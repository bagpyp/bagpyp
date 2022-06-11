import { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/global.css";

export default function _app({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
