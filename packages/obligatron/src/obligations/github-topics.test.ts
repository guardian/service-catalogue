import assert from 'assert';
import { describe, it } from 'node:test';
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
        const result = repoToObligationResult(repo);
        const expectedResult = {
            resource: 'some/repo',
            reason: 'Repository does not have topics indicating production status: ',
            url: 'https://github.com/some/repo',
            contacts: undefined,
        };
        assert.deepStrictEqual(result, expectedResult);
    });

    void it('should include topics in the reason', () => {
        const repoWithTopics = { ...repo, topics: ['topic1', 'topic2'] };
        const result = repoToObligationResult(repoWithTopics);
        assert.strictEqual(result.reason, 'Repository does not have topics indicating production status: topic1, topic2');
    });
});