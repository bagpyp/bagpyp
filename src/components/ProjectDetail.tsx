import Image from "next/image";
import { Project } from "../interfaces";

type ProjectDetailProps = {
	project: Project;
};

const ProjectDetail = ({ project }: ProjectDetailProps) => (
	<div className="card p-8">
		<h1 className="text-4xl font-bold mb-4">{project.title}</h1>
		{project.subtitle && (
			<p className="text-xl text-primary-600 font-semibold mb-6">
				{project.subtitle}
			</p>
		)}
		<p className="text-lg text-slate-700 mb-4">{project.description}</p>
		<p className="text-slate-600 mb-6">{project.longDescription}</p>

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
);

export default ProjectDetail;
