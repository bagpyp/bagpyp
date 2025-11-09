import { render, screen } from "@testing-library/react";
import BlogPage from "../../pages/blog/index";
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

describe("Blog Listing Page", () => {
	const mockProps = {
		posts: blogPostsData
	};

	it("renders page title", () => {
		render(<BlogPage {...mockProps} />);
		expect(screen.getByText("Technical Blog")).toBeInTheDocument();
	});

	it("shows description about AI engineering", () => {
		render(<BlogPage {...mockProps} />);
		expect(
			screen.getByText(/Deep dives into AI engineering/i)
		).toBeInTheDocument();
	});

	it("mentions CAT framework", () => {
		render(<BlogPage {...mockProps} />);
		const catElements = screen.getAllByText(/CAT framework/i);
		expect(catElements.length).toBeGreaterThanOrEqual(1);
	});

	it("renders blog post cards", () => {
		render(<BlogPage {...mockProps} />);
		// Should render at least some blog post titles
		expect(blogPostsData.length).toBeGreaterThan(0);
		if (blogPostsData.length > 0) {
			expect(screen.getByText(blogPostsData[0].title)).toBeInTheDocument();
		}
	});

	it("shows 'coming soon' message when no posts", () => {
		render(<BlogPage posts={[]} />);
		expect(screen.getByText(/Blog posts coming soon/i)).toBeInTheDocument();
	});
});
