import {
	fsbpFindingsToObligatronResults,
	type SecurityHubFinding,
} from './aws-vulnerabilities';

describe('The dependency vulnerabilities obligation', () => {
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
		severity: { Label: 'HIGH', Normalized: 75 },
		aws_account_id: '0123456',
		first_observed_at: new Date('2020-01-01'),
		product_fields: { ControlId: 'S.1', StandardsArn: 'arn:1' },
	};

	const twoResourceFinding: SecurityHubFinding = {
		...oneResourceFinding,
		resources: [resource1, resource2],
	};

	it('should return a result in the expected format', () => {
		const actual = fsbpFindingsToObligatronResults([oneResourceFinding]);
		console.log(actual);

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

		expect(actual).toEqual([expected]);
	});

	it('should return multiple results if two resources are referenced in the same finding', () => {
		const actual = fsbpFindingsToObligatronResults([twoResourceFinding]);
		console.log(actual);

		expect(actual.length).toEqual(2);
	});

	it('should list multiple control IDs in one finding if the same resource has failed two controls', () => {
		const extraFinding = {
			...oneResourceFinding,
			product_fields: { ControlId: 'S.2', StandardsArn: 'arn:1' },
		};

		const actual = fsbpFindingsToObligatronResults([
			oneResourceFinding,
			extraFinding,
		])[0]?.reason;
		console.log(actual);

		expect(actual).toContain('S.1');
		expect(actual).toContain('S.2');
	});
});