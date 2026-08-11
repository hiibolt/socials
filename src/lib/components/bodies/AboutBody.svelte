<script lang="ts">
	import TagIcon from '$lib/components/TagIcon.svelte';

	const tech = ['Rust', 'Nix', 'K8s', 'Svelte', 'HPC', 'Homelabbing', 'Bun', 'Tauri'] as const;
	const hobbies = [
		'Motorcycling',
		'E-Skateboarding',
		'Snowboarding',
		'Reading',
		'Cars',
		'Music',
		'Exploring',
		'Hiking'
	] as const;
</script>

<div class="about">
	<div class="intro">
		<p class="lead">John White</p>
		<p class="tagline">I rewrite Rust projects in Rust.</p>
		<p class="bio">
			Backend, systems, and the occasional compiler. NixOS + k8s when not shipping code.
		</p>
	</div>

	<div class="grid">
		<section class="chip-panel" aria-label="Tech interests">
			<span class="label">tech</span>
			<div class="tags">
				{#each tech as tag}
					<TagIcon label={tag} />
				{/each}
			</div>
		</section>
		<section class="chip-panel" aria-label="Hobbies">
			<span class="label">hobbies</span>
			<div class="tags">
				{#each hobbies as hobby}
					<TagIcon label={hobby} />
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.about {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		font-size: 0.88rem;
		line-height: 1.4;
		color: var(--px-ink);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex-shrink: 0;
	}

	.lead {
		margin: 0;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: 0.01em;
	}

	.tagline {
		margin: 0;
		font-weight: 600;
		font-size: 0.84rem;
		color: var(--px-ink);
	}

	.bio {
		margin: 0.2rem 0 0;
		color: rgba(29, 29, 31, 0.78);
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-top: auto;
		min-height: 0;
		flex: 1 1 auto;
	}

	.chip-panel {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.5rem 0.55rem;
		border-radius: 12px;
		border: 1px solid var(--px-stroke-soft);
		background: rgba(255, 255, 255, 0.45);
		min-width: 0;
		min-height: 0;
	}

	.label {
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--px-muted);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	:global(.card.maximized) .about {
		gap: 1.25rem;
		max-width: 42rem;
		margin-inline: auto;
		justify-content: center;
		font-size: clamp(0.9rem, 1.3vw, 1.05rem);
	}

	:global(.card.maximized) .lead {
		font-size: clamp(1.25rem, 2.5vw, 1.75rem);
	}

	:global(.card.maximized) .tagline {
		font-size: clamp(0.9rem, 1.5vw, 1.1rem);
	}

	:global(.card.maximized) .bio {
		font-size: clamp(0.88rem, 1.35vw, 1.05rem);
		max-width: 36rem;
	}

	:global(.card.maximized) .grid {
		gap: 0.75rem;
	}

	:global(.card.maximized) .chip-panel {
		padding: 0.75rem 0.85rem;
		gap: 0.5rem;
	}
</style>
