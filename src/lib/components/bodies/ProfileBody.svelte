<script lang="ts">
	const avatar = 'https://avatars.githubusercontent.com/u/91273156?v=4';
</script>

<div class="profile">
	<div class="ring">
		<img src={avatar} alt="hiibolt avatar" width="160" height="160" draggable="false" />
	</div>
	<p class="name">Bolt</p>
	<p class="handle">@hiibolt</p>
</div>

<style>
	.profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		height: 100%;
		min-height: 0;
		text-align: center;
		container-type: size;
	}

	.ring {
		padding: 3px;
		border-radius: 22px;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(200, 210, 230, 0.5));
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
	}

	img {
		display: block;
		width: min(160px, 52cqi);
		height: min(160px, 52cqi);
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 19px;
		background: #dfe3ea;
	}

	.name {
		margin: 0.25rem 0 0;
		font-weight: 700;
		font-size: 1.1rem;
		letter-spacing: 0.01em;
	}

	.handle {
		margin: 0;
		font-size: 0.82rem;
		color: var(--px-muted);
	}

	:global(.card.maximized) .profile {
		gap: 0.85rem;
	}

	:global(.card.maximized) .ring {
		padding: 4px;
		border-radius: 28px;
	}

	:global(.card.maximized) img {
		width: clamp(168px, 22vmin, 240px);
		height: clamp(168px, 22vmin, 240px);
		border-radius: 24px;
	}

	:global(.card.maximized) .name {
		font-size: clamp(1.15rem, 2.4vw, 1.6rem);
	}

	:global(.card.maximized) .handle {
		font-size: clamp(0.85rem, 1.5vw, 1.05rem);
	}
</style>
