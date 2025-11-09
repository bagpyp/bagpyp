import { render, screen } from "@testing-library/react";

// Mock the Auth0 hook before any imports
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: jest.fn(() => ({ user: null }))
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => {
		return <img {...props} />;
	}
}));

import Contact from "../../pages/contact";
import { useUser } from "@auth0/nextjs-auth0/client";

describe("Contact Page", () => {
	it("renders heading when not logged in", () => {
		(useUser as jest.Mock).mockReturnValue({ user: null });
		render(<Contact />);
		expect(screen.getByText("Get in touch")).toBeInTheDocument();
	});

	it("shows login prompt when not logged in", () => {
		(useUser as jest.Mock).mockReturnValue({ user: null });
		render(<Contact />);
		expect(screen.getByText(/Login or Create an Account/i)).toBeInTheDocument();
	});

	it("shows contact information when logged in", () => {
		(useUser as jest.Mock).mockReturnValue({
			user: { name: "Test User", email: "test@example.com" }
		});
		render(<Contact />);
		expect(screen.getByText("Email Us")).toBeInTheDocument();
		expect(screen.getByText("Call Us")).toBeInTheDocument();
	});
});
