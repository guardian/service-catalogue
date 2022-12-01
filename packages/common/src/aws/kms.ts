import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';

const region = 'eu-west-1';
const kmsClient = new KMSClient({
	region,
});

export const decrypt = async (
	cipherText: string,
	keyId: string,
): Promise<string> => {
	const decryptCommand = new DecryptCommand({
		CiphertextBlob: Buffer.from(cipherText, 'base64'),
		KeyId: keyId,
	});

	try {
		const { Plaintext } = await kmsClient.send(decryptCommand);
		console.log('Decrypt command sent successfully');

		if (!Plaintext) {
			// should not happen, AWS's types are just a bit odd
			const message = 'Plaintext is missing from DecryptCommandOutput!';
			console.error(message);
			return message;
		}

		console.log('Ciphertext successfully decrypted');
		return Buffer.from(Plaintext).toString();
	} catch (e) {
		const message = `Decryption failed: ${(e as Error).message}`;
		console.error(message);
		throw new Error(message);
	}
};
