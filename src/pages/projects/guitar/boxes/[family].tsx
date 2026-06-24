import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../../../components/Layout";
import GuitarAppRoute from "../../../../projects/guitar/components/GuitarAppRoute";
import type { BoxScaleFamily } from "../../../../projects/guitar/lib/box-shapes";

const FAMILY_SLUGS: Record<string, BoxScaleFamily> = {
	pentatonic: "pentatonic",
	major: "major"
};

type Props = { boxFamily: BoxScaleFamily };

const BoxesFamilyPage = ({ boxFamily }: Props) => (
	<Layout title="Guitar Box Shapes | Bagpyp">
		<GuitarAppRoute section="boxes" triadsView="by-voicing" boxFamily={boxFamily} />
	</Layout>
);

export default BoxesFamilyPage;

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: Object.keys(FAMILY_SLUGS).map((family) => ({ params: { family } })),
	fallback: false
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
	const family = params?.family as string;
	const boxFamily = FAMILY_SLUGS[family];
	if (!boxFamily) {
		return { notFound: true };
	}
	return { props: { boxFamily } };
};
