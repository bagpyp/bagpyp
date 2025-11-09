export const TensorIcon = ({ className = "w-full h-full" }) => (
	<svg
		viewBox="0 0 400 300"
		className={className}
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="tensorGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#8b5cf6" />
				<stop offset="100%" stopColor="#ec4899" />
			</linearGradient>
			<linearGradient id="tensorGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#06b6d4" />
				<stop offset="100%" stopColor="#3b82f6" />
			</linearGradient>
		</defs>
		{/* Background */}
		<rect width="400" height="300" fill="#f8fafc" />
		{/* 3D Cube representation of tensor */}
		{/* Front face */}
		<path
			d="M 120 120 L 220 120 L 220 220 L 120 220 Z"
			fill="url(#tensorGrad1)"
			opacity="0.9"
			stroke="#6366f1"
			strokeWidth="2"
		/>
		{/* Top face */}
		<path
			d="M 120 120 L 180 80 L 280 80 L 220 120 Z"
			fill="url(#tensorGrad2)"
			opacity="0.7"
			stroke="#3b82f6"
			strokeWidth="2"
		/>
		{/* Side face */}
		<path
			d="M 220 120 L 280 80 L 280 180 L 220 220 Z"
			fill="url(#tensorGrad1)"
			opacity="0.5"
			stroke="#8b5cf6"
			strokeWidth="2"
		/>
		{/* Grid lines on front face */}
		<line x1="120" y1="170" x2="220" y2="170" stroke="white" strokeWidth="1" opacity="0.4" />
		<line x1="170" y1="120" x2="170" y2="220" stroke="white" strokeWidth="1" opacity="0.4" />
		{/* Mathematical notation */}
		<text x="200" y="270" textAnchor="middle" fill="#475569" fontSize="20" fontStyle="italic">
			R[i,j,k]
		</text>
	</svg>
);
