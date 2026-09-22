## Cloudbuster

Yes, it is a [Kate Bush reference](https://www.youtube.com/watch?v=pllRW9wETzw).

### What does it do?

Cloudbuster does two things

1. Evaluates AWS [FSBP](https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html) violations, collected from our Cloudquery-powered postgres DB, and sends alerts to the relevant teams.
2. Makes sure that breakglass users in AWS have MFA set up, and are tagged with a google username.

FSBP messages are sent daily for critical alerts, and on Tuesdays for high-severity alerts. We send alerts for messages less than 45 days old. Breakglass alerts do not have a severity, and are sent every Tuesday.

Developers should not invoke Cloudbuster PROD outside of its schedule without a good reason.

When running Cloudbuster outside of PROD, messages are sent to the Anghammarad test channel to avoid teams receiving test alerts.

Additionally, there is an enableMessaging flag set in [config.ts](./src/config.ts) that can be used to disable messaging completely.

### Why?

1. Security best practice in the cloud is constantly evolving, and it's difficult to keep up. By using a framework like FSBP, we can ensure that we are largely following best practices, and teams have less security work to worry about.
2. Breakglass accounts are used during outages and incidents. It's important that they are set up in a secure and accountable way.

### How do I run it?

- Retrieve the `Run Service Catalogue workloads locally` developer policy from Janus
- Run: `npm run start -w dev-environment; ` to set up a local CloudQuery DB
- Run: `npm run start -w cloudbuster`
