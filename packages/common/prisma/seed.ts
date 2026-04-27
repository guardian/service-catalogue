import { getTeams } from 'packages/repocop/src/query.js';
import { Prisma } from 'common/prisma-client/client.js';
import type { PrismaConfig } from 'common/src/database-setup.js';
import {
    getDatabaseConnectionString,
    getDevDatabaseConfig,
} from 'common/src/database-setup.js';
import { getPrismaClient } from 'common/src/prisma-client-setup.js';

const config: PrismaConfig = {
    databaseConnectionString: getDatabaseConnectionString(
        await getDevDatabaseConfig(),
    ),
    withQueryLogging: true,
};

const prisma = getPrismaClient(config);

const orgName = 'guardian';
const cqSourceName = 'seed';

function createTeam(
    id: number,
    slug: string,
    org: string = orgName,
    cq_source_name: string = cqSourceName,
): Prisma.github_teamsCreateManyInput {
    return {
        //useful fields
        id: BigInt(id),
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        description: `The ${slug} team`,
        org,
        url: `https://github.com/orgs/${org}/teams/${slug}`,
        cq_source_name,
        cq_id: crypto.randomUUID(),
        //less useful fields - just populating with nulls or defaults
        cq_sync_time: null,
        cq_parent_id: null,
        node_id: null,
        permission: null,
        permissions: Prisma.DbNull,
        privacy: null,
        members_count: null,
        repos_count: null,
        organization: Prisma.DbNull,
        html_url: null,
        members_url: null,
        repositories_url: null,
        parent: Prisma.DbNull,
        ldap_dn: null,
        notification_setting: null,
        assignment: null,
    };
}

const createBranch = (
    repo: Prisma.github_repositoriesCreateManyInput,
    branchName: string,
    cq_source_name: string = cqSourceName,
): Prisma.github_repository_branchesCreateManyInput => {
    return {
        cq_sync_time: null,
        cq_source_name,
        cq_id: crypto.randomUUID(),
        cq_parent_id: null,
        org: repo.org,
        repository_id: repo.id,
        protection: Prisma.DbNull,
        name: branchName,
        commit: Prisma.DbNull,
        protected: branchName === 'main' ? true : false,
    };
};

interface RepoAndLanguages {
    repo: Prisma.github_repositoriesCreateManyInput;
    languages: Prisma.github_languagesCreateManyInput;
    branches: Prisma.github_repository_branchesCreateManyInput[];
}

