import Link from "next/link";
import Image from "next/image";
import { Project } from "../interfaces";

type Props = {
	project: Project;
};

const ProjectCard = ({ project }: Props) => {
	return (
		<Link href={`/projects/${project.slug}`} className="card group cursor-pointer h-full hover:scale-105 transition-transform duration-300 block">
			{/* Project Image */}
			<div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-100 dark:to-slate-200 overflow-hidden">
				{project.images && project.images.length > 0 ? (
					<Image
						src={`/images/projects/${project.images[0]}`}
						alt={project.title}
						fill
						className="object-cover group-hover:scale-110 transition-transform duration-500"
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<svg
							className="w-24 h-24 text-slate-400 dark:text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							/>
						</svg>
					</div>
				)}

				{/* Category badge */}
				<div className="absolute top-4 right-4">
					<span className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full shadow-lg">
						{project.category}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				<h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
					{project.title}
				</h3>

				{project.subtitle && (
					<p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">
						{project.subtitle}
					</p>
				)}

				<p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-3">
					{project.description}
				</p>

				{/* Technologies */}
				<div className="flex flex-wrap gap-2 mb-4">
					{project.technologies.slice(0, 4).map((tech, idx) => (
						<span
							key={idx}
							className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded"
						>
							{tech}
						</span>
					))}
					{project.technologies.length > 4 && (
						<span className="px-2 py-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
							+{project.technologies.length - 4} more
						</span>
					)}
				</div>

				{/* CTA */}
				<div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
					View Project
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
		</Link>
	);
};

export default ProjectCard;
