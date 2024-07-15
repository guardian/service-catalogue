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
