import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';

const region = 'eu-west-1';
const kmsClient = new KMSClient({
	region,
});

export const decrypt = async (
	cipherText: string,
	keyId: string,
): Promise<string | undefined> => {
	// TODO: Surround this in try/catch
	const decryptCommand = new DecryptCommand({
		CiphertextBlob: Buffer.from(cipherText, 'base64'),
		KeyId: keyId,
	});

	const { Plaintext } = await kmsClient.send(decryptCommand);

	if (Plaintext) {
		const plaintextString = Buffer.from(Plaintext).toString();
		return plaintextString;
	}
};
