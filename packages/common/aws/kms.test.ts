import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { mockClient } from 'aws-sdk-client-mock';
import { decrypt } from './kms';

const kmsMock = mockClient(KMSClient);

beforeEach(() => {
	kmsMock.reset();
});

describe('test', function () {
	it('should fail', async function () {
		kmsMock.on(DecryptCommand).resolves({
			Plaintext: Buffer.from('boo', 'base64'),
		});

		const bat = await decrypt('foo', 'bar');

		expect(bat).toBe(false);
	});
});
