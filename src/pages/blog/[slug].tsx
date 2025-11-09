import { GetStaticProps, GetStaticPaths } from "next";
import Layout from "../../components/Layout";
import { BlogPost } from "../../interfaces";
import { blogPostsData } from "../../data/blog-posts";

type Props = {
	post?: BlogPost;
	errors?: string;
};

const BlogPostPage = ({ post, errors }: Props) => {
	if (errors || !post) {
		return (
			<Layout title="Blog Post Not Found">
				<div className="container-custom section">
					<p className="text-red-600">Error: {errors || "Post not found"}</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout title={`${post.title} | Bagpyp Blog`} description={post.excerpt}>
			<article className="section">
				<div className="container-custom max-w-4xl">
					{/* Header */}
					<div className="mb-12">
						{/* Category & Date */}
						<div className="flex items-center gap-4 mb-6">
							<span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
								{post.category}
							</span>
							<span className="text-slate-500">
								{new Date(post.publishedDate).toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric"
								})}
							</span>
							<span className="text-slate-500">• {post.readingTime} min read</span>
						</div>

						{/* Title */}
						<h1 className="mb-4">{post.title}</h1>
						{post.subtitle && (
							<p className="text-2xl text-slate-600 font-medium mb-6">
								{post.subtitle}
							</p>
						)}

						{/* Author */}
						<div className="flex items-center gap-3 pt-6 border-t border-slate-200">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
								{post.author
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</div>
							<div>
								<p className="font-semibold text-slate-900">{post.author}</p>
								<p className="text-sm text-slate-500">AI Engineer & Consultant</p>
							</div>
						</div>
					</div>

					{/* Tags */}
					<div className="flex flex-wrap gap-2 mb-12">
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
							>
								#{tag}
							</span>
						))}
					</div>

					{/* Content Placeholder */}
					<div className="prose prose-lg max-w-none">
						<div className="card p-12 bg-gradient-to-br from-blue-50 to-purple-50 text-center">
							<h3 className="text-2xl font-bold mb-4 text-slate-900">
								Content Hosted Externally
							</h3>
							<p className="text-slate-600 mb-6">
								This blog post is available as a{" "}
								{post.content.endsWith(".pdf") ? "PDF document" : "markdown file"}
								.
							</p>
							<p className="text-sm text-slate-500">
								Content path: <code className="text-primary-700">{post.content}</code>
							</p>
							<p className="text-sm text-slate-400 mt-4">
								Future enhancement: Implement markdown/PDF rendering here
							</p>
						</div>
					</div>
				</div>
			</article>
		</Layout>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const paths = blogPostsData.map((post) => ({
		params: { slug: post.slug }
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	try {
		const slug = params?.slug as string;
		const post = blogPostsData.find((p) => p.slug === slug);

		if (!post) {
			return { props: { errors: "Post not found" } };
		}

		return { props: { post } };
	} catch (err: any) {
		return { props: { errors: err.message } };
	}
};

export default BlogPostPage;
