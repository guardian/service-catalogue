import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { mockClient } from 'aws-sdk-client-mock';
import { decrypt } from './kms';

const kmsMock = mockClient(KMSClient);

beforeEach(() => {
	kmsMock.reset();
});

describe('decrypt', function () {
	it('should return the string representation of data decrypted by KMS', async function () {
		const expectedOutput = 'foo';
		const enc = new TextEncoder();
		const expectedOutputArrayBuffer = enc.encode(expectedOutput);

		kmsMock.on(DecryptCommand).resolves({
			Plaintext: expectedOutputArrayBuffer,
		});

		const actualOutput = await decrypt('keyId', expectedOutput);

		expect(actualOutput).toBe(expectedOutput);
	});

	it('should return undefined if the decrypt operation fails', async function () {
		const expectedOutput = 'plaintext';

		kmsMock.on(DecryptCommand).rejects();

		const actualOutput = await decrypt('keyId', expectedOutput);

		expect(actualOutput).toBe(undefined);
	});
});
