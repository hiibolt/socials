/** Iconify ids: simple-icons for brands, lucide/mdi for the rest */

export type IconDef = {
	/** iconify collection:name */
	icon: string;
	/** hover / a11y text */
	tip: string;
};

const tech: Record<string, IconDef> = {
	rust: { icon: 'simple-icons:rust', tip: 'Rust' },
	nix: { icon: 'simple-icons:nixos', tip: 'Nix' },
	nixos: { icon: 'simple-icons:nixos', tip: 'NixOS' },
	k8s: { icon: 'simple-icons:kubernetes', tip: 'Kubernetes' },
	kubernetes: { icon: 'simple-icons:kubernetes', tip: 'Kubernetes' },
	svelte: { icon: 'simple-icons:svelte', tip: 'Svelte' },
	hpc: { icon: 'lucide:server', tip: 'High-performance computing' },
	compiler: { icon: 'lucide:binary', tip: 'Compiler / language tooling' },
	bevy: { icon: 'simple-icons:bevy', tip: 'Bevy game engine' },
	'game engine': { icon: 'lucide:gamepad-2', tip: 'Game engine' },
	devops: { icon: 'lucide:git-branch', tip: 'DevOps' },
	cilium: { icon: 'simple-icons:cilium', tip: 'Cilium CNI' },
	impermanence: { icon: 'lucide:refresh-cw', tip: 'Impermanence (wipe-on-boot state)' },
	declarative: { icon: 'lucide:file-code-2', tip: 'Declarative configuration' },
	ml: { icon: 'lucide:brain', tip: 'Machine learning' },
	healthcare: { icon: 'lucide:heart-pulse', tip: 'Healthcare' },
	sqlite: { icon: 'simple-icons:sqlite', tip: 'SQLite' },
	'c++': { icon: 'simple-icons:cplusplus', tip: 'C++' },
	cpp: { icon: 'simple-icons:cplusplus', tip: 'C++' },
	robotics: { icon: 'lucide:bot', tip: 'Robotics' },
	embedded: { icon: 'lucide:cpu', tip: 'Embedded systems' },
	quantum: { icon: 'lucide:atom', tip: 'Quantum computing' },
	tauri: { icon: 'simple-icons:tauri', tip: 'Tauri' },
	systems: { icon: 'lucide:layers', tip: 'Systems programming' },
	python: { icon: 'simple-icons:python', tip: 'Python' },
	data: { icon: 'lucide:database', tip: 'Data analysis' },
	osint: { icon: 'lucide:scan-search', tip: 'OSINT' },
	docs: { icon: 'lucide:book-open', tip: 'Documentation' },
	'p5.js': { icon: 'simple-icons:p5dotjs', tip: 'p5.js' },
	p5js: { icon: 'simple-icons:p5dotjs', tip: 'p5.js' },
	algorithms: { icon: 'lucide:network', tip: 'Algorithms' },
	docker: { icon: 'simple-icons:docker', tip: 'Docker' },
	axum: { icon: 'simple-icons:tokio', tip: 'Axum / Tokio' },
	cuda: { icon: 'simple-icons:nvidia', tip: 'CUDA' },
	mpi: { icon: 'lucide:share-2', tip: 'MPI parallelism' },
	tokio: { icon: 'simple-icons:tokio', tip: 'Tokio' },
	databento: { icon: 'lucide:line-chart', tip: 'Databento / market data' },
	argocd: { icon: 'simple-icons:argo', tip: 'Argo CD' },
	'bare-metal': { icon: 'lucide:hard-drive', tip: 'Bare-metal' },
	'home lab': { icon: 'lucide:home', tip: 'Home lab' },
	homelabbing: { icon: 'lucide:server-cog', tip: 'Homelabbing' },
	bun: { icon: 'simple-icons:bun', tip: 'Bun' }
};

const hobbies: Record<string, IconDef> = {
	motorcycling: { icon: 'mdi:motorbike', tip: 'Motorcycling' },
	'e-skateboarding': { icon: 'mdi:skateboard', tip: 'E-Skateboarding' },
	snowboarding: { icon: 'mdi:snowboard', tip: 'Snowboarding' },
	reading: { icon: 'lucide:book', tip: 'Reading' },
	cars: { icon: 'mdi:car-sports', tip: 'Cars' },
	music: { icon: 'lucide:music', tip: 'Music' },
	exploring: { icon: 'lucide:compass', tip: 'Exploring' },
	hiking: { icon: 'lucide:mountain', tip: 'Hiking' }
};

const social: Record<string, IconDef> = {
	github: { icon: 'simple-icons:github', tip: 'GitHub' },
	x: { icon: 'simple-icons:x', tip: 'X (Twitter)' },
	linkedin: { icon: 'simple-icons:linkedin', tip: 'LinkedIn' },
	discord: { icon: 'simple-icons:discord', tip: 'Discord' }
};

const links: Record<string, IconDef> = {
	repository: { icon: 'simple-icons:github', tip: 'Open repository' },
	demo: { icon: 'lucide:external-link', tip: 'Open live demo' }
};

function norm(label: string) {
	return label.trim().toLowerCase();
}

export function resolveTagIcon(label: string): IconDef {
	const k = norm(label);
	return (
		tech[k] ??
		hobbies[k] ??
		social[k] ??
		({ icon: 'lucide:tag', tip: label } satisfies IconDef)
	);
}

export function resolveSocialIcon(id: string): IconDef {
	return social[norm(id)] ?? { icon: 'lucide:link', tip: id };
}

export function resolveLinkIcon(kind: 'repository' | 'demo'): IconDef {
	return links[kind];
}
