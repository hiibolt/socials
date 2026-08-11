<script lang="ts">
	import Icon from '@iconify/svelte';
	import { takeSudoku } from '$lib/games/cache';
	import { gameSettings } from '$lib/games/settings.svelte';

	const SIZE = 9;

	type Snapshot = { cells: number[]; notes: number[][] };

	function parse(s: string): number[] {
		return s.split('').map((c) => Number(c));
	}

	function emptyNotes(): number[][] {
		return Array.from({ length: 81 }, () => [] as number[]);
	}

	function cloneNotes(n: number[][]): number[][] {
		return n.map((row) => [...row]);
	}

	function candidatesFor(board: number[], i: number): number[] {
		if (board[i] !== 0) return [];
		const r = Math.floor(i / 9);
		const c = i % 9;
		const used = new Set<number>();
		for (let x = 0; x < 9; x++) {
			used.add(board[r * 9 + x]);
			used.add(board[x * 9 + c]);
		}
		const br = Math.floor(r / 3) * 3;
		const bc = Math.floor(c / 3) * 3;
		for (let y = br; y < br + 3; y++) {
			for (let x = bc; x < bc + 3; x++) used.add(board[y * 9 + x]);
		}
		return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n));
	}

	function computeNotes(board: number[]): number[][] {
		return Array.from({ length: 81 }, (_, i) => candidatesFor(board, i));
	}

	function peerIndices(i: number): number[] {
		const r = Math.floor(i / 9);
		const c = i % 9;
		const out: number[] = [];
		for (let x = 0; x < 9; x++) {
			out.push(r * 9 + x);
			out.push(x * 9 + c);
		}
		const br = Math.floor(r / 3) * 3;
		const bc = Math.floor(c / 3) * 3;
		for (let y = br; y < br + 3; y++) {
			for (let x = bc; x < bc + 3; x++) out.push(y * 9 + x);
		}
		return [...new Set(out)].filter((j) => j !== i);
	}

	let given = $state<number[]>(Array(81).fill(0));
	let solution = $state<number[]>(Array(81).fill(0));
	let cells = $state<number[]>(Array(81).fill(0));
	let notes = $state<number[][]>(emptyNotes());
	let selected = $state(0);
	let status = $state<'play' | 'won' | 'wrong'>('play');
	let banner = $state<'incorrect' | null>(null);
	let focused = $state(false);
	let loading = $state(true);
	let source = $state('fallback');
	let editMode = $state(false);
	let undoStack = $state<Snapshot[]>([]);
	let redoStack = $state<Snapshot[]>([]);
	let bannerTimer: ReturnType<typeof setTimeout> | null = null;

	const autoNotes = $derived(gameSettings.sudoku.autoNotes);
	const difficulty = $derived(gameSettings.sudoku.difficulty);

	const selVal = $derived(cells[selected] ?? 0);
	const selR = $derived(Math.floor(selected / SIZE));
	const selC = $derived(selected % SIZE);
	const canUndo = $derived(undoStack.length > 0);
	const canRedo = $derived(redoStack.length > 0);
	const canRemove = $derived(!loading && !isGiven(selected) && cells[selected] !== 0);

	const showNotes = $derived(
		autoNotes || editMode || notes.some((n) => n.length > 0)
	);

	function isGiven(i: number) {
		return given[i] !== 0;
	}

	function isPeer(i: number) {
		if (selVal !== 0 || i === selected) return false;
		const r = Math.floor(i / SIZE);
		const c = i % SIZE;
		if (r === selR || c === selC) return true;
		return (
			Math.floor(r / 3) === Math.floor(selR / 3) && Math.floor(c / 3) === Math.floor(selC / 3)
		);
	}

	function isSameDigit(i: number) {
		return selVal !== 0 && cells[i] === selVal && i !== selected;
	}

	function snapshot(): Snapshot {
		return { cells: [...cells], notes: cloneNotes(notes) };
	}

	function applySnapshot(s: Snapshot) {
		cells = [...s.cells];
		notes = cloneNotes(s.notes);
		status = cells.every((v, i) => v !== 0 && v === solution[i]) ? 'won' : 'play';
		banner = null;
	}

	function pushHistory() {
		undoStack = [...undoStack, snapshot()];
		redoStack = [];
	}

	function seedNotesFromBoard(board: number[]) {
		notes = autoNotes ? computeNotes(board) : emptyNotes();
	}

	/** After placing digit d at i: clear that cell's notes, strip d from peers. */
	function autoRemoveNotes(board: number[], i: number, d: number): number[][] {
		const next = cloneNotes(notes);
		next[i] = [];
		for (const j of peerIndices(i)) {
			if (board[j] === 0) next[j] = next[j].filter((n) => n !== d);
		}
		return next;
	}

	async function loadPuzzle() {
		loading = true;
		banner = null;
		editMode = false;
		undoStack = [];
		redoStack = [];
		const data = await takeSudoku(difficulty);
		given = parse(data.puzzle);
		solution = parse(data.solution);
		source = data.source;
		cells = [...given];
		seedNotesFromBoard(cells);
		status = 'play';
		selected = given.findIndex((v) => v === 0);
		if (selected < 0) selected = 0;
		loading = false;
	}

	$effect(() => {
		void difficulty;
		void loadPuzzle();
	});

	// when auto-notes is toggled on mid-game, seed empty cells once
	let prevAutoNotes = false;
	$effect(() => {
		const on = gameSettings.sudoku.autoNotes;
		if (loading) {
			prevAutoNotes = on;
			return;
		}
		if (on && !prevAutoNotes) {
			const board = cells;
			const next = cloneNotes(notes);
			for (let i = 0; i < 81; i++) {
				if (board[i] === 0 && next[i].length === 0) next[i] = candidatesFor(board, i);
			}
			notes = next;
		}
		prevAutoNotes = on;
	});

	function flashIncorrect() {
		banner = 'incorrect';
		if (bannerTimer) clearTimeout(bannerTimer);
		bannerTimer = setTimeout(() => {
			if (banner === 'incorrect') banner = null;
		}, 1100);
	}

	function setDigit(d: number) {
		if (status === 'won' || loading) return;
		if (isGiven(selected)) return;

		// edit mode: toggle pencil mark on empty cells
		if (editMode) {
			if (cells[selected] !== 0) return;
			pushHistory();
			const cur = notes[selected] ?? [];
			const has = cur.includes(d);
			const nextCell = has ? cur.filter((n) => n !== d) : [...cur, d].sort((a, b) => a - b);
			const next = cloneNotes(notes);
			next[selected] = nextCell;
			notes = next;
			banner = null;
			return;
		}

		if (d !== solution[selected]) {
			flashIncorrect();
			return;
		}

		pushHistory();
		const nextCells = [...cells];
		nextCells[selected] = d;
		cells = nextCells;
		notes = autoRemoveNotes(nextCells, selected, d);
		banner = null;
		status = nextCells.every((v, i) => v === solution[i]) ? 'won' : 'play';
	}

	function removeEntry() {
		if (!canRemove) return;
		pushHistory();
		const nextCells = [...cells];
		nextCells[selected] = 0;
		cells = nextCells;
		// restore candidates for this cell; keep peer notes as-is (undo covers full state)
		const next = cloneNotes(notes);
		next[selected] = autoNotes || editMode || showNotes ? candidatesFor(nextCells, selected) : [];
		notes = next;
		banner = null;
		status = 'play';
	}

	function undo() {
		if (!canUndo) return;
		const prev = undoStack[undoStack.length - 1];
		redoStack = [...redoStack, snapshot()];
		undoStack = undoStack.slice(0, -1);
		applySnapshot(prev);
	}

	function redo() {
		if (!canRedo) return;
		const next = redoStack[redoStack.length - 1];
		undoStack = [...undoStack, snapshot()];
		redoStack = redoStack.slice(0, -1);
		applySnapshot(next);
	}

	function check() {
		if (!cells.every((v) => v !== 0)) {
			status = 'wrong';
			return;
		}
		status = cells.every((v, i) => v === solution[i]) ? 'won' : 'wrong';
	}

	function reset() {
		pushHistory();
		cells = [...given];
		seedNotesFromBoard(cells);
		status = 'play';
		banner = null;
		selected = given.findIndex((v) => v === 0);
		if (selected < 0) selected = 0;
	}

	function onKey(e: KeyboardEvent) {
		if (!focused || loading) return;
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
			e.preventDefault();
			if (e.shiftKey) redo();
			else undo();
			return;
		}
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
			e.preventDefault();
			redo();
			return;
		}
		if (e.key >= '1' && e.key <= '9') {
			e.preventDefault();
			setDigit(Number(e.key));
			return;
		}
		if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
			e.preventDefault();
			removeEntry();
			return;
		}
		if (e.key.toLowerCase() === 'e') {
			e.preventDefault();
			editMode = !editMode;
			return;
		}
		const row = Math.floor(selected / SIZE);
		const col = selected % SIZE;
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selected = ((row + SIZE - 1) % SIZE) * SIZE + col;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selected = ((row + 1) % SIZE) * SIZE + col;
		}
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			selected = row * SIZE + ((col + SIZE - 1) % SIZE);
		}
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			selected = row * SIZE + ((col + 1) % SIZE);
		}
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="sudoku" role="group" aria-label="Sudoku">
	{#if banner === 'incorrect'}
		<div class="banner" role="status">Incorrect</div>
	{/if}

	{#if loading}
		<p class="status">loading…</p>
	{:else}
		<div class="grid">
			{#each cells as value, i}
				{@const r = Math.floor(i / SIZE)}
				{@const c = i % SIZE}
				<button
					type="button"
					class="cell"
					class:given={isGiven(i)}
					class:user={!isGiven(i) && value !== 0}
					class:selected={selected === i}
					class:peer={isPeer(i)}
					class:same={isSameDigit(i)}
					class:box-r={(c + 1) % 3 === 0 && c !== SIZE - 1}
					class:box-b={(r + 1) % 3 === 0 && r !== SIZE - 1}
					class:notes={value === 0 && showNotes && notes[i]?.length > 0}
					onclick={() => {
						selected = i;
						focused = true;
						banner = null;
					}}
					onfocus={() => {
						selected = i;
						focused = true;
					}}
				>
					{#if value}
						{value}
					{:else if showNotes}
						<span class="note-grid">
							{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as n}
								<span
									class:on={notes[i]?.includes(n)}
									class:hl={selVal !== 0 && n === selVal && notes[i]?.includes(n)}
									>{notes[i]?.includes(n) ? n : ''}</span
								>
							{/each}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<div class="toolbar" role="toolbar" aria-label="Sudoku tools">
		<button
			type="button"
			class="tool"
			class:active={canUndo}
			disabled={!canUndo}
			aria-label="Undo"
			title="Undo"
			onclick={() => {
				focused = true;
				undo();
			}}
		>
			<Icon icon="lucide:undo-2" width="16" height="16" />
		</button>
		<button
			type="button"
			class="tool"
			class:active={canRedo}
			disabled={!canRedo}
			aria-label="Redo"
			title="Redo"
			onclick={() => {
				focused = true;
				redo();
			}}
		>
			<Icon icon="lucide:redo-2" width="16" height="16" />
		</button>
		<button
			type="button"
			class="tool remove"
			class:armed={canRemove}
			disabled={!canRemove}
			aria-label="Remove entry"
			title="Remove user entry"
			onclick={() => {
				focused = true;
				removeEntry();
			}}
		>
			<Icon icon="lucide:eraser" width="16" height="16" />
		</button>
		<button
			type="button"
			class="tool edit"
			class:on={editMode}
			aria-pressed={editMode}
			aria-label="Edit notes"
			title="Edit mode (pencil marks)"
			onclick={() => {
				focused = true;
				editMode = !editMode;
			}}
		>
			<Icon icon="lucide:pencil" width="16" height="16" />
		</button>
	</div>

	<div class="pad" role="group" aria-label="Digits">
		{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as d}
			<button
				type="button"
				class="key"
				class:edit={editMode}
				onclick={() => {
					focused = true;
					setDigit(d);
				}}>{d}</button
			>
		{/each}
	</div>

	<div class="actions">
		<button
			type="button"
			onclick={() => {
				focused = true;
				check();
			}}>check</button
		>
		<button
			type="button"
			onclick={() => {
				focused = true;
				reset();
			}}>reset</button
		>
		<button
			type="button"
			onclick={() => {
				focused = true;
				void loadPuzzle();
			}}>new</button
		>
		{#if status === 'won'}
			<span class="status ok">solved</span>
		{:else if status === 'wrong'}
			<span class="status bad">not yet</span>
		{:else if editMode}
			<span class="status edit-hint">pencil</span>
		{/if}
	</div>
	{#if source === 'fallback'}
		<p class="src">offline puzzle</p>
	{/if}
</div>

<style>
	.sudoku {
		/* square board side — large when maximized (was soft-capped at 28rem) */
		/* reserve room for toolbar + pad + actions under larger type */
		--board: min(100cqi, calc(100cqh - 8.25rem), 40rem);
		/* clear UI font — pixel face is hard for dense digits */
		--sudoku-font: 'SF Pro Text', 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue',
			Arial, sans-serif;
		font-family: var(--sudoku-font);
		font-variant-numeric: tabular-nums;
		-webkit-font-smoothing: antialiased;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.35rem;
		height: 100%;
		width: 100%;
		min-width: 0;
		min-height: 0;
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
	}

	.banner {
		position: absolute;
		top: 0.35rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 4;
		padding: 0.28rem 0.75rem;
		border-radius: 999px;
		background: rgba(201, 52, 52, 0.92);
		color: #fff;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		box-shadow: 0 6px 18px rgba(201, 52, 52, 0.28);
		animation: banner-in 140ms ease-out;
		pointer-events: none;
	}

	@keyframes banner-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.grid {
		display: grid;
		/* minmax(0,1fr): default 1fr min is content-size and clips right columns when large */
		grid-template-columns: repeat(9, minmax(0, 1fr));
		grid-template-rows: repeat(9, minmax(0, 1fr));
		box-sizing: border-box;
		border: 1.5px solid rgba(0, 0, 0, 0.28);
		border-radius: var(--px-radius-sm);
		background: rgba(255, 255, 255, 0.7);
		/* equal width+height — don't let flex stretch one axis */
		width: var(--board);
		height: var(--board);
		max-width: 100%;
		min-width: 0;
		min-height: 0;
		align-self: center;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		flex: 0 0 auto;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		flex-shrink: 0;
		width: min(100%, var(--board));
	}

	.tool {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 8px;
		border: 1px solid var(--px-stroke-soft);
		background: rgba(255, 255, 255, 0.75);
		color: rgba(0, 0, 0, 0.28);
		cursor: pointer;
		transition:
			color 100ms ease,
			background 100ms ease,
			border-color 100ms ease;
	}

	.tool:disabled {
		cursor: default;
		opacity: 0.55;
	}

	.tool.active {
		color: #0b4fbf;
		border-color: rgba(11, 79, 191, 0.28);
		background: rgba(11, 79, 191, 0.08);
	}

	.tool.active:hover:not(:disabled) {
		background: rgba(11, 79, 191, 0.14);
	}

	.tool.remove.armed {
		color: #c93434;
		border-color: rgba(201, 52, 52, 0.3);
		background: rgba(201, 52, 52, 0.08);
	}

	.tool.remove.armed:hover:not(:disabled) {
		background: rgba(201, 52, 52, 0.16);
	}

	.tool.edit.on {
		color: #0b4fbf;
		border-color: rgba(11, 79, 191, 0.35);
		background: rgba(11, 79, 191, 0.12);
	}

	.tool :global(svg) {
		display: block;
	}

	.pad {
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		gap: 0.22rem;
		align-self: center;
		width: min(100%, var(--board));
		max-width: 100%;
		flex-shrink: 0;
	}

	.cell {
		all: unset;
		box-sizing: border-box;
		display: grid;
		place-items: center;
		min-width: 0;
		min-height: 0;
		width: 100%;
		height: 100%;
		font-family: var(--sudoku-font);
		font-variant-numeric: tabular-nums;
		font-size: clamp(0.7rem, 3.4cqh, 1.4rem);
		font-weight: 600;
		letter-spacing: 0;
		border-right: 1px solid rgba(0, 0, 0, 0.2);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		cursor: pointer;
		color: var(--px-ink);
		position: relative;
		background: transparent;
		overflow: hidden;
		transition: background 80ms ease;
	}

	.cell.box-r {
		border-right: 2px solid rgba(0, 0, 0, 0.34);
	}

	.cell.box-b {
		border-bottom: 2px solid rgba(0, 0, 0, 0.34);
	}

	.cell.given {
		background: rgba(0, 0, 0, 0.03);
		color: var(--px-ink);
	}

	.cell.user {
		color: #0b4fbf;
	}

	.cell.peer {
		background: rgba(0, 113, 227, 0.07);
	}

	.cell.same {
		background: rgba(0, 113, 227, 0.16);
	}

	.cell.selected {
		background: rgba(0, 113, 227, 0.28);
		color: var(--px-ink);
		z-index: 1;
	}

	.cell.selected.user {
		color: #0b4fbf;
	}

	.cell.selected.given {
		color: var(--px-ink);
	}

	.cell.notes {
		padding: 1px;
	}

	.note-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
		height: 100%;
		font-family: var(--sudoku-font);
		font-variant-numeric: tabular-nums;
		font-size: clamp(0.34rem, 1.5cqh, 0.8rem);
		font-weight: 500;
		line-height: 1;
		color: var(--px-muted);
	}

	.note-grid span {
		display: grid;
		place-items: center;
		position: relative;
		z-index: 0;
	}

	.note-grid span:not(.on) {
		visibility: hidden;
	}

	.note-grid span.hl::before {
		content: '';
		position: absolute;
		inset: 8%;
		border-radius: 50%;
		background: rgba(0, 113, 227, 0.32);
		z-index: -1;
	}

	.cell.selected .note-grid {
		color: rgba(20, 40, 70, 0.75);
	}

	.key,
	.actions button {
		font-family: var(--sudoku-font);
		font-variant-numeric: tabular-nums;
		font-size: clamp(0.62rem, 1.8cqh, 0.88rem);
		font-weight: 600;
		padding: clamp(0.28rem, 0.9cqh, 0.48rem);
		border: 1.5px solid rgba(0, 0, 0, 0.22);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		color: var(--px-ink);
	}

	.key.edit {
		color: #0b4fbf;
		border-color: rgba(11, 79, 191, 0.25);
		background: rgba(11, 79, 191, 0.06);
	}

	.key:hover,
	.actions button:hover {
		background: rgba(255, 255, 255, 0.95);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		justify-content: center;
		flex-wrap: wrap;
		flex-shrink: 0;
	}

	.status {
		font-size: 0.72rem;
		font-weight: 600;
		text-align: center;
		margin: 0;
	}

	.status.ok {
		color: #1a7a2e;
	}

	.status.bad {
		color: #c93434;
	}

	.status.edit-hint {
		color: #0b4fbf;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.65rem;
	}

	.src {
		margin: 0;
		text-align: center;
		font-size: 0.58rem;
		color: var(--px-muted);
	}
</style>
