import { AppProps } from "next/app";
import "../styles/global.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function _app({ Component, pageProps }: AppProps) {
	return (
		<UserProvider>
			<Component {...pageProps} />
			{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
			)}
		</UserProvider>
	);
}
