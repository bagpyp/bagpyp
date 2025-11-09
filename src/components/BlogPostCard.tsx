import Link from "next/link";
import { BlogPost } from "../interfaces";
import { TensorIcon, AIBrainIcon, CodeIcon, DataIcon } from "./svgs";

type Props = {
	post: BlogPost;
};

const getIconForPost = (slug: string) => {
	if (slug.includes("tensor")) return TensorIcon;
	if (slug.includes("algebra") || slug.includes("agentic")) return CodeIcon;
	if (slug.includes("monitoring") || slug.includes("sidecar")) return DataIcon;
	return AIBrainIcon;
};

const BlogPostCard = ({ post }: Props) => {
	const IconComponent = getIconForPost(post.slug);

	return (
		<Link href={`/blog/${post.slug}`}>
			<div className="card group cursor-pointer h-full hover:scale-105 transition-transform duration-300">
				{/* Image/Icon */}
				<div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
					<div className="w-full h-full p-8">
						<IconComponent className="w-full h-full" />
					</div>

					{/* Reading time badge */}
					<div className="absolute top-4 right-4">
						<span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-full shadow-lg">
							{post.readingTime} min read
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Category & Date */}
					<div className="flex items-center justify-between mb-3">
						<span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
							{post.category}
						</span>
						<span className="text-xs text-slate-500">
							{new Date(post.publishedDate).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric"
							})}
						</span>
					</div>

					<h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
						{post.title}
					</h3>

					{post.subtitle && (
						<p className="text-sm text-slate-600 font-medium mb-3">
							{post.subtitle}
						</p>
					)}

					<p className="text-slate-600 mb-4 leading-relaxed line-clamp-3">
						{post.excerpt}
					</p>

					{/* Tags */}
					<div className="flex flex-wrap gap-2 mb-4">
						{post.tags.slice(0, 3).map((tag, idx) => (
							<span
								key={idx}
								className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
							>
								#{tag}
							</span>
						))}
					</div>

					{/* CTA */}
					<div className="flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
						Read Article
						<svg
							className="w-4 h-4 ml-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default BlogPostCard;
