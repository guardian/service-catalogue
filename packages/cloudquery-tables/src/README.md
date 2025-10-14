# CloudQuery tables
This directory lists all tables collected with CloudQuery.
We do not collect tables by [wildcard matching](https://docs.cloudquery.io/docs/advanced/performance-tuning#use-wildcard-matching) 
to avoid automatically collecting any new tables introduced in a plugin update as this could dramatically increase our usage[^1].

## Adding a new table
To start collecting a new table:
1. Ensure the table is available in the version (see [`.env`](../../../../../.env)) of the CloudQuery plugin used
2. Add the table to [`index.ts`](./index.ts)
3. Update or create a task to collect the table

> [!NOTE]
> There are unit tests checking only the tables listed in [`index.ts`](./index.ts) are collected.

## Removing a table
Before removing a table, ensure it is not used by any dashboards or other processes.

To stop collecting a table:
1. Remove the table from [`index.ts`](./index.ts)
2. Remove the table from the task that collected it
3. Add a database migration to drop the table from the database

[^1]: Per our contract, we have a finite number of rows that can be synced each month.