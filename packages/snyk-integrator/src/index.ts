import type { SNSHandler } from 'aws-lambda';
import { parseEvent } from 'common/functions';
import {
	createPrAndAddToProject,
	generateBranchName,
} from 'common/src/pull-requests';
import type { SnykIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import { createYaml, generatePr } from './snyk-integrator';

export async function main(event: SnykIntegratorEvent) {
	console.log(`Generating Snyk PR for ${event.name}`);
	const config: Config = getConfig();

	const boardNumber = 110;
	const author = 'gu-snyk-integrator';
	const branchPrefix = 'integrate-snyk';
	const branch = generateBranchName(branchPrefix);
	const [title, body] = generatePr(event.languages, branch);
	const snykFileContents = createYaml(event.languages, branch);
	const fileName = '.github/workflows/snyk.yaml';
	const commitMessage = 'Add snyk.yaml';

	await createPrAndAddToProject(
		config.stage,
		event.name,
		config.owner,
		author,
		branch,
		title,
		body,
		fileName,
		snykFileContents,
		commitMessage,
		boardNumber,
		[], //TODO: add admins when snyk integrator is re-enabled
	);
}

export const handler: SNSHandler = async (event) => {
	const snykIntegratorEvents = parseEvent<SnykIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(snykIntegratorEvents[0]!);
};
