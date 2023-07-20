// eslint-disable-next-line @typescript-eslint/no-var-requires -- can't use import here
const dotenv = require('dotenv');

// Load environment variables from .env file at the root of the repository
dotenv.config({ path: `${__dirname}/.env` });

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
