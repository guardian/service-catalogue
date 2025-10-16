const dotenv = require('dotenv');

// Load environment variables from .env file at the root of the repository
dotenv.config({ path: `${__dirname}/.env` });

const transform = {
	'^.+\\.tsx?$': [
		'ts-jest',
		{
			jsc: {
				parser: {
					syntax: 'typescript',
					tsx: true,
					decorators: false,
					dynamicImport: true,
				},
			},
		},
	],
};

const setupFilesAfterEnv = [`<rootDir>/jest.setup.js`];

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
			transformIgnorePatterns: ['node_modules/(?!@guardian/aws-account-setup)'],
			setupFilesAfterEnv: [`<rootDir>/jest.setup.js`],
			testMatch: ['<rootDir>/**/*.test.ts'],
			moduleNameMapper: {
				'^cloudquery-tables$': '<rootDir>/../cloudquery-tables/src',
				'^cloudquery-tables/(.*)$': '<rootDir>/../cloudquery-tables/src/$1',
			},
		},
		{
			displayName: 'cloudbuster',
			transform,
			setupFilesAfterEnv,
			testMatch: ['<rootDir>/packages/cloudbuster/**/*.test.ts'],
		},
		{
			displayName: 'common',
			transform,
			setupFilesAfterEnv,
			testMatch: ['<rootDir>/packages/common/**/*.test.ts'],
		},
		{
			displayName: 'dependency-graph-integrator',
			transform,
			setupFilesAfterEnv,
			testMatch: [
				'<rootDir>/packages/dependency-graph-integrator/**/*.test.ts',
			],
		},
		{
			displayName: 'repocop',
			transform,
			setupFilesAfterEnv,
			transformIgnorePatterns: ['node_modules/(?!@guardian/aws-account-setup)'],
			testMatch: ['<rootDir>/packages/repocop/**/*.test.ts'],
		},
		{
			displayName: 'interactive-monitor',
			transform,
			setupFilesAfterEnv,
			testMatch: ['<rootDir>/packages/interactive-monitor/**/*.test.ts'],
		},
		{
			displayName: 'obligatron',
			transform,
			setupFilesAfterEnv,
			testMatch: ['<rootDir>/packages/obligatron/**/*.test.ts'],
		},
	],
};
