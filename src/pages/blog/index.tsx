import { GetStaticProps } from "next";
import Layout from "../../components/Layout";
import BlogPostCard from "../../components/BlogPostCard";
import { BlogPost } from "../../interfaces";
import { blogPostsData } from "../../data/blog-posts";

type Props = {
	posts: BlogPost[];
};

const BlogPage = ({ posts }: Props) => {
	return (
		<Layout
			title="Blog | Bagpyp"
			description="Technical writing on AI engineering, reliability testing, production systems, and software architecture"
		>
			{/* Header */}
			<section className="bg-gradient-to-br from-slate-900 to-primary-900 text-white py-20">
				<div className="container-custom">
					<div className="max-w-4xl">
						<h1 className="mb-6">Technical Blog</h1>
						<p className="text-xl text-slate-300 leading-relaxed">
							Deep dives into AI engineering, the CAT framework, mathematical
							foundations of ML systems, and lessons from production deployments.
						</p>
					</div>
				</div>
			</section>

			{/* Blog Posts Grid */}
			<section className="section">
				<div className="container-custom">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{posts.map((post) => (
							<BlogPostCard key={post.id} post={post} />
						))}
					</div>

					{posts.length === 0 && (
						<div className="text-center py-16">
							<p className="text-xl text-slate-600">
								Blog posts coming soon. Check back later for technical insights
								on AI engineering and production systems.
							</p>
						</div>
					)}
				</div>
			</section>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	return {
		props: {
			posts: blogPostsData
		}
	};
};

export default BlogPage;
