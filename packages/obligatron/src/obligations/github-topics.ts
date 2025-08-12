import type { PrismaClient, view_repo_ownership } from '@prisma/client';
import { getRepoOwnership, getRepositories } from 'common/src/database-queries.js';
import type {
    Repository,
} from 'common/src/types.js';
import type { ObligationResult } from './index.js';

export function topicsIncludesProductionStatus(topics: string[], productionStatuses: string[]): boolean {
    return productionStatuses.some(status => topics.includes(status));
}

export function repoToObligationResult(repo: Repository, allOwners: view_repo_ownership[]): ObligationResult {
    const teamSlugs = allOwners.filter((o) => o.full_repo_name === repo.full_name).map((x) => x.github_team_slug)

    return {
        resource: repo.full_name,
        reason: `Repository does not have topics indicating production status. Topics: ${repo.topics.join(', ')}`,
        url: `https://github.com/${repo.full_name}`,
        contacts: { slugs: teamSlugs },
    };
}

export async function evaluateRepoTopics(prisma: PrismaClient): Promise<ObligationResult[]> {

    const productionStatuses: string[] = (await prisma.guardian_production_status.findMany({
        select: {
            status: true,
        },
    })).map((status) => status.status);


    const repositories = (await getRepositories(prisma, []))
        .filter((repo) => !repo.archived && !topicsIncludesProductionStatus(repo.topics, productionStatuses));


    //prefilter to only repos that don't have production topics. At a minimum, this will reduce the size of the list by 90%
    const owners = (await getRepoOwnership(prisma)).filter((record) =>
        repositories.some((repo) => repo.full_name === record.full_repo_name),
    );

    return repositories.map((repo) => repoToObligationResult(repo, owners));

}
