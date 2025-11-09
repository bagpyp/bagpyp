import { GetStaticProps } from "next";
import Link from "next/link";

import { Project } from "../../interfaces";
import { sampleProjectData } from "../../utils/sample-projects";
import Layout from "../../components/Layout";
import Projects from "../../components/Projects";

type Props = {
	items: Project[];
};

const WithStaticProps = ({ items }: Props) => (
	<Layout title="Projects">
		<h1>Projects</h1>
		<Projects projects={items} />
		<p>
			<Link href="/">Home</Link>
		</p>
	</Layout>
);

export const getStaticProps: GetStaticProps = async () => {
	// Example for including static props in a Next.js function component page.
	// Don't forget to include the respective types for any props passed into
	// the component.
	const items: Project[] = sampleProjectData;
	return { props: { items } };
};

export default WithStaticProps;
