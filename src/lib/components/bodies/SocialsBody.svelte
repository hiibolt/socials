<script lang="ts">
	import Icon from '@iconify/svelte';
	import { socials } from '$lib/data/socials';
	import { resolveSocialIcon } from '$lib/icons/catalog';
</script>

<ul class="socials">
	{#each socials as s (s.id)}
		{@const ic = resolveSocialIcon(s.id)}
		<li>
			<a href={s.url} target="_blank" rel="noopener noreferrer">
				<span class="left">
					<span class="badge" aria-hidden="true">
						<Icon icon={ic.icon} width="16" height="16" />
					</span>
					<span class="label">{s.label}</span>
				</span>
				<span class="handle">{s.handle}</span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.socials {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		width: 100%;
		height: 100%;
		min-height: 0;
		justify-content: center;
	}

	:global(.card.maximized) .socials {
		max-width: 28rem;
		margin-inline: auto;
		gap: 0.65rem;
	}

	:global(.card.maximized) a {
		padding: 0.85rem 1rem;
		font-size: 0.95rem;
	}

	a {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--px-stroke-soft);
		border-radius: var(--px-radius-sm);
		background: rgba(255, 255, 255, 0.55);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
		color: var(--px-ink);
		text-decoration: none;
		font-size: 0.88rem;
		transition:
			background 120ms ease,
			transform 120ms ease,
			box-shadow 120ms ease;
	}

	a:hover {
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	a:active {
		transform: translateY(0);
	}

	.left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.badge {
		display: grid;
		place-items: center;
		width: 1.7rem;
		height: 1.7rem;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.05);
		color: var(--px-ink);
		flex-shrink: 0;
	}

	.badge :global(svg) {
		display: block;
	}

	.label {
		font-weight: 600;
		letter-spacing: 0.01em;
		font-size: 0.86rem;
	}

	.handle {
		font-size: 0.76rem;
		color: var(--px-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
