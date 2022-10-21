import { exists, readFileSync, writeFileSync } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import type { Octokit } from '@octokit/rest';
import { putItem } from '../../common/aws/s3';
import { getConfig } from '../../common/config';
import type {
	RepositoriesResponse,
	TeamRepoResponse,
} from '../../common/github/github';
import {
	getInfoForRepo,
	getOctokit,
	getRepos,
	getReposForTeam,
	getTeamBySlug,
	getTeams,
	listRepositories,
	listTeams,
} from '../../common/github/github';
import type { Repository } from './transformations';
import {
	findOwnersOfRepo,
	getAdminReposFromResponse,
	RepoAndOwner,
	transformRepo,
} from './transformations';

const saveToS3 = (
	dataKeyPrefix: string,
	dataBucketName: string | undefined,
	repos: Repository[],
	fileName: string,
): Promise<void> => {
	const key = join(dataKeyPrefix, 'github', fileName);
	return putItem(key, repos, dataBucketName);
};

const saveToTestDir = async (
	client: Octokit,
	stage: string,
	fileName: string,
	data: object,
): Promise<void> => {
	if (stage === 'DEV' && !fs.existsSync(fileName)) {
		const repoRiffRaff = await getInfoForRepo(client, 'guardian', 'riff-raff');
		writeFileSync(fileName, JSON.stringify(data), {
			flag: 'w',
		});
	}
};

const createOwnerObjects = async (
	client: Octokit,
	teamSlug: string,
): Promise<RepoAndOwner[]> => {
	const allRepos: TeamRepoResponse = await getReposForTeam(client, teamSlug);
	const adminRepos: string[] = getAdminReposFromResponse(allRepos);
	return adminRepos.map((repoName) => new RepoAndOwner(teamSlug, repoName));
};

export const main = async (): Promise<void> => {
	console.log('[INFO] starting repo-fetcher');

	const config = await getConfig();
	const client = getOctokit(config);

	const stage = config.stage;
	console.log(`[INFO] stage is ${stage}`);

	console.log(`[INFO] running ListTeams`);
	//teamNames array of teamNames
	const teamNames = await getTeams(config.stage, client);
	const teamNamesFileName = join(__dirname, '../../../test/teamNames.json');
	if (stage === 'DEV' && !fs.existsSync(teamNamesFileName)) {
		const repoRiffRaff = await getInfoForRepo(client, 'guardian', 'riff-raff');
		writeFileSync(teamNamesFileName, JSON.stringify(teamNames), {
			flag: 'w',
		});
	}
	//single team
	const devxTeam = await getTeamBySlug(client, 'devx-operations');
	//const devxTeamSlug = devxTeam.data.slug;
	const devxTeamSlug = 'devx-operations';
	const repoRiffRaffFileName = join(
		__dirname,
		'../../../test/repoRiffRaff.json',
	);
	if (stage === 'DEV' && !fs.existsSync(repoRiffRaffFileName)) {
		const repoRiffRaff = await getInfoForRepo(client, 'guardian', 'riff-raff');
		writeFileSync(repoRiffRaffFileName, JSON.stringify(repoRiffRaff), {
			flag: 'w',
		});
	}

	console.log(`[INFO] found ${teamNames.length} github teams`);
	console.log(`[INFO] running createOwnerObjects`);

	const reposAndOwnersFileName = join(
		__dirname,
		'../../../test/reposAndOwnersDev.json',
	);
	if (stage === 'DEV' && !fs.existsSync(reposAndOwnersFileName)) {
		const reposAndOwnersDev: RepoAndOwner[] = await createOwnerObjects(
			client,
			devxTeamSlug,
		);
		writeFileSync(reposAndOwnersFileName, JSON.stringify(reposAndOwnersDev), {
			flag: 'w',
		});
	}

	const reposAndOwners: RepoAndOwner[] = (
		await Promise.all(
			teamNames.map((team) => createOwnerObjects(client, team.slug)),
		)
	).flat();
	console.log(`[INFO] createOwnerObjects done`);

	//getting all repos for the guardian takes a long time, so get less on DEV
	const reposResponse: RepositoriesResponse = await getRepos(
		config.stage,
		client,
	);

	console.log(`[INFO] running transformRepo`);
	const repos = reposResponse.map((response) =>
		transformRepo(response, findOwnersOfRepo(response.name, reposAndOwners)),
	);
	console.log(`[INFO] transformRepo done`);

	console.log(`[INFO] saving to bucket`);
	if (stage === 'DEV') {
		writeFileSync(
			join(__dirname, '../../../test/repos.json'),
			JSON.stringify(repos),
			{
				flag: 'w',
			},
		);
	} else {
		await saveToS3(
			config.dataKeyPrefix,
			config.dataBucketName,
			repos,
			'repos.json',
		);
	}
	console.log(`[INFO] save to bucket done`);

	console.log(`[INFO] found ${repos.length} repos`);

	if (stage === 'DEV') {
		writeFileSync(
			join(__dirname, '../../../test/localJsonFilesCreated'),
			JSON.stringify('created local json files for easy of testing'),
			{
				flag: 'w',
			},
		);
	}

	console.log(`[INFO] finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
