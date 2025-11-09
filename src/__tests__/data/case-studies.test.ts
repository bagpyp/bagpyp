import {
	caseStudiesData,
	getFeaturedCaseStudies,
	getCaseStudyById
} from "../../data/case-studies";

describe("Case Studies Data", () => {
	it("has all expected case studies", () => {
		expect(caseStudiesData).toHaveLength(7);
	});

	it("includes Mayo Clinic case study", () => {
		const mayo = caseStudiesData.find((s) => s.id === "mayo-clinic");
		expect(mayo).toBeDefined();
		expect(mayo?.name).toBe("Mayo Clinic");
	});

	it("includes eBay case study", () => {
		const ebay = caseStudiesData.find((s) => s.id === "ebay");
		expect(ebay).toBeDefined();
		expect(ebay?.name).toBe("eBay");
	});

	it("includes Trust & Will case study", () => {
		const trustAndWill = caseStudiesData.find((s) => s.id === "trust-and-will");
		expect(trustAndWill).toBeDefined();
		expect(trustAndWill?.name).toBe("Trust & Will");
	});

	it("includes Arrive Health case study", () => {
		const arriveHealth = caseStudiesData.find((s) => s.id === "arrive-health");
		expect(arriveHealth).toBeDefined();
		expect(arriveHealth?.name).toBe("Arrive Health");
	});

	it("CRITICAL: includes Hillcrest Ski & Sports case study", () => {
		const hillcrest = caseStudiesData.find((s) => s.id === "hillcrest");
		expect(hillcrest).toBeDefined();
		expect(hillcrest?.name).toBe("Hillcrest Ski & Sports");
		expect(hillcrest?.featured).toBe(true);
	});

	it("all case studies have required fields", () => {
		caseStudiesData.forEach((study) => {
			expect(study.id).toBeDefined();
			expect(study.name).toBeDefined();
			expect(study.role).toBeDefined();
			expect(study.description).toBeDefined();
			expect(study.highlights).toBeDefined();
			expect(study.technologies).toBeDefined();
		});
	});

	it("getFeaturedCaseStudies returns only featured studies", () => {
		const featured = getFeaturedCaseStudies();
		featured.forEach((study) => {
			expect(study.featured).toBe(true);
		});
	});

	it("getFeaturedCaseStudies includes Hillcrest", () => {
		const featured = getFeaturedCaseStudies();
		const hillcrest = featured.find((s) => s.name === "Hillcrest Ski & Sports");
		expect(hillcrest).toBeDefined();
	});

	it("getCaseStudyById works correctly", () => {
		const mayo = getCaseStudyById("mayo-clinic");
		expect(mayo?.name).toBe("Mayo Clinic");
	});

	it("AI features are properly set", () => {
		const mayo = caseStudiesData.find((s) => s.id === "mayo-clinic");
		expect(mayo?.aiFeatures).toBeDefined();
		expect(mayo?.aiFeatures?.length).toBeGreaterThan(0);
	});
});
