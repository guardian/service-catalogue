module.exports = {
	verbose: true,
	testEnvironment: 'node',
	projects: [
		{
			displayName: 'cdk',
			transform: {
				'^.+\\.tsx?$': 'ts-jest',
			},
			transformIgnorePatterns: [
				'node_modules/(?!@guardian/private-infrastructure-config)',
			],
			setupFilesAfterEnv: [`<rootDir>/packages/cdk/jest.setup.js`],
		},
	],
};
