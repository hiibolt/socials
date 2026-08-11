<script lang="ts">
	import { gameSettings, type MinesDifficulty } from '$lib/games/settings.svelte';

	type Cell = {
		mine: boolean;
		open: boolean;
		flag: boolean;
		adj: number;
	};

	const PRESETS: Record<MinesDifficulty, { cols: number; rows: number; mines: number }> = {
		easy: { cols: 9, rows: 9, mines: 10 },
		medium: { cols: 12, rows: 12, mines: 24 },
		hard: { cols: 16, rows: 16, mines: 48 }
	};

	let cols = $state(9);
	let rows = $state(9);
	let mineCount = $state(10);
	let grid = $state<Cell[]>([]);
	let status = $state<'ready' | 'play' | 'won' | 'lost'>('ready');
	let planted = $state(false);
	let focused = $state(false);

	const difficulty = $derived(gameSettings.mines.difficulty);
	const flags = $derived(grid.filter((c) => c.flag).length);
	const remaining = $derived(Math.max(0, mineCount - flags));
	const opened = $derived(grid.filter((c) => c.open).length);
	const totalSafe = $derived(cols * rows - mineCount);

	function emptyCell(): Cell {
		return { mine: false, open: false, flag: false, adj: 0 };
	}

	function idx(x: number, y: number) {
		return y * cols + x;
	}

	function inBounds(x: number, y: number) {
		return x >= 0 && y >= 0 && x < cols && y < rows;
	}

	function neighbors(x: number, y: number): [number, number][] {
		const out: [number, number][] = [];
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) continue;
				const nx = x + dx;
				const ny = y + dy;
				if (inBounds(nx, ny)) out.push([nx, ny]);
			}
		}
		return out;
	}

	function buildEmpty(c: number, r: number): Cell[] {
		return Array.from({ length: c * r }, emptyCell);
	}

	function plantMines(safeX: number, safeY: number) {
		const next = grid.map((c) => ({ ...c, mine: false, adj: 0 }));
		const banned = new Set<number>([idx(safeX, safeY)]);
		for (const [nx, ny] of neighbors(safeX, safeY)) banned.add(idx(nx, ny));

		const slots: number[] = [];
		for (let i = 0; i < cols * rows; i++) {
			if (!banned.has(i)) slots.push(i);
		}
		for (let i = slots.length - 1; i > 0; i--) {
			const j = (Math.random() * (i + 1)) | 0;
			[slots[i], slots[j]] = [slots[j], slots[i]];
		}
		const place = Math.min(mineCount, slots.length);
		for (let i = 0; i < place; i++) next[slots[i]].mine = true;

		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				const i = idx(x, y);
				if (next[i].mine) continue;
				next[i].adj = neighbors(x, y).reduce(
					(n, [nx, ny]) => n + (next[idx(nx, ny)].mine ? 1 : 0),
					0
				);
			}
		}
		grid = next;
	}

	function resetBoard() {
		const p = PRESETS[difficulty];
		cols = p.cols;
		rows = p.rows;
		mineCount = p.mines;
		grid = buildEmpty(cols, rows);
		status = 'ready';
		planted = false;
	}

	$effect(() => {
		void difficulty;
		resetBoard();
	});

	function flood(x: number, y: number) {
		const stack: [number, number][] = [[x, y]];
		const next = grid.map((c) => ({ ...c }));
		while (stack.length) {
			const [cx, cy] = stack.pop()!;
			const i = idx(cx, cy);
			const cell = next[i];
			if (cell.open || cell.flag) continue;
			cell.open = true;
			if (cell.adj === 0 && !cell.mine) {
				for (const [nx, ny] of neighbors(cx, cy)) {
					const n = next[idx(nx, ny)];
					if (!n.open && !n.flag) stack.push([nx, ny]);
				}
			}
		}
		grid = next;
	}

	function checkWin(board: Cell[]) {
		const safe = cols * rows - mineCount;
		if (board.filter((c) => c.open && !c.mine).length >= safe) {
			status = 'won';
			// auto-flag remaining mines
			grid = board.map((c) => (c.mine ? { ...c, flag: true } : c));
		}
	}

	function openCell(x: number, y: number) {
		if (status === 'won' || status === 'lost') return;
		const i = idx(x, y);
		const cell = grid[i];
		if (cell.open || cell.flag) return;

		if (!planted) {
			plantMines(x, y);
			planted = true;
			status = 'play';
		}

		if (grid[i].mine) {
			// reveal all mines
			grid = grid.map((c, j) =>
				c.mine || j === i ? { ...c, open: true } : c
			);
			status = 'lost';
			return;
		}

		if (grid[i].adj === 0) {
			flood(x, y);
		} else {
			const next = grid.map((c) => ({ ...c }));
			next[i].open = true;
			grid = next;
		}
		checkWin(grid);
	}

	function toggleFlag(x: number, y: number) {
		if (status === 'won' || status === 'lost') return;
		const i = idx(x, y);
		if (grid[i].open) return;
		const next = grid.map((c) => ({ ...c }));
		next[i].flag = !next[i].flag;
		grid = next;
		if (status === 'ready') status = 'play';
	}

	/** Chord: open neighbors when flags match adj count */
	function chord(x: number, y: number) {
		if (status === 'won' || status === 'lost') return;
		const cell = grid[idx(x, y)];
		if (!cell.open || cell.adj === 0) return;
		const nbs = neighbors(x, y);
		const flagged = nbs.filter(([nx, ny]) => grid[idx(nx, ny)].flag).length;
		if (flagged !== cell.adj) return;
		for (const [nx, ny] of nbs) {
			const n = grid[idx(nx, ny)];
			if (!n.open && !n.flag) openCell(nx, ny);
			if (grid[idx(nx, ny)]?.mine && grid[idx(nx, ny)]?.open) return;
		}
	}

	function onCellClick(e: MouseEvent, x: number, y: number) {
		e.preventDefault();
		focused = true;
		if (e.button === 2 || e.shiftKey || e.altKey) {
			toggleFlag(x, y);
			return;
		}
		if (e.detail >= 2 || e.metaKey || e.ctrlKey) {
			chord(x, y);
			return;
		}
		openCell(x, y);
	}

	function face() {
		if (status === 'won') return '☺';
		if (status === 'lost') return '☠';
		return '·';
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="mines"
	role="group"
	aria-label="Mines"
	tabindex="0"
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
>
	<div class="hud">
		<span class="stat" title="Mines remaining">{remaining}</span>
		<button type="button" class="face" onclick={resetBoard} aria-label="New game">{face()}</button>
		<span class="stat muted">{opened}/{totalSafe}</span>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="board"
		class:lost={status === 'lost'}
		class:won={status === 'won'}
		style:--cols={cols}
		style:--rows={rows}
		oncontextmenu={(e) => e.preventDefault()}
	>
		{#each grid as cell, i (i)}
			{@const x = i % cols}
			{@const y = (i / cols) | 0}
			<button
				type="button"
				class="cell"
				class:open={cell.open}
				class:flag={cell.flag && !cell.open}
				class:mine={cell.open && cell.mine}
				class:boom={cell.open && cell.mine && status === 'lost'}
				data-n={cell.open && !cell.mine && cell.adj > 0 ? cell.adj : undefined}
				aria-label={cell.open
					? cell.mine
						? 'mine'
						: cell.adj
							? `${cell.adj}`
							: 'empty'
					: cell.flag
						? 'flagged'
						: 'hidden'}
				onpointerdown={(e) => {
					if (e.button === 2) {
						e.preventDefault();
						toggleFlag(x, y);
					}
				}}
				onclick={(e) => onCellClick(e, x, y)}
			>
				{#if cell.flag && !cell.open}
					<span class="mark flag-m">⚑</span>
				{:else if cell.open && cell.mine}
					<span class="mark mine-m">●</span>
				{:else if cell.open && cell.adj > 0}
					{cell.adj}
				{/if}
			</button>
		{/each}
	</div>

	<p class="hint">
		{#if status === 'won'}
			cleared
		{:else if status === 'lost'}
			boom · face to retry
		{:else}
			click open · right/shift flag · double chord
		{/if}
	</p>
</div>

<style>
	.mines {
		--mines-font: 'SF Pro Text', 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue',
			Arial, sans-serif;
		font-family: var(--mines-font);
		font-variant-numeric: tabular-nums;
		-webkit-font-smoothing: antialiased;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		height: 100%;
		width: 100%;
		min-height: 0;
		box-sizing: border-box;
		overflow: hidden;
	}

	.hud {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: min(100%, calc(var(--cols, 9) * 1.85rem + 2rem), 28rem);
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.stat {
		min-width: 2.4rem;
		font-size: 0.85rem;
		font-weight: 700;
		color: #c93434;
		letter-spacing: 0.02em;
	}

	.stat.muted {
		color: var(--px-muted);
		text-align: right;
		font-weight: 600;
		font-size: 0.72rem;
	}

	.face {
		font: inherit;
		font-size: 1.1rem;
		line-height: 1;
		width: 2rem;
		height: 2rem;
		border-radius: 8px;
		border: 1.5px solid rgba(0, 0, 0, 0.2);
		background: rgba(255, 255, 255, 0.85);
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
	}

	.face:hover {
		background: #fff;
	}

	.board {
		--cell: min(
			2.15rem,
			calc((100cqi - 0.5rem) / var(--cols)),
			calc((100cqh - 5.5rem) / var(--rows))
		);
		display: grid;
		grid-template-columns: repeat(var(--cols), var(--cell));
		grid-template-rows: repeat(var(--rows), var(--cell));
		gap: 1px;
		padding: 3px;
		border-radius: var(--px-radius-sm);
		border: 1.5px solid rgba(0, 0, 0, 0.24);
		background: rgba(0, 0, 0, 0.12);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		flex: 0 0 auto;
		max-width: 100%;
	}

	.cell {
		all: unset;
		box-sizing: border-box;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		font-family: var(--mines-font);
		font-size: clamp(0.55rem, calc(var(--cell) * 0.48), 1rem);
		font-weight: 700;
		cursor: pointer;
		background: linear-gradient(160deg, #f3f4f7 0%, #d5dae3 100%);
		box-shadow:
			inset 1px 1px 0 rgba(255, 255, 255, 0.75),
			inset -1px -1px 0 rgba(0, 0, 0, 0.08);
		user-select: none;
		color: transparent;
	}

	.cell:hover:not(.open) {
		filter: brightness(1.04);
	}

	.cell.open {
		background: rgba(255, 255, 255, 0.72);
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
		cursor: default;
	}

	.cell.flag .mark {
		color: #c93434;
	}

	.cell.mine {
		background: rgba(201, 52, 52, 0.12);
	}

	.cell.boom {
		background: #c93434;
	}

	.cell.boom .mark {
		color: #fff;
	}

	.mark {
		line-height: 1;
		font-size: 0.85em;
	}

	.mine-m {
		color: #1d1d1f;
	}

	.cell[data-n='1'] {
		color: #0b4fbf;
	}
	.cell[data-n='2'] {
		color: #1a7a2e;
	}
	.cell[data-n='3'] {
		color: #c93434;
	}
	.cell[data-n='4'] {
		color: #3b1f8e;
	}
	.cell[data-n='5'] {
		color: #8b3a1a;
	}
	.cell[data-n='6'] {
		color: #0a7a7a;
	}
	.cell[data-n='7'] {
		color: #1d1d1f;
	}
	.cell[data-n='8'] {
		color: #6e6e73;
	}

	.hint {
		margin: 0;
		font-size: 0.68rem;
		font-weight: 600;
		color: var(--px-muted);
		text-align: center;
		flex-shrink: 0;
		min-height: 1em;
	}

	.board.won {
		box-shadow: 0 0 0 2px rgba(40, 200, 64, 0.35);
	}

	.board.lost {
		box-shadow: 0 0 0 2px rgba(201, 52, 52, 0.3);
	}
</style>
