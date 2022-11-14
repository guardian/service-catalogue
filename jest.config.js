const generateProject = (name) => {
	return {
		displayName: name,
		transform: {
			'^.+\\.tsx?$': 'ts-jest',
		},
		testMatch: [`<rootDir>/packages/${name}/**/*.test.ts`],
		setupFilesAfterEnv: [`./packages/${name}/jest.setup.js`],
		moduleNameMapper: {
			'^common$': '<rootDir>/packages/common/src',
			'^common/(.*)$': '<rootDir>/packages/common/src/$1',
		},
	};
};

module.exports = {
	verbose: true,
	testEnvironment: 'node',
	projects: [
		'cdk',
		'github-lens-api',
		'repo-fetcher',
		'common',
		'services-api',
	].map(generateProject),
};
