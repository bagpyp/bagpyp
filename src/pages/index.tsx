import Layout from "../components/Layout";
import CheckoutForm from "../components/CheckoutForm";
import { useUser } from "@auth0/nextjs-auth0";

const Index = () => {
	const { user } = useUser();
	return (
		<Layout>
			<h1>👨‍💻 bagpyp</h1>
			{user && <CheckoutForm />}
		</Layout>
	);
};

export default Index;
