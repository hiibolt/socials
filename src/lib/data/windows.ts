import type { WindowState } from '$lib/types';

/** Default desktop layout — sized for 18px root type. */
export const defaultWindows: WindowState[] = [
	{
		id: 'profile',
		title: 'profile',
		x: 36,
		y: 36,
		w: 270,
		h: 320,
		z: 1,
		minimized: false,
		maximized: false,
		closed: false,
		restore: null
	},
	{
		id: 'about',
		title: 'about me',
		x: 328,
		y: 48,
		w: 400,
		h: 300,
		z: 2,
		minimized: false,
		maximized: false,
		closed: false,
		restore: null
	},
	{
		id: 'projects',
		title: 'projects',
		x: 36,
		y: 372,
		w: 560,
		h: 420,
		z: 3,
		minimized: false,
		maximized: false,
		closed: false,
		restore: null
	},
	{
		id: 'socials',
		title: 'socials',
		x: 752,
		y: 44,
		w: 300,
		h: 340,
		z: 4,
		minimized: false,
		maximized: false,
		closed: false,
		restore: null
	},
	{
		id: 'games',
		title: 'minigames',
		x: 620,
		y: 368,
		w: 500,
		h: 480,
		z: 5,
		minimized: false,
		maximized: false,
		closed: false,
		restore: null
	}
];
