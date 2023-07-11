# GitHub recently updated
Our default CloudQuery configuration is to collect data for all repositories in the GitHub organisation.

There are some cases where this leads to a long task execution. 
For example, the [`github_repository_branches`](https://www.cloudquery.io/docs/plugins/sources/github/tables/github_repository_branches) table 
will collect data for all branches, in all repositories. That's a lot of data!

This app will execute the following SQL query, and store the result in AWS for use in CloudQuery tasks:

```sql
select      full_name
            , pushed_at
            , updated_at
from        github_repositories
where       greatest(pushed_at, updated_at) > NOW() - INTERVAL '1 days';
```

This will return a list of repositories that have been updated in the last 24 hours[^1], a subset of all repositories in the organisation.
This list can then be used in CloudQuery tasks to limit the scope of data collection.

## Database authentication
When running in AWS Lambda, the app uses IAM authentication to access RDS. 
A dedicated user has been created for it, with access scoped to the tables it needs to read from.

```sql
CREATE USER github_recently_updated;
GRANT rds_iam TO github_recently_updated;

GRANT USAGE ON SCHEMA public TO github_recently_updated;
GRANT SELECT ON public.github_repositories TO github_recently_updated;
```

## Running locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. (optional) Customise the configuration in [`.env`](.env)
3. Run the app: 
   ```bash
   npm start
   ```

### Using IAM authentication locally
If you want to use IAM authentication locally with the RDS database, do the following:
1. Obtain AWS credentials for the `deployTools` account from Janus
2. Connect to the VPN (as the database is not publicly accessible)
3. Update the configuration in [`.env`](.env):
   1. Set `DATABASE_HOST` to the hostname of the RDS instance
   2. Set `DATABASE_USER` to `github_recently_updated`
   3. Set `DATABASE_IAM_AUTH` to `true`
4. Download the CA certificate for the RDS instance. See [AWS's docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html) for more information.

   ```bash
   wget https://truststore.pki.rds.amazonaws.com/eu-west-1/eu-west-1-bundle.pem -O eu-west-1-bundle.pem
   ```

5. Set [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile), and run the app:
   ```bash
   NODE_EXTRA_CA_CERTS=eu-west-1-bundle.pem npm start
   ```

   `NODE_EXTRA_CA_CERTS` cannot be set dynamically; it must be set before the Node process starts.

[^1]: The query will run at the same cadence that the `github_repositories` table is updated. Currently, once a day. 
