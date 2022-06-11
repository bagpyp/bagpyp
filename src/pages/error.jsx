import Layout from "../components/Layout";
import { useRouter } from "next/router";

const Error = () => {
	const router = useRouter();
	console.log(router.query);
	return (
		<Layout title="Error">
			<h1>something went wrong 🫢</h1>
		</Layout>
	);
};

export default Error;