function createRepoAndChildren(
    id: number,
    name: string,
    languages: string[],
    org: string = orgName,
    cq_source_name: string = cqSourceName,
): RepoAndLanguages {
    const fullName = `${org}/${name}`;
    const repo: Prisma.github_repositoriesCreateManyInput = {
        //useful fields
        org,
        id: BigInt(id),
        node_id: null,
        owner: Prisma.DbNull,
        name: name,
        full_name: fullName,
        description: `The ${name} repository`,
        created_at: new Date('2020-01-01T00:00:00Z'),
        default_branch: 'main',
        pushed_at: new Date('2021-01-01T00:00:00Z'),
        updated_at: new Date('2021-01-01T00:00:00Z'),
        language: languages[0] ?? null,
        cq_id: crypto.randomUUID(),
        cq_source_name,
        topics: ['production'],
        //less useful fields - just populating with nulls or defaults
        cq_sync_time: null,
        cq_parent_id: null,
        homepage: null,
        code_of_conduct: Prisma.DbNull,
        master_branch: null,
        html_url: null,
        clone_url: null,
        git_url: null,
        mirror_url: null,
        ssh_url: null,
        svn_url: null,
        fork: null,
        forks_count: null,
        network_count: null,
        open_issues_count: null,
        open_issues: null,
        stargazers_count: null,
        subscribers_count: null,
        watchers_count: null,
        watchers: null,
        size: null,
        auto_init: null,
        parent: Prisma.DbNull,
        source: Prisma.DbNull,
        template_repository: Prisma.DbNull,
        organization: Prisma.DbNull,
        permissions: Prisma.DbNull,
        allow_rebase_merge: null,
        allow_update_branch: null,
        allow_squash_merge: null,
        allow_merge_commit: null,
        allow_auto_merge: null,
        allow_forking: null,
        delete_branch_on_merge: null,
        use_squash_pr_title_as_default: null,
        squash_merge_commit_title: null,
        squash_merge_commit_message: null,
        merge_commit_title: null,
        merge_commit_message: null,
        archived: null,
        disabled: null,
        license: Prisma.DbNull,
        private: null,
        has_issues: null,
        has_wiki: null,
        has_pages: null,
        has_projects: null,
        has_downloads: null,
        has_discussions: null,
        is_template: null,
        license_template: null,
        gitignore_template: null,
        security_and_analysis: Prisma.DbNull,
        team_id: null,
        url: null,
        archive_url: null,
        assignees_url: null,
        blobs_url: null,
        branches_url: null,
        collaborators_url: null,
        comments_url: null,
        commits_url: null,
        compare_url: null,
        contents_url: null,
        contributors_url: null,
        deployments_url: null,
        downloads_url: null,
        events_url: null,
        forks_url: null,
        git_commits_url: null,
        git_refs_url: null,
        git_tags_url: null,
        hooks_url: null,
        issue_comment_url: null,
        issue_events_url: null,
        issues_url: null,
        keys_url: null,
        labels_url: null,
        languages_url: null,
        merges_url: null,
        milestones_url: null,
        notifications_url: null,
        pulls_url: null,
        releases_url: null,
        stargazers_url: null,
        statuses_url: null,
        subscribers_url: null,
        subscription_url: null,
        tags_url: null,
        trees_url: null,
        teams_url: null,
        text_matches: Prisma.DbNull,
        visibility: null,
        role_name: null,
        custom_properties: Prisma.DbNull,
        web_commit_signoff_required: null,
    };
    return {
        repo,
        languages: {
            full_name: fullName,
            name: name,
            languages: languages,
            cq_sync_time: null,
            cq_source_name,
            cq_id: crypto.randomUUID(),
            cq_parent_id: null,
        },
        branches: [
            createBranch(repo, 'main'),
            createBranch(repo, 'develop', cq_source_name),
            createBranch(repo, 'feature-1', cq_source_name),
        ],
    };
}

type RoleName = 'triage' | 'read' | 'maintain' | 'write' | 'admin';

