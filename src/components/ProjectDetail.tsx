import * as React from "react";
import Image from "next/image";
import { Project } from "../interfaces";

type ProjectDetailProps = {
	project: Project;
};

const ProjectDetail = ({ project: project }: ProjectDetailProps) => (
	<div
		style={{
			border: "1px solid #ddd",
			padding: "20px",
			borderRadius: "8px",
			marginBottom: "20px"
		}}
	>
		<h1>{project.title}</h1>
		<p>
			<strong>{project.description}</strong>
		</p>
		<p>{project.long_description}</p>
		<p>
			<strong>Technologies Used:</strong> {project.tech_used.join(", ")}
		</p>
		<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
			{Array.isArray(project.images) ? (
				project.images.map((image, index) => (
					<Image
						key={index}
						src={`/img/projects/${image}`}
						alt={`${project.title} ${index + 1}`}
						width={300}
						height={200}
						style={{ borderRadius: "4px" }}
					/>
				))
			) : (
				<Image
					src={`/img/projects/${project.images}`}
					alt={project.title}
					width={300}
					height={200}
					style={{ borderRadius: "4px" }}
				/>
			)}
		</div>
	</div>
);

export default ProjectDetail;
