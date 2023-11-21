import { main } from './index';

if (require.main === module) {
	void (async () => await main())();
}
