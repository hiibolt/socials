<script lang="ts">
	import type { Snippet } from 'svelte';
	import { portal } from '$lib/actions/portal';

	type Props = {
		text: string;
		children: Snippet;
	};

	let { text, children }: Props = $props();

	let open = $state(false);
	let wrapEl: HTMLElement | undefined = $state();
	let tipEl: HTMLElement | undefined = $state();
	let pos = $state({ left: 0, top: 0, place: 'above' as 'above' | 'below' });
	let timer: ReturnType<typeof setTimeout> | null = null;

	function place() {
		if (!wrapEl || !tipEl) return;
		const r = wrapEl.getBoundingClientRect();
		const tw = tipEl.offsetWidth;
		const th = tipEl.offsetHeight;
		const pad = 8;

		let left = r.left + r.width / 2;
		const half = tw / 2;
		left = Math.min(window.innerWidth - half - pad, Math.max(half + pad, left));

		const spaceAbove = r.top;
		const placeAbove = spaceAbove >= th + pad + 4;
		const top = placeAbove ? r.top - pad : r.bottom + pad;

		pos = { left, top, place: placeAbove ? 'above' : 'below' };
	}

	function show() {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			open = true;
			requestAnimationFrame(() => place());
		}, 220);
	}

	function hide() {
		if (timer) clearTimeout(timer);
		timer = null;
		open = false;
	}

	$effect(() => {
		if (!open) return;
		const onMove = () => place();
		window.addEventListener('scroll', onMove, true);
		window.addEventListener('resize', onMove);
		return () => {
			window.removeEventListener('scroll', onMove, true);
			window.removeEventListener('resize', onMove);
		};
	});
</script>

<span
	bind:this={wrapEl}
	class="wrap"
	onpointerenter={show}
	onpointerleave={hide}
	onfocusin={show}
	onfocusout={hide}
	role="group"
>
	{@render children()}
</span>

{#if open && text}
	<span
		bind:this={tipEl}
		use:portal
		class="tip"
		class:below={pos.place === 'below'}
		role="tooltip"
		style:left="{pos.left}px"
		style:top="{pos.top}px"
	>
		{text}
	</span>
{/if}

<style>
	.wrap {
		position: relative;
		display: inline-flex;
		vertical-align: middle;
	}

	.tip {
		position: fixed;
		z-index: 100000;
		transform: translate(-50%, -100%);
		padding: 0.3rem 0.55rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(28, 28, 32, 0.94);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: #f5f5f7;
		font-family: var(--font-pixel);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		line-height: 1.25;
		white-space: nowrap;
		max-width: min(240px, calc(100vw - 16px));
		overflow: hidden;
		text-overflow: ellipsis;
		pointer-events: none;
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
		animation: pop 120ms ease-out;
	}

	.tip.below {
		transform: translate(-50%, 0);
	}

	.tip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: rgba(28, 28, 32, 0.94);
	}

	.tip.below::after {
		top: auto;
		bottom: 100%;
		border-top-color: transparent;
		border-bottom-color: rgba(28, 28, 32, 0.94);
	}

	@keyframes pop {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
