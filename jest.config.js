const generateProject = (name) => {
	return {
		displayName: name,
		transform: {
			'^.+\\.tsx?$': 'ts-jest',
		},
		transformIgnorePatterns: [
			'node_modules/(?!@guardian/private-infrastructure-config)',
		],
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
	].map(generateProject),
};
