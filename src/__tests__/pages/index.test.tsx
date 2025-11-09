import { render, screen } from "@testing-library/react";
import HomePage from "../../pages/index";
import { caseStudiesData } from "../../data/case-studies";
import { projectsData } from "../../data/projects";
import { blogPostsData } from "../../data/blog-posts";

// Mock the Auth0 hook
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: () => ({ user: null })
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => {
		return <img {...props} />;
	}
}));

// Mock Stripe
jest.mock("../../utils/get-stripe", () => ({
	__esModule: true,
	default: jest.fn()
}));

describe("Home Page", () => {
	const mockProps = {
		featuredCaseStudies: caseStudiesData.filter((s) => s.featured),
		featuredProjects: projectsData.filter((p) => p.featured),
		featuredBlogPosts: blogPostsData.filter((b) => b.featured)
	};

	it("renders the hero section", () => {
		render(<HomePage {...mockProps} />);
		expect(
			screen.getByText("AI Engineering for", { exact: false })
		).toBeInTheDocument();
	});

	it("renders featured work section", () => {
		render(<HomePage {...mockProps} />);
		expect(screen.getByText("Featured Work")).toBeInTheDocument();
	});

	it("renders CAT framework highlight", () => {
		render(<HomePage {...mockProps} />);
		const catElements = screen.getAllByText("Continuous Alignment Testing (CAT)");
		expect(catElements.length).toBeGreaterThanOrEqual(1);
	});

	it("renders View All Experience button", () => {
		render(<HomePage {...mockProps} />);
		expect(screen.getByText("View All Experience")).toBeInTheDocument();
	});

	it("shows OpenAI partner badge", () => {
		render(<HomePage {...mockProps} />);
		expect(
			screen.getByText("One of 8 official OpenAI partners worldwide")
		).toBeInTheDocument();
	});
});
