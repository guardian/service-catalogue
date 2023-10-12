import { main } from './index';

if (require.main === module) {
	process.env.AWS_PROFILE = 'deployTools';
	process.env.AWS_REGION = 'eu-west-1';

	void (async () => await main())();
}
