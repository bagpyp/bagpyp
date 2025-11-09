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
		{/* Header */}
		<section className="bg-gradient-to-br from-slate-900 to-primary-900 text-white py-20">
			<div className="container-custom">
				<div className="max-w-4xl">
					<h1 className="mb-6">Personal Projects</h1>
					<p className="text-xl text-slate-300 leading-relaxed">
						Exploring technical challenges through creative solutions in music
						theory, mathematics, IoT, and AI systems.
					</p>
				</div>
			</div>
		</section>

		{/* Projects Grid */}
		<section className="section">
			<div className="container-custom">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			</div>
		</section>
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
