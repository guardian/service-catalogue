import type { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { evaluateSecurityHubTaggingCoverage } from './tagging';

const createPrismaClientWithMockedResponse = (response: unknown[]) => {
	const aws_securityhub_findings = {
		findMany: () => Promise.resolve(response),
	};

	const test = {
		aws_securityhub_findings,
	} as unknown as PrismaClient;

	return test;
};

describe('The tagging obligation', () => {
	it('catches failed securityhub findings', async () => {
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

		expect(results).toHaveLength(2);
		expect(results[0]).toEqual({
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
		expect(results[1]).toEqual({
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

	it('handles findings with no resources', async () => {
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

		expect(results).toHaveLength(0);
	});

	it('handles findings with incorrect amount of resources', async () => {
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

		expect(results).toHaveLength(2);
	});

	it('crashes on findings with an invalid Resource schema', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				id: '123456789012',
				title: 'failed tagging',
				region: 'mars-north-1',
				aws_account_id: '123456789012',
				resources: [{}],
			},
		]);

		await expect(evaluateSecurityHubTaggingCoverage(client)).rejects.toEqual(
			new Error('Invalid resource in finding 123456789012'),
		);
	});
});
