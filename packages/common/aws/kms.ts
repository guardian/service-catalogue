import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';

const region = 'eu-west-1';
const kmsClient = new KMSClient({
	region,
});

export const decrypt = async (
	cipherText: string,
	keyId: string,
): Promise<string | undefined> => {
	const decryptCommand = new DecryptCommand({
		CiphertextBlob: Buffer.from(cipherText, 'base64'),
		KeyId: keyId,
	});

	try {
		const { Plaintext } = await kmsClient.send(decryptCommand);
		console.log('[INFO] Decrypt command sent successfully');

		if (Plaintext) {
			console.log('[INFO] Ciphertext successfully decrypted');
			const plaintextString = Buffer.from(Plaintext).toString();
			return plaintextString;
		} else {
			console.log('[ERROR] Plaintext is missing from DecryptCommandOutput!');
		}
	} catch (e) {
		console.log(`[ERROR] ${(e as Error).message}`);
	}
};
