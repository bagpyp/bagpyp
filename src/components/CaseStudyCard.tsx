import { Client } from "../interfaces";

type Props = {
	caseStudy: Client;
};

const CaseStudyCard = ({ caseStudy }: Props) => {
	return (
		<div className="card group cursor-default h-full">
			{/* Header with gradient */}
			<div className="relative h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center overflow-hidden">
				{/* Animated background pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent group-hover:translate-x-full transition-transform duration-1000" />
				</div>

				{/* Company name */}
				<div className="relative z-10 text-white text-center p-6">
					<h3 className="text-3xl font-bold mb-2">{caseStudy.name}</h3>
					<p className="text-primary-100 text-sm">{caseStudy.period}</p>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				<div className="mb-4">
					<span className="text-primary-600 font-semibold text-sm">
						{caseStudy.role}
					</span>
				</div>

				<p className="text-slate-600 mb-6 leading-relaxed">
					{caseStudy.description}
				</p>

				{/* AI Features Badge */}
				{caseStudy.aiFeatures && caseStudy.aiFeatures.length > 0 && (
					<div className="mb-6">
						<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
							AI Capabilities
						</h4>
						<div className="flex flex-wrap gap-2">
							{caseStudy.aiFeatures.map((feature, idx) => (
								<span
									key={idx}
									className="px-3 py-1 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 text-xs font-medium rounded-full border border-primary-200"
								>
									{feature}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Key Highlights */}
				<div>
					<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
						Key Highlights
					</h4>
					<ul className="space-y-2">
						{caseStudy.highlights.slice(0, 3).map((highlight, idx) => (
							<li key={idx} className="flex items-start">
								<svg
									className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-sm text-slate-600">{highlight}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Technologies */}
				<div className="mt-6 pt-6 border-t border-slate-200">
					<div className="flex flex-wrap gap-2">
						{caseStudy.technologies.slice(0, 5).map((tech, idx) => (
							<span
								key={idx}
								className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded"
							>
								{tech}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CaseStudyCard;
