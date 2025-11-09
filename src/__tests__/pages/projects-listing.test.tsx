import { render, screen } from "@testing-library/react";
import ProjectsPage from "../../pages/projects/index";
import { projectsData } from "../../data/projects";

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: () => ({ user: null })
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => <img {...props} />
}));

describe("Projects Listing Page", () => {
	const mockProps = {
		projects: projectsData
	};

	it("renders page title", () => {
		render(<ProjectsPage {...mockProps} />);
		expect(screen.getByText("Personal Projects")).toBeInTheDocument();
	});

	it("shows descriptive subtitle", () => {
		render(<ProjectsPage {...mockProps} />);
		expect(
			screen.getByText("Exploring technical challenges through creative solutions")
		).toBeInTheDocument();
	});

	it("renders project cards", () => {
		render(<ProjectsPage {...mockProps} />);
		projectsData.forEach((project) => {
			expect(screen.getByText(project.title)).toBeInTheDocument();
		});
	});

	it("includes guitar projects", () => {
		render(<ProjectsPage {...mockProps} />);
		// Should have at least one guitar-related project
		const guitarElements = screen.getAllByText(/Guitar/i);
		expect(guitarElements.length).toBeGreaterThanOrEqual(1);
	});
});
