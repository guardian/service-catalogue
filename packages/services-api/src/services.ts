import fetch from 'node-fetch';

export type LensResponse<A> = {
	payload: A;
	lastModified: string;
};

// TODO date fields are currently modelled as strings. This is fine for now as
// we are just passing them through, but it might be worth converting to Date
// types if/when we introduce date logic - for example, filtering by date range.

// TODO move into common and share with github-data-fetcher. Though note questions over
// (de)serialising date fields.
export interface Repository {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	description: string | null;
	created_at: string | null;
	updated_at: string | null;
	pushed_at: string | null;
	size: number | undefined;
	language: string | null | undefined;
	archived: boolean | undefined;
	open_issues_count: number | undefined;
	is_template: boolean | undefined;
	topics: string[] | undefined;
	default_branch: string | undefined;
	owners: string[];
}

export interface Stack {
	stackName: string;
	metadata: Record<string, unknown>;
	accountId: string;
	accountName: string;
	createdTime: string;
	lastUpdatedTime: string;
	tags: Record<string, string | undefined>;
	devxFeatures: Record<string, string | undefined>;
}

export interface Service {
	// Github Teams that have 'Admin' rights to the repo this service is defined
	// in.
	githubOwners: string[];

	// One or more Cloudformation stacks that comprise this service. Typically
	// if more than one it is because there are multiple stages - e.g. 'CODE'
	// and 'PROD'.
	stacks: Stack[];
}

export interface ServicesApi {
	list(): Promise<Service[]>;
	forGithubOwner(owner: string): Promise<Service[]>;
}

// Implementation of ServicesApi that is backed by our Cloudformation and Github
// Lens HTTP (JSON API) services. NOTE: no attempt to cache results has yet been
// made - each operation is expensive.
export class LensServicesApi implements ServicesApi {
	readonly cloudformationLensUrl: string;
	readonly githubLensUrl: string;

	constructor(cloudformationLensUrl: string, githubLensUrl: string) {
		this.cloudformationLensUrl = cloudformationLensUrl;
		this.githubLensUrl = githubLensUrl;
	}

	async list(): Promise<Service[]> {
		const stacksResp = await fetch(`${this.cloudformationLensUrl}/stacks`);
		const stacks = (await stacksResp.json()) as Stack[];

		const reposResp = await fetch(`${this.githubLensUrl}/repos`);
		const repos = (await reposResp.json()) as LensResponse<Repository[]>;

		const services: Service[] = groupByService(stacks).map((stacks) => {
			return {
				stacks: stacks,
				githubOwners: stacks.flatMap((stack) =>
					ownersForStack(repos.payload, stack),
				),
			};
		});

		return services;
	}

	async forGithubOwner(owner: string): Promise<Service[]> {
		const all = await this.list();
		return all.filter((service) => service.githubOwners.includes(owner));
	}
}

export const ownersForStack = (repos: Repository[], stack: Stack): string[] => {
	const repoTag = stack.tags['gu:repo'];
	if (!repoTag) {
		return [];
	}

	// find the repo and return its owners.
	const owners = repos.find((repo) => repo.full_name === repoTag)?.owners;
	return owners ?? [];
};

// Group stacks by service. Initially this means grouping stacks that share app,
// stack, and accountId, but have a different stage tag.
export const groupByService = (stacks: Stack[]): Stack[][] => {
	const groups: Map<string, Stack[]> = new Map();

	stacks.forEach((stack) => {
		const app = stack.tags['App'];
		const stackTag = stack.tags['Stack'];
		const accountId = stack.accountId;

		// Requirement: stacks should have app/stack/stage tags for grouping to
		// work.
		const key =
			app && stackTag
				? `${accountId}/${stackTag}/${app}` // apps with the same Stack and App are grouped.
				: `${accountId}/${stack.stackName}`;

		const existing = groups.get(key) ?? [];
		groups.set(key, existing.concat(stack));
	});

	return Array.from(groups.values()); // groups.values returns IterableIterator
};
