/* eslint-disable @typescript-eslint/no-unsafe-member-access -- For body access which is always any */
import type { RetrievedObject } from 'common/aws/s3';
import type { Repository, Team } from 'common/model/repository';
import type { Express } from 'express';
import request from 'supertest';
import { buildApp } from './app';

describe('github-lens api lambda', () => {
	let app: Express;

	beforeEach(() => {
		const repoData = Promise.resolve<RetrievedObject<Repository[]>>({
			payload: [],
		});
		const teamData = Promise.resolve<RetrievedObject<Team[]>>({
			payload: [],
		});
		app = buildApp(repoData, teamData);
	});

	describe('GET /healthcheck', () => {
		it('returns a valid healthcheck', async () => {
			const res = await request(app).get('/healthcheck');
			expect(res.status).toEqual(200);
			expect(res.body.stage).toEqual('INFRA');
		});
	});
});
