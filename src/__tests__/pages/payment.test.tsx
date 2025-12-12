import { render, screen } from "@testing-library/react";

// Mock Auth0 FIRST before any imports
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: jest.fn(() => ({ user: null, isLoading: false }))
}));

// Mock Next.js Image - filter out fill prop to avoid React 19 warnings
jest.mock("next/image", () => ({
	__esModule: true,
	default: ({ fill, ...props }: any) => <img {...props} />
}));

// Mock Stripe
jest.mock("../../utils/get-stripe", () => ({
	__esModule: true,
	default: jest.fn()
}));

import PaymentPage from "../../pages/payment";
import { useUser } from "@auth0/nextjs-auth0/client";

describe("Payment Page", () => {
	it("shows authentication required when not logged in", () => {
		(useUser as jest.Mock).mockReturnValue({ user: null, isLoading: false });

		render(<PaymentPage />);
		expect(screen.getByText("Authentication Required")).toBeInTheDocument();
		expect(
			screen.getByText("Please sign in to access the payment page.")
		).toBeInTheDocument();
	});

	it("shows loading state", () => {
		(useUser as jest.Mock).mockReturnValue({ user: null, isLoading: true });

		render(<PaymentPage />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("shows payment form when logged in", () => {
		(useUser as jest.Mock).mockReturnValue({
			user: { name: "Test User", email: "test@example.com" },
			isLoading: false
		});

		render(<PaymentPage />);
		expect(screen.getByText("Make a Payment")).toBeInTheDocument();
		expect(screen.getByText("Enter Payment Amount")).toBeInTheDocument();
	});
});
