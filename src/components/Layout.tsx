import { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

type Props = {
	children?: ReactNode;
	title?: string;
	description?: string;
};

const Layout = ({
	children,
	title = "Robert Cunningham | AI Engineering Consultancy",
	description = "Expert AI engineering and software consultancy specializing in production LLM systems, multi-agent architectures, and enterprise software development."
}: Props) => {
	const [darkMode, setDarkMode] = useState(true);

	// Initialize dark mode from localStorage or default to dark
	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");

		if (storedTheme === "light") {
			setDarkMode(false);
			document.documentElement.classList.remove("dark");
		} else {
			// Default to dark mode
			setDarkMode(true);
			document.documentElement.classList.add("dark");
		}
	}, []);

	// Toggle dark mode
	const toggleDarkMode = () => {
		if (darkMode) {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
			setDarkMode(false);
		} else {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
			setDarkMode(true);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Head>
				<title>{title}</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta name="description" content={description} />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
					rel="stylesheet"
				/>
			</Head>

			{/* Navigation */}
			<nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
				<div className="container-custom">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
						>
							<div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center p-2">
								<Image
									src="/img/logo.svg"
									alt="Robert Cunningham"
									width={32}
									height={32}
									className="w-full h-full"
								/>
							</div>
							<span className="font-bold text-xl text-slate-900 dark:text-white">
								Robert Cunningham
							</span>
						</Link>

						{/* Navigation Links */}
						<div className="hidden md:flex items-center space-x-6">
							{/* Social Icons */}
							<a
								href="https://github.com/bagpyp"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
								aria-label="GitHub"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
								</svg>
							</a>

							<a
								href="https://linkedin.com/in/bagpyp"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
								aria-label="LinkedIn"
							>
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							</a>

							{/* Vertical separator */}
							<div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

							{/* Text Links */}
							<Link
								href="/experience"
								className="text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
							>
								Experience
							</Link>
							<Link
								href="/projects"
								className="text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
							>
								Projects
							</Link>
							<Link
								href="/blog"
								className="text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
							>
								Blog
							</Link>
						</div>

						{/* Dark Mode Toggle */}
						<div className="flex items-center">
							<button
								onClick={toggleDarkMode}
								className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
								aria-label="Toggle dark mode"
							>
								{darkMode ? (
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
								) : (
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="flex-grow">{children}</main>

			{/* Footer */}
			<footer className="bg-slate-900 text-white py-12 mt-20">
				<div className="container-custom">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						{/* Brand */}
						<div className="md:col-span-2">
							<div className="w-24 h-24 rounded-full bg-primary-50/10 flex items-center justify-center p-4 mb-6">
								<Image
									src="/img/logo.svg"
									alt="Logo"
									width={64}
									height={64}
									className="w-full h-full"
								/>
							</div>
							<h3 className="font-bold text-xl mb-4 text-white">
								Robert Cunningham
							</h3>
							<p className="text-slate-400 text-sm">
								AI Engineering Consultancy specializing in production LLM
								systems and enterprise software development.
							</p>
						</div>

						{/* Quick Links */}
						<div>
							<h4 className="font-semibold mb-4">Quick Links</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link
										href="/experience"
										className="text-slate-400 hover:text-white transition-colors"
									>
										Experience
									</Link>
								</li>
								<li>
									<Link
										href="/projects"
										className="text-slate-400 hover:text-white transition-colors"
									>
										Projects
									</Link>
								</li>
								<li>
									<Link
										href="/blog"
										className="text-slate-400 hover:text-white transition-colors"
									>
										Blog
									</Link>
								</li>
							</ul>
						</div>

						{/* Contact Info */}
						<div>
							<h4 className="font-semibold mb-4">Connect</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<a
										href="mailto:rtc@bagpyp.net"
										className="text-slate-400 hover:text-white transition-colors"
									>
										rtc@bagpyp.net
									</a>
								</li>
								<li>
									<a
										href="https://linkedin.com/in/bagpyp"
										target="_blank"
										rel="noopener noreferrer"
										className="text-slate-400 hover:text-white transition-colors"
									>
										LinkedIn
									</a>
								</li>
								<li>
									<a
										href="https://github.com/bagpyp"
										target="_blank"
										rel="noopener noreferrer"
										className="text-slate-400 hover:text-white transition-colors"
									>
										GitHub
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
						<p>&copy; {new Date().getFullYear()} Bagpyp, LLC. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Layout;
