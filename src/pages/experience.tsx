import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import CaseStudyCard from "../components/CaseStudyCard";
import { Client } from "../interfaces";
import { caseStudiesData } from "../data/case-studies";

type Props = {
	caseStudies: Client[];
};

const ExperiencePage = ({ caseStudies }: Props) => {
	return (
		<Layout
			title="Experience | Bagpyp"
			description="Professional experience in AI engineering, software development, and enterprise systems. Work with Mayo Clinic, eBay, Ford, Trust & Will, and more."
		>
			{/* Header */}
			<section className="bg-gradient-to-br from-slate-900 to-primary-900 text-white py-20">
				<div className="container-custom">
					<div className="max-w-4xl">
						<h1 className="mb-6">Professional Experience</h1>
						<p className="text-xl text-slate-300 leading-relaxed">
							Enterprise AI engineering, software development, and system
							architecture for Fortune 500 companies, healthcare institutions,
							and innovative startups.
						</p>
					</div>
				</div>
			</section>

			{/* Case Studies Grid */}
			<section className="section">
				<div className="container-custom">
					{/* Artium AI Sub-clients highlighted */}
					<div className="mb-16">
						<h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
							AI Engineering at Artium AI
						</h2>
						<p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-3xl">
							As one of only eight official OpenAI partners worldwide, delivered
							production AI systems for leading organizations.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{caseStudies
								.filter(
									(s) =>
										s.id === "mayo-clinic" ||
										s.id === "ebay" ||
										s.id === "trust-and-will" ||
										s.id === "arrive-health"
								)
								.map((study) => (
									<CaseStudyCard key={study.id} caseStudy={study} />
								))}
						</div>
					</div>

					{/* Other Experience */}
					<div>
						<h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
							Additional Experience
						</h2>
						<p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-3xl">
							Full-stack development, data engineering, and ongoing client
							support.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{caseStudies
								.filter(
									(s) =>
										s.id !== "mayo-clinic" &&
										s.id !== "ebay" &&
										s.id !== "trust-and-will" &&
										s.id !== "arrive-health"
								)
								.map((study) => (
									<CaseStudyCard key={study.id} caseStudy={study} />
								))}
						</div>
					</div>
				</div>
			</section>

			{/* Credentials Section */}
			<section className="section bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
				<div className="container-custom">
					<div className="max-w-4xl mx-auto">
						<h2 className="text-3xl font-bold mb-8 text-center dark:text-slate-100">
							Education & Expertise
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Education */}
							<div className="card p-8">
								<h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">
									Academic Background
								</h3>
								<div className="space-y-6">
									<div>
										<h4 className="font-semibold text-primary-700 dark:text-primary-400">
											MS Computational & Applied Mathematics
										</h4>
										<p className="text-slate-600 dark:text-slate-300">
											Portland State University, 2015-2017
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-primary-700 dark:text-primary-400">
											Software Development Bootcamp
										</h4>
										<p className="text-slate-600 dark:text-slate-300">The Tech Academy, 2019</p>
									</div>
								</div>
							</div>

							{/* Core Skills */}
							<div className="card p-8">
								<h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">
									Core Competencies
								</h3>
								<ul className="space-y-3">
									<li className="flex items-start">
										<svg
											className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-slate-700 dark:text-slate-300">
											LLM System Design & AI Engineering
										</span>
									</li>
									<li className="flex items-start">
										<svg
											className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-slate-700 dark:text-slate-300">
											Statistical & Mathematical Modeling
										</span>
									</li>
									<li className="flex items-start">
										<svg
											className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-slate-700 dark:text-slate-300">
											Multi-Agent & RAG Architectures
										</span>
									</li>
									<li className="flex items-start">
										<svg
											className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-slate-700 dark:text-slate-300">
											Continuous Alignment Testing (CAT)
										</span>
									</li>
									<li className="flex items-start">
										<svg
											className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-slate-700 dark:text-slate-300">
											Enterprise Software Architecture
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	return {
		props: {
			caseStudies: caseStudiesData
		}
	};
};

export default ExperiencePage;
