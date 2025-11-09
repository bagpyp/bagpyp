import { render, screen } from "@testing-library/react";
import BlogPostCard from "../../components/BlogPostCard";
import { BlogPost } from "../../interfaces";

describe("BlogPostCard", () => {
	const mockPost: BlogPost = {
		id: "test-post",
		slug: "test-post-slug",
		title: "Test Blog Post",
		subtitle: "Test Subtitle",
		excerpt: "This is a test excerpt for the blog post",
		content: "/blog/test-post.md",
		author: "Robert Cunningham",
		publishedDate: "2024-01-15",
		tags: ["AI", "Testing", "CAT Framework"],
		category: "AI Engineering",
		readingTime: 10,
		featured: true
	};

	it("renders post title", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
	});

	it("renders post subtitle", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
	});

	it("renders excerpt", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(
			screen.getByText("This is a test excerpt for the blog post")
		).toBeInTheDocument();
	});

	it("shows category", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(screen.getByText("AI Engineering")).toBeInTheDocument();
	});

	it("shows reading time", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(screen.getByText("10 min read")).toBeInTheDocument();
	});

	it("displays tags", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(screen.getByText("#AI")).toBeInTheDocument();
		expect(screen.getByText("#Testing")).toBeInTheDocument();
		expect(screen.getByText("#CAT Framework")).toBeInTheDocument();
	});

	it("shows formatted date", () => {
		render(<BlogPostCard post={mockPost} />);
		// Date formatting may vary, just check it contains "2024"
		expect(screen.getByText(/2024/)).toBeInTheDocument();
	});

	it("has Read Article CTA", () => {
		render(<BlogPostCard post={mockPost} />);
		expect(screen.getByText("Read Article")).toBeInTheDocument();
	});

	it("links to correct blog slug", () => {
		const { container } = render(<BlogPostCard post={mockPost} />);
		const link = container.querySelector('a[href="/blog/test-post-slug"]');
		expect(link).toBeInTheDocument();
	});
});
