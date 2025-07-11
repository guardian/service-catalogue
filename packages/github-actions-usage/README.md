# GitHub Actions Usage

This app, deployed as an AWS Lambda, tracks which GitHub Actions are in use across all repositories in the organisation.

## How it works

1. Get all records from the `github_workflows` table
2. For each record returned, parse the `contents` field
   1. If the field is empty, log a message
   2. Use GitHub's [`@actions/workflow-parser`](https://github.com/actions/languageservices/tree/main/workflow-parser) to parse the `contents` field
   3. If validation fails, log a message
3. Extract the `uses` string from the `contents`
4. Save results to database

## Querying the data

The Lambda writes to the [`github_actions_usage` table](../common/prisma/migrations/20240222201635_guardian_github_actions_usage/migration.sql).

The [`view_github_actions` SQL view](../common/prisma/migrations/20240222201635_guardian_github_actions_usage/migration.sql) also exists
to make it easier to query the data.
This view shows the archived status of a repository, the name of the Action being used, and the version.

## Testing

The tests are written with [Node's test runner](https://nodejs.org/api/test.html).
This is in contrast to other packages in this repository which used Jest.
This is because Jest had issues with the `@actions/workflow-parser` package;
Jest was failing with "cannot find module" errors.
