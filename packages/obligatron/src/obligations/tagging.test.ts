import assert from 'assert';
import { describe, it } from 'node:test';
import type { PrismaClient } from '@prisma/client';
import { evaluateSecurityHubTaggingCoverage } from './tagging.js';

const createPrismaClientWithMockedResponse = (response: unknown[]) => {
	const aws_securityhub_findings = {
		findMany: () => Promise.resolve(response),
	};

	const test = {
		aws_securityhub_findings,
	} as unknown as PrismaClient;

	return test;
};

void describe('The tagging obligation', () => {
	void it('catches failed securityhub findings', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				id: '123456789012',
				title: 'failed tagging',
				region: 'mars-north-1',
				aws_account_id: '123456789012',
				resources: [
					{
						Id: 'arn:aws:s3:::mybucket',
						Region: 'mars-north-1',
						Type: 'AWS::S3::Bucket',
						Tags: {
							Stack: 'my-stack',
							Stage: 'prod',
							App: 'myapp',
							'gu:repo': 'myrepo',
						},
					},
				],
			},
			{
				id: '123456789012',
				title: 'failed tagging',
				region: 'mars-north-1',
				aws_account_id: '123456789012',
				resources: [
					{
						Id: 'arn:aws:s3:::mybucket',
						Tags: {
							Stack: 'my-stack',
							Stage: 'prod',
							App: 'myapp',
						},
					},
				],
			},
		]);

		const results = await evaluateSecurityHubTaggingCoverage(client);

		assert.strictEqual(results.length, 2);
		assert.deepStrictEqual(results[0], {
			resource: 'arn:aws:s3:::mybucket',
			reason: 'failed tagging',
			contacts: {
				aws_account_id: '123456789012',
				Stack: 'my-stack',
				Stage: 'prod',
				App: 'myapp',
			},
			url: 'https://mars-north-1.console.aws.amazon.com/securityhub/home?region=mars-north-1#/findings?search=RecordState%3D%255Coperator%255C%253AEQUALS%255C%253AACTIVE%26Id%3D%255Coperator%255C%253AEQUALS%255C%253A123456789012',
		});
		assert.deepStrictEqual(results[1], {
			resource: 'arn:aws:s3:::mybucket',
			reason: 'failed tagging',
			contacts: {
				aws_account_id: '123456789012',
				Stack: 'my-stack',
				Stage: 'prod',
				App: 'myapp',
			},
			url: 'https://mars-north-1.console.aws.amazon.com/securityhub/home?region=mars-north-1#/findings?search=RecordState%3D%255Coperator%255C%253AEQUALS%255C%253AACTIVE%26Id%3D%255Coperator%255C%253AEQUALS%255C%253A123456789012',
		});
	});

	void it('handles findings with no resources', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				id: '123456789012',
				title: 'failed tagging',
				region: 'mars-north-1',
				aws_account_id: '123456789012',
				resources: [],
			},
		]);

		const results = await evaluateSecurityHubTaggingCoverage(client);

		assert.strictEqual(results.length, 0);
	});

	void it('handles findings with incorrect amount of resources', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				id: '123456789012',
				title: 'failed tagging',
				region: 'mars-north-1',
				aws_account_id: '123456789012',
				resources: [
					{
						Id: 'arn:aws:s3:::mybucket',
						Region: 'mars-north-1',
						Type: 'AWS::S3::Bucket',
						Tags: {
							Stack: 'my-stack',
							Stage: 'prod',
							App: 'myapp',
							'gu:repo': 'myrepo',
						},
					},
					{
						Id: 'arn:aws:s3:::mybucket',
						Region: 'mars-north-1',
						Type: 'AWS::S3::Bucket',
						Tags: {
							Stack: 'my-stack',
							Stage: 'prod',
							App: 'myapp',
							'gu:repo': 'myrepo',
						},
					},
				],
			},
		]);

		const results = await evaluateSecurityHubTaggingCoverage(client);

		assert.strictEqual(results.length, 2);
	});

	void it('crashes on findings with an invalid Resource schema', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				id: '123456789012',
				title: 'failed tagging',
				region: 'mars-north-1',
				aws_account_id: '123456789012',
				resources: [{}],
			},
		]);

		await assert.rejects(
			() => evaluateSecurityHubTaggingCoverage(client),
			(err: Error) =>
				err instanceof Error &&
				err.message === 'Invalid resource in finding 123456789012',
		);
	});
});
