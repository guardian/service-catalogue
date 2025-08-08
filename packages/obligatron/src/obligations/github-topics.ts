import type { PrismaClient } from '@prisma/client';
import { getRepositories } from 'common/src/database-queries.js';
import type {
    Repository,
} from 'common/src/types.js';
import type { ObligationResult } from './index.js';

export function topicsIncludesProductionStatus(topics: string[], productionStatuses: string[]): boolean {
    return productionStatuses.some(status => topics.includes(status));
}

export function repoToObligationResult(repo: Repository): ObligationResult {
    return {
        resource: repo.full_name,
        reason: `Repository does not have topics indicating production status: ${repo.topics.join(', ')}`,
        url: `https://github.com/${repo.full_name}`,
        contacts: undefined,
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

    return repositories.map((repo) => repoToObligationResult(repo));

}
