import { BlogPost } from "../interfaces";

// Blog post metadata - actual content hosted as markdown/PDF
export const blogPostsData: BlogPost[] = [
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
		image: "c_prime_node.svg"
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
