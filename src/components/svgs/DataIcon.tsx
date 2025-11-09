export const DataIcon = ({ className = "w-full h-full" }) => (
	<svg
		viewBox="0 0 400 300"
		className={className}
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="dataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#06b6d4" />
				<stop offset="100%" stopColor="#3b82f6" />
			</linearGradient>
		</defs>
		{/* Background */}
		<rect width="400" height="300" fill="#f1f5f9" />
		{/* Bar chart */}
		<rect x="50" y="180" width="40" height="80" fill="url(#dataGrad)" opacity="0.8" rx="4" />
		<rect x="110" y="120" width="40" height="140" fill="url(#dataGrad)" opacity="0.9" rx="4" />
		<rect x="170" y="100" width="40" height="160" fill="url(#dataGrad)" rx="4" />
		<rect x="230" y="140" width="40" height="120" fill="url(#dataGrad)" opacity="0.9" rx="4" />
		<rect x="290" y="160" width="40" height="100" fill="url(#dataGrad)" opacity="0.8" rx="4" />
		{/* Grid lines */}
		<line x1="40" y1="260" x2="340" y2="260" stroke="#cbd5e1" strokeWidth="2" />
		<line x1="40" y1="210" x2="340" y2="210" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
		<line x1="40" y1="160" x2="340" y2="160" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
		<line x1="40" y1="110" x2="340" y2="110" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
		{/* Trend line */}
		<path
			d="M 70 200 Q 150 120 230 150 T 310 180"
			stroke="#10b981"
			strokeWidth="3"
			fill="none"
			opacity="0.7"
		/>
	</svg>
);
