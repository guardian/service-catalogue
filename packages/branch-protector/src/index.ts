import {Octokit} from 'octokit';
import {Endpoints} from '@octokit/types';

//TODO: move to a common place
function getEnvOrThrow(key: string): string {
    const value: string | undefined = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

const authToken: string = getEnvOrThrow('GITHUB_ACCESS_TOKEN');

export type UpdateBranchProtectionParams =
    Endpoints["PUT /repos/{owner}/{repo}/branches/{branch}/protection"]["parameters"];

export async function updateBranchProtection(octokit: Octokit,
                                             owner: string,
                                             repo: string,
                                             branch: string,
) {

    //https://github.com/guardian/recommendations/blob/main/github.md#branch-protection
    const branchProtectionParams: UpdateBranchProtectionParams = {
        owner: owner,
        repo: repo,
        branch: branch,
        required_status_checks: {
            strict: true,
            contexts: [],
        },
        restrictions: null,
        enforce_admins: true,
        required_pull_request_reviews: {
            require_code_owner_reviews: true,
            required_approving_review_count: 1,
        },
        allow_force_pushes: false,
        allow_deletions: false,
    }
    await octokit.rest.repos.updateBranchProtection(
        branchProtectionParams
    );
}

async function getDefaultBranchName(owner: string, repo: string, octokit: Octokit) {

    const data = await octokit.rest.repos.get({owner: owner, repo: repo});
    return data.data.default_branch;
}

async function isMainBranchProtected(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string,
): Promise<boolean> {
    const branchData = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
    });
    return branchData.data.protected;
}

export async function main(event: updateProtectionEvent) {
    const octokit: Octokit = new Octokit({auth: authToken});

    const owner = event.full_name.split('/')[0]!;
    const repo = event.full_name.split('/')[1]!;
    const defaultBranchName = await getDefaultBranchName(owner, repo, octokit);
    const isProtected = await isMainBranchProtected(octokit, owner, repo, defaultBranchName);
    console.log(`Is ${repo} protected? ${isProtected.toString()}`);
    if (isProtected) {
        console.log(`${repo}'s main branch is protected. No action required`)
        return false;
    } else {
        console.log(`Updating ${repo} branch protection`)
        await updateBranchProtection(octokit,
            owner,
            repo,
            defaultBranchName,
        );
        console.log(`Update of ${repo} successful`)
        return true;
    }
}