function createRepoOwnership(
    repo: Prisma.github_repositoriesCreateManyInput,
    team: Prisma.github_teamsCreateManyInput,
    roleName: RoleName,
    cq_source_name: string = cqSourceName,
): Prisma.github_team_repositoriesCreateManyInput {
    return {
        //useful fields
        role_name: roleName,
        org: repo.org || '',
        team_id: team.id, //team id
        id: repo.id, //repo id
        owner: repo.owner ?? Prisma.DbNull,
        name: repo.name ?? null,
        full_name: repo.full_name ?? null,
        description: repo.description ?? null,
        created_at: repo.created_at ?? null,
        pushed_at: repo.pushed_at ?? null,
        updated_at: repo.updated_at ?? null,
        default_branch: repo.default_branch ?? null,
        language: repo.language ?? null,
        //less useful fields
        cq_sync_time: null,
        cq_source_name,
        cq_id: crypto.randomUUID(),
        cq_parent_id: null,
        node_id: repo.node_id ?? null,
        homepage: repo.homepage ?? null,
        code_of_conduct: repo.code_of_conduct ?? Prisma.DbNull,
        master_branch: repo.master_branch ?? null,
        html_url: repo.html_url ?? null,
        clone_url: repo.clone_url ?? null,
        git_url: repo.git_url ?? null,
        mirror_url: repo.mirror_url ?? null,
        ssh_url: repo.ssh_url ?? null,
        svn_url: repo.svn_url ?? null,
        fork: repo.fork ?? null,
        forks_count: repo.forks_count ?? null,
        network_count: repo.network_count ?? null,
        open_issues_count: repo.open_issues_count ?? null,
        open_issues: repo.open_issues ?? null,
        stargazers_count: repo.stargazers_count ?? null,
        subscribers_count: repo.subscribers_count ?? null,
        watchers_count: repo.watchers_count ?? null,
        watchers: repo.watchers ?? null,
        size: repo.size ?? null,
        auto_init: repo.auto_init ?? null,
        parent: repo.parent ?? Prisma.DbNull,
        source: repo.source ?? Prisma.DbNull,
        template_repository: repo.template_repository ?? Prisma.DbNull,
        organization: repo.organization ?? Prisma.DbNull,
        permissions: repo.permissions ?? Prisma.DbNull,
        allow_rebase_merge: repo.allow_rebase_merge ?? null,
        allow_update_branch: repo.allow_update_branch ?? null,
        allow_squash_merge: repo.allow_squash_merge ?? null,
        allow_merge_commit: repo.allow_merge_commit ?? null,
        allow_auto_merge: repo.allow_auto_merge ?? null,
        allow_forking: repo.allow_forking ?? null,
        delete_branch_on_merge: repo.delete_branch_on_merge ?? null,
        use_squash_pr_title_as_default: repo.use_squash_pr_title_as_default ?? null,
        squash_merge_commit_title: repo.squash_merge_commit_title ?? null,
        squash_merge_commit_message: repo.squash_merge_commit_message ?? null,
        merge_commit_title: repo.merge_commit_title ?? null,
        merge_commit_message: repo.merge_commit_message ?? null,
        topics: repo.topics || undefined,
        archived: repo.archived ?? null,
        disabled: repo.disabled ?? null,
        license: repo.license ?? Prisma.DbNull,
        private: repo.private ?? null,
        has_issues: repo.has_issues ?? null,
        has_wiki: repo.has_wiki ?? null,
        has_pages: repo.has_pages ?? null,
        has_projects: repo.has_projects ?? null,
        has_downloads: repo.has_downloads ?? null,
        has_discussions: repo.has_discussions ?? null,
        is_template: repo.is_template ?? null,
        license_template: repo.license_template ?? null,
        gitignore_template: repo.gitignore_template ?? null,
        security_and_analysis: repo.security_and_analysis ?? Prisma.DbNull,
        url: repo.url ?? null,
        archive_url: repo.archive_url ?? null,
        assignees_url: repo.assignees_url ?? null,
        blobs_url: repo.blobs_url ?? null,
        branches_url: repo.branches_url ?? null,
        collaborators_url: repo.collaborators_url ?? null,
        comments_url: repo.comments_url ?? null,
        commits_url: repo.commits_url ?? null,
        compare_url: repo.compare_url ?? null,
        contents_url: repo.contents_url ?? null,
        contributors_url: repo.contributors_url ?? null,
        deployments_url: repo.deployments_url ?? null,
        downloads_url: repo.downloads_url ?? null,
        events_url: repo.events_url ?? null,
        forks_url: repo.forks_url ?? null,
        git_commits_url: repo.git_commits_url ?? null,
        git_refs_url: repo.git_refs_url ?? null,
        git_tags_url: repo.git_tags_url ?? null,
        hooks_url: repo.hooks_url ?? null,
        issue_comment_url: repo.issue_comment_url ?? null,
        issue_events_url: repo.issue_events_url ?? null,
        issues_url: repo.issues_url ?? null,
        keys_url: repo.keys_url ?? null,
        labels_url: repo.labels_url ?? null,
        languages_url: repo.languages_url ?? null,
        merges_url: repo.merges_url ?? null,
        milestones_url: repo.milestones_url ?? null,
        notifications_url: repo.notifications_url ?? null,
        pulls_url: repo.pulls_url ?? null,
        releases_url: repo.releases_url ?? null,
        stargazers_url: repo.stargazers_url ?? null,
        statuses_url: repo.statuses_url ?? null,
        subscribers_url: repo.subscribers_url ?? null,
        subscription_url: repo.subscription_url ?? null,
        tags_url: repo.tags_url ?? null,
        trees_url: repo.trees_url ?? null,
        teams_url: repo.teams_url ?? null,
        text_matches: repo.text_matches ?? Prisma.DbNull,
        visibility: repo.visibility ?? null,
        custom_properties: repo.custom_properties ?? Prisma.DbNull,
        web_commit_signoff_required: repo.web_commit_signoff_required ?? null,
    };
}

