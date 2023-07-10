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

## Credentials
This app uses IAM authentication to access RDS. 
A dedicated user has been created for it, with access scoped to the tables it needs to read from.

```sql
CREATE USER github_recently_updated;
GRANT rds_iam TO github_recently_updated;

GRANT USAGE ON SCHEMA public TO github_recently_updated;
GRANT SELECT ON public.github_repositories TO github_recently_updated;
```

[^1]: The query will run at the same cadence that the `github_repositories` table is updated. Currently, once a day. 
