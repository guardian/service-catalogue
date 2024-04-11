## Cloudbuster

Yes, it is a Kate Bush reference.

### What does it do?

The cloudbuster evaluates AWS FSBP violations, collected via CloudQuery, and sends alerts to the relevant teams.

### Why?

Security best practice in the cloud is constantly evolving, and it's difficult to keep up. By using a framework like FSBP, we can ensure that we are largely following best practices, and teams have less security work to worry about.

### How do I run it?

Retrieve deployTools credentials from Janus. Run: `npm run start -w dev-environment` to set up a local CloudQuery DB.

Wait a minute or two for the DB sync to complete, then run: `npm run start -w cloudbuster`
