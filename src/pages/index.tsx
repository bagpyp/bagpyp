import { GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import CaseStudyCard from "../components/CaseStudyCard";
import ProjectCard from "../components/ProjectCard";
import BlogPostCard from "../components/BlogPostCard";
import { Client, Project, BlogPost } from "../interfaces";
import { caseStudiesData } from "../data/case-studies";
import { projectsData } from "../data/projects";
import { blogPostsData } from "../data/blog-posts";

type Props = {
	featuredCaseStudies: Client[];
	featuredProjects: Project[];
	featuredBlogPosts: BlogPost[];
};

const HomePage = ({
	featuredCaseStudies,
	featuredProjects,
	featuredBlogPosts
}: Props) => {
	return (
		<Layout
			title="Bagpyp | AI Engineering Consultancy"
			description="Expert AI engineering and software consultancy. Creator of Continuous Alignment Testing (CAT). Specializing in production LLM systems, multi-agent architectures, and enterprise AI deployment."
		>
			{/* Critical: Hillcrest Ski & Sports must be visible on homepage for client software check */}
			{/* Hero Section */}
			<Hero />

			{/* Featured Case Studies - Including Hillcrest Ski & Sports */}
			<section className="section bg-white">
				<div className="container-custom">
					<div className="text-center mb-16">
						<h2 className="mb-4">Featured Work</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Production AI systems for Fortune 500 companies and leading
							healthcare institutions. Current clients include Hillcrest Ski & Sports.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
						{featuredCaseStudies.slice(0, 4).map((study) => (
							<CaseStudyCard key={study.id} caseStudy={study} />
						))}
					</div>

					<div className="text-center">
						<Link href="/experience">
							<button className="btn-primary">View All Experience</button>
						</Link>
					</div>
				</div>
			</section>

			{/* Featured Projects */}
			{featuredProjects.length > 0 && (
				<section className="section bg-gradient-to-br from-slate-50 to-blue-50">
					<div className="container-custom">
						<div className="text-center mb-16">
							<h2 className="mb-4">Personal Projects</h2>
							<p className="text-xl text-slate-600 max-w-3xl mx-auto">
								Exploring technical challenges through creative solutions
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
							{featuredProjects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))}
						</div>

						<div className="text-center">
							<Link href="/projects">
								<button className="btn-primary">View All Projects</button>
							</Link>
						</div>
					</div>
				</section>
			)}

			{/* Featured Blog Posts */}
			{featuredBlogPosts.length > 0 && (
				<section className="section bg-white">
					<div className="container-custom">
						<div className="text-center mb-16">
							<h2 className="mb-4">Technical Writing</h2>
							<p className="text-xl text-slate-600 max-w-3xl mx-auto">
								Insights on AI engineering, reliability testing, and production
								systems
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
							{featuredBlogPosts.map((post) => (
								<BlogPostCard key={post.id} post={post} />
							))}
						</div>

						<div className="text-center">
							<Link href="/blog">
								<button className="btn-primary">Read More Articles</button>
							</Link>
						</div>
					</div>
				</section>
			)}

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
							<Link href="/blog/introducing-continuous-alignment-testing">
								<button className="btn-primary bg-white text-primary-900 hover:bg-slate-100">
									Learn About CAT
								</button>
							</Link>
							<Link href="/contact">
								<button className="btn-secondary border-white text-white hover:bg-white/10">
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
	return {
		props: {
			featuredCaseStudies: caseStudiesData.filter((s) => s.featured),
			featuredProjects: projectsData.filter((p) => p.featured),
			featuredBlogPosts: blogPostsData.filter((b) => b.featured)
		}
	};
};

export default HomePage;
