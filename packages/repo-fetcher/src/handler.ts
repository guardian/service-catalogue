import config from "./config";
import { listRepositories, RepositoriesResponse } from "./github";

interface Repository {
    id: number,
    name: string,
    full_name: string,
    private: boolean,
    description: string | null,
    created_at: Date,
    updated_at: Date,
    pushed_at: Date,
    size: number,
    language: string,
    archived: boolean,
    open_issues_count: number,
    is_template: boolean,
    topics: string[],
    default_branch: string,
}

const parseDateString = (dateString: string | null | undefined): Date | null => {
    if(dateString === undefined || dateString === null || dateString.length === 0) {
        return null
    }
    return new Date(dateString);
}

export const main = async (): Promise<void> => {
    console.log('starting repo-fetcher');

    const reposResponse: RepositoriesResponse = await listRepositories(config);
    const repos = reposResponse.map(resp => {
        return {
            id: resp.id,
            name: resp.name,
            full_name: resp.full_name,
            private: resp.private,
            description: resp.description,
            created_at: parseDateString(resp.created_at),
            updated_at: parseDateString(resp.updated_at),
            pushed_at: parseDateString(resp.pushed_at),
            size: resp.size,
            language: resp.language,
            archived: resp.archived,
            open_issues_count: resp.open_issues_count,
            is_template: resp.is_template,
            topics: resp.topics,
            default_branch: resp.default_branch,
        } as Repository
    })

    console.log(repos[0]);
}

if (require.main === module) {
    void (async () => await main())();
}