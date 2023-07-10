import { getLogLevel } from './logger';

const environmentOrError = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Environment variable ${name} is not set`);
	}
	return value;
};

export const config = {
	app: environmentOrError('APP'),
	stage: environmentOrError('STAGE'),
	logLevel: getLogLevel(process.env.LOG_LEVEL),
};
