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
	differenceInDays: environmentOrError('DIFFERENCE_IN_DAYS'),
	database: {
		host: environmentOrError('DATABASE_HOST'),
		user: environmentOrError('DATABASE_USER'),
		password: environmentOrError('DATABASE_PASSWORD'),
	},
};
