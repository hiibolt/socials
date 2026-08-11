<script lang="ts">
	import Icon from '@iconify/svelte';
	import Tooltip from './Tooltip.svelte';
	import { resolveTagIcon } from '$lib/icons/catalog';

	type Props = {
		label: string;
		/** optional override iconify id */
		icon?: string;
		/** optional override tooltip */
		tip?: string;
	};

	let { label, icon, tip }: Props = $props();

	const def = $derived(resolveTagIcon(label));
	const iconId = $derived(icon ?? def.icon);
	const tooltip = $derived(tip ?? def.tip ?? label);
</script>

<Tooltip text={tooltip}>
	<span class="tag" aria-label={tooltip}>
		<Icon icon={iconId} width="15" height="15" aria-hidden="true" />
	</span>
</Tooltip>

<style>
	.tag {
		display: inline-grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 8px;
		border: 1px solid var(--px-stroke-soft);
		background: rgba(255, 255, 255, 0.58);
		color: var(--px-ink);
		opacity: 0.82;
		cursor: default;
		transition:
			opacity 120ms ease,
			background 120ms ease,
			transform 120ms ease,
			color 120ms ease;
	}

	.tag :global(svg) {
		display: block;
	}

	.tag:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.96);
		transform: translateY(-1px);
		color: #000;
	}
</style>
