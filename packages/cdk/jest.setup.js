/* eslint-disable no-undef -- jest globals are missing due to guardian.config.jest eslint rules not covering jest.setup.js - see https://github.com/guardian/csnx/blob/main/libs/%40guardian/eslint-config/configs/jest.js */
jest.mock('@guardian/cdk/lib/constants/tracking-tag');
jest.mock('@guardian/private-infrastructure-config');

// Silence the console during the CI build to make the build log easier to read
if (process.env.CI === 'true') {
	global.console = {
		...console,
		log: jest.fn(),
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};
}
