<script lang="ts">
	import { onMount } from 'svelte';
	import { loadWordle } from '$lib/games/cache';
	import { gameSettings } from '$lib/games/settings.svelte';

	type Mark = 'correct' | 'present' | 'absent' | 'empty';

	let answer = $state('RUSTY');
	let maxGuesses = $state(6);
	let loading = $state(true);
	let source = $state('fallback');

	let guesses = $state<string[]>([]);
	let current = $state('');
	let status = $state<'play' | 'won' | 'lost'>('play');
	let message = $state('');
	let focused = $state(false);

	const LEN = $derived(answer.length);
	const hardMode = $derived(gameSettings.wordle.hardMode);

	async function loadPuzzle() {
		loading = true;
		const data = await loadWordle();
		answer = data.answer;
		maxGuesses = data.maxGuesses;
		source = data.source;
		resetBoard();
		loading = false;
	}

	function resetBoard() {
		guesses = [];
		current = '';
		status = 'play';
		message = '';
	}

	onMount(() => {
		void loadPuzzle();
	});

	const rows = $derived.by(() => {
		const out: { letters: string[]; marks: Mark[] }[] = [];
		for (let i = 0; i < maxGuesses; i++) {
			if (i < guesses.length) {
				out.push({ letters: guesses[i].split(''), marks: score(guesses[i]) });
			} else if (i === guesses.length && status === 'play') {
				const letters = current.padEnd(LEN).split('').slice(0, LEN);
				out.push({ letters, marks: Array(LEN).fill('empty') as Mark[] });
			} else {
				out.push({
					letters: Array(LEN).fill('') as string[],
					marks: Array(LEN).fill('empty') as Mark[]
				});
			}
		}
		return out;
	});

	function score(guess: string): Mark[] {
		const g = guess.toUpperCase().split('');
		const ans = answer.split('');
		const marks: Mark[] = Array(LEN).fill('absent');
		const used = Array(LEN).fill(false);

		for (let i = 0; i < LEN; i++) {
			if (g[i] === ans[i]) {
				marks[i] = 'correct';
				used[i] = true;
			}
		}
		for (let i = 0; i < LEN; i++) {
			if (marks[i] === 'correct') continue;
			const j = ans.findIndex((ch, k) => !used[k] && ch === g[i]);
			if (j >= 0) {
				marks[i] = 'present';
				used[j] = true;
			}
		}
		return marks;
	}

	function hardModeError(guess: string): string | null {
		if (!hardMode || guesses.length === 0) return null;
		for (const prev of guesses) {
			const marks = score(prev);
			for (let i = 0; i < LEN; i++) {
				if (marks[i] === 'correct' && guess[i] !== prev[i]) {
					return `${i + 1}: must be ${prev[i]}`;
				}
			}
			for (let i = 0; i < LEN; i++) {
				if (marks[i] === 'present' && !guess.includes(prev[i])) {
					return `must use ${prev[i]}`;
				}
			}
		}
		return null;
	}

	function submit() {
		if (status !== 'play' || loading) return;
		if (current.length !== LEN) {
			message = `${LEN} letters`;
			return;
		}
		const g = current.toUpperCase();
		const hardErr = hardModeError(g);
		if (hardErr) {
			message = hardErr;
			return;
		}
		guesses = [...guesses, g];
		current = '';
		message = '';
		if (g === answer) {
			status = 'won';
			message = 'nice.';
			return;
		}
		if (guesses.length >= maxGuesses) {
			status = 'lost';
			message = answer;
		}
	}

	function onKey(e: KeyboardEvent) {
		if (!focused && /^[a-zA-Z]$/.test(e.key)) focused = true;
		if (!focused || status !== 'play' || loading) return;
		if (e.key === 'Enter') {
			e.preventDefault();
			submit();
			return;
		}
		if (e.key === 'Backspace') {
			e.preventDefault();
			current = current.slice(0, -1);
			message = '';
			return;
		}
		if (/^[a-zA-Z]$/.test(e.key) && current.length < LEN) {
			e.preventDefault();
			current += e.key.toUpperCase();
			message = '';
		}
	}

	function typeKey(k: string) {
		focused = true;
		if (status !== 'play' || loading) return;
		if (k === 'ENTER') return submit();
		if (k === '⌫') {
			current = current.slice(0, -1);
			return;
		}
		if (current.length < LEN) current += k;
	}

	function reset() {
		void loadPuzzle();
		focused = true;
	}

	const keys = [
		'QWERTYUIOP'.split(''),
		'ASDFGHJKL'.split(''),
		['ENTER', ...'ZXCVBNM'.split(''), '⌫']
	];

	function keyMark(letter: string): Mark | null {
		if (letter.length !== 1) return null;
		let best: Mark | null = null;
		for (const g of guesses) {
			const marks = score(g);
			for (let i = 0; i < g.length; i++) {
				if (g[i] !== letter) continue;
				const m = marks[i];
				if (m === 'correct') return 'correct';
				if (m === 'present') best = 'present';
				else if (!best) best = 'absent';
			}
		}
		return best;
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="wordle" role="group" aria-label="Wordle">
	<header class="brand">
		<div class="title-row">
			<h3 class="title">Wordle</h3>
			{#if hardMode}<span class="badge">hard</span>{/if}
		</div>
		<div class="legend" aria-hidden="true">
			<span class="swatch correct"></span><span>right</span>
			<span class="swatch present"></span><span>close</span>
			<span class="swatch absent"></span><span>nope</span>
		</div>
	</header>

	{#if loading}
		<p class="msg">loading…</p>
	{:else}
		<div class="board">
			{#each rows as row}
				<div class="row">
					{#each row.letters as ch, i}
						<span class="tile" class:filled={!!ch.trim()} data-mark={row.marks[i]}
							>{ch.trim()}</span
						>
					{/each}
				</div>
			{/each}
		</div>
	{/if}

	<p class="msg" class:ok={status === 'won'} class:bad={status === 'lost'} class:empty={!message}>
		{message || '\u00a0'}
	</p>

	<div class="kb">
		{#each keys as row}
			<div class="kb-row">
				{#each row as k}
					<button
						type="button"
						class="key"
						class:wide={k.length > 1}
						data-mark={keyMark(k) ?? undefined}
						onclick={() => typeKey(k)}
					>
						{k}
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<div class="foot">
		<button type="button" class="reset" onclick={reset}>new</button>
		{#if source === 'fallback'}
			<span class="src">offline</span>
		{/if}
	</div>
</div>

<style>
	.wordle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.45rem;
		width: 100%;
		height: 100%;
		min-height: 22rem;
		box-sizing: border-box;
		overflow: auto;
		padding-bottom: 0.15rem;
	}

	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		width: 100%;
		text-align: center;
		flex-shrink: 0;
		margin-bottom: 0.15rem;
	}

	.title-row {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
	}

	.title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-align: center;
	}

	.legend {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		font-size: 0.58rem;
		color: var(--px-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.badge {
		font-size: 0.55rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.1rem 0.35rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.08);
		color: var(--px-muted);
	}

	.swatch {
		width: 0.48rem;
		height: 0.48rem;
		border-radius: 2px;
		margin-left: 0.15rem;
	}

	.swatch.correct {
		background: #28c840;
		margin-left: 0;
	}

	.swatch.present {
		background: #febc2e;
	}

	.swatch.absent {
		background: #8e8e93;
	}

	.board {
		display: flex;
		flex-direction: column;
		justify-content: center;
		/* claim most of the vertical free space for the letter grid */
		flex: 1 1 auto;
		min-height: 11.5rem;
		margin-top: 0.15rem;
		gap: clamp(0.2rem, 1cqh, 0.45rem);
	}

	.row {
		display: flex;
		justify-content: center;
		gap: clamp(0.2rem, 1cqh, 0.45rem);
	}

	.tile {
		/* scale with container; floor soft enough for default window */
		width: clamp(1.65rem, 8.6cqh, 4.25rem);
		height: clamp(1.65rem, 8.6cqh, 4.25rem);
		display: grid;
		place-items: center;
		border: 1.5px solid rgba(0, 0, 0, 0.24);
		border-radius: 5px;
		font-weight: 700;
		font-size: clamp(0.78rem, 3.3cqh, 1.55rem);
		text-transform: uppercase;
		background: rgba(255, 255, 255, 0.82);
	}

	.tile.filled {
		border-color: rgba(0, 0, 0, 0.4);
	}

	.tile[data-mark='correct'] {
		background: #28c840;
		border-color: transparent;
		color: #fff;
	}

	.tile[data-mark='present'] {
		background: #febc2e;
		border-color: transparent;
		color: #1d1d1f;
	}

	.tile[data-mark='absent'] {
		background: #8e8e93;
		border-color: transparent;
		color: #fff;
	}

	.msg {
		margin: 0;
		min-height: 0.85rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.msg.empty {
		min-height: 0.35rem;
	}

	.msg.ok {
		color: #1a7a2e;
	}

	.msg.bad {
		color: #c93434;
	}

	.kb {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: min(34rem, 100%);
		gap: clamp(0.14rem, 0.65cqh, 0.28rem);
		flex-shrink: 0;
		margin-top: auto;
	}

	.kb-row {
		display: flex;
		justify-content: center;
		gap: 0.16rem;
	}

	.key {
		font: inherit;
		font-weight: 600;
		min-width: clamp(1.35rem, 3.8cqh, 2.55rem);
		padding: clamp(0.28rem, 1cqh, 0.58rem) 0.16rem;
		font-size: clamp(0.58rem, 1.65cqh, 0.95rem);
		border: 1px solid var(--px-stroke-soft);
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		color: var(--px-ink);
	}

	.key.wide {
		min-width: clamp(2.15rem, 5.8cqh, 3.8rem);
	}

	.key[data-mark='correct'] {
		background: #28c840;
		color: #fff;
		border-color: transparent;
	}

	.key[data-mark='present'] {
		background: #febc2e;
		border-color: transparent;
	}

	.key[data-mark='absent'] {
		background: #8e8e93;
		color: #fff;
		border-color: transparent;
	}

	.foot {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	:global(.card.maximized) .title {
		font-size: clamp(1.1rem, 2.4vw, 1.55rem);
	}

	:global(.card.maximized) .legend {
		font-size: 0.62rem;
		gap: 0.35rem;
	}

	:global(.card.maximized) .kb {
		max-width: min(40rem, 100%);
	}

	.reset {
		font: inherit;
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.32rem 0.7rem;
		border: none;
		border-radius: var(--px-radius-pill);
		background: var(--px-select);
		color: #fff;
		cursor: pointer;
	}

	.reset:hover {
		filter: brightness(1.06);
	}

	.src {
		font-size: 0.6rem;
		color: var(--px-muted);
	}
</style>
