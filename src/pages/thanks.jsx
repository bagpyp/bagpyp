import Layout from "../components/Layout";
import { useRouter } from "next/router";

const Thanks = () => {
	const router = useRouter();
	console.log(router.query);
	return (
		<Layout title="Thanks!">
			<h1>🙏 thank you!</h1>
		</Layout>
	);
};

export default Thanks;
