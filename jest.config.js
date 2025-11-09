const nextJest = require("next/jest");

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: "./"
});

// Add any custom config to be passed to Jest
const customJestConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	testEnvironment: "jest-environment-jsdom",
	moduleNameMapper: {
		"^@/components/(.*)$": "<rootDir>/src/projects/guitar/components/$1",
		"^@/lib/guitar/(.*)$": "<rootDir>/src/projects/guitar/lib/$1",
		"^@/lib/guitar$": "<rootDir>/src/projects/guitar/lib",
		"^@/pages/(.*)$": "<rootDir>/src/pages/$1",
		"^@/utils/(.*)$": "<rootDir>/src/utils/$1",
		"^@/interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
		"^@/styles/(.*)$": "<rootDir>/src/styles/$1"
	},
	testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
	collectCoverageFrom: [
		"src/**/*.{js,jsx,ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/*.stories.{js,jsx,ts,tsx}",
		"!src/**/__tests__/**"
	],
	transformIgnorePatterns: [
		"node_modules/(?!(@auth0)/)"
	]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
