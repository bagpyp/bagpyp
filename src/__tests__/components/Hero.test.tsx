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
		expect(screen.getByText("AI Engineering for", { exact: false })).toBeInTheDocument();
		expect(screen.getByText("Production Systems")).toBeInTheDocument();
	});

	it("shows OpenAI partner badge", () => {
		render(<Hero />);
		expect(
			screen.getByText("One of 8 official OpenAI partners worldwide")
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
		expect(screen.getByText("Multi-Agent Systems")).toBeInTheDocument();
		expect(screen.getByText("Statistical Rigor")).toBeInTheDocument();
		expect(screen.getByText("Enterprise Scale")).toBeInTheDocument();
	});
});
