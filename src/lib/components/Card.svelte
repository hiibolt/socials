<script lang="ts" generics="T = never">
	import type { Snippet } from 'svelte';
	import type { WindowId } from '$lib/types';
	import Selector from './Selector.svelte';

	type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

	type Props = {
		id: WindowId;
		title: string;
		x: number;
		y: number;
		w: number;
		h: number;
		z: number;
		maximized: boolean;
		active?: boolean;
		onClose: () => void;
		onMinimize: () => void;
		onMaximize: () => void;
		onFocus: () => void;
		onMove: (x: number, y: number) => void;
		onResize?: (next: { x: number; y: number; w: number; h: number }) => void;
		children?: Snippet;
		items?: T[];
		selected?: T | null;
		getKey?: (item: T) => string;
		getLabel?: (item: T) => string;
		getImage?: (item: T) => string | null | undefined;
		getSettingsId?: (item: T) => keyof import('$lib/games/settings.svelte').GameSettings | null | undefined;
		onSelect?: (item: T) => void;
		selectedContent?: Snippet<[T]>;
	};

	let {
		id,
		title,
		x,
		y,
		w,
		h,
		z,
		maximized,
		active = true,
		onClose,
		onMinimize,
		onMaximize,
		onFocus,
		onMove,
		onResize,
		children,
		items,
		selected = null,
		getKey,
		getLabel,
		getImage,
		getSettingsId,
		onSelect,
		selectedContent
	}: Props = $props();

	const selectable = $derived(
		!!items && !!getKey && !!getLabel && !!onSelect && !!selectedContent
	);

	const edges: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

	let dragging = $state(false);
	let resizing = $state(false);
	let ox = 0;
	let oy = 0;
	let ow = 0;
	let oh = 0;
	let startX = 0;
	let startY = 0;
	let edge: ResizeEdge | null = null;

	function pointerDown(e: PointerEvent) {
		if (maximized) return;
		if ((e.target as HTMLElement).closest('button')) return;
		onFocus();
		dragging = true;
		startX = e.clientX;
		startY = e.clientY;
		ox = x;
		oy = y;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function pointerMove(e: PointerEvent) {
		if (!dragging) return;
		onMove(ox + (e.clientX - startX), oy + (e.clientY - startY));
	}

	function pointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* already released */
		}
	}

	function resizeDown(e: PointerEvent, which: ResizeEdge) {
		if (maximized || !onResize) return;
		e.stopPropagation();
		e.preventDefault();
		onFocus();
		resizing = true;
		edge = which;
		startX = e.clientX;
		startY = e.clientY;
		ox = x;
		oy = y;
		ow = w;
		oh = h;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function resizeMove(e: PointerEvent) {
		if (!resizing || !edge || !onResize) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		let nx = ox;
		let ny = oy;
		let nw = ow;
		let nh = oh;
		if (edge.includes('e')) nw = ow + dx;
		if (edge.includes('s')) nh = oh + dy;
		if (edge.includes('w')) {
			nw = ow - dx;
			nx = ox + dx;
		}
		if (edge.includes('n')) {
			nh = oh - dy;
			ny = oy + dy;
		}
		// floor size; keep opposite edge anchored when shrinking past min
		const minW = 260;
		const minH = 180;
		if (nw < minW) {
			if (edge.includes('w')) nx = ox + ow - minW;
			nw = minW;
		}
		if (nh < minH) {
			if (edge.includes('n')) ny = oy + oh - minH;
			nh = minH;
		}
		onResize({ x: nx, y: ny, w: nw, h: nh });
	}

	function resizeUp(e: PointerEvent) {
		if (!resizing) return;
		resizing = false;
		edge = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* already released */
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div
	class="card"
	class:maximized
	class:dragging
	class:resizing
	class:active
	class:inactive={!active}
	style:left={maximized ? undefined : `${x}px`}
	style:top={maximized ? undefined : `${y}px`}
	style:width={maximized ? undefined : `${w}px`}
	style:height={maximized ? undefined : `${h}px`}
	style:z-index={maximized ? 9000 : z}
	data-window={id}
	onclick={onFocus}
	role="presentation"
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="titlebar"
		role="toolbar"
		tabindex="-1"
		aria-label="{title} window controls"
		onpointerdown={pointerDown}
		onpointermove={pointerMove}
		onpointerup={pointerUp}
		onpointercancel={pointerUp}
		ondblclick={onMaximize}
	>
		<div class="traffic">
			<button
				type="button"
				class="tl close"
				aria-label="Close {title}"
				onclick={(e) => {
					e.stopPropagation();
					onClose();
				}}
			>
				<span class="glyph" aria-hidden="true">×</span>
			</button>
			<button
				type="button"
				class="tl min"
				aria-label="Minimize {title}"
				onclick={(e) => {
					e.stopPropagation();
					onMinimize();
				}}
			>
				<span class="glyph" aria-hidden="true">−</span>
			</button>
			<button
				type="button"
				class="tl max"
				aria-label="Maximize {title}"
				onclick={(e) => {
					e.stopPropagation();
					onMaximize();
				}}
			>
				<span class="glyph" aria-hidden="true">+</span>
			</button>
		</div>
		<span class="title">{title}</span>
		<span class="title-spacer" aria-hidden="true"></span>
	</div>
	<div class="body" class:flush={selectable}>
		{#if selectable && items && getKey && getLabel && onSelect && selectedContent}
			<Selector
				{items}
				{selected}
				{getKey}
				{getLabel}
				{getImage}
				{getSettingsId}
				{onSelect}
				children={selectedContent}
			/>
		{:else if children}
			{@render children()}
		{/if}
	</div>

	{#if !maximized && onResize}
		{#each edges as ed}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="rz rz-{ed}"
				role="separator"
				aria-orientation={ed === 'n' || ed === 's' ? 'horizontal' : 'vertical'}
				aria-label="Resize {ed}"
				onpointerdown={(e) => resizeDown(e, ed)}
				onpointermove={resizeMove}
				onpointerup={resizeUp}
				onpointercancel={resizeUp}
			></div>
		{/each}
	{/if}
</div>

<style>
	.card {
		position: absolute;
		display: flex;
		flex-direction: column;
		min-width: 240px;
		min-height: 180px;
		background: var(--px-glass);
		backdrop-filter: var(--blur);
		-webkit-backdrop-filter: var(--blur);
		border: 1px solid var(--px-stroke);
		border-radius: var(--px-radius);
		box-shadow: var(--px-shadow);
		overflow: hidden;
		user-select: none;
		image-rendering: auto;
		contain: layout style;
		will-change: transform;
		transition:
			box-shadow 160ms ease,
			background 160ms ease,
			opacity 160ms ease;
	}

	:global(html[data-perf='low']) .card {
		will-change: auto;
		transition: none;
	}


	.card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		/* liquid highlight */
		background: linear-gradient(
			155deg,
			rgba(255, 255, 255, 0.55) 0%,
			rgba(255, 255, 255, 0.08) 28%,
			transparent 52%
		);
		opacity: 0.9;
		z-index: 2;
	}

	.card.maximized {
		inset: 0;
		width: auto;
		height: auto;
		max-width: none;
		max-height: none;
		min-width: 0;
		min-height: 0;
		border-radius: 0;
		box-shadow: none;
		/* sit above desktop chrome, still under dock (10000) */
		z-index: 9000;
	}

	.card.maximized::before {
		border-radius: 0;
	}

	.card.maximized .body {
		/* use remaining viewport under titlebar */
		flex: 1 1 auto;
		min-height: 0;
	}

	.card.maximized .body:not(.flush) {
		padding: clamp(0.85rem, 2.2vh, 1.75rem) clamp(1rem, 3vw, 2.5rem);
		display: flex;
		flex-direction: column;
	}

	.card.maximized .body.flush :global(.selector) {
		/* wider sidebar when huge */
		grid-template-columns: minmax(8rem, min(18vw, 14rem)) 1fr;
	}

	/* games: less wasted chrome when maximized */
	.card.maximized[data-window='games'] .body.flush :global(.pane) {
		padding: clamp(0.35rem, 1vh, 0.75rem) clamp(0.4rem, 1.2vw, 1rem);
	}

	.card.maximized[data-window='games'] .body.flush :global(.selector) {
		grid-template-columns: minmax(6.5rem, min(12vw, 11rem)) 1fr;
	}

	.card.maximized .body:not(.flush) > :global(*) {
		flex: 1 1 auto;
		min-height: 0;
		width: 100%;
		max-width: min(52rem, 100%);
		margin-inline: auto;
	}

	.card.dragging {
		cursor: grabbing;
		opacity: 0.96;
	}

	.card.resizing {
		opacity: 0.98;
	}

	.rz {
		position: absolute;
		z-index: 6;
		/* expand hit target beyond the thin edge */
		background: transparent;
		touch-action: none;
	}

	.rz-n {
		top: -3px;
		left: 10px;
		right: 10px;
		height: 8px;
		cursor: ns-resize;
	}

	.rz-s {
		bottom: -3px;
		left: 10px;
		right: 10px;
		height: 8px;
		cursor: ns-resize;
	}

	.rz-e {
		top: 10px;
		right: -3px;
		bottom: 10px;
		width: 8px;
		cursor: ew-resize;
	}

	.rz-w {
		top: 10px;
		left: -3px;
		bottom: 10px;
		width: 8px;
		cursor: ew-resize;
	}

	.rz-ne {
		top: -3px;
		right: -3px;
		width: 14px;
		height: 14px;
		cursor: nesw-resize;
	}

	.rz-nw {
		top: -3px;
		left: -3px;
		width: 14px;
		height: 14px;
		cursor: nwse-resize;
	}

	.rz-se {
		bottom: -3px;
		right: -3px;
		width: 14px;
		height: 14px;
		cursor: nwse-resize;
	}

	.rz-sw {
		bottom: -3px;
		left: -3px;
		width: 14px;
		height: 14px;
		cursor: nesw-resize;
	}

	.card.active {
		background: var(--px-glass-strong);
		box-shadow: var(--px-shadow-active);
	}

	.card.inactive {
		background: var(--px-glass-tint);
		opacity: 0.92;
	}

	.card.inactive .title {
		color: var(--px-muted);
	}

	.card.inactive .tl {
		filter: saturate(0.75) brightness(1.05);
	}

	.titlebar {
		position: relative;
		z-index: 3;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.75rem 0.45rem;
		cursor: grab;
		touch-action: none;
		flex-shrink: 0;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.35) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-bottom: 1px solid var(--px-stroke-soft);
	}

	.dragging .titlebar {
		cursor: grabbing;
	}

	.traffic {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding-left: 0.15rem;
	}

	.tl {
		position: relative;
		width: 12px;
		height: 12px;
		border: none;
		border-radius: 50%;
		padding: 0;
		cursor: pointer;
		display: grid;
		place-items: center;
		box-shadow:
			inset 0 0 0 0.5px rgba(0, 0, 0, 0.18),
			0 0.5px 1px rgba(0, 0, 0, 0.12);
		transition: filter 120ms ease;
	}

	.tl .glyph {
		font-size: 10px;
		line-height: 1;
		font-weight: 700;
		opacity: 0;
		color: rgba(0, 0, 0, 0.55);
		transform: translateY(-0.5px);
		transition: opacity 100ms ease;
	}

	.traffic:hover .tl .glyph {
		opacity: 1;
	}

	.tl.close {
		background: var(--px-tl-close);
	}

	.tl.min {
		background: var(--px-tl-min);
	}

	.tl.max {
		background: var(--px-tl-max);
	}

	.tl:hover {
		filter: brightness(1.05);
	}

	.tl:active {
		filter: brightness(0.92);
	}

	.title {
		justify-self: center;
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--px-ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		opacity: 0.85;
	}

	.title-spacer {
		/* mirrors traffic-light cluster so title stays centered */
		width: 3.4rem;
		min-width: 52px;
	}

	.body {
		position: relative;
		z-index: 3;
		flex: 1;
		min-height: 0;
		overflow: auto;
		overflow-x: hidden;
		background: var(--px-window);
		padding: 0.75rem 0.85rem;
		cursor: default;
		user-select: text;
		border-top: 1px solid rgba(255, 255, 255, 0.35);
		/* avoid clipping top content (avatar ring) when body scrolls */
		-webkit-overflow-scrolling: touch;
	}

	.card[data-window='profile'] .body {
		overflow: visible;
		display: flex;
		flex-direction: column;
	}

	.card[data-window='profile'] .body > :global(*) {
		flex: 1 1 auto;
		min-height: 0;
	}

	.body.flush {
		padding: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: transparent;
		border-top: none;
	}

	.body.flush :global(.selector) {
		flex: 1;
		min-height: 0;
		border: none;
		background: transparent;
	}

	/* project detail bleeds to pane edges */
	.body.flush :global(.pane) {
		padding: 0;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.body.flush :global(.pane > .detail),
	.body.flush :global(.pane > .host) {
		margin: 0;
		flex: 1 1 auto;
		min-height: 0;
		height: 100%;
	}

	/* games keep a little inset while still filling height */
	.card[data-window='games'] .body.flush :global(.pane) {
		padding: 0;
	}

	.card[data-window='games'] .body.flush :global(.pane > .host) {
		height: 100%;
	}
</style>
