import { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/global.css";
import { UserProvider } from "@auth0/nextjs-auth0";

export default function _app({ Component, pageProps }: AppProps) {
	return (
		<UserProvider>
			<Component {...pageProps} />
		</UserProvider>
	);
}
