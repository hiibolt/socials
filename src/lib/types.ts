export type WindowId = 'profile' | 'about' | 'projects' | 'socials' | 'games';

export type Rect = { x: number; y: number; w: number; h: number };

export type WindowState = {
	id: WindowId;
	title: string;
	x: number;
	y: number;
	w: number;
	h: number;
	z: number;
	minimized: boolean;
	maximized: boolean;
	closed: boolean;
	restore: Rect | null;
};

export type Project = {
	id: string;
	title: string;
	summary: string;
	tags: string[];
	repository: string | null;
	liveDemo: string | null;
	/** small local thumb under /projects */
	image: string | null;
};

export type Social = {
	id: string;
	label: string;
	url: string;
	handle: string;
};
