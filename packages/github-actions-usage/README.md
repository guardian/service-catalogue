# GitHub Actions Usage

This app, deployed as an AWS Lambda, tracks which GitHub Actions are in use across all repositories in the organisation.

## How it works
1. Get all records from the `github_workflows` table
2. For each record returned, parse the `contents` field
    1. If the field is empty, log a message
    2. Use [Ajv](https://ajv.js.org/) to validate the `contents` field against a [schema](https://json.schemastore.org/github-workflow.json) published by https://www.schemastore.org/json/
    3. If validation fails, log a message
3. Extract the `uses` string from the `contents`
4. Save results to database

## Querying the data
The Lambda writes to the [`github_actions_usage` table](../common/prisma/migrations/20240222201635_guardian_github_actions_usage/migration.sql).

The [`view_github_actions` SQL view](../common/prisma/migrations/20240222201635_guardian_github_actions_usage/migration.sql) also exists
to make it easier to query the data.
This view shows the archived status of a repository, the name of the Action being used, and the version.

## Updating the schema
The [schema](./src/schema/github-workflow.json) might need updating from time to time.

To do this, run the following, and commit the resulting file:

```bash
cd /path/to/github-actions-usage
wget --output-document src/schema/github-workflow.json https://json.schemastore.org/github-workflow.json
```
