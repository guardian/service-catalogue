import type { Octokit } from 'octokit';
import type { UpdateCustomPropertyParams } from './model.js';

export async function setRepoCustomProperty(
	octokit: Octokit,
	gitHubOrg: string,
	repoName: string,
	propertyName: string,
	propertyValue: string,
) {
	try {
		const currentPropertiesForRepo =
			await octokit.rest.repos.customPropertiesForReposGetRepositoryValues({
				owner: gitHubOrg,
				repo: repoName,
			});

		const existingProperty = currentPropertiesForRepo.data.find(
			(property) => property.property_name === propertyName,
		);

		if (existingProperty?.value === propertyValue) {
			console.log(
				`Custom property ${propertyName} is already set to ${propertyValue} for ${repoName} - skipping`,
			);
			return false;
		}
	} catch (error) {
		const sanitisedError =
			error instanceof Error
				? { message: error.message, name: error.name }
				: 'Unknown error';
		console.log(
			`Could not check existing property for ${repoName}`,
			sanitisedError,
		);
		return false;
	}

	try {
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

		await octokit.rest.repos.customPropertiesForReposCreateOrUpdateRepositoryValues(
			customPropertyParams,
		);

		console.log(
			`Have set custom property ${propertyName} to ${propertyValue} for ${repoName}`,
		);
		return true;
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
