import type { SavingsplansClientConfig } from '@aws-sdk/client-savingsplans';
import { SavingsplansClient } from '@aws-sdk/client-savingsplans';
// ES Modules import
const config: SavingsplansClientConfig = {
	region: 'us-east-1',
};
const client: SavingsplansClient = new SavingsplansClient(config);
