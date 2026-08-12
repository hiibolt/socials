<script lang="ts">
	import type { Component } from 'svelte';

	type Props = {
		component: Component<Record<string, never>>;
	};

	let { component: Game }: Props = $props();
</script>

<div class="host">
	<Game />
</div>

<style>
	.host {
		height: 100%;
		min-height: 20rem;
		min-width: 0;
		width: 100%;
		padding: 0.4rem 0.25rem 0.5rem;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		container-type: size;
		container-name: game;
		overflow: hidden;
	}

	.host > :global(*) {
		flex: 1 1 auto;
		min-height: 0;
		min-width: 0;
		width: 100%;
		height: 100%;
	}

	:global(.card.maximized) .host {
		/* use almost the full pane — was over-padded */
		padding: clamp(0.25rem, 0.8vh, 0.6rem) clamp(0.2rem, 0.8vw, 0.5rem);
	}

	:global(.card.maximized) .host > :global(*) {
		/* let games claim the pane; they self-cap with cqi/cqh */
		max-width: 100%;
		margin-inline: auto;
	}
</style>
