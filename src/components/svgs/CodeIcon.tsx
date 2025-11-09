export const CodeIcon = ({ className = "w-full h-full" }) => (
	<svg
		viewBox="0 0 400 300"
		className={className}
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#10b981" />
				<stop offset="100%" stopColor="#3b82f6" />
			</linearGradient>
		</defs>
		{/* Background */}
		<rect width="400" height="300" fill="#1e293b" rx="8" />
		{/* Code window header */}
		<rect width="400" height="40" fill="#334155" />
		<circle cx="20" cy="20" r="6" fill="#ef4444" />
		<circle cx="40" cy="20" r="6" fill="#f59e0b" />
		<circle cx="60" cy="20" r="6" fill="#10b981" />
		{/* Code lines */}
		<rect x="30" y="70" width="180" height="8" fill="#6366f1" opacity="0.7" rx="4" />
		<rect x="50" y="95" width="200" height="8" fill="#8b5cf6" opacity="0.7" rx="4" />
		<rect x="50" y="120" width="140" height="8" fill="#06b6d4" opacity="0.7" rx="4" />
		<rect x="30" y="145" width="160" height="8" fill="#10b981" opacity="0.7" rx="4" />
		<rect x="50" y="170" width="220" height="8" fill="#f59e0b" opacity="0.7" rx="4" />
		<rect x="50" y="195" width="100" height="8" fill="#ec4899" opacity="0.7" rx="4" />
		<rect x="30" y="220" width="190" height="8" fill="#6366f1" opacity="0.7" rx="4" />
		{/* Bracket decoration */}
		<text x="300" y="150" fill="url(#codeGrad)" fontSize="120" fontWeight="bold" opacity="0.4">
			{"{"}
		</text>
	</svg>
);
