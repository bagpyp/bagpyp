import Layout from "../components/Layout";
import CheckoutForm from "../components/CheckoutForm";
import ConsultancyService from "../components/ConsultancyService";

const Index = () => {
	return (
		<Layout>
			<ConsultancyService />
			<CheckoutForm />
		</Layout>
	);
};

export default Index;
