import { AppProps } from "next/app";
import "../styles/global.css";
import "../projects/tonnetz/App.css";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function _app({ Component, pageProps }: AppProps) {
	return (
		<Auth0Provider>
			<Component {...pageProps} />
			{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
			)}
		</Auth0Provider>
	);
}
