import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sudokuDataset } from '$lib/data/games';

type Diff = 'easy' | 'medium' | 'hard';

function flatten(grid: number[][]): string {
	return grid.map((row) => row.join('')).join('');
}

/** dosuku API — been around a while; falls back to hardcoded puzzle. */
export const GET: RequestHandler = async ({ url }) => {
	const difficulty = (url.searchParams.get('difficulty') ?? 'medium') as Diff;
	const allowed: Diff[] = ['easy', 'medium', 'hard'];
	const diff = allowed.includes(difficulty) ? difficulty : 'medium';

	try {
		const res = await fetch('https://sudoku-api.vercel.app/api/dosuku', {
			headers: { Accept: 'application/json' }
		});
		if (!res.ok) throw new Error(`dosuku ${res.status}`);
		const data = (await res.json()) as {
			newboard?: {
				grids?: { value: number[][]; solution: number[][]; difficulty: string }[];
			};
		};
		const grids = data.newboard?.grids ?? [];
		const match =
			grids.find((g) => g.difficulty?.toLowerCase() === diff) ??
			grids[0];
		if (!match?.value || !match?.solution) throw new Error('empty board');

		return json({
			puzzle: flatten(match.value),
			solution: flatten(match.solution),
			difficulty: (match.difficulty ?? diff).toLowerCase(),
			source: 'dosuku'
		});
	} catch {
		return json({
			puzzle: sudokuDataset.puzzle,
			solution: sudokuDataset.solution,
			difficulty: diff,
			source: 'fallback'
		});
	}
};
