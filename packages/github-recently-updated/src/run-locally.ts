/*
This is a little helper to run a lambda locally.
It is purposefully light keep it simple.
 */

import { main } from './handler';

if (require.main === module) {
	void (async () => await main())();
}
