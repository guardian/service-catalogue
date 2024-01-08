# Updating CloudQuery

To update the version of CloudQuery, and its plugins:

1. Edit the [`.env` file at the root of the repository](../.env)
2. [Run CloudQuery locally](../packages/dev-environment/README.md) to ensure it works
3. Update the CDK snapshot tests: `npm test --workspace=cdk -- -u`
4. Raise a PR
