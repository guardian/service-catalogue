import type { Alert } from '../types.js';

//These alerts were copied from the GH API docs https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2022-11-28

export const exampleDependabotAlert: Alert[] = [
	{
		number: 2,
		state: 'dismissed',
		dependency: {
			package: {
				ecosystem: 'pip',
				name: 'django',
			},
			manifest_path: 'path/to/requirements.txt',
			scope: 'runtime',
		},
		security_advisory: {
			ghsa_id: 'GHSA-rf4j-j272-fj86',
			cve_id: 'CVE-2018-6188',
			summary:
				'Django allows remote attackers to obtain potentially sensitive information by leveraging data exposure from the confirm_login_allowed() method, as demonstrated by discovering whether a user account is inactive',
			description:
				'django.contrib.auth.forms.AuthenticationForm in Django 2.0 before 2.0.2, and 1.11.8 and 1.11.9, allows remote attackers to obtain potentially sensitive information by leveraging data exposure from the confirm_login_allowed() method, as demonstrated by discovering whether a user account is inactive.',
			vulnerabilities: [
				{
					package: {
						ecosystem: 'pip',
						name: 'django',
					},
					severity: 'high',
					vulnerable_version_range: '>= 2.0.0, < 2.0.2',
					first_patched_version: {
						identifier: '2.0.2',
					},
				},
				{
					package: {
						ecosystem: 'pip',
						name: 'django',
					},
					severity: 'high',
					vulnerable_version_range: '>= 1.11.8, < 1.11.10',
					first_patched_version: {
						identifier: '1.11.10',
					},
				},
			],
			severity: 'high',
			cvss: {
				vector_string: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
				score: 7.5,
			},
			cwes: [
				{
					cwe_id: 'CWE-200',
					name: 'Exposure of Sensitive Information to an Unauthorized Actor',
				},
			],
			identifiers: [
				{
					type: 'GHSA',
					value: 'GHSA-rf4j-j272-fj86',
				},
				{
					type: 'CVE',
					value: 'CVE-2018-6188',
				},
			],
			references: [
				{
					url: 'https://nvd.nist.gov/vuln/detail/CVE-2018-6188',
				},
				{
					url: 'https://github.com/advisories/GHSA-rf4j-j272-fj86',
				},
				{
					url: 'https://usn.ubuntu.com/3559-1/',
				},
				{
					url: 'http://www.securitytracker.com/id/1040422',
				},
			],
			published_at: '2018-10-03T21:13:54Z',
			updated_at: '2022-04-26T18:35:37Z',
			withdrawn_at: null,
		},
		security_vulnerability: {
			package: {
				ecosystem: 'pip',
				name: 'django',
			},
			severity: 'high',
			vulnerable_version_range: '>= 2.0.0, < 2.0.2',
			first_patched_version: {
				identifier: '2.0.2',
			},
		},
		url: 'https://api.github.com/repos/octo-org/octo-repo/dependabot/alerts/2',
		html_url: 'https://github.com/octo-org/octo-repo/security/dependabot/2',
		created_at: '2022-06-15T07:43:03Z',
		updated_at: '2022-08-23T14:29:47Z',
		dismissed_at: '2022-08-23T14:29:47Z',
		dismissed_by: {
			login: 'octocat',
			id: 1,
			node_id: 'MDQ6VXNlcjE=',
			avatar_url: 'https://github.com/images/error/octocat_happy.gif',
			gravatar_id: '',
			url: 'https://api.github.com/users/octocat',
			html_url: 'https://github.com/octocat',
			followers_url: 'https://api.github.com/users/octocat/followers',
			following_url:
				'https://api.github.com/users/octocat/following{/other_user}',
			gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
			starred_url:
				'https://api.github.com/users/octocat/starred{/owner}{/repo}',
			subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
			organizations_url: 'https://api.github.com/users/octocat/orgs',
			repos_url: 'https://api.github.com/users/octocat/repos',
			events_url: 'https://api.github.com/users/octocat/events{/privacy}',
			received_events_url:
				'https://api.github.com/users/octocat/received_events',
			type: 'User',
			site_admin: false,
		},
		dismissed_reason: 'tolerable_risk',
		dismissed_comment: 'This alert is accurate but we use a sanitizer.',
		fixed_at: null,
	},
	{
		number: 1,
		state: 'open',
		dependency: {
			package: {
				ecosystem: 'pip',
				name: 'ansible',
			},
			manifest_path: 'path/to/requirements.txt',
			scope: 'runtime',
		},
		security_advisory: {
			ghsa_id: 'GHSA-8f4m-hccc-8qph',
			cve_id: 'CVE-2021-20191',
			summary: 'Insertion of Sensitive Information into Log File in ansible',
			description:
				'A flaw was found in ansible. Credentials, such as secrets, are being disclosed in console log by default and not protected by no_log feature when using those modules. An attacker can take advantage of this information to steal those credentials. The highest threat from this vulnerability is to data confidentiality.',
			vulnerabilities: [
				{
					package: {
						ecosystem: 'pip',
						name: 'ansible',
					},
					severity: 'medium',
					vulnerable_version_range: '>= 2.9.0, < 2.9.18',
					first_patched_version: {
						identifier: '2.9.18',
					},
				},
				{
					package: {
						ecosystem: 'pip',
						name: 'ansible',
					},
					severity: 'medium',
					vulnerable_version_range: '< 2.8.19',
					first_patched_version: {
						identifier: '2.8.19',
					},
				},
				{
					package: {
						ecosystem: 'pip',
						name: 'ansible',
					},
					severity: 'medium',
					vulnerable_version_range: '>= 2.10.0, < 2.10.7',
					first_patched_version: {
						identifier: '2.10.7',
					},
				},
			],
			severity: 'medium',
			cvss: {
				vector_string: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N',
				score: 5.5,
			},
			cwes: [
				{
					cwe_id: 'CWE-532',
					name: 'Insertion of Sensitive Information into Log File',
				},
			],
			identifiers: [
				{
					type: 'GHSA',
					value: 'GHSA-8f4m-hccc-8qph',
				},
				{
					type: 'CVE',
					value: 'CVE-2021-20191',
				},
			],
			references: [
				{
					url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-20191',
				},
				{
					url: 'https://access.redhat.com/security/cve/cve-2021-20191',
				},
				{
					url: 'https://bugzilla.redhat.com/show_bug.cgi?id=1916813',
				},
			],
			published_at: '2021-06-01T17:38:00Z',
			updated_at: '2021-08-12T23:06:00Z',
			withdrawn_at: null,
		},
		security_vulnerability: {
			package: {
				ecosystem: 'pip',
				name: 'ansible',
			},
			severity: 'medium',
			vulnerable_version_range: '< 2.8.19',
			first_patched_version: {
				identifier: '2.8.19',
			},
		},
		url: 'https://api.github.com/repos/octo-org/hello-world/dependabot/alerts/1',
		html_url: 'https://github.com/octo-org/hello-world/security/dependabot/1',
		created_at: '2022-06-14T15:21:52Z',
		updated_at: '2022-06-14T15:21:52Z',
		dismissed_at: null,
		dismissed_by: null,
		dismissed_reason: null,
		dismissed_comment: null,
		fixed_at: null,
	},
];
