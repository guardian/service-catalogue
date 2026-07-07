import assert from 'assert';
import { describe, it } from 'node:test';
import type {
    aws_accounts,
    aws_iam_credential_reports,
    aws_iam_users,
} from 'common/prisma-client/client.js';
import { BreakglassUser, createBreakglassUserReport } from './breakglass.js';

function credentialReport(
    overrides: Partial<aws_iam_credential_reports>,
): aws_iam_credential_reports {
    return {
        cq_sync_time: null,
        cq_source_name: null,
        cq_id: 'cq-id',
        cq_parent_id: null,
        arn: 'arn:aws:iam::123456789012:user/alice',
        user_creation_time: null,
        password_last_changed: null,
        password_next_rotation: null,
        access_key_1_last_rotated: null,
        access_key_2_last_rotated: null,
        cert_1_last_rotated: null,
        cert_2_last_rotated: null,
        access_key_1_last_used_date: null,
        access_key_2_last_used_date: null,
        password_last_used: null,
        password_enabled: 'true',
        user: 'alice',
        password_status: null,
        mfa_active: true,
        access_key1_active: null,
        access_key2_active: null,
        cert1_active: null,
        cert2_active: null,
        access_key1_last_used_region: null,
        access_key1_last_used_service: null,
        access_key2_last_used_region: null,
        access_key2_last_used_service: null,
        account_id: '123456789012',
        ...overrides,
    };
}

function awsAccount(overrides: Partial<aws_accounts>): aws_accounts {
    return {
        id: '123456789012',
        name: 'my-account',
        email: 'account@example.com',
        status: 'ACTIVE',
        joined_timestamp: new Date('2020-01-01'),
        ancestors: [],
        is_product_and_engineering: true,
        ...overrides,
    };
}

function iamUser(overrides: Partial<aws_iam_users>): aws_iam_users {
    return {
        cq_sync_time: null,
        cq_source_name: null,
        cq_id: 'cq-id',
        cq_parent_id: null,
        account_id: '123456789012',
        arn: 'arn:aws:iam::123456789012:user/alice',
        tags: { GoogleUsername: 'alice.smith' },
        create_date: null,
        path: null,
        user_id: null,
        user_name: 'alice',
        password_last_used: null,
        permissions_boundary: null,
        ...overrides,
    };
}

void describe('createBreakglassUserReport', () => {
    void it('joins credential reports to accounts and users', () => {
        const report = createBreakglassUserReport(
            [credentialReport({})],
            [awsAccount({})],
            [iamUser({})],
        );

        const expected: BreakglassUser = {
            accountName: 'my-account',
            user: 'alice',
            userUrl: 'https://console.aws.amazon.com/iam/home#/users/alice',
            mfaActive: true,
            hasUsernameTag: true,
        };

        assert.deepStrictEqual(report, [expected]);
    });

    void it('only includes users with passwords', () => {
        const report = createBreakglassUserReport(
            [
                credentialReport({ user: 'alice', password_enabled: 'true' }),
                credentialReport({
                    user: 'bob',
                    arn: 'arn:aws:iam::123456789012:user/bob',
                    password_enabled: 'false',
                }),
            ],
            [awsAccount({})],
            [iamUser({})],
        );

        assert.strictEqual(report.length, 1);
        assert.strictEqual(report[0]?.user, 'alice');
    });

    void it('reports hasUsernameTag as false when no matching user is found', () => {
        const report = createBreakglassUserReport(
            [credentialReport({})],
            [awsAccount({})],
            [],
        );

        const expected: BreakglassUser = {
            accountName: 'my-account',
            user: 'alice',
            userUrl: 'https://console.aws.amazon.com/iam/home#/users/alice',
            mfaActive: true,
            hasUsernameTag: false,
        };

        assert.deepStrictEqual(report, [expected]);
    });

    void it('reports hasUsernameTag as false when the user has no GoogleUsername tag', () => {
        const report = createBreakglassUserReport(
            [credentialReport({})],
            [awsAccount({})],
            [iamUser({ tags: { SomeOtherTag: 'value' } })],
        );

        const expected: BreakglassUser = {
            accountName: 'my-account',
            user: 'alice',
            userUrl: 'https://console.aws.amazon.com/iam/home#/users/alice',
            mfaActive: true,
            hasUsernameTag: false,
        };

        assert.deepStrictEqual(report, [expected]);
    });

    void it('sorts the report by account name', () => {
        const report = createBreakglassUserReport(
            [
                credentialReport({
                    user: 'alice',
                    arn: 'arn:aws:iam::111111111111:user/alice',
                }),
                credentialReport({
                    user: 'bob',
                    arn: 'arn:aws:iam::222222222222:user/bob',
                }),
            ],
            [
                awsAccount({ id: '222222222222', name: 'aardvark-account' }),
                awsAccount({ id: '111111111111', name: 'zebra-account' }),
            ],
            [],
        );

        assert.deepStrictEqual(
            report.map((r) => r.accountName),
            ['aardvark-account', 'zebra-account'],
        );
    });
});
