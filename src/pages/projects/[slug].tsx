import { GetStaticProps, GetStaticPaths } from "next";
import { Project } from "../../interfaces";
import { projectsData } from "../../data/projects";
import Layout from "../../components/Layout";
import ProjectDetail from "../../components/ProjectDetail";

type Props = {
	project?: Project;
	errors?: string;
};

const ProjectPage = ({ project, errors }: Props) => {
	if (errors) {
		return (
			<Layout title="Project Not Found">
				<div className="container-custom section">
					<p className="text-red-600">Error: {errors}</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title={project ? `${project.title} | Bagpyp` : "Project"}
			description={project?.description}
		>
			<div className="container-custom section">
				{project && <ProjectDetail project={project} />}
			</div>
		</Layout>
	);
};

export default ProjectPage;

export const getStaticPaths: GetStaticPaths = async () => {
	const paths = projectsData.map((project) => ({
		params: { slug: project.slug }
	}));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	try {
		const slug = params?.slug as string;
		const project = projectsData.find((p) => p.slug === slug);

		if (!project) {
			return { props: { errors: "Project not found" } };
		}

		return { props: { project } };
	} catch (err: any) {
		return { props: { errors: err.message } };
	}
};
