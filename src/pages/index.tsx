import { GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import FeaturedCard from "../components/FeaturedCard";
import { Client, Project, BlogPost } from "../interfaces";
import { caseStudiesData, getCaseStudyById } from "../data/case-studies";
import { projectsData, getProjectBySlug } from "../data/projects";
import { blogPostsData, getBlogPostBySlug } from "../data/blog-posts";
import { featuredItems, FeaturedItemConfig } from "../config/featured-items";

type FeaturedItem = {
	item: Client | Project | BlogPost;
	type: "case-study" | "project" | "blog";
	config: FeaturedItemConfig;
};

type Props = {
	featuredItems: FeaturedItem[];
};

const HomePage = ({ featuredItems }: Props) => {
	return (
		<Layout
			title="Bagpyp | AI Engineering Consultancy"
			description="Expert AI engineering and software consultancy. Creator of Continuous Alignment Testing (CAT). Specializing in production LLM systems, multi-agent architectures, and enterprise AI deployment."
		>
			{/* Critical: Hillcrest Ski & Sports must be visible on homepage for client software check */}
			{/* Hero Section */}
			<Hero />

			{/* Featured Work - Configurable Mix of Case Studies, Projects, and Blog Posts */}
			<section className="section bg-white dark:bg-slate-900">
				<div className="container-custom">
					<div className="text-center mb-16">
						<h2 className="mb-4">Featured Work</h2>
						<p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
							Production AI systems for Fortune 500 companies, interactive
							projects, and technical thought leadership.
						</p>
					</div>

					{/* Flexible Grid - Mix any content types */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
						{featuredItems.map(({ item, type, config }, idx) => (
							<FeaturedCard
								key={`${type}-${config.id}-${idx}`}
								item={item}
								type={type}
							/>
						))}
					</div>

					<div className="text-center space-x-4">
						<Link href="/experience">
							<button className="btn-primary">View All Experience</button>
						</Link>
						<Link href="/projects">
							<button className="btn-secondary">View All Projects</button>
						</Link>
						<Link href="/blog">
							<button className="btn-secondary">Read Blog</button>
						</Link>
					</div>
				</div>
			</section>

			{/* CAT Framework Highlight */}
			<section className="section bg-gradient-to-br from-primary-900 via-accent-900 to-primary-900 text-white">
				<div className="container-custom">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="mb-6">Continuous Alignment Testing (CAT)</h2>
						<p className="text-xl text-primary-100 mb-8 leading-relaxed">
							A framework for validating and monitoring agentic AI architectures
							in production. Using reliability tensors, validators, and
							statistical rigor to ensure AI systems behave consistently and
							predictably at scale.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/blog/reliability-testing-llm-systems">
								<button className="btn-primary">
									Learn About CAT
								</button>
							</Link>
							<Link href="/contact">
								<button className="btn-secondary bg-transparent border-white text-white hover:bg-white/10">
									Get in Touch
								</button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	// Build featured items array from configuration
	const items: FeaturedItem[] = featuredItems
		.map((config) => {
			let item: Client | Project | BlogPost | undefined;

			if (config.type === "case-study") {
				item = getCaseStudyById(config.id);
			} else if (config.type === "project") {
				// Projects use slug, not id
				item = projectsData.find((p) => p.id === config.id);
			} else if (config.type === "blog") {
				// Blog posts use slug, not id
				item = blogPostsData.find((b) => b.id === config.id);
			}

			if (!item) {
				console.warn(`Featured item not found: ${config.type} - ${config.id}`);
				return null;
			}

			return {
				item,
				type: config.type,
				config
			};
		})
		.filter((item): item is FeaturedItem => item !== null);

	return {
		props: {
			featuredItems: items
		}
	};
};

export default HomePage;
