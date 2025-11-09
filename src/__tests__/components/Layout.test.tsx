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

	it("renders with custom title", () => {
		render(<Layout title="Custom Title">Test content</Layout>);
		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("renders header with logo and contact link", () => {
		render(<Layout>Test content</Layout>);
		expect(screen.getByAltText("bagpyp")).toBeInTheDocument();
		expect(screen.getByText("Contact")).toBeInTheDocument();
	});

	it("renders footer with copyright", () => {
		render(<Layout>Test content</Layout>);
		const currentYear = new Date().getFullYear();
		expect(screen.getByText(`© ${currentYear}`)).toBeInTheDocument();
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
