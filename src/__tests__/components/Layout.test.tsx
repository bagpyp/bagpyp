import { render, screen } from "@testing-library/react";
import Layout from "../../components/Layout";

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

	it("renders Bagpyp brand", () => {
		render(<Layout>Test content</Layout>);
		const bagpypElements = screen.getAllByText("Bagpyp");
		expect(bagpypElements.length).toBeGreaterThan(0);
	});

	it("renders Sign In button when not logged in", () => {
		render(<Layout>Test content</Layout>);
		expect(screen.getByText("Sign In")).toBeInTheDocument();
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
