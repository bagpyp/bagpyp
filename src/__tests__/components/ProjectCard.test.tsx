import { render, screen } from "@testing-library/react";
import ProjectCard from "../../components/ProjectCard";
import { Project } from "../../interfaces";

// Mock Next.js Image
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => <img {...props} />
}));

describe("ProjectCard", () => {
	const mockProject: Project = {
		id: "test-project",
		slug: "test-project-slug",
		title: "Test Project",
		subtitle: "Test Subtitle",
		description: "Test project description",
		longDescription: "Longer test description",
		client: "Personal",
		technologies: ["React", "TypeScript", "Next.js", "Tailwind", "Jest"],
		features: ["Feature 1", "Feature 2"],
		images: ["test-image.png"],
		featured: true,
		year: "2024",
		category: "AI/ML"
	};

	it("renders project title", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("Test Project")).toBeInTheDocument();
	});

	it("renders project subtitle", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
	});

	it("renders project description", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("Test project description")).toBeInTheDocument();
	});

	it("shows category badge", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("AI/ML")).toBeInTheDocument();
	});

	it("displays first 4 technologies", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(screen.getByText("Next.js")).toBeInTheDocument();
		expect(screen.getByText("Tailwind")).toBeInTheDocument();
	});

	it("shows +1 more when more than 4 technologies", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("+1 more")).toBeInTheDocument();
	});

	it("has View Project CTA", () => {
		render(<ProjectCard project={mockProject} />);
		expect(screen.getByText("View Project")).toBeInTheDocument();
	});

	it("links to correct project slug", () => {
		const { container } = render(<ProjectCard project={mockProject} />);
		const link = container.querySelector('a[href="/projects/test-project-slug"]');
		expect(link).toBeInTheDocument();
	});
});
