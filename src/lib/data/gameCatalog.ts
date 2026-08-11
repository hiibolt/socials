import type { Component } from 'svelte';
import type { GameSettings } from '$lib/games/settings.svelte';
import Wordle from '$lib/components/games/Wordle.svelte';
import Sudoku from '$lib/components/games/Sudoku.svelte';
import Minesweeper from '$lib/components/games/Minesweeper.svelte';
import Snake from '$lib/components/games/Snake.svelte';

export type GameItem = {
	id: keyof GameSettings;
	label: string;
	component: Component<Record<string, never>>;
};

export const gameCatalog: GameItem[] = [
	{ id: 'wordle', label: 'Wordle', component: Wordle as Component<Record<string, never>> },
	{ id: 'sudoku', label: 'Sudoku', component: Sudoku as Component<Record<string, never>> },
	{ id: 'mines', label: 'Mines', component: Minesweeper as Component<Record<string, never>> },
	{ id: 'snake', label: 'Snake', component: Snake as Component<Record<string, never>> }
];
