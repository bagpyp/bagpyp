import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Layout from "../../components/Layout";
import { BlogPost } from "../../interfaces";
import { blogPostsData } from "../../data/blog-posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { promises as fs } from "fs";
import path from "path";

type Props = {
	post?: BlogPost;
	markdownContent?: string;
	errors?: string;
};

const BlogPostPage = ({ post, markdownContent, errors }: Props) => {
	if (errors || !post) {
		return (
			<Layout title="Blog Post Not Found">
				<div className="container-custom section">
					<p className="text-red-600">Error: {errors || "Post not found"}</p>
				</div>
			</Layout>
		);
	}

	const isPDF = post.content.endsWith(".pdf");

	return (
		<>
			<Head>
				{/* KaTeX CSS for LaTeX rendering */}
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
					integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
					crossOrigin="anonymous"
				/>
			</Head>
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

						{/* Content */}
						{isPDF ? (
							<div className="card p-12 bg-gradient-to-br from-blue-50 to-purple-50 text-center">
								<h3 className="text-2xl font-bold mb-4 text-slate-900">
									Download PDF White Paper
								</h3>
								<p className="text-slate-600 mb-6">
									This article is available as a comprehensive PDF white paper.
								</p>
								<a
									href={post.content}
									target="_blank"
									rel="noopener noreferrer"
									className="btn-primary inline-block"
								>
									Download PDF
								</a>
							</div>
						) : markdownContent ? (
							<div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary-600 prose-strong:text-slate-900 prose-code:text-primary-700 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-img:rounded-lg prose-img:shadow-lg">
								<ReactMarkdown
									remarkPlugins={[remarkGfm, remarkMath]}
									rehypePlugins={[rehypeRaw, rehypeKatex]}
								>
									{markdownContent}
								</ReactMarkdown>
							</div>
						) : (
							<div className="card p-12 text-center">
								<p className="text-slate-600">Content not available</p>
							</div>
						)}
					</div>
				</article>
			</Layout>
		</>
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

		// If it's a markdown file, read it
		let markdownContent = null;
		if (post.content.endsWith(".md")) {
			const filePath = path.join(process.cwd(), "public", post.content);
			try {
				markdownContent = await fs.readFile(filePath, "utf8");
			} catch (err) {
				console.error(`Failed to read markdown file: ${filePath}`, err);
			}
		}

		return { props: { post, markdownContent } };
	} catch (err: any) {
		return { props: { errors: err.message } };
	}
};

export default BlogPostPage;
