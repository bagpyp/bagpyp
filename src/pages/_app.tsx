import { AppProps } from "next/app";
import "../styles/global.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export default function _app({ Component, pageProps }: AppProps) {
	return (
		<UserProvider>
			<Component {...pageProps} />
		</UserProvider>
	);
}
