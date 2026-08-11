import type { Project } from '$lib/types';

export const projects: Project[] = [
	{
		id: 'rosy',
		title: 'Rosy Programming Language',
		summary:
			'Parallel beam-physics language transpiled to Rust — modern COSY INFINITY for HPC.',
		tags: ['Rust', 'Compiler', 'HPC', 'MPI'],
		repository: 'https://github.com/hiibolt/rosy',
		liveDemo: null,
		image: '/projects/rosy.jpg'
	},
	{
		id: 'k8s-cluster',
		title: 'Kubernetes Homelab Cluster',
		summary: 'Bare-metal 8-node home lab: ArgoCD, Cilium, VaultWarden, Cloudflare Tunnels.',
		tags: ['Kubernetes', 'DevOps', 'Cilium'],
		repository: 'https://github.com/hiibolt/kubernetes-configs',
		liveDemo: null,
		image: '/projects/k8s-cluster.jpg'
	},
	{
		id: 'sabi',
		title: 'Sabi Visual Novel Engine',
		summary: 'Bevy VN engine with a theatre-script language and hot-reloadable assets.',
		tags: ['Rust', 'Bevy', 'Game Engine'],
		repository: 'https://github.com/hiibolt/sabi',
		liveDemo: null,
		image: '/projects/sabi.jpg'
	},
	{
		id: 'mbo',
		title: 'MBO — Market Simulation',
		summary: 'Databento market reconstructor. 500K+ msg/sec, p99 <5ms, full K8s deploy.',
		tags: ['Rust', 'Svelte', 'Kubernetes'],
		repository: 'https://github.com/hiibolt/hft-simulation',
		liveDemo: 'https://mbo.hiibolt.com',
		image: '/projects/mbo.jpg'
	},
	{
		id: 'nixos-machines',
		title: 'NixOS Machine Configs',
		summary: 'Impermanent, fully declarative hosts. Wipe on boot. No config drift.',
		tags: ['NixOS', 'Impermanence', 'Declarative'],
		repository: 'https://github.com/hiibolt/nixos',
		liveDemo: null,
		image: '/projects/nixos.jpg'
	},
	{
		id: 'igait',
		title: 'iGAIT',
		summary: 'HIPAA backend + ML gait pipeline for ASD detection on Metis HPC.',
		tags: ['Rust', 'ML', 'Healthcare'],
		repository: 'https://github.com/igait-niu/igait-backend',
		liveDemo: 'https://igaitapp.com',
		image: '/projects/igait.jpg'
	},
	{
		id: 'hawkeye',
		title: 'Hawkeye Batch Monitor',
		summary: 'PBS Professional web monitor for NIU Metis — Axum + Askama monolith.',
		tags: ['Rust', 'HPC', 'SQLite'],
		repository: 'https://github.com/hiibolt/hawkeye',
		liveDemo: 'https://hslab.niu.edu/batchmon',
		image: '/projects/hawkeye.jpg'
	},
	{
		id: '355v-development',
		title: 'VEX 355V Codebase',
		summary: 'State champs → Worlds semifinalists. PROS/C++ competition stack.',
		tags: ['C++', 'Robotics', 'Embedded'],
		repository: 'https://github.com/hiibolt/355V-Development',
		liveDemo: null,
		image: '/projects/vex.jpg'
	},
	{
		id: 'qsharp_rs',
		title: 'Quantum Simulator (Rust)',
		summary: 'Zero-dep Q#-flavored simulator — custom Complex/Matrix/System libs.',
		tags: ['Rust', 'Quantum'],
		repository: 'https://github.com/hiibolt/qsharp_rs',
		liveDemo: null,
		image: '/projects/qubit.jpg'
	},
	{
		id: 'r6econ',
		title: 'R6 Marketplace Analyzer',
		summary: 'Quantitative R6 market tracker with a Discord frontend for sale history.',
		tags: ['Python', 'Data'],
		repository: 'https://github.com/hiibolt/r6econ',
		liveDemo: null,
		image: '/projects/r6econ.jpg'
	},
	{
		id: 'r6rs',
		title: 'R6 OSINT Toolkit',
		summary: 'Ubisoft + Snusbase wrappers for account tracing and recovery work.',
		tags: ['Rust', 'OSINT'],
		repository: 'https://github.com/hiibolt/r6rs',
		liveDemo: null,
		image: '/projects/r6rs.jpg'
	},
	{
		id: 'niu-metis-documentation',
		title: 'Metis Supercomputer Docs',
		summary: 'Public mdbook for NIU Metis — the docs that got me hired at CRCD.',
		tags: ['Docs', 'HPC'],
		repository: 'https://github.com/hiibolt/niu-metis-documentation',
		liveDemo: 'https://hiibolt.github.io/niu-metis-documentation/',
		image: '/projects/niu-metis.jpg'
	},
	{
		id: 'monikaiv2',
		title: 'MonikaiV2',
		summary: 'STM/LTM-augmented LLM chat with a P5 visual-novel frontend.',
		tags: ['Rust', 'ML', 'P5.js'],
		repository: 'https://github.com/hiibolt/monikaiv2',
		liveDemo: null,
		image: '/projects/monikaiv2.jpg'
	},
	{
		id: 'aoc',
		title: 'Competitive Programming',
		summary: 'Advent of Code, LeetCode, and friends. Mostly Rust.',
		tags: ['Algorithms', 'Rust'],
		repository: 'https://github.com/hiibolt/competitive',
		liveDemo: null,
		image: '/projects/aoc.jpg'
	}
];
