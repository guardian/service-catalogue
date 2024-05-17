// eslint-disable-next-line @typescript-eslint/no-var-requires -- can't use import here
const dotenv = require('dotenv');

// Load environment variables from .env file at the root of the repository
dotenv.config({ path: `${__dirname}/.env` });

const transform = {
	'^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'esnext' } }],
};

/*
When running in CI (GitHub Actions), use the GitHub Actions reporter to annotate the PR with any test failures.
Locally, use the default reporter.

See:
  - https://jestjs.io/docs/configuration#github-actions-reporter
  - https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
 */
const reporters = process.env.GITHUB_ACTIONS
	? [['github-actions', { silent: false }], 'summary']
	: ['default'];

module.exports = {
	verbose: true,
	testEnvironment: 'node',
	reporters,
	projects: [
		{
			displayName: 'cdk',
			transform,
			transformIgnorePatterns: [
				'node_modules/(?!@guardian/private-infrastructure-config)',
			],
			setupFilesAfterEnv: [`<rootDir>/packages/cdk/jest.setup.js`],
			testMatch: ['<rootDir>/packages/cdk/**/*.test.ts'],
		},
		{
			displayName: 'common',
			transform,
			testMatch: ['<rootDir>/packages/common/**/*.test.ts'],
		},
		{
			displayName: 'dependency-graph-integrator',
			transform,
			testMatch: [
				'<rootDir>/packages/dependency-graph-integrator/**/*.test.ts',
			],
		},
		{
			displayName: 'repocop',
			transform,
			transformIgnorePatterns: [
				'node_modules/(?!@guardian/private-infrastructure-config)',
			],
			testMatch: ['<rootDir>/packages/repocop/**/*.test.ts'],
		},
		{
			displayName: 'interactive-monitor',
			transform,
			testMatch: ['<rootDir>/packages/interactive-monitor/**/*.test.ts'],
		},
		{
			displayName: 'snyk-integrator',
			transform,
			testMatch: ['<rootDir>/packages/snyk-integrator/**/*.test.ts'],
		},
	],
};
