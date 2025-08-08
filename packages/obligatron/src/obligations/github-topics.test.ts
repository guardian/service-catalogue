import assert from 'assert';
import { describe, it } from 'node:test';
import type {
    view_repo_ownership,
} from '@prisma/client';
import type { Repository } from 'common/types.js';
import { repoToObligationResult, topicsIncludesProductionStatus } from './github-topics.js';

void describe('topicsIncludesProductionStatus', () => {
    const productionStatuses = ['production', 'testing', 'documentation', 'prototype', 'hackday', 'learning', 'interactive'];
    void it('returns true when topics include a production status', () => {
        const topics = ['production', 'blah'];
        assert.strictEqual(topicsIncludesProductionStatus(topics, productionStatuses), true);
    });

    void it('returns false when topics do not include any production status', () => {
        const topics = ['https'];
        assert.strictEqual(topicsIncludesProductionStatus(topics, productionStatuses), false);
    });

    void it('returns false when topics is empty', () => {
        const topics: string[] = [];
        assert.strictEqual(topicsIncludesProductionStatus(topics, productionStatuses), false);
    });

    void it('returns false when productionStatuses is empty', () => {
        const topics = ['production'];
        const emptyProductionStatuses: string[] = [];
        assert.strictEqual(topicsIncludesProductionStatus(topics, emptyProductionStatuses), false);
    });

    void it('returns false when both topics and productionStatuses are empty', () => {
        assert.strictEqual(topicsIncludesProductionStatus([], []), false);
    });

    void it('returns true when multiple production statuses are present in topics', () => {
        const topics = ['production', 'staging', 'testing'];
        assert.strictEqual(topicsIncludesProductionStatus(topics, productionStatuses), true);
    });

    void it('is case sensitive', () => {
        const topics = ['Production', 'scala'];
        const caseSensitiveProductionStatuses = ['production'];
        assert.strictEqual(topicsIncludesProductionStatus(topics, caseSensitiveProductionStatuses), false);
    })
});

void describe('repoToObligationResult', () => {
    const repo: Repository = {
        archived: false,
        full_name: 'some/repo',
        topics: [],
        id: BigInt(1),
        default_branch: 'main',
        name: 'repo',
        created_at: new Date('2020-01-01'),
        pushed_at: new Date('2020-01-01'),
        updated_at: new Date('2020-01-01'),
    };

    void it('should convert a repository to an obligation result', () => {
        const result = repoToObligationResult(repo, []);
        const expectedResult = {
            resource: 'some/repo',
            reason: 'Repository does not have topics indicating production status. Topics: ',
            url: 'https://github.com/some/repo',
            contacts: { slugs: [] },
        };
        assert.deepStrictEqual(result, expectedResult);
    });

    void it('should include topics in the reason', () => {
        const repoWithTopics = { ...repo, topics: ['topic1', 'topic2'] };
        const result = repoToObligationResult(repoWithTopics, []);
        assert.strictEqual(result.reason, 'Repository does not have topics indicating production status. Topics: topic1, topic2');
    });

    void it('should include contacts when owners are provided', () => {
        const owners: view_repo_ownership[] = [
            {
                archived: false,
                role_name: 'owner',
                github_team_id: BigInt(1),
                github_team_name: 'Team One',
                github_team_slug: 'team1',
                short_repo_name: 'repo',
                full_repo_name: 'some/repo',
                galaxies_team: null,
                team_contact_email: null,
            },
            {
                archived: false,
                role_name: 'owner',
                github_team_id: BigInt(2),
                github_team_name: 'Team Two',
                github_team_slug: 'team2',
                short_repo_name: 'repo',
                full_repo_name: 'some/repo',
                galaxies_team: null,
                team_contact_email: null,
            },
            {
                archived: false,
                role_name: 'owner',
                github_team_id: BigInt(3),
                github_team_name: 'Team Three',
                github_team_slug: 'team3',
                short_repo_name: 'other-repo',
                full_repo_name: 'some/other-repo',
                galaxies_team: null,
                team_contact_email: null,
            },
        ];
        const result = repoToObligationResult(repo, owners);

        assert.deepStrictEqual(result.contacts!, { slugs: ['team1', 'team2'] });
    })
});