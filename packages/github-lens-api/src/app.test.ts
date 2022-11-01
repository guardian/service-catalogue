/* eslint-disable @typescript-eslint/no-unsafe-member-access -- For body access which is always any */
import type { Stage } from 'common/config';
import type { LogLevel } from 'common/log/log';
import type { Express } from 'express';
import request from 'supertest';
import { buildApp } from './app';

describe('github-lens api lambda', () => {
	let app: Express;

	beforeEach(() => {
		const config = {
			dataKeyPrefix: 'prefix',
			dataBucketName: 'bucket',
			region: 'eu-west-1',
			stage: 'DEV' as Stage,
			logLevel: 'info' as LogLevel,
		};
		app = buildApp(config);
	});

	describe('GET /healthcheck', () => {
		it('returns a valid healthcheck', async () => {
			const res = await request(app).get('/healthcheck');
			expect(res.status).toEqual(200);
			expect(res.body.stage).toEqual('INFRA');
		});
	});
});
