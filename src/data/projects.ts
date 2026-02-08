import { Project } from "../interfaces";

// Personal projects - each loads its own React page
export const projectsData: Project[] = [
	{
		id: "tonnetz-lattice",
		slug: "tonnetz-lattice",
		title: "Tonnetz Lattice",
		subtitle: "Neo-Riemannian Harmonic Space Explorer",
		description:
			"Interactive visualization of the Tonnetz harmonic lattice for exploring chord relationships in neo-Riemannian music theory with Web Audio synthesis.",
		longDescription:
			"A sophisticated music theory tool that visualizes all 12 pitch classes in a 2D Tonnetz grid where musical intervals follow predictable geometric patterns: Major 3rds move right, minor 3rds move down, and Perfect 5ths are diagonal. Build and play chord progressions, explore harmonic relationships, and save your compositions.",
		client: "Personal Project",
		technologies: [
			"React 19",
			"TypeScript",
			"Canvas API",
			"Web Audio API",
			"Neo-Riemannian Theory"
		],
		features: [
			"Interactive pan and zoom with inertia",
			"Major and minor triad visualization",
			"Chord progression builder with playback",
			"Configurable key center and label modes",
			"Save/load/export progressions as JSON",
			"Preset chord progression library",
			"MIDI-based pitch representation"
		],
		outcomes: [
			"Advanced music theory visualization",
			"Real-time audio synthesis",
			"Mathematical approach to harmony",
			"Elegant state management with React Context"
		],
		images: ["tonnetz-main.png"],
		featured: true,
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
		images: ["desk.JPG", "dragontree.JPG", "arduino.png"],
		featured: true,
		year: "2020",
		category: "Infrastructure"
	},
	{
		id: "guitar-triads",
		slug: "guitar-major-triads",
		title: "Guitar Workbench",
		subtitle: "Triads and Box Shapes",
		description:
			"Unified guitar learning page with switchable tools for triads, pentatonic boxes, and blues boxes.",
		longDescription:
			"Comprehensive interactive guitar workspace combining chord and box-shape systems in one place. Switch between major triad voicings and box-shape visualizers with shared fretboard rendering and hover-to-play audio feedback.",
		client: "Personal Project",
		technologies: [
			"Next.js 14",
			"TypeScript",
			"Vitest",
			"Web Audio API"
		],
		features: [
			"Major triads across 4 string groups (6-5-4, 5-4-3, 4-3-2, 3-2-1)",
			"Major, pentatonic, and blues box-shape systems",
			"Pentatonic 5-box and blues box visualizations",
			"Shared fretboard rendering engine across tools",
			"Interactive hover-to-play notes",
			"Physics-based exponential fret spacing"
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
			id: "guitar-modes",
			slug: "guitar-modes-3nps",
			title: "Guitar Box Shapes",
			subtitle: "Major, Pentatonic, and Blues Boxes",
			description:
				"Interactive guitar scale explorer focused on box-shape systems for major modes, minor pentatonic, and blues.",
			longDescription:
				"Comprehensive fretboard visualization tool focused on connected box-shape systems. Includes all seven major-mode boxes, five minor pentatonic boxes, and five blues boxes with optional experimental sixth-box extension.",
			client: "Personal Project",
			technologies: [
				"Next.js 14",
				"TypeScript",
				"Web Audio API",
				"Music Theory"
			],
			features: [
				"All 7 major modes visualization (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)",
				"Major-mode box-shape visualization",
				"Minor pentatonic 5-box system",
				"Blues 5-box system with optional experimental 6th box",
				"Color-coded scale degrees",
				"Interactive fretboard",
				"Mode comparison tool"
			],
			outcomes: [
				"Complete modal theory implementation",
				"Visual learning tool",
				"Interactive exploration"
			],
			images: ["guitar-modes-screenshot.png"],
			featured: false,
			year: "2024",
			category: "Full-Stack"
		}
];

export const getFeaturedProjects = () =>
	projectsData.filter((project) => project.featured);

export const getProjectBySlug = (slug: string) =>
	projectsData.find((project) => project.slug === slug);
