# GitHub Data Fetcher

This project contains a scheduled lambda that retrieves data from the GitHub API and saves it in S3.

## Purpose

The GitHub API is subject to rate-limits and authentication requirements that are not useful for 
consuming this data internally. By retrieving and caching certain data about our teams, repositories
and users we can provide a more conveniently accessible data set to other services.

When the lambda runs it will generate 2 files in S3:

- `s3://${BUCKET_NAME}/${ENV}/teams.json`: A list of GitHub teams and the repositories they own.
- `s3://${BUCKET_NAME}/${ENV}/repos.json`: A list of repository and the GitHub teams that own them.

See the data types that get saved in [../common/src/model/github.ts](../common/src/model/github.ts).

*If you modify these data types, please ensure other services which consume them will behave as expected!*

## Local Development

Start with [Local Development at the root](../../README.md#local-development).

You can run the project locally from this directory by running:

```
npm run dev
```