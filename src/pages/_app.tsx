import { AppProps } from "next/app";
import "../styles/global.css";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

export default function _app({ Component, pageProps }: AppProps) {
	return (
		<Auth0Provider>
			<Component {...pageProps} />
		</Auth0Provider>
	);
}
