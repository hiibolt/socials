export type PerfTier = 'high' | 'low';

export type PerfProfile = {
	tier: PerfTier;
	reducedMotion: boolean;
	/** larger GoL cells = fewer cells */
	golCell: number;
	golStepMs: number;
	/** paint every N frames */
	golPaintEvery: number;
	glass: boolean;
};

export function detectPerf(): PerfProfile {
	if (typeof window === 'undefined') {
		return {
			tier: 'high',
			reducedMotion: false,
			golCell: 7,
			golStepMs: 185,
			golPaintEvery: 1,
			glass: true
		};
	}

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce)').matches;
	const coarse = matchMedia('(pointer: coarse)').matches;
	const cores = navigator.hardwareConcurrency || 4;
	const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
	const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
		?.saveData;
	// be conservative: only flag genuinely constrained devices
	const low =
		!!saveData ||
		cores <= 2 ||
		mem <= 2 ||
		(coarse && cores <= 4) ||
		window.innerWidth * window.innerHeight < 300_000;

	if (low) {
		return {
			tier: 'low',
			reducedMotion,
			golCell: 12,
			golStepMs: reducedMotion ? 999999 : 280,
			golPaintEvery: 2,
			glass: !reduceTransparency && !saveData
		};
	}

	return {
		tier: 'high',
		reducedMotion,
		golCell: 7,
		golStepMs: 185,
		golPaintEvery: 1,
		glass: true
	};
}

export function applyPerfClass(profile: PerfProfile) {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.perf = profile.tier;
	document.documentElement.dataset.glass = profile.glass ? 'on' : 'off';
}
