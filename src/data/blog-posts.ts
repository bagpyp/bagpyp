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
