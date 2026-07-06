import Layout from "../../../../components/Layout";
import GuitarAppRoute from "../../../../projects/guitar/components/GuitarAppRoute";

const NotesIndexPage = () => (
	<Layout title="Guitar Notes | Bagpyp">
		<GuitarAppRoute section="notes" triadsView="by-voicing" boxFamily="pentatonic" />
	</Layout>
);

export default NotesIndexPage;
