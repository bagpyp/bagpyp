import Layout from "../components/Layout";
import CheckoutForm from "../components/CheckoutForm";
import { useUser } from "@auth0/nextjs-auth0";
import ConsultancyService from "../components/ConsultancyService";

const Index = () => {
	const { user } = useUser();
	return (
		<Layout>
			<ConsultancyService />
			<CheckoutForm />
		</Layout>
	);
};

export default Index;
