import { render, screen } from "@testing-library/react";
import Index from "../../pages/index";

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

describe("Index Page", () => {
	it("renders the consultancy service section", () => {
		render(<Index />);
		expect(screen.getByText("Bagpyp | Software Consultancy")).toBeInTheDocument();
	});

	it("renders the checkout form", () => {
		render(<Index />);
		expect(screen.getByText("Make a Payment")).toBeInTheDocument();
	});

	it("renders the submit button", () => {
		render(<Index />);
		expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
	});
});
