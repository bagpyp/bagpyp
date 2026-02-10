/** @type {import("next").NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s.gravatar.com"
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com"
			}
		]
	},
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: "/projects/guitar-major-triads",
				destination: "/projects/guitar",
				permanent: true
			}
		];
	}
};

module.exports = nextConfig;
