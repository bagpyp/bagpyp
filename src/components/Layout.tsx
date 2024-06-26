import React, { ReactNode } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Layout.module.css";
import LoginLogout from "./LoginLogout";
import Link from "next/link";

type Props = {
	children?: ReactNode;
	title?: string;
};

const Layout = ({ children, title = "Bagpyp" }: Props) => {
	return (
		<div className={styles.container}>
			<Head>
				<title>{title}</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<header className={styles.header}>
				<Link href="/">
					<Image src={"/img/logo.svg"} alt="bagpyp" width={100} height={100} />
				</Link>
				<Link href="/contact">Contact</Link>
				<LoginLogout />
			</header>
			<main className={styles.main}>{children}</main>
			<footer className={styles.footer}>
				<hr />
				<small>&copy; {new Date().getFullYear()}</small>
			</footer>
		</div>
	);
};

export default Layout;
