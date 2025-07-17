import  assert from 'assert';
import { describe, it } from 'node:test';
import type { SecurityHubFinding } from 'common/src/types';
import { fsbpFindingsToObligatronResults } from './aws-vulnerabilities';

void describe('The dependency vulnerabilities obligation', () => {
	const resource1 = {
		Id: 'arn:service:1',
		Tags: { Stack: 'myStack' },
		Region: 'some-region',
		Type: 'some-type',
	};

	const resource2 = {
		...resource1,
		Id: 'arn:service:2',
	};

	const oneResourceFinding: SecurityHubFinding = {
		resources: [resource1],
		title: 'title',
		aws_account_name: 'accountName',
		remediation: { Recommendation: { Url: 'url' } },
		severity: { Label: 'HIGH', Normalized: 75 },
		aws_account_id: '0123456',
		first_observed_at: new Date('2020-01-01'),
		product_fields: { ControlId: 'S.1' },
		workflow: { Status: 'NEW' },
	};

	const twoResourceFinding: SecurityHubFinding = {
		...oneResourceFinding,
		resources: [resource1, resource2],
	};

	void it('should return a result in the expected format', () => {
		const actual = fsbpFindingsToObligatronResults([oneResourceFinding]);

		const expected = {
			contacts: {
				App: undefined,
				Stack: 'myStack',
				Stage: undefined,
				aws_account_id: '0123456',
			},
			reason: 'The following AWS FSBP controls are failing: S.1',
			resource: 'arn:service:1',
			url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html',
		};

		assert.deepStrictEqual(actual, [expected]);
	});

	void it('should return multiple results if two resources are referenced in the same finding', () => {
		const actual = fsbpFindingsToObligatronResults([twoResourceFinding]);
		assert.strictEqual(actual.length, 2);
	});

	void it('should list multiple control IDs in one finding if the same resource has failed two controls', () => {
		const extraFinding = {
			...oneResourceFinding,
			product_fields: { ControlId: 'S.2', StandardsArn: 'arn:1' },
		};

		const actual = fsbpFindingsToObligatronResults([
			oneResourceFinding,
			extraFinding,
		])[0]?.reason;

		assert.ok(actual?.includes('S.1'));
		assert.ok(actual?.includes('S.2'));
	});
	void it('should handle a resource with no tags', () => {
		const finding = {
			...oneResourceFinding,
			resources: [{ ...resource1, Tags: {} }],
		};

		const actual = fsbpFindingsToObligatronResults([finding]);
		const contacts = actual[0]?.contacts;

		assert.deepStrictEqual(contacts, {
			aws_account_id: '0123456',
			App: undefined,
			Stack: undefined,
			Stage: undefined,
		});
	});
});
