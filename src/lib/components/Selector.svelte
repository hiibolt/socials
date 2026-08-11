<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { GameSettings } from '$lib/games/settings.svelte';
	import GameSettingsPanel from '$lib/components/games/GameSettingsPanel.svelte';
	import { portal } from '$lib/actions/portal';

	type Props = {
		items: T[];
		selected: T | null;
		getKey: (item: T) => string;
		getLabel: (item: T) => string;
		getImage?: (item: T) => string | null | undefined;
		getSettingsId?: (item: T) => keyof GameSettings | null | undefined;
		onSelect: (item: T) => void;
		children: Snippet<[T]>;
		empty?: Snippet;
	};

	let {
		items,
		selected,
		getKey,
		getLabel,
		getImage,
		getSettingsId,
		onSelect,
		children,
		empty
	}: Props = $props();

	let settingsFor = $state<string | null>(null);
	let settingsGame = $state<keyof GameSettings | null>(null);
	let anchorEl: HTMLElement | null = null;
	let popPos = $state({ top: 0, left: 0 });

	function placePop() {
		if (!anchorEl) return;
		const r = anchorEl.getBoundingClientRect();
		const pad = 8;
		const panelW = 168;
		const panelH = 120;
		// prefer to the right of the ⋯ button (into the content pane)
		let left = r.right + 6;
		let top = r.top;
		if (left + panelW > window.innerWidth - pad) {
			left = Math.max(pad, r.left - panelW - 6);
		}
		if (top + panelH > window.innerHeight - pad) {
			top = Math.max(pad, window.innerHeight - panelH - pad);
		}
		popPos = { top, left };
	}

	function toggleSettings(item: T, e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		const id = getSettingsId?.(item);
		if (!id) return;
		const key = getKey(item);
		const open = settingsFor === key;
		if (open) {
			settingsFor = null;
			settingsGame = null;
			anchorEl = null;
			return;
		}
		settingsFor = key;
		settingsGame = id;
		anchorEl = e.currentTarget as HTMLElement;
		onSelect(item);
		requestAnimationFrame(placePop);
	}

	function selectTab(item: T) {
		onSelect(item);
		if (settingsFor && settingsFor !== getKey(item)) {
			settingsFor = null;
			settingsGame = null;
			anchorEl = null;
		}
	}

	function closeSettings() {
		settingsFor = null;
		settingsGame = null;
		anchorEl = null;
	}

	$effect(() => {
		if (!settingsFor) return;
		const onScroll = () => placePop();
		const onPointer = (e: PointerEvent) => {
			const t = e.target as HTMLElement | null;
			if (t?.closest?.('[data-settings-pop], .more')) return;
			closeSettings();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeSettings();
		};
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onScroll);
		// defer so the opening click doesn't immediately close
		const t = setTimeout(() => window.addEventListener('pointerdown', onPointer), 0);
		window.addEventListener('keydown', onKey);
		return () => {
			clearTimeout(t);
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onScroll);
			window.removeEventListener('pointerdown', onPointer);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<div class="selector">
	<div class="picker" role="listbox" aria-label="Select item">
		{#each items as item (getKey(item))}
			{@const img = getImage?.(item)}
			{@const sid = getSettingsId?.(item)}
			{@const key = getKey(item)}
			{@const active = selected !== null && getKey(selected) === key}
			<div class="tab" class:active class:menu-open={settingsFor === key}>
				<button
					type="button"
					class="option"
					class:has-thumb={!!img}
					class:has-more={!!sid}
					role="option"
					aria-selected={active}
					onclick={() => selectTab(item)}
				>
					{#if img}
						<span class="thumb" aria-hidden="true">
							<img src={img} alt="" width="32" height="32" loading="lazy" decoding="async" />
						</span>
					{/if}
					<span class="label">{getLabel(item)}</span>
				</button>

				{#if sid}
					<button
						type="button"
						class="more"
						aria-label="Settings for {getLabel(item)}"
						aria-expanded={settingsFor === key}
						onclick={(e) => toggleSettings(item, e)}
					>
						⋯
					</button>
				{/if}
			</div>
		{/each}
	</div>
	<div class="pane">
		{#if selected}
			{@render children(selected)}
		{:else if empty}
			{@render empty()}
		{:else}
			<p class="hint">pick one →</p>
		{/if}
	</div>
</div>

{#if settingsFor && settingsGame}
	<div
		class="settings-pop"
		data-settings-pop
		use:portal
		style:top="{popPos.top}px"
		style:left="{popPos.left}px"
		role="dialog"
		aria-label="Game settings"
	>
		<GameSettingsPanel game={settingsGame} />
	</div>
{/if}

<style>
	.selector {
		display: grid;
		grid-template-columns: minmax(6.25rem, 28%) 1fr;
		gap: 0;
		height: 100%;
		min-height: 0;
		flex: 1;
		background: transparent;
	}

	.picker {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
		border-right: 1px solid var(--px-stroke-soft);
		background: var(--px-glass-dark);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		min-height: 0;
		padding: 0.32rem;
		gap: 0.18rem;
	}

	.tab {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: stretch;
		border-radius: var(--px-radius-sm);
		min-width: 0;
	}

	.tab:hover .more,
	.tab.menu-open .more,
	.more:focus-visible {
		opacity: 1;
		pointer-events: auto;
	}

	.option {
		all: unset;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.45rem;
		font: inherit;
		font-size: 0.78rem;
		line-height: 1.25;
		color: var(--px-ink);
		cursor: pointer;
		border-radius: var(--px-radius-sm);
		transition: background 100ms ease;
		min-width: 0;
		grid-column: 1 / -1;
		grid-row: 1;
	}

	.option.has-more {
		padding-right: 1.5rem;
	}

	.option.has-thumb {
		padding-top: 0.3rem;
		padding-bottom: 0.3rem;
	}

	.tab:hover .option,
	.tab.menu-open .option {
		background: rgba(255, 255, 255, 0.45);
	}

	.tab.active .option {
		background: var(--px-select);
		color: #fff;
		box-shadow: 0 2px 8px rgba(0, 113, 227, 0.28);
	}

	.tab.active:hover .option,
	.tab.active.menu-open .option {
		background: var(--px-select);
	}

	.more {
		all: unset;
		box-sizing: border-box;
		grid-column: 2;
		grid-row: 1;
		z-index: 2;
		align-self: center;
		justify-self: end;
		margin-right: 0.15rem;
		width: 1.25rem;
		height: 1.25rem;
		display: grid;
		place-items: center;
		border-radius: 6px;
		font-size: 0.85rem;
		line-height: 1;
		letter-spacing: 0.02em;
		color: var(--px-muted);
		cursor: pointer;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 100ms ease,
			background 100ms ease,
			color 100ms ease;
	}

	.tab.active .more {
		color: rgba(255, 255, 255, 0.85);
	}

	.more:hover,
	.tab.menu-open .more {
		background: rgba(0, 0, 0, 0.08);
		color: var(--px-ink);
	}

	.tab.active .more:hover,
	.tab.active.menu-open .more {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
	}

	.settings-pop {
		position: fixed;
		z-index: 100000;
		/* no transform — top/left already viewport coords */
	}

	.thumb {
		flex-shrink: 0;
		width: 1.7rem;
		height: 1.7rem;
		border-radius: 6px;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.35);
	}

	.thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.pane {
		padding: 0.6rem 0.6rem 0.7rem;
		overflow-y: auto;
		overflow-x: hidden;
		background: var(--px-window);
		min-height: 0;
		min-width: 0;
	}

	.hint {
		margin: 0;
		color: var(--px-muted);
		font-size: 0.82rem;
	}

	@media (max-width: 640px) {
		.selector {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.picker {
			flex-direction: row;
			flex-wrap: wrap;
			border-right: none;
			border-bottom: 1px solid var(--px-stroke-soft);
			max-height: 5.5rem;
		}
	}
</style>