function createCloudFormationStack(
    name: string,
    cq_source_name: string = cqSourceName,
): Prisma.aws_cloudformation_stacksCreateManyInput {
    const accountId = '0000000000000';
    const region = 'eu-west-1';
    const uuid = crypto.randomUUID();
    const arn = `arn:aws:cloudformation:${region}:${accountId}:stack/${name}/${uuid}`;
    const tags: Array<{ Key: string; Value: string }> = [
        { Key: 'Stack', Value: `${name}-stack` },
        { Key: 'Stage', Value: 'PROD' }, // TODO VARY THIS
        { Key: 'App', Value: `${name}-app` },
        { Key: 'gu:repo', Value: `${orgName}/${name}` },
    ];

    return {
        cq_sync_time: null,
        cq_source_name,
        cq_id: uuid,
        cq_parent_id: null,
        id: arn,
        tags: tags as Prisma.InputJsonValue,
        account_id: '0000000000000',
        region: 'eu-west-1',
        stack_status: 'CREATE_COMPLETE',
        creation_time: new Date('2020-01-01T00:00:00Z'),
        arn: arn,
        stack_name: name,
        capabilities: [],
        change_set_id: null,
        deletion_time: null,
        description: `The ${name} stack`,
        disable_rollback: false,
        drift_information: Prisma.DbNull,
        enable_termination_protection: false,
        last_updated_time: null,
        notification_arns: undefined,
        outputs: Prisma.DbNull,
        parameters: Prisma.DbNull,
        parent_id: null,
        retain_except_on_create: null,
        role_arn: null,
        rollback_configuration: Prisma.DbNull,
        root_id: null,
        stack_id: arn,
        stack_status_reason: null,
        timeout_in_minutes: null,
        deletion_mode: null,
        detailed_status: null,
    };
}

function createCustomProperties(
    repo_id: number | bigint,
): Prisma.github_repository_custom_propertiesCreateManyInput {
    return {
        cq_sync_time: null,
        cq_source_name: cqSourceName,
        cq_id: crypto.randomUUID(),
        cq_parent_id: null,
        org: orgName,
        property_name: 'gu_dependency_graph_integrator_ignore',
        repository_id: BigInt(repo_id),
        value: ['true'],
    };
}

function createGithubActionsUsage(
    name: string,
    workflow_uses: string[],
    workflow_path: string = 'ci.yaml',
): Prisma.guardian_github_actions_usageCreateManyInput {
    return {
        evaluated_on: new Date(),
        full_name: `${orgName}/${name}`,
        workflow_path: '.github/workflows/' + workflow_path,
        workflow_uses,
    };
}

const frontendTeam = createTeam(1, 'frontend');
const backendTeam = createTeam(2, 'backend');
const devopsTeam = createTeam(3, 'devops');
const cricketTeam = createTeam(4, 'cricket');

const teams: Prisma.github_teamsCreateManyInput[] = [
    frontendTeam,
    backendTeam,
    devopsTeam,
    cricketTeam,
];

//using a couple of public repos for now, so that at least some calls to the GitHub API are made by repocop for the moment.
const dcr = 'dotcom-rendering';
const janus = 'janus-app';
const devops = 'fsbp-fix';
const cricket = 'cricket';

const dcrRepo = createRepoAndChildren(1, dcr, [
    'TypeScript',
    'JavaScript',
    'HTML',
    'CSS',
    'Shell',
]);
const janusRepo = createRepoAndChildren(2, janus, [
    'Scala',
    'Dockerfile',
    'Shell',
]);
const theDevopsRepo = createRepoAndChildren(3, devops, ['Go', 'Shell']);
const theCricketRepo = createRepoAndChildren(4, cricket, [
    'Python',
    'Terraform',
    'Shell',
]);

