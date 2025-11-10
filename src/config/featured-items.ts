/**
 * Featured Items Configuration
 *
 * Control exactly what appears on the homepage in what order.
 * Mix and match case studies, projects, and blog posts.
 *
 * Add/remove/reorder items here to customize homepage featured content.
 */

export type FeaturedItemConfig = {
	type: "case-study" | "project" | "blog";
	id: string; // The ID from the respective data file
};

/**
 * Homepage Featured Items
 *
 * Configure what appears in the "Featured Work" section on homepage.
 * Items will appear in the order listed here.
 *
 * Examples:
 * - { type: "case-study", id: "mayo-clinic" }
 * - { type: "project", id: "guitar-triads" }
 * - { type: "blog", id: "reliability-testing" }
 */
export const featuredItems: FeaturedItemConfig[] = [
	// AI Case Studies - Top 3
	{ type: "case-study", id: "ebay" },
	{ type: "case-study", id: "mayo-clinic" },
	{ type: "case-study", id: "trust-and-will" },

	// Ford, TriMet, and Hillcrest Experience
	{ type: "case-study", id: "ford" },
	{ type: "case-study", id: "trimet" },
	{ type: "case-study", id: "hillcrest" },

	// Thought Leadership
	{ type: "blog", id: "reliability-testing" },

	// More Blog Content
	{ type: "blog", id: "agentic-architecture" },
	{ type: "blog", id: "agentic-algebra" },
	{ type: "blog", id: "mathematics-of-trust" },

	// More Projects
	{ type: "project", id: "graph-dynamics" },

	// Guitar Project
	{ type: "project", id: "guitar-triads" },
];

/**
 * To customize:
 *
 * 1. Add/remove items from the array above
 * 2. Reorder items as desired
 * 3. IDs must match those in:
 *    - src/data/case-studies.ts (for case-study type)
 *    - src/data/projects.ts (for project type)
 *    - src/data/blog-posts.ts (for blog type)
 *
 * The homepage will automatically render the appropriate card type
 * for each item in the order specified.
 */
