# Updating CloudQuery

To update the version of CloudQuery, and its plugins:

1. Edit the [`.env` file at the root of the repository](../.env)
2. Check the tables being collected are still available by running the `diff` script:

   ```bash
   npm -w cloudquery-tables run diff
   ```

   If any tables are no longer available, remove them as per the instructions in [the CloudQuery tables README](../packages/cloudquery-tables/README.md).
3. [Run CloudQuery locally](../packages/dev-environment/README.md) to ensure it works
4. Update the CDK snapshot tests: 
   
   ```bash
   npm -w cdk test -- -u
   ```
   
5. Raise a PR
