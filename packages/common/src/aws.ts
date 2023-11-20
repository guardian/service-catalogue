import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@smithy/types';

interface AwsClientConfig {
	region: string;
	credentials: AwsCredentialIdentityProvider;
}

export const awsClientConfig: AwsClientConfig = {
	/*
	Whilst this _should_ be dynamic, in reality we only use this region, so hardcode it.
	 */
	region: 'eu-west-1',

	/*
	This chain will look in various places for AWS credentials.
	Using the profile `deployTools` ensures we can use Janus credentials when running locally.

	See https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/.
	 */
	credentials: fromNodeProviderChain({
		profile: 'deployTools',
	}),
};
