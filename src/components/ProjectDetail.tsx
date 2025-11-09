import Image from "next/image";
import { Project } from "../interfaces";
import dynamic from "next/dynamic";

type ProjectDetailProps = {
	project: Project;
};

const ProjectDetail = ({ project }: ProjectDetailProps) => {
	// Check if this is a guitar project that should load interactive component
	const isGuitarProject = project.slug.startsWith("guitar-");

	// Dynamically load guitar components
	const GuitarComponent = isGuitarProject
		? dynamic(
				() => {
					if (project.slug === "guitar-major-triads") {
						return import("../projects/guitar/components/MajorTriads");
					} else if (project.slug === "guitar-scale-practice") {
						return import("../projects/guitar/components/ScalePractice");
					} else if (project.slug === "guitar-modes-3nps") {
						return import("../projects/guitar/components/Modes3NPS");
					}
					return Promise.resolve(() => <div>Guitar component not found</div>);
				},
				{
					ssr: false,
					loading: () => (
						<div className="flex items-center justify-center min-h-[400px]">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
								<p className="text-slate-600">Loading interactive project...</p>
							</div>
						</div>
					)
				}
		  )
		: null;

	// If it's a guitar project, render the interactive component
	if (isGuitarProject && GuitarComponent) {
		return (
			<div className="bg-white min-h-screen">
				<GuitarComponent />
			</div>
		);
	}

	// Otherwise render the standard project detail view
	return (
		<div className="section">
			<div className="container-custom">
				<div className="card p-8">
					<h1 className="text-4xl font-bold mb-4">{project.title}</h1>
					{project.subtitle && (
						<p className="text-xl text-primary-600 font-semibold mb-6">
							{project.subtitle}
						</p>
					)}
					<p className="text-lg text-slate-700 mb-4">{project.description}</p>
					<p className="text-slate-600 mb-6">{project.longDescription}</p>

					{project.features && project.features.length > 0 && (
						<div className="mb-6">
							<h3 className="font-semibold text-slate-900 mb-3">Key Features:</h3>
							<ul className="space-y-2">
								{project.features.map((feature, idx) => (
									<li key={idx} className="flex items-start">
										<svg
											className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-sm text-slate-600">{feature}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					<div className="mb-6">
						<h3 className="font-semibold text-slate-900 mb-3">Technologies:</h3>
						<div className="flex flex-wrap gap-2">
							{project.technologies.map((tech, idx) => (
								<span
									key={idx}
									className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded"
								>
									{tech}
								</span>
							))}
						</div>
					</div>

					{project.images && project.images.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
							{project.images.map((image, index) => (
								<div key={index} className="relative h-64 rounded-lg overflow-hidden">
									<Image
										src={`/images/projects/${image}`}
										alt={`${project.title} ${index + 1}`}
										fill
										className="object-cover"
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProjectDetail;
