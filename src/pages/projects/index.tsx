import { GetStaticProps } from "next";
import Link from "next/link";

import { Project } from "../../interfaces";
import { sampleProjectData } from "../../utils/sample-projects";
import Layout from "../../components/Layout";
import List from "../../components/List";

type Props = {
	items: Project[];
};

const WithStaticProps = ({ items }: Props) => (
	<Layout title="Projects">
		<h1>projects 🗽</h1>
		<List items={items} />
		<p>
			<Link href="/">
				<a>home 🏡</a>
			</Link>
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
