const envOrError = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable ${name}`);
	}
	return value;
};

/**
 * The versions of various ServiceCatalogue plugins.
 * See the `.env` file at the root of the repository.
 */
export const Versions = {
	CloudqueryCli: envOrError('CQ_CLI'),
	CloudqueryPostgresDestination: envOrError('CQ_POSTGRES_DESTINATION'),
	CloudqueryPostgresSource: envOrError('CQ_POSTGRES_SOURCE'),
	CloudqueryAws: envOrError('CQ_AWS'),
	CloudqueryGithub: envOrError('CQ_GITHUB'),
	CloudqueryFastly: envOrError('CQ_FASTLY'),
	CloudqueryGalaxies: envOrError('CQ_GUARDIAN_GALAXIES'),
	CloudquerySnyk: envOrError('CQ_SNYK'),
	CloudquerySnykGuardian: envOrError('CQ_GUARDIAN_SNYK'),
};
