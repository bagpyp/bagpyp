import { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";

type Props = {
	children?: ReactNode;
	title?: string;
	description?: string;
};

const Layout = ({
	children,
	title = "Bagpyp | AI Engineering Consultancy",
	description = "Expert AI engineering and software consultancy specializing in production LLM systems, multi-agent architectures, and enterprise software development."
}: Props) => {
	const { user } = useUser();

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
			<nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
				<div className="container-custom">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center space-x-2 font-bold text-2xl text-slate-900 hover:text-primary-600 transition-colors"
						>
							<span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
								Bagpyp
							</span>
						</Link>

						{/* Navigation Links */}
						<div className="hidden md:flex items-center space-x-8">
							<Link
								href="/experience"
								className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
							>
								Experience
							</Link>
							<Link
								href="/projects"
								className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
							>
								Projects
							</Link>
							<Link
								href="/blog"
								className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
							>
								Blog
							</Link>
							{user && (
								<Link
									href="/payment"
									className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
								>
									Payment
								</Link>
							)}
						</div>

						{/* User Avatar / Login */}
						<div className="flex items-center">
							{user ? (
								<Link href="/api/auth/logout">
									<div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
										<Image
											src={user.picture || "/img/defaultUser.png"}
											alt={user.name || "User"}
											width={40}
											height={40}
											className="rounded-full border-2 border-primary-500"
										/>
									</div>
								</Link>
							) : (
								<Link href="/api/auth/login">
									<button className="btn-primary text-sm px-4 py-2">
										Sign In
									</button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="flex-grow">{children}</main>

			{/* Footer */}
			<footer className="bg-slate-900 text-white py-12 mt-20">
				<div className="container-custom">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Brand */}
						<div>
							<h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
								Bagpyp
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
