<script lang="ts">
	import type { WindowState } from '$lib/types';

	type Props = {
		windows: WindowState[];
		onRestore: (id: WindowState['id']) => void;
	};

	let { windows, onRestore }: Props = $props();

	let minimized = $derived(windows.filter((w) => w.minimized && !w.closed));
</script>

{#if minimized.length > 0}
	<nav class="dock" aria-label="Minimized windows">
		{#each minimized as win (win.id)}
			<button type="button" class="slot" onclick={() => onRestore(win.id)}>
				<span class="glyph" aria-hidden="true">{win.title.slice(0, 1)}</span>
				<span class="label">{win.title}</span>
			</button>
		{/each}
	</nav>
{/if}

<style>
	.dock {
		position: fixed;
		left: 50%;
		bottom: 0.85rem;
		transform: translateX(-50%);
		display: flex;
		gap: 0.35rem;
		padding: 0.45rem 0.55rem;
		background: var(--px-glass);
		backdrop-filter: var(--blur);
		-webkit-backdrop-filter: var(--blur);
		border: 1px solid var(--px-stroke);
		border-radius: 18px;
		box-shadow: var(--px-shadow-active);
		z-index: 10000;
		contain: layout style;
	}


	.dock::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.45) 0%,
			rgba(255, 255, 255, 0.05) 45%,
			transparent 100%
		);
	}

	.slot {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		min-width: 3.1rem;
		padding: 0.35rem 0.45rem;
		border: 1px solid transparent;
		border-radius: 12px;
		background: transparent;
		cursor: pointer;
		font: inherit;
		color: var(--px-ink);
		transition:
			background 120ms ease,
			transform 120ms ease;
	}

	.slot:hover {
		background: rgba(255, 255, 255, 0.45);
		transform: translateY(-2px);
	}

	.slot:active {
		transform: translateY(0);
	}

	.glyph {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		background: linear-gradient(160deg, #f4f5f8 0%, #d9dde6 100%);
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 10px;
		font-weight: 700;
		font-size: 0.85rem;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
		text-transform: uppercase;
	}

	.label {
		font-size: 0.62rem;
		letter-spacing: 0.02em;
		max-width: 5rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0.75;
	}
</style>
