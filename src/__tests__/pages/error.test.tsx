import { render, screen } from "@testing-library/react";
import Error from "../../pages/error";

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

describe("Error Page", () => {
	it("renders error message", () => {
		render(<Error />);
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});
});
