<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { prefetchGames } from '$lib/games/cache';
	import { applyPerfClass, detectPerf } from '$lib/perf';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		applyPerfClass(detectPerf());
		prefetchGames();
	});
</script>

<svelte:head>
	<title>hiibolt // socials</title>
	<meta name="description" content="hiibolt — pixel desktop, projects, socials, minigames." />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
