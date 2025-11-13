import type { Octokit } from 'octokit';
import type { UpdateCustomPropertyParams } from './model.js';

export async function setRepoCustomProperty(
	octokit: Octokit,
	gitHubOrg: string,
	repoName: string,
	propertyName: string,
	propertyValue: string,
) {
	const customPropertyParams: UpdateCustomPropertyParams = {
		owner: gitHubOrg,
		repo: repoName,
		properties: [
			{
				property_name: propertyName,
				value: propertyValue,
			},
		],
	};
	try {
		await octokit.rest.repos.customPropertiesForReposCreateOrUpdateRepositoryValues(
			customPropertyParams,
		);
		console.log(
			`Have set custom property ${propertyName} to ${propertyValue} for ${repoName}`,
		);
	} catch (error) {
		const sanitisedError =
			error instanceof Error
				? { message: error.message, name: error.name }
				: 'Unknown error';
		console.error(
			`Failed to set custom property ${propertyName} to ${propertyValue} for ${repoName}`,
			sanitisedError,
		);
		throw error;
	}
}
