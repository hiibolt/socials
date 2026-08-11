<script lang="ts">
	import { onMount } from 'svelte';
	import { detectPerf } from '$lib/perf';

	type Props = { paused?: boolean };
	let { paused = false }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	const gate = { paused: false };
	$effect(() => {
		gate.paused = paused;
	});

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
		if (!ctx) return;

		const off = document.createElement('canvas');
		const offCtx = off.getContext('2d', { alpha: false });
		if (!offCtx) return;

		const perf = detectPerf();
		const reduced = perf.reducedMotion;
		const low = perf.tier === 'low';

		const paper = [232, 234, 239] as const;
		const ink = [48, 52, 60] as const;

		let cell = perf.golCell;
		let cols = 0;
		let rows = 0;
		let cur = new Uint8Array(0);
		let nxt = new Uint8Array(0);
		let heat = new Float32Array(0);
		let img: ImageData | null = null;
		let raf = 0;
		let lastStep = 0;
		let lastPaint = 0;
		let frameN = 0;
		let stagnant = 0;
		let prevPop = -1;
		let dirty = true;
		const stepMs = perf.golStepMs;
		const paintEvery = perf.golPaintEvery;
		const fadeIn = low ? 5 : 3.0;
		const fadeOut = low ? 10 : 7.0;
		const inkMax = 0.42;
		let running = !reduced;

		const gliderR: [number, number][] = [
			[1, 0],
			[2, 1],
			[0, 2],
			[1, 2],
			[2, 2]
		];
		const gliderL: [number, number][] = [
			[1, 0],
			[0, 1],
			[0, 2],
			[1, 2],
			[2, 2]
		];

		function stamp(pat: [number, number][], ox: number, oy: number, lit = true) {
			for (const [dx, dy] of pat) {
				const x = ((ox + dx) % cols + cols) % cols;
				const y = ((oy + dy) % rows + rows) % rows;
				const i = y * cols + x;
				cur[i] = 1;
				if (lit) heat[i] = Math.max(heat[i], 0.15);
			}
			dirty = true;
		}

		function seed() {
			const n = cols * rows;
			cur = new Uint8Array(n);
			nxt = new Uint8Array(n);
			heat = new Float32Array(n);
			img = new ImageData(cols, rows);
			off.width = cols;
			off.height = rows;
			stagnant = 0;
			prevPop = -1;

			const density = low ? 0.07 : 0.09;
			for (let i = 0; i < n; i++) {
				const alive = Math.random() < density ? 1 : 0;
				cur[i] = alive;
				heat[i] = alive ? 0.35 + Math.random() * 0.4 : 0;
			}

			for (let p = 0; p < (low ? 3 : 6); p++) {
				const pat = p % 2 === 0 ? gliderR : gliderL;
				stamp(
					pat,
					((Math.random() * (cols - 6)) | 0) + 1,
					((Math.random() * (rows - 6)) | 0) + 1
				);
			}
			dirty = true;
		}

		function injectLife(count = 3) {
			for (let i = 0; i < count; i++) {
				const pat = Math.random() < 0.5 ? gliderR : gliderL;
				stamp(pat, ((Math.random() * cols) | 0) % cols, ((Math.random() * rows) | 0) % rows);
			}
		}

		function resize() {
			const dpr = low ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			if (vw < 1 || vh < 1) return;

			canvas!.width = Math.max(1, Math.floor(vw * dpr));
			canvas!.height = Math.max(1, Math.floor(vh * dpr));
			canvas!.style.width = `${vw}px`;
			canvas!.style.height = `${vh}px`;
			ctx!.imageSmoothingEnabled = false;

			const nextCols = Math.max(8, Math.floor(vw / cell));
			const nextRows = Math.max(8, Math.floor(vh / cell));
			if (nextCols !== cols || nextRows !== rows) {
				cols = nextCols;
				rows = nextRows;
				seed();
			}
			dirty = true;
			paint(true);
		}

		function step() {
			const c = cols;
			const r = rows;
			if (c < 1 || r < 1) return;
			let pop = 0;
			for (let y = 0; y < r; y++) {
				const y0 = y * c;
				const yn = ((y + 1) % r) * c;
				const yp = ((y - 1 + r) % r) * c;
				for (let x = 0; x < c; x++) {
					const xl = (x - 1 + c) % c;
					const xr = (x + 1) % c;
					const n =
						cur[yp + xl] +
						cur[yp + x] +
						cur[yp + xr] +
						cur[y0 + xl] +
						cur[y0 + xr] +
						cur[yn + xl] +
						cur[yn + x] +
						cur[yn + xr];
					const alive = cur[y0 + x];
					const next = n === 3 || (alive && n === 2) ? 1 : 0;
					nxt[y0 + x] = next;
					pop += next;
				}
			}
			const t = cur;
			cur = nxt;
			nxt = t;
			dirty = true;

			const total = c * r;
			const sparse = pop < total * 0.004;
			const stuck = prevPop >= 0 && Math.abs(pop - prevPop) <= 2 && pop < total * 0.08;
			prevPop = pop;
			if (sparse || stuck) {
				stagnant++;
				if (stagnant > 12) {
					injectLife(sparse ? 4 : 2);
					stagnant = 0;
				}
			} else {
				stagnant = 0;
			}
		}

		function tickHeat(dt: number) {
			const n = heat.length;
			const up = fadeIn * dt;
			const down = fadeOut * dt;
			let changed = false;
			for (let i = 0; i < n; i++) {
				const target = cur[i] ? 1 : 0;
				const h = heat[i];
				if (h < target) {
					heat[i] = h + up > 1 ? 1 : h + up;
					changed = true;
				} else if (h > target) {
					heat[i] = h - down < 0 ? 0 : h - down;
					changed = true;
				}
			}
			if (changed) dirty = true;
		}

		function paint(force = false) {
			if (!img) return;
			if (!force && !dirty) return;
			dirty = false;

			const data = img.data;
			const n = heat.length;
			const [pr, pg, pb] = paper;
			const [ir, ig, ib] = ink;
			const dr = ir - pr;
			const dg = ig - pg;
			const db = ib - pb;

			for (let i = 0; i < n; i++) {
				const t = heat[i];
				const e = t * t * (3 - 2 * t);
				const a = e * inkMax;
				const o = i << 2;
				data[o] = (pr + dr * a) | 0;
				data[o + 1] = (pg + dg * a) | 0;
				data[o + 2] = (pb + db * a) | 0;
				data[o + 3] = 255;
			}

			offCtx!.putImageData(img, 0, 0);
			ctx!.imageSmoothingEnabled = false;
			ctx!.drawImage(off, 0, 0, canvas!.width, canvas!.height);
		}

		function paintAt(clientX: number, clientY: number) {
			if (!cols || !rows) return;
			const x = Math.floor((clientX / window.innerWidth) * cols);
			const y = Math.floor((clientY / window.innerHeight) * rows);
			if (x < 0 || y < 0 || x >= cols || y >= rows) return;
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					if (dx * dx + dy * dy > 2) continue;
					const cx = (x + dx + cols) % cols;
					const cy = (y + dy + rows) % rows;
					const i = cy * cols + cx;
					cur[i] = 1;
					heat[i] = Math.max(heat[i], 0.2);
				}
			}
			dirty = true;
		}

		let lastBrush = 0;
		function onPointer(e: PointerEvent) {
			if (reduced || !running || low || gate.paused) return;
			if ((e.target as HTMLElement)?.closest?.('.card, .dock, button, a, input')) return;
			const now = performance.now();
			if (now - lastBrush < 40) return;
			lastBrush = now;
			paintAt(e.clientX, e.clientY);
		}

		function frame(ts: number) {
			raf = requestAnimationFrame(frame);
			if (!running) {
				lastPaint = ts;
				return;
			}

			// paused: keep last frame on screen, don't advance sim
			if (gate.paused) {
				lastPaint = ts;
				return;
			}

			if (lastPaint === 0) lastPaint = ts;
			const dt = Math.min(0.05, (ts - lastPaint) / 1000);
			lastPaint = ts;
			frameN++;

			if (ts - lastStep >= stepMs) {
				lastStep = ts;
				step();
			}

			tickHeat(dt);
			if (frameN % paintEvery === 0) paint();
		}

		function onVis() {
			running = !document.hidden && !reduced;
			if (running) {
				const now = performance.now();
				lastStep = now;
				lastPaint = now;
				dirty = true;
				paint(true);
			}
		}

		const ro = new ResizeObserver(resize);
		ro.observe(document.documentElement);
		document.addEventListener('visibilitychange', onVis);
		if (!low) window.addEventListener('pointermove', onPointer, { passive: true });
		resize();
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			document.removeEventListener('visibilitychange', onVis);
			window.removeEventListener('pointermove', onPointer);
		};
	});
</script>

<canvas bind:this={canvas} class="gol" aria-hidden="true"></canvas>

<style>
	.gol {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		pointer-events: none;
		image-rendering: pixelated;
		background: rgb(232, 234, 239);
		/* do NOT use contain:strict — size containment collapses % dimensions to 0 */
		contain: layout style paint;
		-webkit-mask-image: radial-gradient(
			ellipse 80% 75% at 50% 48%,
			#000 0%,
			#000 45%,
			rgba(0, 0, 0, 0.65) 70%,
			rgba(0, 0, 0, 0.2) 88%,
			transparent 100%
		);
		mask-image: radial-gradient(
			ellipse 80% 75% at 50% 48%,
			#000 0%,
			#000 45%,
			rgba(0, 0, 0, 0.65) 70%,
			rgba(0, 0, 0, 0.2) 88%,
			transparent 100%
		);
		opacity: 0.92;
	}

	:global(html[data-perf='low']) .gol {
		opacity: 0.8;
		-webkit-mask-image: none;
		mask-image: none;
	}
</style>
