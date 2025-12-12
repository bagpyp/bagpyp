import { render, screen } from "@testing-library/react";
import ExperiencePage from "../../pages/experience";
import { caseStudiesData } from "../../data/case-studies";

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
	useUser: () => ({ user: null })
}));

// Mock Next.js Image - filter out fill prop to avoid React 19 warnings
jest.mock("next/image", () => ({
	__esModule: true,
	default: ({ fill, ...props }: any) => <img {...props} />
}));

describe("Experience Page", () => {
	const mockProps = {
		caseStudies: caseStudiesData
	};

	it("renders page title", () => {
		render(<ExperiencePage {...mockProps} />);
		expect(screen.getByText("Professional Experience")).toBeInTheDocument();
	});

	it("renders Artium AI section", () => {
		render(<ExperiencePage {...mockProps} />);
		expect(screen.getByText("AI Engineering at Artium AI")).toBeInTheDocument();
	});

	it("renders education section", () => {
		render(<ExperiencePage {...mockProps} />);
		expect(screen.getByText("Education & Expertise")).toBeInTheDocument();
		expect(
			screen.getByText("MS Computational & Applied Mathematics")
		).toBeInTheDocument();
	});

	it("shows core competencies", () => {
		render(<ExperiencePage {...mockProps} />);
		expect(
			screen.getByText("LLM System Design & AI Engineering")
		).toBeInTheDocument();
		expect(
			screen.getByText("Continuous Alignment Testing (CAT)")
		).toBeInTheDocument();
	});
});
