<script lang="ts">
	import Icon from '@iconify/svelte';
	import {
		gameSettings,
		setGameSetting,
		settingSchema,
		type GameSettings
	} from '$lib/games/settings.svelte';

	type Props = { game: keyof GameSettings };
	let { game }: Props = $props();

	let open = $state(false);
	const fields = $derived(settingSchema[game] ?? []);
	const values = $derived(gameSettings[game] as Record<string, unknown>);
</script>

<div class="settings">
	<button
		type="button"
		class="gear"
		class:open
		aria-expanded={open}
		aria-label="Game settings"
		onclick={() => (open = !open)}
	>
		<Icon icon="lucide:settings-2" width="14" height="14" aria-hidden="true" />
	</button>

	{#if open}
		<div class="panel" role="group" aria-label="Settings">
			{#each fields as field (field.key)}
				<label class="row">
					<span class="label" title={field.tip ?? field.label}>{field.label}</span>
					{#if field.type === 'toggle'}
						<input
							type="checkbox"
							checked={Boolean(values[field.key])}
							onchange={(e) =>
								setGameSetting(
									game,
									field.key as never,
									(e.currentTarget as HTMLInputElement).checked as never
								)}
						/>
					{:else if field.type === 'select'}
						<select
							value={String(values[field.key] ?? '')}
							onchange={(e) =>
								setGameSetting(
									game,
									field.key as never,
									(e.currentTarget as HTMLSelectElement).value as never
								)}
						>
							{#each field.options as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					{/if}
				</label>
			{/each}
		</div>
	{/if}
</div>

<style>
	.settings {
		position: absolute;
		top: 0.35rem;
		right: 0.4rem;
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.3rem;
	}

	.gear {
		display: grid;
		place-items: center;
		width: 1.65rem;
		height: 1.65rem;
		padding: 0;
		border-radius: 8px;
		border: 1px solid var(--px-stroke-soft);
		background: rgba(255, 255, 255, 0.75);
		color: var(--px-muted);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	.gear :global(svg) {
		display: block;
	}

	.gear.open,
	.gear:hover {
		color: var(--px-ink);
		background: rgba(255, 255, 255, 0.98);
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
		min-width: 9.5rem;
		padding: 0.4rem 0.5rem;
		border-radius: 10px;
		border: 1px solid var(--px-stroke-soft);
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		font-size: 0.62rem;
	}

	.label {
		font-weight: 600;
		color: var(--px-ink);
	}

	select {
		font: inherit;
		font-size: 0.6rem;
		padding: 0.15rem 0.25rem;
		border-radius: 6px;
		border: 1px solid var(--px-stroke-soft);
		background: #fff;
		color: var(--px-ink);
		max-width: 5.5rem;
	}

	input[type='checkbox'] {
		width: 0.85rem;
		height: 0.85rem;
		accent-color: var(--px-select);
	}
</style>
