import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../../../components/Layout";
import GuitarAppRoute from "../../../../projects/guitar/components/GuitarAppRoute";
import type { TriadsViewMode } from "../../../../projects/guitar/components/MajorTriads";

const VIEW_SLUGS: Record<string, TriadsViewMode> = {
	bykey: "by-key",
	byvoicing: "by-voicing",
	"by-key": "by-key",
	"by-voicing": "by-voicing",
	all: "all"
};

type Props = { triadsView: TriadsViewMode };

const TriadsViewPage = ({ triadsView }: Props) => (
	<Layout title="Guitar Triads | Bagpyp">
		<GuitarAppRoute section="triads" triadsView={triadsView} boxFamily="pentatonic" />
	</Layout>
);

export default TriadsViewPage;

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: Object.keys(VIEW_SLUGS).map((view) => ({ params: { view } })),
	fallback: false
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
	const view = params?.view as string;
	const triadsView = VIEW_SLUGS[view];
	if (!triadsView) {
		return { notFound: true };
	}
	return { props: { triadsView } };
};
