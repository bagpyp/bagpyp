import { Project } from "../interfaces";

// Personal projects - each loads its own React page
export const projectsData: Project[] = [
	{
		id: "guitar-triads",
		slug: "guitar-app-triads",
		title: "Interactive Guitar Learning App",
		subtitle: "Physics-Based Fretboard Visualization",
		description:
			"Interactive guitar learning application with realistic fretboard rendering, circle of fifths color coding, and Web Audio API sound playback.",
		longDescription:
			"A comprehensive guitar learning tool featuring major triads visualization, scale practice challenges, and physics-based rendering. Built with mathematical precision using exponential fret spacing (Fender 25.5\" scale) and comprehensive test coverage with 188 passing tests.",
		client: "Personal Project",
		technologies: [
			"Next.js 14",
			"TypeScript",
			"Vitest",
			"Web Audio API",
			"CSS-in-JS"
		],
		features: [
			"Major triads across all string groups",
			"Circle of fifths color-coded visualization",
			"Physics-based fretboard spacing",
			"Interactive hover-to-play notes",
			"Progressive scale practice challenges",
			"188 comprehensive tests"
		],
		outcomes: [
			"Demonstrates TDD excellence",
			"Shows mathematical precision in code",
			"Creative problem-solving (music theory + physics)",
			"Zero backend - pure browser-based"
		],
		images: ["guitar-triads-screenshot.png"],
		featured: true,
		year: "2024",
		category: "Full-Stack"
	}
	// Placeholder for future projects to be ported
];

export const getFeaturedProjects = () =>
	projectsData.filter((project) => project.featured);

export const getProjectBySlug = (slug: string) =>
	projectsData.find((project) => project.slug === slug);
