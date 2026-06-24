import Layout from "../../../../components/Layout";
import GuitarAppRoute from "../../../../projects/guitar/components/GuitarAppRoute";

const TriadsIndexPage = () => (
	<Layout title="Guitar Triads | Bagpyp">
		<GuitarAppRoute section="triads" triadsView="by-voicing" boxFamily="pentatonic" />
	</Layout>
);

export default TriadsIndexPage;
