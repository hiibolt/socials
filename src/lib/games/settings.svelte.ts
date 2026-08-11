import { browser } from '$app/environment';

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';
export type MinesDifficulty = 'easy' | 'medium' | 'hard';
export type SnakeSpeed = 'slow' | 'normal' | 'fast';

export type GameSettings = {
	wordle: { hardMode: boolean };
	sudoku: { autoNotes: boolean; difficulty: SudokuDifficulty };
	mines: { difficulty: MinesDifficulty };
	snake: { speed: SnakeSpeed };
};

export type SettingField =
	| { key: string; type: 'toggle'; label: string; tip?: string }
	| {
			key: string;
			type: 'select';
			label: string;
			tip?: string;
			options: { value: string; label: string }[];
	  };

export const settingSchema: Record<keyof GameSettings, SettingField[]> = {
	wordle: [
		{
			key: 'hardMode',
			type: 'toggle',
			label: 'Hard mode',
			tip: 'Revealed hints must be used in later guesses'
		}
	],
	sudoku: [
		{
			key: 'autoNotes',
			type: 'toggle',
			label: 'Auto-notes',
			tip: 'Show candidate digits in empty cells'
		},
		{
			key: 'difficulty',
			type: 'select',
			label: 'Difficulty',
			options: [
				{ value: 'easy', label: 'Easy' },
				{ value: 'medium', label: 'Medium' },
				{ value: 'hard', label: 'Hard' }
			]
		}
	],
	mines: [
		{
			key: 'difficulty',
			type: 'select',
			label: 'Difficulty',
			options: [
				{ value: 'easy', label: 'Easy · 9×9' },
				{ value: 'medium', label: 'Medium · 12×12' },
				{ value: 'hard', label: 'Hard · 16×16' }
			]
		}
	],
	snake: [
		{
			key: 'speed',
			type: 'select',
			label: 'Speed',
			options: [
				{ value: 'slow', label: 'Slow' },
				{ value: 'normal', label: 'Normal' },
				{ value: 'fast', label: 'Fast' }
			]
		}
	]
};

const STORAGE_KEY = 'socials.game-settings.v3';

const defaults: GameSettings = {
	wordle: { hardMode: false },
	sudoku: { autoNotes: false, difficulty: 'medium' },
	mines: { difficulty: 'easy' },
	snake: { speed: 'normal' }
};

function load(): GameSettings {
	if (!browser) return structuredClone(defaults);
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return structuredClone(defaults);
		const parsed = JSON.parse(raw) as Partial<GameSettings>;
		return {
			wordle: { ...defaults.wordle, ...parsed.wordle },
			sudoku: { ...defaults.sudoku, ...parsed.sudoku },
			mines: { ...defaults.mines, ...parsed.mines },
			snake: { ...defaults.snake, ...parsed.snake }
		};
	} catch {
		return structuredClone(defaults);
	}
}

function persist(value: GameSettings) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	} catch {
		/* quota / private mode */
	}
}

export const gameSettings = $state<GameSettings>(load());

export function patchGameSettings<K extends keyof GameSettings>(
	game: K,
	patch: Partial<GameSettings[K]>
) {
	gameSettings[game] = { ...gameSettings[game], ...patch };
	persist(gameSettings);
}

export function setGameSetting<K extends keyof GameSettings>(
	game: K,
	key: keyof GameSettings[K],
	value: GameSettings[K][typeof key]
) {
	gameSettings[game] = { ...gameSettings[game], [key]: value };
	persist(gameSettings);
}
