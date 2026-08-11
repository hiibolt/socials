export type WordlePuzzle = {
	answer: string;
	maxGuesses: number;
	source: string;
};

export type SudokuPuzzle = {
	puzzle: string;
	solution: string;
	source: string;
};

const FALLBACK_WORDLE: WordlePuzzle = {
	answer: 'RUSTY',
	maxGuesses: 6,
	source: 'fallback'
};

const FALLBACK_SUDOKU: SudokuPuzzle = {
	puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
	solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
	source: 'fallback'
};

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

let wordleSlot: Promise<WordlePuzzle> | null = null;
const sudokuSlots = new Map<string, Promise<SudokuPuzzle>>();

async function fetchWordle(): Promise<WordlePuzzle> {
	try {
		const res = await fetch('/api/wordle');
		const data = (await res.json()) as {
			answer: string;
			maxGuesses?: number;
			source?: string;
		};
		return {
			answer: String(data.answer).toUpperCase(),
			maxGuesses: data.maxGuesses ?? 6,
			source: data.source ?? 'nyt'
		};
	} catch {
		return { ...FALLBACK_WORDLE };
	}
}

async function fetchSudoku(difficulty: string): Promise<SudokuPuzzle> {
	try {
		const res = await fetch(`/api/sudoku?difficulty=${encodeURIComponent(difficulty)}`);
		const data = (await res.json()) as {
			puzzle: string;
			solution: string;
			source?: string;
		};
		return {
			puzzle: data.puzzle,
			solution: data.solution,
			source: data.source ?? 'api'
		};
	} catch {
		return { ...FALLBACK_SUDOKU };
	}
}

function ensureWordle() {
	if (!wordleSlot) wordleSlot = fetchWordle();
	return wordleSlot;
}

function ensureSudoku(difficulty: string) {
	let slot = sudokuSlots.get(difficulty);
	if (!slot) {
		slot = fetchSudoku(difficulty);
		sudokuSlots.set(difficulty, slot);
	}
	return slot;
}

/** Fire-and-forget warm of Wordle + every Sudoku difficulty. Safe to call repeatedly. */
export function prefetchGames() {
	if (typeof window === 'undefined') return;
	void ensureWordle();
	for (const d of DIFFICULTIES) void ensureSudoku(d);
}

/** Resolve Wordle (reuses prefetched daily). */
export function loadWordle() {
	return ensureWordle();
}

/**
 * Take one Sudoku puzzle for `difficulty`.
 * Consumes the warm slot and immediately starts fetching the next in the background.
 */
export async function takeSudoku(difficulty: string) {
	const p = ensureSudoku(difficulty);
	sudokuSlots.delete(difficulty);
	void ensureSudoku(difficulty);
	return p;
}
