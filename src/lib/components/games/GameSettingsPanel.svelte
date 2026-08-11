<script lang="ts">
	import {
		gameSettings,
		setGameSetting,
		settingSchema,
		type GameSettings
	} from '$lib/games/settings.svelte';

	type Props = { game: keyof GameSettings };
	let { game }: Props = $props();

	const fields = $derived(settingSchema[game] ?? []);
	const values = $derived(gameSettings[game] as Record<string, unknown>);
</script>

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

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 10.5rem;
		padding: 0.5rem 0.55rem;
		border-radius: 10px;
		border: 1px solid var(--px-stroke-soft);
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		font-size: 0.72rem;
	}

	.label {
		font-weight: 600;
		color: var(--px-ink);
		white-space: nowrap;
	}

	select {
		font: inherit;
		font-size: 0.7rem;
		padding: 0.15rem 0.28rem;
		border-radius: 6px;
		border: 1px solid var(--px-stroke-soft);
		background: #fff;
		color: var(--px-ink);
		max-width: 6rem;
	}

	input[type='checkbox'] {
		width: 0.95rem;
		height: 0.95rem;
		accent-color: var(--px-select);
	}
</style>
