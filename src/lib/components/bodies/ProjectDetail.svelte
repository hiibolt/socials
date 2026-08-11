<script lang="ts">
	import TagIcon from '$lib/components/TagIcon.svelte';
	import LinkIcons from '$lib/components/LinkIcons.svelte';
	import type { Project } from '$lib/types';

	type Props = { project: Project };
	let { project }: Props = $props();
</script>

<article class="detail">
	<div class="hero" class:empty={!project.image}>
		{#if project.image}
			<img
				src={project.image}
				alt=""
				width="480"
				height="160"
				loading="lazy"
				decoding="async"
				fetchpriority="low"
			/>
		{:else}
			<div class="fallback" aria-hidden="true">
				<span>{project.title.slice(0, 1)}</span>
			</div>
		{/if}
		<div class="hero-shade"></div>
		<div class="hero-bar">
			<h3>{project.title}</h3>
			<LinkIcons repository={project.repository} liveDemo={project.liveDemo} />
		</div>
	</div>

	<div class="body">
		<p>{project.summary}</p>
		<div class="tags" aria-label="Tags">
			{#each project.tags as tag}
				<TagIcon label={tag} />
			{/each}
		</div>
	</div>
</article>

<style>
	.detail {
		display: flex;
		flex-direction: column;
		gap: 0;
		height: 100%;
		min-height: 0;
		container-type: size;
	}

	.hero {
		position: relative;
		height: clamp(7.5rem, 32%, 9.5rem);
		flex-shrink: 0;
		overflow: hidden;
		background: linear-gradient(145deg, #dfe3ea 0%, #c5ccd8 100%);
	}

	:global(.card.maximized) .hero {
		height: clamp(160px, 28vh, 320px);
	}

	:global(.card.maximized) h3 {
		font-size: clamp(1rem, 2.2vw, 1.45rem);
	}

	:global(.card.maximized) .body {
		padding: clamp(1rem, 2.5vh, 1.75rem) clamp(1.1rem, 3vw, 2.25rem);
		gap: 0.85rem;
	}

	:global(.card.maximized) p {
		font-size: clamp(0.85rem, 1.4vw, 1.05rem);
		max-width: 48rem;
	}

	.hero img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.fallback {
		display: grid;
		place-items: center;
		height: 100%;
		font-size: 2.4rem;
		font-weight: 700;
		color: rgba(29, 29, 31, 0.2);
		letter-spacing: 0.04em;
	}

	.hero-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			transparent 20%,
			rgba(15, 18, 24, 0.15) 55%,
			rgba(15, 18, 24, 0.72) 100%
		);
		pointer-events: none;
	}

	.hero-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.55rem 0.7rem;
		z-index: 1;
	}

	h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.01em;
		line-height: 1.25;
		color: #fff;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
		min-width: 0;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.8rem 0.85rem 0.85rem;
		background: var(--px-window);
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	p {
		margin: 0;
		font-size: 0.84rem;
		line-height: 1.45;
		color: rgba(29, 29, 31, 0.8);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: auto;
	}

	/* light-on-dark link chips over hero */
	.hero-bar :global(.icon) {
		background: rgba(255, 255, 255, 0.18);
		border-color: rgba(255, 255, 255, 0.28);
		color: #fff;
		opacity: 0.95;
	}

	.hero-bar :global(.icon:hover) {
		background: rgba(255, 255, 255, 0.92);
		color: var(--px-select);
	}
</style>