const repos: Prisma.github_repositoriesCreateManyInput[] = [
    dcrRepo.repo,
    janusRepo.repo,
    theDevopsRepo.repo,
    theCricketRepo.repo,
];
const languages: Prisma.github_languagesCreateManyInput[] = [
    dcrRepo.languages,
    janusRepo.languages,
    theDevopsRepo.languages,
    theCricketRepo.languages,
];
const branches: Prisma.github_repository_branchesCreateManyInput[] = [
    ...dcrRepo.branches,
    ...janusRepo.branches,
    ...theDevopsRepo.branches,
    ...theCricketRepo.branches,
];

const dcrRepoOwnership = createRepoOwnership(
    dcrRepo.repo,
    frontendTeam,
    'admin',
);
const janusRepoOwnership = createRepoOwnership(
    janusRepo.repo,
    backendTeam,
    'admin',
);
const devopsRepoOwnership = createRepoOwnership(
    theDevopsRepo.repo,
    devopsTeam,
    'admin',
);
const backendRepoOwnership2 = createRepoOwnership(
    janusRepo.repo,
    devopsTeam,
    'admin',
); //example of a repo with multiple owners
const cricketRepoOwnership = createRepoOwnership(
    theCricketRepo.repo,
    cricketTeam,
    'admin',
);

const teamRepos: Prisma.github_team_repositoriesCreateManyInput[] = [
    dcrRepoOwnership,
    janusRepoOwnership,
    devopsRepoOwnership,
    backendRepoOwnership2,
    cricketRepoOwnership,
];

const frontendStack = createCloudFormationStack(dcr);
const backendStack = createCloudFormationStack(janus);
const cricketStack = createCloudFormationStack(cricket);

const cloudFormationStacks: Prisma.aws_cloudformation_stacksCreateManyInput[] =
    [frontendStack, backendStack, cricketStack];

const frontendGithubActionsUsage = createGithubActionsUsage(dcr, [
    'actions/checkout@v2',
    'actions/setup-node@v2',
]);
const backendGithubActionsUsage = createGithubActionsUsage(janus, [
    'actions/checkout@v2',
    'actions/setup-scala@v1',
]);
const devopsGithubActionsUsage = createGithubActionsUsage(devops, [
    'actions/checkout@v2',
    'actions/setup-python@v2',
]);
const cricketGithubActionsUsage = createGithubActionsUsage(cricket, [
    'actions/checkout@v2',
    'actions/setup-go@v2',
]);

const githubActionsUsages: Prisma.guardian_github_actions_usageCreateManyInput[] =
    [
        frontendGithubActionsUsage,
        backendGithubActionsUsage,
        devopsGithubActionsUsage,
        cricketGithubActionsUsage,
    ];

const customProperties = createCustomProperties(janusRepo.repo.id);

console.log('Seeding teams, repos, languages, and team-repo relationships...');

const seedFilter = {
    where: {
        cq_source_name: cqSourceName,
    },
};

await prisma.github_teams.deleteMany(seedFilter);
await prisma.github_teams.createMany({ data: teams });

console.log('Seeded teams');
const table = await getTeams(prisma);
console.log(table);

await prisma.github_repositories.deleteMany(seedFilter);
await prisma.github_repositories.createMany({ data: repos });

await prisma.github_languages.deleteMany(seedFilter);
await prisma.github_languages.createMany({ data: languages });

await prisma.github_team_repositories.deleteMany(seedFilter);
await prisma.github_team_repositories.createMany({ data: teamRepos });

await prisma.github_repository_branches.deleteMany(seedFilter);
await prisma.github_repository_branches.createMany({ data: branches });

await prisma.aws_cloudformation_stacks.deleteMany(seedFilter);
await prisma.aws_cloudformation_stacks.createMany({
    data: cloudFormationStacks,
});

await prisma.github_repository_custom_properties.deleteMany(seedFilter);
await prisma.github_repository_custom_properties.createMany({
    data: customProperties,
});

await prisma.guardian_github_actions_usage.deleteMany();
await prisma.guardian_github_actions_usage.createMany({
    data: githubActionsUsages,
});

console.log('Seeding complete!');

await prisma.$disconnect();
