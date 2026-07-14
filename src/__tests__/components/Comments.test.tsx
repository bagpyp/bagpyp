import { render, screen } from "@testing-library/react";
import Comments from "../../components/Comments";

// Mock giscus - jsdom can't load the iframe widget
jest.mock("@giscus/react", () => ({
	__esModule: true,
	default: (props: any) => (
		<div
			data-testid="giscus"
			data-repo={props.repo}
			data-mapping={props.mapping}
			data-term={props.term}
			data-theme={props.theme}
		/>
	)
}));

describe("Comments", () => {
	it("renders the Comments heading", () => {
		render(<Comments slug="reliability-testing" />);
		expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
	});

	it("keys the giscus thread to the post slug", () => {
		render(<Comments slug="reliability-testing" />);
		const giscus = screen.getByTestId("giscus");
		expect(giscus).toHaveAttribute("data-repo", "bagpyp/bagpyp");
		expect(giscus).toHaveAttribute("data-mapping", "specific");
		expect(giscus).toHaveAttribute("data-term", "reliability-testing");
	});

	it("uses the dark theme when the dark class is set", () => {
		document.documentElement.classList.add("dark");
		const { unmount } = render(<Comments slug="reliability-testing" />);
		expect(screen.getByTestId("giscus")).toHaveAttribute("data-theme", "dark");
		unmount();
		document.documentElement.classList.remove("dark");
	});
});
