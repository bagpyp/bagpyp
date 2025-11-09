import { Project } from "../interfaces";

// Personal projects - each loads its own React page
export const projectsData: Project[] = [
	{
		id: "guitar-triads",
		slug: "guitar-major-triads",
		title: "Guitar Major Triads Visualizer",
		subtitle: "Interactive Chord Voicing Explorer",
		description:
			"Physics-based fretboard visualization of major triads across all string groups with circle of fifths color coding and Web Audio playback.",
		longDescription:
			"Comprehensive guitar learning tool featuring major triads visualization with realistic fretboard rendering. Uses exponential fret spacing (Fender 25.5\" scale) and circle of fifths color system. Hover over any note to hear it played through the Web Audio API.",
		client: "Personal Project",
		technologies: [
			"Next.js 14",
			"TypeScript",
			"Vitest",
			"Web Audio API"
		],
		features: [
			"Major triads across 4 string groups (6-5-4, 5-4-3, 4-3-2, 3-2-1)",
			"Circle of fifths color-coded visualization",
			"Physics-based exponential fret spacing",
			"Interactive hover-to-play notes",
			"Smart position selection algorithm",
			"188 comprehensive tests"
		],
		outcomes: [
			"Demonstrates mathematical precision",
			"Creative problem-solving (music theory + physics)",
			"TDD excellence",
			"Zero backend required"
		],
		images: ["guitar-triads-screenshot.png"],
		featured: true,
		year: "2024",
		category: "Full-Stack"
	},
	{
		id: "guitar-scales",
		slug: "guitar-scale-practice",
		title: "Guitar Scale Practice Trainer",
		subtitle: "Modal Scale Challenges with 3-Notes-Per-String",
		description:
			"Interactive scale practice challenges for all 7 modes with progressive hints, scoring system, and XYZ pattern visualization.",
		longDescription:
			"Advanced scale practice tool featuring random challenges across all modal scales. Progressive hint system reveals notes one at a time while tracking your score. Implements 3-notes-per-string patterns with realistic fretboard physics.",
		client: "Personal Project",
		technologies: [
			"Next.js 14",
			"TypeScript",
			"Web Audio API",
			"Vitest"
		],
		features: [
			"Challenges for all 7 modes",
			"Progressive hint system with scoring",
			"3-notes-per-string XYZ patterns",
			"Real-time feedback",
			"Physics-based rendering"
		],
		outcomes: [
			"Advanced music theory implementation",
			"Interactive learning system",
			"Comprehensive test coverage"
		],
		images: ["guitar-triads-screenshot.png"],
		featured: true,
		year: "2024",
		category: "Full-Stack"
	},
	{
		id: "guitar-modes",
		slug: "guitar-modes-3nps",
		title: "Guitar Modes - 3 Notes Per String",
		subtitle: "Interactive Modal Scale Visualizer",
		description:
			"Visual exploration of all 7 modes (Ionian through Locrian) using 3-notes-per-string patterns with color-coded fretboard display.",
		longDescription:
			"Comprehensive modal scale visualization tool showing all 7 modes across the fretboard. Uses 3-notes-per-string patterns for optimal finger positioning. Each mode is color-coded and displayed with physics-based fretboard rendering.",
		client: "Personal Project",
		technologies: [
			"Next.js 14",
			"TypeScript",
			"Web Audio API",
			"Music Theory"
		],
		features: [
			"All 7 modes visualization (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)",
			"3-notes-per-string patterns",
			"Color-coded scale degrees",
			"Interactive fretboard",
			"Mode comparison tool"
		],
		outcomes: [
			"Complete modal theory implementation",
			"Visual learning tool",
			"Interactive exploration"
		],
		images: ["guitar-triads-screenshot.png"],
		featured: false,
		year: "2024",
		category: "Full-Stack"
	},
	{
		id: "graph-dynamics",
		slug: "graph-theoretic-dynamics",
		title: "Graph Theoretic Multi-Agent Dynamics",
		subtitle: "My First Python Script",
		description:
			"Mathematical simulation of autonomous agents reaching consensus through graph-based communication. Graduate thesis work in Applied Mathematics.",
		longDescription:
			"First Python programming project from graduate school (2015). Models N autonomous agents in 2D/3D space whose dynamics are dictated by neighbor knowledge. Implements various network topologies using Laplacian matrices and solves ODEs to simulate consensus dynamics.",
		client: "Portland State University - MS Thesis",
		technologies: [
			"Python",
			"NumPy",
			"SciPy",
			"Matplotlib",
			"Graph Theory"
		],
		features: [
			"N-agent consensus dynamics simulation",
			"Multiple graph topologies (star, path, cycle, complete)",
			"2D and 3D visualization",
			"Laplacian matrix-based communication",
			"ODE solver for system evolution",
			"Customizable parameters"
		],
		outcomes: [
			"Graduate thesis research",
			"First programming project",
			"Applied math to simulation",
			"Foundation for understanding multi-agent systems"
		],
		images: ["concensusGraph.png", "threeDim.png", "pyCharm.png"],
		featured: true,
		year: "2015",
		category: "AI/ML"
	},
	{
		id: "dragontree",
		slug: "dragontree-iot",
		title: "Dragontree IoT Monitor",
		subtitle: "ESP32 Plant Monitoring System",
		description:
			"IoT plant monitoring using ESP32-S2 microcontroller with Flask backend and Heroku deployment. Full-stack hardware-to-cloud integration.",
		longDescription:
			"Hardware and software integration project featuring an ESP32-S2 microcontroller monitoring a Dracaena draco plant. Sensor data is processed with pandas, served via Flask API, and deployed on Heroku. Demonstrates complete IoT stack from embedded systems to cloud.",
		client: "Personal Project",
		technologies: [
			"ESP32-S2",
			"Python",
			"Flask",
			"pandas",
			"Heroku",
			"Arduino"
		],
		features: [
			"Real-time sensor data collection",
			"ESP32-S2 microcontroller programming",
			"Flask REST API",
			"pandas data processing",
			"Heroku deployment",
			"Hardware-software integration"
		],
		outcomes: [
			"End-to-end IoT solution",
			"Embedded systems experience",
			"Cloud deployment",
			"Full-stack integration"
		],
		images: ["dragontree.JPG", "desk.JPG", "arduino.png"],
		featured: false,
		year: "2020",
		category: "Infrastructure"
	}
];

export const getFeaturedProjects = () =>
	projectsData.filter((project) => project.featured);

export const getProjectBySlug = (slug: string) =>
	projectsData.find((project) => project.slug === slug);
