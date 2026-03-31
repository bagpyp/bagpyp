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

describe("HomePage - Content Pinning Tests", () => {
	// Build mock featured items matching the config structure
	const mockFeaturedItems = [
		{
			item: caseStudiesData.find((s) => s.id === "mayo-clinic")!,
			type: "case-study" as const,
			config: { type: "case-study" as const, id: "mayo-clinic" }
		},
		{
			item: caseStudiesData.find((s) => s.id === "hillcrest")!,
			type: "case-study" as const,
			config: { type: "case-study" as const, id: "hillcrest" }
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

	describe("Critical Client Visibility", () => {
		it("MUST show 'Hillcrest Ski & Sports' on homepage for client software check", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			// Client software checks for this text - DO NOT REMOVE
			const hillcrestElements = screen.getAllByText(/Hillcrest Ski & Sports/i);
			expect(hillcrestElements.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Hero Section", () => {
		it("shows main headline about agentic AI systems", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(
				screen.getByRole("heading", { level: 1, name: /Agentic AI Systems/i })
			).toBeInTheDocument();
			expect(screen.getByText(/That Hold Up in Production/i)).toBeInTheDocument();
		});

		it("mentions CAT framework in hero", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			const catElements = screen.getAllByText(
				/Continuous Alignment Testing \(CAT\)/i
			);
			expect(catElements.length).toBeGreaterThanOrEqual(1);
		});

		it("shows reliability positioning badge", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(
				screen.getByText(
					/Agentic AI, evals, and reliability engineering for high-stakes domains/i
				)
			).toBeInTheDocument();
		});

		it("mentions Fortune 500 clients", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			const mayoElements = screen.getAllByText(/Mayo Clinic/i);
			expect(mayoElements.length).toBeGreaterThanOrEqual(1);
		});

		it("shows value propositions", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(screen.getByText("Agentic Architectures")).toBeInTheDocument();
			expect(screen.getByText("Evals & Reliability")).toBeInTheDocument();
			expect(screen.getByText("High-Stakes Domains")).toBeInTheDocument();
		});

		it("has CTA buttons", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(screen.getByText("View Experience")).toBeInTheDocument();
			expect(screen.getByText("Read Technical Blog")).toBeInTheDocument();
		});
	});

	describe("Featured Work Section", () => {
		it("shows Featured Work heading", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(screen.getByText("Featured Work")).toBeInTheDocument();
		});

		it("shows description tying featured work to agentic architecture and Hillcrest", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(
				screen.getByText(
					/public writing, production case studies, and systems work centered on agentic architecture, evaluation, and reliability engineering\./i
				)
			).toBeInTheDocument();
			const hillcrestElements = screen.getAllByText(/Hillcrest Ski & Sports/i);
			expect(hillcrestElements.length).toBeGreaterThanOrEqual(1);
		});

		it("has View All buttons", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(screen.getByText("View All Experience")).toBeInTheDocument();
			expect(screen.getByText("View All Projects")).toBeInTheDocument();
			expect(screen.getByText("Read Blog")).toBeInTheDocument();
		});
	});

	describe("CAT Framework Section", () => {
		it("shows CAT framework heading", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			const catElements = screen.getAllByText(
				"Continuous Alignment Testing (CAT)"
			);
			expect(catElements.length).toBeGreaterThanOrEqual(1);
		});

		it("describes CAT framework", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(
				screen.getByText(
					/CAT combines validators, reliability tensors, and statistical rigor to make high-leverage AI systems more observable, auditable, and dependable at scale\./i
				)
			).toBeInTheDocument();
		});

		it("has Learn About CAT button", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(screen.getByText("Learn About CAT")).toBeInTheDocument();
		});

		it("has Get in Touch button", () => {
			render(<HomePage featuredItems={mockFeaturedItems} />);
			expect(screen.getByText("Get in Touch")).toBeInTheDocument();
		});
	});
});
