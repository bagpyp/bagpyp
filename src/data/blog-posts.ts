import { BlogPost } from "../interfaces";

// Blog post metadata - actual content hosted as markdown/PDF
export const blogPostsData: BlogPost[] = [
	{
		id: "cat-framework-intro",
		slug: "introducing-continuous-alignment-testing",
		title: "Introducing Continuous Alignment Testing",
		subtitle: "A Framework for Validating Production AI Systems",
		excerpt:
			"How to systematically validate and monitor agentic AI architectures in production using validators, verifiers, and reliability tensors.",
		content: "/blog/cat-framework-intro.md", // Path to markdown file
		author: "Robert Cunningham",
		publishedDate: "2024-07-15",
		tags: ["AI", "Testing", "CAT Framework", "Production AI", "Reliability"],
		category: "AI Engineering",
		readingTime: 12,
		featured: true,
		image: "cat-reliability-tensor.svg"
	},
	{
		id: "reliability-tensors",
		slug: "reliability-tensors-mathematical-framework",
		title: "Reliability Tensors",
		subtitle: "Mathematical Framework for AI Testing",
		excerpt:
			"Deep dive into the mathematical foundations of reliability testing: validators, verifiers, and 3D tensor representations of AI system behavior.",
		content: "/blog/reliability-testing.pdf", // Path to PDF
		author: "Robert Cunningham",
		publishedDate: "2024-08-01",
		tags: ["Mathematics", "AI Testing", "CAT Framework", "Tensor Analysis"],
		category: "Technical Deep Dive",
		readingTime: 20,
		featured: true,
		image: "reliability-tensor-3d.svg"
	},
	{
		id: "agentic-architecture-algebra",
		slug: "agentic-architecture-algebra",
		title: "The Algebra of Agentic Architectures",
		subtitle: "Formalizing Tool-Using AI Systems",
		excerpt:
			"Mathematical formalization of agentic AI systems through tool call matrices, selection masks, and interaction tensors.",
		content: "/blog/agentic-architecture-algebra.md", // Path to markdown
		author: "Robert Cunningham",
		publishedDate: "2024-09-15",
		tags: ["Agentic AI", "Mathematics", "Formal Methods", "AI Architecture"],
		category: "AI Engineering",
		readingTime: 15,
		featured: true,
		image: "agentic-algebra.svg"
	},
	{
		id: "production-ai-monitoring",
		slug: "sidecar-pattern-ai-monitoring",
		title: "The Sidecar Pattern for AI Monitoring",
		subtitle: "Zero-Cost Reliability Testing in Production",
		excerpt:
			"How to leverage existing production data to run continuous reliability tests without generating new outputs or incurring additional compute costs.",
		content: "/blog/production-monitoring.md", // Placeholder
		author: "Robert Cunningham",
		publishedDate: "2024-10-01",
		tags: ["Production AI", "Monitoring", "CAT Framework", "DevOps"],
		category: "AI Engineering",
		readingTime: 10,
		featured: false,
		image: "sidecar-pattern.svg"
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
