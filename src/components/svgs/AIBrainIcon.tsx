export const AIBrainIcon = ({ className = "w-full h-full" }) => (
	<svg
		viewBox="0 0 400 300"
		className={className}
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#0ea5e9" />
				<stop offset="100%" stopColor="#8b5cf6" />
			</linearGradient>
		</defs>
		{/* Background */}
		<rect width="400" height="300" fill="#f8fafc" />
		{/* Neural network connections */}
		<g opacity="0.3" stroke="#94a3b8" strokeWidth="1.5" fill="none">
			<path d="M 100 150 Q 150 100 200 150" />
			<path d="M 100 150 Q 150 200 200 150" />
			<path d="M 200 150 Q 250 100 300 150" />
			<path d="M 200 150 Q 250 200 300 150" />
			<line x1="100" y1="150" x2="200" y2="150" />
			<line x1="200" y1="150" x2="300" y2="150" />
		</g>
		{/* Brain/network nodes */}
		<circle cx="100" cy="150" r="20" fill="url(#brainGrad)" opacity="0.8" />
		<circle cx="200" cy="150" r="25" fill="url(#brainGrad)" />
		<circle cx="300" cy="150" r="20" fill="url(#brainGrad)" opacity="0.8" />
		<circle cx="150" cy="100" r="12" fill="#0ea5e9" opacity="0.6" />
		<circle cx="150" cy="200" r="12" fill="#0ea5e9" opacity="0.6" />
		<circle cx="250" cy="100" r="12" fill="#8b5cf6" opacity="0.6" />
		<circle cx="250" cy="200" r="12" fill="#8b5cf6" opacity="0.6" />
		{/* AI text */}
		<text
			x="200"
			y="160"
			textAnchor="middle"
			fill="white"
			fontSize="24"
			fontWeight="bold"
		>
			AI
		</text>
	</svg>
);
