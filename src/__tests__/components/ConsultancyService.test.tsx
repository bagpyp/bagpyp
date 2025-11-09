import { render, screen } from "@testing-library/react";
import ConsultancyService from "../../components/ConsultancyService";

// Mock Next.js Image component
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => {
		return <img {...props} />;
	}
}));

describe("ConsultancyService", () => {
	it("renders the main heading", () => {
		render(<ConsultancyService />);
		expect(screen.getByText("Bagpyp | Software Consultancy")).toBeInTheDocument();
	});

	it("renders the introduction text", () => {
		render(<ConsultancyService />);
		expect(screen.getByText(/At Bagpyp, we specialize in transforming/i)).toBeInTheDocument();
	});

	it("renders the services section", () => {
		render(<ConsultancyService />);
		expect(screen.getByText("Our Services")).toBeInTheDocument();
		expect(screen.getByText("Custom Software Development")).toBeInTheDocument();
		expect(screen.getByText("Legacy System Refactoring")).toBeInTheDocument();
		expect(screen.getByText("Microservices Architecture")).toBeInTheDocument();
		expect(screen.getByText("Data Analysis and Optimization")).toBeInTheDocument();
		expect(screen.getByText("CI/CD Implementation")).toBeInTheDocument();
	});

	it("renders highlighted projects section", () => {
		render(<ConsultancyService />);
		expect(screen.getByText("Highlighted Projects")).toBeInTheDocument();
	});

	it("renders TriMet project", () => {
		render(<ConsultancyService />);
		expect(screen.getByText("TriMet")).toBeInTheDocument();
		expect(screen.getByAltText("TriMet Project")).toBeInTheDocument();
	});

	it("renders Ford project", () => {
		render(<ConsultancyService />);
		expect(screen.getByText("Ford Motor Company")).toBeInTheDocument();
		expect(screen.getByAltText("Ford Project")).toBeInTheDocument();
	});

	it("renders Hillcrest project", () => {
		render(<ConsultancyService />);
		expect(screen.getByText("Hillcrest Ski & Sports")).toBeInTheDocument();
		expect(screen.getByAltText("Hillcrest Project")).toBeInTheDocument();
	});
});
