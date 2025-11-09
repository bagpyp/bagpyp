import { GetStaticProps } from "next";
import { Project } from "../../interfaces";
import { projectsData } from "../../data/projects";
import Layout from "../../components/Layout";
import ProjectCard from "../../components/ProjectCard";

type Props = {
	projects: Project[];
};

const ProjectsPage = ({ projects }: Props) => (
	<Layout
		title="Projects | Bagpyp"
		description="Personal projects showcasing technical skills, creativity, and innovation"
	>
		<div className="section">
			<div className="container-custom">
				{/* Header */}
				<div className="text-center mb-16">
					<h1 className="mb-4">Personal Projects</h1>
					<p className="text-xl text-slate-600 max-w-3xl mx-auto">
						Exploring technical challenges through creative solutions
					</p>
				</div>

				{/* Projects Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			</div>
		</div>
	</Layout>
);

export const getStaticProps: GetStaticProps = async () => {
	return {
		props: {
			projects: projectsData
		}
	};
};

export default ProjectsPage;
