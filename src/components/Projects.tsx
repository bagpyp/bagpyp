import * as React from "react";
import ProjectDetail from "./ProjectDetail";
import { Project } from "../interfaces";

type Props = {
	projects: Project[];
};

const Projects = ({ projects }: Props) => (
	<ul>
		{projects.map((project) => (
			<li key={project.id}>
				<ProjectDetail project={project} />
			</li>
		))}
	</ul>
);

export default Projects;
