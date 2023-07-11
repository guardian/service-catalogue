import {
	SecretsManagerClient,
	UpdateSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { Signer } from '@aws-sdk/rds-signer';
import { Client } from 'ts-postgres';
import { config } from './config';
import { configureLogging } from './logger';

const getPassword = async () => {
	const {
		isDev,
		database: { password, useIamAuth, host, user },
		aws: { profile, region },
	} = config;

	if (!useIamAuth) {
		console.log('Using standard authentication');
		return Promise.resolve(password);
	}

	console.log('Using IAM authentication');
	const signer = new Signer({
		hostname: host,
		port: 5432,
		username: user,
		region,

		/*
		Only supply credentials in development, as they are implicitly provided within AWS Lambda.
		See https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-lambda.html
		 */
		...(isDev && { credentials: fromNodeProviderChain({ profile }) }),
	});

	return await signer.getAuthToken();
};

export const main = async () => {
	const {
		isDev,
		logLevel,
		database: { host, user },
		differenceInDays,
		aws: { region, secretArn, profile },
	} = config;

	// Configure the logger first, so any calls to `console.log`, `console.warn` etc. are filtered as necessary.
	configureLogging(logLevel);

	const password = await getPassword();
	const dbClient = new Client({
		host,
		user,
		password,
	});

	try {
		await dbClient.connect();
		console.log(`Connected to database`);

		const result = await dbClient.query(
			`SELECT full_name FROM github_repositories WHERE GREATEST(pushed_at, updated_at) > NOW() - INTERVAL '${differenceInDays} days'`,
		);

		const repositories = [];
		for await (const row of result) {
			repositories.push(row.get('full_name'));
		}

		console.log(
			`Repositories updated in the last ${differenceInDays} days: ${repositories.length}`,
		);
		console.debug(repositories.join(','));

		const ssmClient = new SecretsManagerClient({
			region,

			/*
			Only supply credentials in development, as they are implicitly provided within AWS Lambda.
			See https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-lambda.html
		 */
			...(isDev && { credentials: fromNodeProviderChain({ profile }) }),
		});

		const command = new UpdateSecretCommand({
			SecretId: secretArn,
			SecretString: JSON.stringify(repositories),
		});

		await ssmClient.send(command);
		console.log(`Secret updated!`);
	} finally {
		await dbClient.end();
	}
};
