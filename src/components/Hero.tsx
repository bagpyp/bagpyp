import Link from "next/link";

const Hero = () => {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">
			{/* Animated background */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTl2LTFoLTR2MWMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNGg0YzEuMSAwIDItLjkgMi0ycy0uOS0yLTItMmgtNHYtNGg0eiIvPjwvZz48L2c+PC9zdmc+')] animate-[scroll_20s_linear_infinite]" />
			</div>

			<div className="container-custom py-24 md:py-32 relative z-10">
				<div className="max-w-4xl">
					{/* Eyebrow */}
					<div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 animate-fade-in">
						<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
						<span className="text-sm font-medium">
							Directly associated with one of 8 official OpenAI partners worldwide
						</span>
					</div>

					{/* Main headline */}
					<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
						Expert in AI Engineering for
						<span className="block bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
							Production Systems
						</span>
					</h1>

					{/* Subheadline */}
					<p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed animate-slide-up animation-delay-100">
						Creator of{" "}
						<span className="font-semibold text-white">
							Continuous Alignment Testing (CAT)
						</span>
						, bringing statistical rigor and mathematical foundations to
						enterprise AI systems at Mayo Clinic, eBay, Trust & Will, and Arrive
						Health.
					</p>

					{/* Value props */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in animation-delay-200">
						<div className="flex items-start space-x-3">
							<svg
								className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<h3 className="font-semibold mb-1">Multi-Agent Systems</h3>
								<p className="text-sm text-slate-400">
									Production-grade RAG & agentic architectures
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<svg
								className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							<div>
								<h3 className="font-semibold mb-1">Statistical Rigor</h3>
								<p className="text-sm text-slate-400">
									MS Applied Mathematics background
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<svg
								className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
							<div>
								<h3 className="font-semibold mb-1">Enterprise Scale</h3>
								<p className="text-sm text-slate-400">
									Fortune 500 deployment experience
								</p>
							</div>
						</div>
					</div>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-300">
						<Link href="/experience">
							<button className="btn-primary">
								View Experience
							</button>
						</Link>
						<Link href="/blog">
							<button className="btn-secondary bg-transparent border-white text-white hover:bg-white/10">
								Read Technical Blog
							</button>
						</Link>
					</div>
				</div>
			</div>

			{/* Bottom gradient fade */}
			<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
		</section>
	);
};

export default Hero;
