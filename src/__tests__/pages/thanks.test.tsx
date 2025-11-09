import { render, screen } from "@testing-library/react";
import Thanks from "../../pages/thanks";

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

describe("Thanks Page", () => {
	it("renders thank you message", () => {
		render(<Thanks />);
		expect(screen.getByText("Thank you!")).toBeInTheDocument();
	});
});
