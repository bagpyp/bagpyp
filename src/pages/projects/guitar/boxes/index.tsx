import Layout from "../../../../components/Layout";
import GuitarAppRoute from "../../../../projects/guitar/components/GuitarAppRoute";

const BoxesIndexPage = () => (
	<Layout title="Guitar Box Shapes | Bagpyp">
		<GuitarAppRoute section="boxes" triadsView="by-voicing" boxFamily="pentatonic" />
	</Layout>
);

export default BoxesIndexPage;
