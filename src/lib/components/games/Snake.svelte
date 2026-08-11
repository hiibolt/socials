<script lang="ts">
	import { onMount } from 'svelte';
	import { gameSettings } from '$lib/games/settings.svelte';

	const COLS = 16;
	const ROWS = 14;
	const CELL = 16;

	type Pt = { x: number; y: number };

	let canvas: HTMLCanvasElement | undefined = $state();
	let score = $state(0);
	let status = $state<'play' | 'dead'>('play');
	let focused = $state(false);

	const speedRef = { ms: 110 };
	$effect(() => {
		const s = gameSettings.snake.speed;
		speedRef.ms = s === 'slow' ? 160 : s === 'fast' ? 70 : 110;
	});

	onMount(() => {
		if (!canvas) return;
		const g = canvas.getContext('2d');
		if (!g) return;
		const ctx: CanvasRenderingContext2D = g;

		let snake: Pt[] = [];
		let dir: Pt = { x: 1, y: 0 };
		let nextDir: Pt = { x: 1, y: 0 };
		let food: Pt = { x: 10, y: 7 };
		let last = 0;
		let raf = 0;
		let alive = true;

		function placeFood() {
			for (let n = 0; n < 200; n++) {
				const p = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
				if (!snake.some((s) => s.x === p.x && s.y === p.y)) {
					food = p;
					return;
				}
			}
		}

		function reset() {
			snake = [
				{ x: 4, y: 7 },
				{ x: 3, y: 7 },
				{ x: 2, y: 7 }
			];
			dir = { x: 1, y: 0 };
			nextDir = { x: 1, y: 0 };
			score = 0;
			status = 'play';
			alive = true;
			placeFood();
		}

		function paint() {
			ctx.fillStyle = 'rgba(255,255,255,0.9)';
			ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

			ctx.strokeStyle = 'rgba(0,0,0,0.05)';
			for (let x = 0; x <= COLS; x++) {
				ctx.beginPath();
				ctx.moveTo(x * CELL + 0.5, 0);
				ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
				ctx.stroke();
			}
			for (let y = 0; y <= ROWS; y++) {
				ctx.beginPath();
				ctx.moveTo(0, y * CELL + 0.5);
				ctx.lineTo(COLS * CELL, y * CELL + 0.5);
				ctx.stroke();
			}

			ctx.fillStyle = '#28c840';
			ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

			snake.forEach((s, i) => {
				ctx.fillStyle = i === 0 ? '#1d1d1f' : '#4a4a4f';
				ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
			});
		}

		function step() {
			if (!alive) return;
			dir = nextDir;
			const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
			if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
				alive = false;
				status = 'dead';
				return;
			}
			if (snake.some((s) => s.x === head.x && s.y === head.y)) {
				alive = false;
				status = 'dead';
				return;
			}
			snake = [head, ...snake];
			if (head.x === food.x && head.y === food.y) {
				score += 1;
				placeFood();
			} else {
				snake.pop();
			}
		}

		function frame(ts: number) {
			raf = requestAnimationFrame(frame);
			if (!last) last = ts;
			if (ts - last >= speedRef.ms) {
				last = ts;
				if (status === 'play') step();
				paint();
			}
		}

		function onKey(e: KeyboardEvent) {
			const map: Record<string, Pt> = {
				ArrowUp: { x: 0, y: -1 },
				ArrowDown: { x: 0, y: 1 },
				ArrowLeft: { x: -1, y: 0 },
				ArrowRight: { x: 1, y: 0 },
				w: { x: 0, y: -1 },
				s: { x: 0, y: 1 },
				a: { x: -1, y: 0 },
				d: { x: 1, y: 0 }
			};
			const nd = map[e.key];
			if (!nd) return;
			focused = true;
			e.preventDefault();
			if (nd.x === -dir.x && nd.y === -dir.y) return;
			nextDir = nd;
			if (status === 'dead') reset();
		}

		reset();
		paint();
		raf = requestAnimationFrame(frame);
		window.addEventListener('keydown', onKey);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<div class="snake" role="group" aria-label="Snake">
	<div class="hud">
		<span>score {score}</span>
		{#if status === 'dead'}
			<span class="dead">game over · arrow to restart</span>
		{:else}
			<span class="hint">arrows / wasd</span>
		{/if}
	</div>
	<button type="button" class="board-wrap" onclick={() => (focused = true)} aria-label="Snake board">
		<canvas bind:this={canvas} width={COLS * CELL} height={ROWS * CELL} class="board"></canvas>
	</button>
</div>

<style>
	.snake {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		height: 100%;
		min-height: 0;
		box-sizing: border-box;
		padding: 0.5rem 0.55rem 0.7rem;
	}

	.hud {
		display: flex;
		justify-content: space-between;
		width: min(100%, 92cqh, 36rem);
		max-width: 100%;
		font-size: clamp(0.68rem, 2cqh, 0.95rem);
		font-weight: 600;
		color: var(--px-muted);
		flex-shrink: 0;
		padding: 0 0.15rem;
	}

	.dead {
		color: #c93434;
	}

	.board-wrap {
		all: unset;
		cursor: pointer;
		border-radius: 12px;
		display: grid;
		place-items: center;
		flex: 1 1 auto;
		min-height: 0;
		width: 100%;
		padding: 0.15rem;
		box-sizing: border-box;
	}

	.board {
		display: block;
		border-radius: 12px;
		border: 1.5px solid rgba(0, 0, 0, 0.16);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		background: #fff;
		image-rendering: pixelated;
		/* main playfield eats most of the pane */
		width: min(100%, 94cqh, 40rem);
		height: auto;
		max-height: min(92cqh, 100%);
		aspect-ratio: 16 / 14;
		object-fit: contain;
	}
</style>
