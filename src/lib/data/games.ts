export type SudokuDataset = {
	puzzle: string;
	solution: string;
};

export type WordleDataset = {
	answer: string;
	maxGuesses: number;
};

// Classic easy-medium puzzle; 0 = empty. Strings are 81 chars, row-major.
export const sudokuDataset: SudokuDataset = {
	puzzle:
		'530070000600195000098000060800060003400803001700020006060000280000419005000080079',
	solution:
		'534678912672195348198342567859761423426853791713924856961537284287419635345286179'
};

export const wordleDataset: WordleDataset = {
	answer: 'RUSTY',
	maxGuesses: 6
};
