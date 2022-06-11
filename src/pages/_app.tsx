import { AppProps } from "next/app";
import "../styles/global.css";

export default function _app({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
