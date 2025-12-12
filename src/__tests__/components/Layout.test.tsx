import { render, screen } from "@testing-library/react";
import Layout from "../../components/Layout";

// Mock the Auth0 hook
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: () => ({ user: null })
}));

// Mock Next.js Image component - filter out fill prop to avoid React 19 warnings
jest.mock("next/image", () => ({
	__esModule: true,
	default: ({ fill, ...props }: any) => {
		return <img {...props} />;
	}
}));

describe("Layout", () => {
	it("renders with default title", () => {
		render(<Layout>Test content</Layout>);
		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("renders navigation links", () => {
		render(<Layout>Test content</Layout>);
		const experienceLinks = screen.getAllByText("Experience");
		expect(experienceLinks.length).toBeGreaterThanOrEqual(1);
		const projectsLinks = screen.getAllByText("Projects");
		expect(projectsLinks.length).toBeGreaterThanOrEqual(1);
		const blogLinks = screen.getAllByText("Blog");
		expect(blogLinks.length).toBeGreaterThanOrEqual(1);
	});

	it("renders brand name", () => {
		render(<Layout>Test content</Layout>);
		const brandElements = screen.getAllByText(/Robert Cunningham|Bagpyp/i);
		expect(brandElements.length).toBeGreaterThan(0);
	});

	it("renders without Sign In button (auth handled elsewhere)", () => {
		render(<Layout>Test content</Layout>);
		// Sign In is now handled on the payment page directly, not in Layout
		expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
	});

	it("renders footer with copyright", () => {
		render(<Layout>Test content</Layout>);
		const currentYear = new Date().getFullYear();
		expect(
			screen.getByText(`© ${currentYear} Bagpyp, LLC. All rights reserved.`)
		).toBeInTheDocument();
	});

	it("renders children correctly", () => {
		render(
			<Layout>
				<div data-testid="child-element">Child content</div>
			</Layout>
		);
		expect(screen.getByTestId("child-element")).toBeInTheDocument();
		expect(screen.getByText("Child content")).toBeInTheDocument();
	});
});
