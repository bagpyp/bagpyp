import { render, screen } from "@testing-library/react";
import Hero from "../../components/Hero";

// Mock Next.js Link
jest.mock("next/link", () => ({
	__esModule: true,
	default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

describe("Hero", () => {
	it("renders main headline", () => {
		render(<Hero />);
		expect(screen.getByText(/Agentic AI Systems/i)).toBeInTheDocument();
		expect(screen.getByText(/That Hold Up in Production/i)).toBeInTheDocument();
	});

	it("shows reliability positioning badge", () => {
		render(<Hero />);
		expect(
			screen.getByText(
				/Agentic AI, evals, and reliability engineering for high-stakes domains/i
			)
		).toBeInTheDocument();
	});

	it("mentions CAT framework", () => {
		render(<Hero />);
		expect(
			screen.getByText("Continuous Alignment Testing (CAT)", { exact: false })
		).toBeInTheDocument();
	});

	it("mentions Fortune 500 clients", () => {
		render(<Hero />);
		expect(
			screen.getByText(/Mayo Clinic, eBay, Trust & Will, and Arrive Health/)
		).toBeInTheDocument();
	});

	it("renders CTA buttons", () => {
		render(<Hero />);
		expect(screen.getByText("View Experience")).toBeInTheDocument();
		expect(screen.getByText("Read Technical Blog")).toBeInTheDocument();
	});

	it("shows value props", () => {
		render(<Hero />);
		expect(screen.getByText("Agentic Architectures")).toBeInTheDocument();
		expect(screen.getByText("Evals & Reliability")).toBeInTheDocument();
		expect(screen.getByText("High-Stakes Domains")).toBeInTheDocument();
	});
});
