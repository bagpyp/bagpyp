import { render, screen } from "@testing-library/react";
import HomePage from "../../pages/index";
import { caseStudiesData } from "../../data/case-studies";
import { projectsData } from "../../data/projects";
import { blogPostsData } from "../../data/blog-posts";

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: () => ({ user: null })
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => <img {...props} />
}));

describe("HomePage - Content Pinning Tests", () => {
	const mockProps = {
		featuredCaseStudies: caseStudiesData.filter((s) => s.featured),
		featuredProjects: projectsData.filter((p) => p.featured),
		featuredBlogPosts: blogPostsData.filter((b) => b.featured)
	};

	describe("Critical Client Visibility", () => {
		it("MUST show 'Hillcrest Ski & Sports' on homepage for client software check", () => {
			render(<HomePage {...mockProps} />);
			// Client software checks for this text - DO NOT REMOVE
			expect(screen.getByText(/Hillcrest Ski & Sports/i)).toBeInTheDocument();
		});
	});

	describe("Hero Section", () => {
		it("shows main headline about AI Engineering", () => {
			render(<HomePage {...mockProps} />);
			expect(screen.getByText("AI Engineering for", { exact: false })).toBeInTheDocument();
			expect(screen.getByText("Production Systems")).toBeInTheDocument();
		});

		it("mentions CAT framework in hero", () => {
			render(<HomePage {...mockProps} />);
			const catElements = screen.getAllByText(/Continuous Alignment Testing \(CAT\)/i);
			expect(catElements.length).toBeGreaterThanOrEqual(1);
		});

		it("shows OpenAI partner badge", () => {
			render(<HomePage {...mockProps} />);
			expect(
				screen.getByText("One of 8 official OpenAI partners worldwide")
			).toBeInTheDocument();
		});

		it("mentions Fortune 500 clients", () => {
			render(<HomePage {...mockProps} />);
			const mayoElements = screen.getAllByText(/Mayo Clinic/i);
			expect(mayoElements.length).toBeGreaterThanOrEqual(1);
			const ebayElements = screen.getAllByText(/eBay/i);
			expect(ebayElements.length).toBeGreaterThanOrEqual(1);
		});

		it("shows value propositions", () => {
			render(<HomePage {...mockProps} />);
			const multiAgentElements = screen.getAllByText(/Multi-Agent Systems/i);
			expect(multiAgentElements.length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Statistical Rigor")).toBeInTheDocument();
			expect(screen.getByText("Enterprise Scale")).toBeInTheDocument();
		});

		it("has CTA buttons", () => {
			render(<HomePage {...mockProps} />);
			expect(screen.getByText("View Experience")).toBeInTheDocument();
			expect(screen.getByText("Read Technical Blog")).toBeInTheDocument();
		});
	});

	describe("Featured Work Section", () => {
		it("shows Featured Work heading", () => {
			render(<HomePage {...mockProps} />);
			expect(screen.getByText("Featured Work")).toBeInTheDocument();
		});

		it("shows description mentioning Fortune 500", () => {
			render(<HomePage {...mockProps} />);
			expect(
				screen.getByText(/Fortune 500 companies and leading healthcare institutions/i)
			).toBeInTheDocument();
		});

		it("has View All Experience button", () => {
			render(<HomePage {...mockProps} />);
			expect(screen.getByText("View All Experience")).toBeInTheDocument();
		});
	});

	describe("CAT Framework Section", () => {
		it("shows CAT framework heading", () => {
			render(<HomePage {...mockProps} />);
			const catElements = screen.getAllByText("Continuous Alignment Testing (CAT)");
			expect(catElements.length).toBeGreaterThanOrEqual(1);
		});

		it("describes CAT framework", () => {
			render(<HomePage {...mockProps} />);
			expect(
				screen.getByText(/reliability tensors, validators, and statistical rigor/i)
			).toBeInTheDocument();
		});

		it("has Learn About CAT button", () => {
			render(<HomePage {...mockProps} />);
			expect(screen.getByText("Learn About CAT")).toBeInTheDocument();
		});

		it("has Get in Touch button", () => {
			render(<HomePage {...mockProps} />);
			expect(screen.getByText("Get in Touch")).toBeInTheDocument();
		});
	});
});
