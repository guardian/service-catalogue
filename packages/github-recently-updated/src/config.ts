import { getLogLevel } from './logger';

const environmentOrError = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Environment variable ${name} is not set`);
	}
	return value;
};

const stage = environmentOrError('STAGE');
const isDev = stage === 'DEV';

export const config = {
	app: environmentOrError('APP'),
	stage,
	isDev,
	logLevel: getLogLevel(process.env.LOG_LEVEL),
	differenceInDays: environmentOrError('DIFFERENCE_IN_DAYS'),
	database: {
		host: environmentOrError('DATABASE_HOST'),
		user: environmentOrError('DATABASE_USER'),
		password: process.env.DATABASE_PASSWORD,

		// Use IAM authentication by default, but allow it to be disabled for local development.
		useIamAuth: (process.env.DATABASE_IAM_AUTH ?? 'true') === 'true',
	},
	aws: {
		profile: 'deployTools',
		region: process.env.AWS_REGION ?? 'eu-west-1',
		secretArn: environmentOrError('SECRET_ARN'),
	},
};
