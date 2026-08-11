<script lang="ts">
	import Icon from '@iconify/svelte';
	import Tooltip from './Tooltip.svelte';
	import { resolveLinkIcon } from '$lib/icons/catalog';

	type Props = {
		repository?: string | null;
		liveDemo?: string | null;
	};

	let { repository = null, liveDemo = null }: Props = $props();

	const repo = resolveLinkIcon('repository');
	const demo = resolveLinkIcon('demo');
</script>

<div class="links">
	{#if repository}
		<Tooltip text={repo.tip}>
			<a
				class="icon"
				href={repository}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={repo.tip}
			>
				<Icon icon={repo.icon} width="15" height="15" aria-hidden="true" />
			</a>
		</Tooltip>
	{/if}
	{#if liveDemo}
		<Tooltip text={demo.tip}>
			<a
				class="icon"
				href={liveDemo}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={demo.tip}
			>
				<Icon icon={demo.icon} width="15" height="15" aria-hidden="true" />
			</a>
		</Tooltip>
	{/if}
</div>

<style>
	.links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 8px;
		color: var(--px-ink);
		opacity: 0.72;
		background: rgba(255, 255, 255, 0.45);
		border: 1px solid var(--px-stroke-soft);
		transition:
			opacity 120ms ease,
			background 120ms ease,
			color 120ms ease;
	}

	.icon:hover {
		opacity: 1;
		background: var(--px-select-soft);
		color: var(--px-select);
	}

	.icon :global(svg) {
		display: block;
	}
</style>
