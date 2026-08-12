<script lang="ts">
	import { onMount } from 'svelte';
	import Card from './Card.svelte';
	import Dock from './Dock.svelte';
	import GameOfLife from './GameOfLife.svelte';
	import ProfileBody from './bodies/ProfileBody.svelte';
	import AboutBody from './bodies/AboutBody.svelte';
	import ProjectDetail from './bodies/ProjectDetail.svelte';
	import SocialsBody from './bodies/SocialsBody.svelte';
	import GameHost from './bodies/GameHost.svelte';
	import { projects } from '$lib/data/projects';
	import { gameCatalog, type GameItem } from '$lib/data/gameCatalog';
	import { defaultWindows } from '$lib/data/windows';
	import type { Project, WindowId, WindowState } from '$lib/types';

	let windows = $state<WindowState[]>(structuredClone(defaultWindows));
	let topZ = $state(10);
	let activeId = $state<WindowId>('profile');
	let selectedProject = $state<Project | null>(projects[0] ?? null);
	let selectedGame = $state<GameItem | null>(gameCatalog[0] ?? null);

	function idx(id: WindowId) {
		return windows.findIndex((w) => w.id === id);
	}

	function focus(id: WindowId) {
		const i = idx(id);
		if (i < 0) return;
		topZ += 1;
		activeId = id;
		windows[i] = { ...windows[i], z: topZ };
	}

	function close(id: WindowId) {
		const i = idx(id);
		if (i < 0) return;
		windows[i] = { ...windows[i], closed: true, minimized: false, maximized: false };
		if (activeId === id) {
			const next = windows.find((w) => !w.closed && !w.minimized);
			if (next) activeId = next.id;
		}
	}

	function minimize(id: WindowId) {
		const i = idx(id);
		if (i < 0) return;
		windows[i] = { ...windows[i], minimized: true, maximized: false };
		if (activeId === id) {
			const next = windows.find((w) => !w.closed && !w.minimized && w.id !== id);
			if (next) activeId = next.id;
		}
	}

	function maximize(id: WindowId) {
		const i = idx(id);
		if (i < 0) return;
		const w = windows[i];
		if (w.maximized) {
			const r = w.restore;
			windows[i] = {
				...w,
				maximized: false,
				x: r?.x ?? w.x,
				y: r?.y ?? w.y,
				w: r?.w ?? w.w,
				h: r?.h ?? w.h,
				restore: null
			};
		} else {
			windows[i] = {
				...w,
				maximized: true,
				minimized: false,
				restore: { x: w.x, y: w.y, w: w.w, h: w.h }
			};
		}
		focus(id);
	}

	function restore(id: WindowId) {
		const i = idx(id);
		if (i < 0) return;
		windows[i] = { ...windows[i], minimized: false };
		focus(id);
	}

	function move(id: WindowId, x: number, y: number) {
		const i = idx(id);
		if (i < 0) return;
		const maxX = Math.max(0, window.innerWidth - 80);
		const maxY = Math.max(0, window.innerHeight - 40);
		windows[i] = {
			...windows[i],
			x: Math.min(Math.max(-40, x), maxX),
			y: Math.min(Math.max(0, y), maxY)
		};
	}

	function resize(id: WindowId, next: { x: number; y: number; w: number; h: number }) {
		const i = idx(id);
		if (i < 0) return;
		const minW = 280;
		const minH = 200;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		let { x, y, w, h } = next;
		w = Math.max(minW, w);
		h = Math.max(minH, h);
		// keep a bit of the window on-screen
		x = Math.min(Math.max(-w + 80, x), vw - 80);
		y = Math.min(Math.max(0, y), vh - 48);
		if (x + w > vw + 40) w = Math.max(minW, vw + 40 - x);
		if (y + h > vh + 20) h = Math.max(minH, vh + 20 - y);
		windows[i] = { ...windows[i], x, y, w, h, maximized: false };
	}

	function chrome(win: WindowState) {
		return {
			id: win.id,
			title: win.title,
			x: win.x,
			y: win.y,
			w: win.w,
			h: win.h,
			z: win.z,
			maximized: win.maximized,
			active: activeId === win.id,
			onClose: () => close(win.id),
			onMinimize: () => minimize(win.id),
			onMaximize: () => maximize(win.id),
			onFocus: () => focus(win.id),
			onMove: (x: number, y: number) => move(win.id, x, y),
			onResize: (r: { x: number; y: number; w: number; h: number }) => resize(win.id, r)
		};
	}

	function clampToViewport() {
		if (typeof window === 'undefined') return;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		if (vw < 900) return;
		windows = windows.map((w) => ({
			...w,
			x: Math.min(w.x, Math.max(0, vw - 100)),
			y: Math.min(w.y, Math.max(0, vh - 48)),
			w: Math.min(w.w, vw - 16),
			h: Math.min(w.h, vh - 16)
		}));
	}

	onMount(() => {
		clampToViewport();
		const onResize = () => clampToViewport();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<div class="desktop">
	<GameOfLife />

	<div class="stage">
		{#each windows as win (win.id)}
			{#if !win.closed && !win.minimized}
				{#if win.id === 'projects'}
					<Card
						{...chrome(win)}
						items={projects}
						selected={selectedProject}
						getKey={(p) => p.id}
						getLabel={(p) => p.title}
						getImage={(p) => p.image}
						onSelect={(p) => (selectedProject = p)}
					>
						{#snippet selectedContent(project)}
							<ProjectDetail {project} />
						{/snippet}
					</Card>
				{:else if win.id === 'games'}
					<Card
						{...chrome(win)}
						items={gameCatalog}
						selected={selectedGame}
						getKey={(g) => g.id}
						getLabel={(g) => g.label}
						getSettingsId={(g) => g.id}
						onSelect={(g) => (selectedGame = g)}
					>
						{#snippet selectedContent(game)}
							<GameHost component={game.component} />
						{/snippet}
					</Card>
				{:else}
					<Card {...chrome(win)}>
						{#if win.id === 'profile'}
							<ProfileBody />
						{:else if win.id === 'about'}
							<AboutBody />
						{:else if win.id === 'socials'}
							<SocialsBody />
						{/if}
					</Card>
				{/if}
			{/if}
		{/each}
	</div>

	<Dock {windows} onRestore={restore} />
</div>

<style>
	.desktop {
		position: relative;
		width: 100%;
		height: 100dvh;
		min-height: 100dvh;
		overflow: hidden;
	}

	.stage {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		min-height: 100dvh;
	}

	@media (max-width: 900px) {
		.desktop {
			height: auto;
			min-height: 100dvh;
			overflow: auto;
		}

		.stage {
			min-height: auto;
			height: auto;
			padding-bottom: 5rem;
		}

		/* stacked layout — but still honor maximized */
		.stage :global(.card:not(.maximized)) {
			position: relative !important;
			left: auto !important;
			top: auto !important;
			width: calc(100% - 1.5rem) !important;
			margin: 0.75rem auto;
			height: auto !important;
			min-height: 260px;
			max-height: none !important;
		}

		/* room for avatar + labels without clipping (esp. Firefox) */
		.stage :global(.card:not(.maximized)[data-window='profile']) {
			min-height: 310px;
			height: 310px !important;
		}

		.stage :global(.card:not(.maximized)[data-window='projects']) {
			min-height: 420px;
			height: min(70dvh, 560px) !important;
		}

		/* Wordle needs vertical room for legend + board + keyboard */
		.stage :global(.card:not(.maximized)[data-window='games']) {
			min-height: 560px;
			height: min(78dvh, 640px) !important;
		}

		.stage :global(.card.maximized) {
			position: fixed !important;
			inset: 0 !important;
			width: auto !important;
			height: auto !important;
			margin: 0 !important;
			z-index: 9000 !important;
		}
	}
</style>
