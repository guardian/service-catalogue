import type { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import {
	fromIni,
	fromTemporaryCredentials,
} from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@smithy/types';

interface AwsClientConfig {
	region: string;
	credentials?: AwsCredentialIdentityProvider;
}

export function awsClientConfig(
	stage: string,
	roleArn?: string,
	region = 'eu-west-1',
): AwsClientConfig {
	return {
		region,

		/*
		If DEV (i.e. running locally), get credentials from the ini file.
		Else, use the standard SDK behaviour of locating credentials through a chain of locations.

		See https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/.
	 */
		...(stage === 'DEV' && {
			credentials: fromIni({ profile: 'deployTools' }),
		}),

		/*
		If not DEV, and a roleArn is provided, assume that role.
		Cannot do this in DEV as Janus credentials deny role assumptions.
		 */
		...(stage !== 'DEV' &&
			roleArn && {
				credentials: fromTemporaryCredentials({
					params: { RoleArn: roleArn },
				}),
			}),
	};
}

/**
 * All regions we support.
 *
 * @see https://github.com/guardian/infosec-platform/blob/main/policies/DenyEC2ECSLambdaAccessToNonApprovedRegions.json
 */
export const AWS_REGIONS = [
	'eu-west-1',
	'eu-west-2',
	'us-east-1',
	'us-east-2',
	'us-west-1',
	'ap-southeast-2',
	'ca-central-1',
];

export async function getSecretManagerValue(
	client: SecretsManagerClient,
	path: string,
): Promise<string> {
	const command = new GetSecretValueCommand({
		SecretId: path,
	});
	const response = await client.send(command);

	if (!response.SecretString) {
		throw new Error(`No secret string found at ${path}`);
	}

	return response.SecretString;
}

export async function getSecretManagerValueAsJson<T>(
	client: SecretsManagerClient,
	path: string,
): Promise<T> {
	const secretString = await getSecretManagerValue(client, path);
	return JSON.parse(secretString) as T;
}
