import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { wordleDataset } from '$lib/data/games';

/** Proxy NYT daily Wordle — keeps CORS off the client. */
export const GET: RequestHandler = async () => {
	const date = new Date().toISOString().slice(0, 10);
	try {
		const res = await fetch(`https://www.nytimes.com/svc/wordle/v2/${date}.json`, {
			headers: { Accept: 'application/json' }
		});
		if (!res.ok) throw new Error(`nyt ${res.status}`);
		const data = (await res.json()) as { solution?: string; print_date?: string };
		const answer = (data.solution ?? wordleDataset.answer).toUpperCase();
		return json({
			answer,
			maxGuesses: 6,
			date: data.print_date ?? date,
			source: 'nyt'
		});
	} catch {
		return json({
			answer: wordleDataset.answer.toUpperCase(),
			maxGuesses: wordleDataset.maxGuesses,
			date,
			source: 'fallback'
		});
	}
};
