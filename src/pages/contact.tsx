import Link from "next/link";
import Layout from "../components/Layout";
import { useUser } from "@auth0/nextjs-auth0/client";

const Contact = () => {
	const { user } = useUser();

	return (
		<Layout title="Contact">
			{user ? (
				<>
					<h1>Get in touch</h1>
					<ul>
						<li>
							<Link href="mailto:rtc@bagpyp.net">Email Us</Link>
						</li>
						<li>
							<Link href="tel:+15038034458">Call Us</Link>
						</li>
					</ul>
				</>
			) : (
				<>
					<h1>Get in touch</h1>
					<p>
						If you would like to reach out, please{" "}
						<Link href="/api/auth/login">Login or Create an Account</Link>
					</p>
				</>
			)}
		</Layout>
	);
};

export default Contact;
