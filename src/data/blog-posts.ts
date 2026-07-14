import { BlogPost } from "../interfaces";

// Blog post metadata - actual content hosted as markdown/PDF
export const blogPostsData: BlogPost[] = [
	{
		id: "introduction-agentic-reliability",
		slug: "introduction-agentic-reliability",
		title: "Redefining Trust: Agentic Reliability Testing",
		subtitle: "Pioneering Reliability in Agentic Systems",
		excerpt:
			"Groundbreaking work on agentic reliability testing—a mathematical framework that's changing how we think about AI system validation. From one of only eight official OpenAI partners worldwide.",
		content: "/blog/01-introduction-agentic-reliability.md",
		author: "Robert Cunningham (via Artium AI)",
		publishedDate: "2024-09-10",
		tags: ["Agentic AI", "Reliability Testing", "CAT Framework", "OpenAI Partnership"],
		category: "AI Engineering",
		readingTime: 8,
		featured: false,
		image: "introduction-agentic-reliability.png"
	},
	{
		id: "mathematics-of-trust",
		slug: "mathematics-of-trust",
		title: "The Mathematics of Trust",
		subtitle: "Graph Theory and Bayesian Analysis for AI Reliability",
		excerpt:
			"Mathematical foundations powering AI reliability. Explore graph-theoretic models, Bayesian frameworks, and tensor analysis that make agentic systems provably reliable.",
		content: "/blog/02-mathematics-of-trust.md",
		author: "Robert Cunningham (via Artium AI)",
		publishedDate: "2024-09-10",
		tags: ["Mathematics", "Graph Theory", "Bayesian Analysis", "Reliability"],
		category: "Technical Deep Dive",
		readingTime: 10,
		featured: false,
		image: "mathematics-of-trust.png"
	},
	{
		id: "building-testing-framework",
		slug: "building-testing-framework",
		title: "From Theory to Production",
		subtitle: "Building an Enterprise-Grade AI Testing Framework",
		excerpt:
			"Transform mathematical elegance into production systems. Comprehensive guide to building testing frameworks that power Fortune 500 AI deployments.",
		content: "/blog/03-building-testing-framework.md",
		author: "Robert Cunningham (via Artium AI)",
		publishedDate: "2024-09-10",
		tags: ["Testing Framework", "Production AI", "Enterprise", "CAT Framework"],
		category: "Technical Deep Dive",
		readingTime: 12,
		featured: false,
		image: "building-testing-framework.png"
	},
	{
		id: "agentic-algebra",
		slug: "agentic-architecture-algebra",
		title: "Formalized Structures: The Algebra of Agentic Architectures",
		subtitle: "Mathematical Formalization of Tool-Using AI Systems",
		excerpt:
			"Mathematical formalization of agentic AI through tool call matrices, selection masks, and tensor operations. Defines the algebra underlying agent-tool interactions with formal propositions and proofs.",
		content: "/blog/algebra.md",
		author: "Robert Cunningham",
		publishedDate: "2024-05-11",
		tags: ["Mathematics", "Agentic AI", "Formal Methods", "Tensor Operations"],
		category: "Technical Deep Dive",
		readingTime: 15,
		featured: true,
		image: "agentic-architecture.png"
	},
	{
		id: "agentic-architecture",
		slug: "agentic-architecture",
		title: "Agentic Architecture",
		subtitle: "Structuring Agent-Tool-User Interactions",
		excerpt:
			"A structured approach to modeling interactions between agents and tools through chat histories, cycles, and graph-theoretic representations. Foundational concepts for understanding agentic AI systems.",
		content: "/blog/agentic-architecture.md",
		author: "Robert Cunningham",
		publishedDate: "2024-09-11",
		tags: ["Agentic AI", "Architecture", "Graph Theory", "CAT Framework"],
		category: "AI Engineering",
		readingTime: 10,
		featured: true,
		image: "AT.svg"
	},
	{
		id: "reliability-testing",
		slug: "reliability-testing-llm-systems",
		title: "Reliability Testing for LLM-Based Systems",
		subtitle: "The CAT Framework White Paper",
		excerpt:
			"Comprehensive framework for conducting reliability tests on LLM systems using validators, verifiers, and reliability tensors. Includes binomial experiments, generative conditional validators, and production monitoring strategies.",
		content: "/blog/reliability-testing.md",
		author: "Robert Cunningham",
		publishedDate: "2024-09-11",
		tags: ["CAT Framework", "Reliability Testing", "LLM Systems", "Validators"],
		category: "AI Engineering",
		readingTime: 20,
		featured: true,
		image: "reliability-tensor.webp"
	},
	{
		id: "octave-lattice",
		slug: "octave-lattice",
		title: "The Octave Lattice",
		subtitle: "Why a Guitar Fretboard Is Secretly the Integer Grid",
		excerpt:
			"Every octave shape on a guitar is a vector, and the two compact ones form a unimodular basis—so the tangled octave map on the fretboard is, up to a change of basis, the integer grid ℤ². A graph-theoretic tour of the neck, and why the B-string wrinkle is invisible to the math.",
		content: "/blog/octave-lattice.md",
		author: "Robert Cunningham",
		publishedDate: "2026-07-07",
		tags: ["Graph Theory", "Music Theory", "Lattices", "Guitar", "Visualization"],
		category: "Music & Mathematics",
		readingTime: 9,
		featured: true,
		image: "octave-lattice.svg"
	},
	{
		id: "unwarping-fretboard",
		slug: "unwarping-fretboard",
		title: "Unwarping the Fretboard",
		subtitle: "Triads, Interval Vectors, and the One-Fret Seam",
		excerpt:
			"A major triad is the cyclic interval word 4–3–5. Unwarp the G–B seam and its inversions become translations again—three chord-tone steps that add up to an octave-lattice generator.",
		content: "/blog/unwarping-fretboard.md",
		author: "Robert Cunningham",
		publishedDate: "2026-07-12",
		tags: ["Music Theory", "Guitar", "Intervals", "Lattices", "Triads"],
		category: "Music & Mathematics",
		readingTime: 11,
		featured: true,
		image: "unwarping-fretboard.svg"
	},
	{
		id: "caged-is-a-helix",
		slug: "caged-is-a-helix",
		title: "CAGED Is a Helix",
		subtitle: "Bass Roots, the Missing Fret, and the Hidden Register Seam",
		excerpt:
			"CAGED closes into a circle only after register is forgotten. Track absolute pitch and the D form reveals an octave jump, a literal zero-density fret, and a helix winding through overlapping triad neighborhoods.",
		content: "/blog/caged-is-a-helix.md",
		author: "Robert Cunningham",
		publishedDate: "2026-07-14",
		tags: ["Music Theory", "Guitar", "CAGED", "Lattices", "Fretboard Geometry"],
		category: "Music & Mathematics",
		readingTime: 30,
		featured: true,
		image: "caged-is-a-helix.svg"
	}
];

export const getFeaturedBlogPosts = () =>
	blogPostsData.filter((post) => post.featured);

export const getBlogPostBySlug = (slug: string) =>
	blogPostsData.find((post) => post.slug === slug);

export const getBlogPostsByCategory = (category: string) =>
	blogPostsData.filter((post) => post.category === category);

export const getBlogPostsByTag = (tag: string) =>
	blogPostsData.filter((post) => post.tags.includes(tag));
