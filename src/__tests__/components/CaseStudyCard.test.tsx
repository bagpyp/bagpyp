import { render, screen } from "@testing-library/react";
import CaseStudyCard from "../../components/CaseStudyCard";
import { Client } from "../../interfaces";

// Mock Next.js Image - filter out fill prop to avoid React 19 warnings
jest.mock("next/image", () => ({
	__esModule: true,
	default: ({ fill, ...props }: any) => <img {...props} />
}));

describe("CaseStudyCard", () => {
	const mockCaseStudy: Client = {
		id: "test-client",
		name: "Test Company",
		role: "Senior Engineer",
		period: "2024",
		location: "Remote",
		description: "Test description of the work",
		highlights: [
			"Built amazing things",
			"Solved complex problems",
			"Delivered at scale"
		],
		technologies: ["Python", "TypeScript", "React"],
		aiFeatures: ["Multi-Agent Systems", "RAG"],
		featured: true
	};

	it("renders company name", () => {
		render(<CaseStudyCard caseStudy={mockCaseStudy} />);
		expect(screen.getByText("Test Company")).toBeInTheDocument();
	});

	it("renders role and period", () => {
		render(<CaseStudyCard caseStudy={mockCaseStudy} />);
		expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
		expect(screen.getByText("2024")).toBeInTheDocument();
	});

	it("renders description", () => {
		render(<CaseStudyCard caseStudy={mockCaseStudy} />);
		expect(screen.getByText("Test description of the work")).toBeInTheDocument();
	});

	it("renders AI features", () => {
		render(<CaseStudyCard caseStudy={mockCaseStudy} />);
		expect(screen.getByText("Multi-Agent Systems")).toBeInTheDocument();
		expect(screen.getByText("RAG")).toBeInTheDocument();
	});

	it("renders highlights (first 3)", () => {
		render(<CaseStudyCard caseStudy={mockCaseStudy} />);
		expect(screen.getByText("Built amazing things")).toBeInTheDocument();
		expect(screen.getByText("Solved complex problems")).toBeInTheDocument();
		expect(screen.getByText("Delivered at scale")).toBeInTheDocument();
	});

	it("renders technologies", () => {
		render(<CaseStudyCard caseStudy={mockCaseStudy} />);
		expect(screen.getByText("Python")).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
	});
});
