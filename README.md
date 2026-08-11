# socials

Pixel MacOS-desktop personal hub. SvelteKit + Bun + Docker.

Live: [socials.hiibolt.com](https://socials.hiibolt.com)

## Stack

- Svelte 5 / SvelteKit
- Bun (`svelte-adapter-bun`)
- Conway's Game of Life background (canvas, adaptive cell size)
- Window chrome: drag, z-order, min / max / close + dock for minimized cards

## Dev (Bun only)

```bash
nix develop   # provides bun via flake
bun install
bun run dev -- --open
```

Without nix: install [Bun](https://bun.sh), then the same `bun install` / `bun run dev`.

## Build

```bash
bun run build
bun run preview
bun run start   # production server from ./build
```

## Docker

Multi-stage `oven/bun` image, serves via `svelte-adapter-bun` on port 4000.

```bash
docker build -t socials .
docker run -p 4000:4000 socials
```

## Cards

1. **profile** — GH avatar  
2. **about me** — terse bio  
3. **projects** — selector → detail (from personal-site portfolio)  
4. **socials** — GitHub, X, LinkedIn, Discord  
5. **minigames** — Sudoku & Wordle (hardcoded datasets for now)
