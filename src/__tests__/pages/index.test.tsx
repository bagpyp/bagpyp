import { render, screen } from "@testing-library/react";
import HomePage from "../../pages/index";
import { caseStudiesData } from "../../data/case-studies";
import { projectsData } from "../../data/projects";
import { blogPostsData } from "../../data/blog-posts";

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: () => ({ user: null })
}));

// Mock Next.js Image - filter out fill prop to avoid React 19 warnings
jest.mock("next/image", () => ({
	__esModule: true,
	default: ({ fill, ...props }: any) => <img {...props} />
}));

describe("Home Page", () => {
	// Build mock featured items like getStaticProps does
	const mockFeaturedItems = [
		{
			item: caseStudiesData.find((s) => s.id === "mayo-clinic")!,
			type: "case-study" as const,
			config: { type: "case-study" as const, id: "mayo-clinic" }
		},
		{
			item: projectsData.find((p) => p.id === "guitar-triads")!,
			type: "project" as const,
			config: { type: "project" as const, id: "guitar-triads" }
		},
		{
			item: blogPostsData.find((b) => b.id === "reliability-testing")!,
			type: "blog" as const,
			config: { type: "blog" as const, id: "reliability-testing" }
		}
	];

	it("renders the hero section", () => {
		render(<HomePage featuredItems={mockFeaturedItems} />);
		expect(
			screen.getByText("AI Engineering for", { exact: false })
		).toBeInTheDocument();
	});

	it("renders featured work section", () => {
		render(<HomePage featuredItems={mockFeaturedItems} />);
		expect(screen.getByText("Featured Work")).toBeInTheDocument();
	});

	it("renders CAT framework highlight", () => {
		render(<HomePage featuredItems={mockFeaturedItems} />);
		const catElements = screen.getAllByText("Continuous Alignment Testing (CAT)");
		expect(catElements.length).toBeGreaterThanOrEqual(1);
	});

	it("renders View All Experience button", () => {
		render(<HomePage featuredItems={mockFeaturedItems} />);
		expect(screen.getByText("View All Experience")).toBeInTheDocument();
	});

	it("shows OpenAI partner badge", () => {
		render(<HomePage featuredItems={mockFeaturedItems} />);
		expect(
			screen.getByText(/one of 8 official OpenAI partners worldwide/i)
		).toBeInTheDocument();
	});

	it("shows featured items from config", () => {
		render(<HomePage featuredItems={mockFeaturedItems} />);
		expect(screen.getByText("Mayo Clinic")).toBeInTheDocument();
	});
});
