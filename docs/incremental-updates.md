# Incremental Updates

CloudQuery has two methods of synchronising data: `full` and `incremental`. Both types may be used in a single job. A `full` sync captures the full set of data on each run; an `incremental` sync only fetches data that have changed since the last run. Further details may be found in the CloudQuery Docs:

- [Syncs](https://www.cloudquery.io/docs/cli/core-concepts/syncs)
- [Managing Incremental Tables](https://www.cloudquery.io/docs/cli/advanced/managing-incremental-tables)

Not all tables support incremental updating - please check the tables listed for each integration in the CloudQuery Docs to see which are included for incremental, filtering the table list by `Show only incremental`.

- [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables)
- [GitHub](https://www.cloudquery.io/hub/plugins/source/cloudquery/github/latest/tables)

Incremental updates are being enabled on the tables that support them. This should reduce our monthly rowcount and make it easier to stay within our licenced limit (currently 150 million per month - [Paid Usage Monitor](https://metrics.gutools.co.uk/d/debncbyh7b37ke/cloudquery-paid-usage))

Enabling incremental updates in the CDK config is straightforward: the syncmode is the final parameter on a CloudQuery Source, and should be set to `incremental`. The overwrite mode has been left as `overwrite-delete-stale`.

CloudQuery performs incremental syncs using a cursor - usually a date field. The cursors are stored in separate tables (`cq_state_{platform}`) which are created by CloudQuery, not through a Prisma migration. It guarantees that it will not miss any data, so it looks as though it's doing 'greater than or equal to' searches, given that repeated incremental syncs always seem to pull in the same amount of data.

There is a [dashboard that tracks incremental syncs](https://metrics.gutools.co.uk/d/me4tfqf/incremental-update-monitor?orgId=1&from=now-30d&to=now&timezone=browser&var-Table=$__all). This tracks the number of rows ingested, and the duration of the ingest, by looking at data from the `cloudquery_sync_summaries` using [jsonb_each](https://www.postgresql.org/docs/9.5/functions-json.html#FUNCTIONS-JSON-PROCESSING-TABLE) to pull data out of the relevant JSON objects:

```sql
select  css._cq_sync_time, css._cq_source_name,
        css.sync_id,
        st.key "table_name",
        st.value::int "row_count"
from  cloudquery_sync_summaries css ,
        jsonb_each(css.resources_per_table ) st,
        jsonb_each(css.durations_per_table_ms) dt
where st.key = '${Table:value}' order by 1
```

It also shows the distribution of rows to sync time, which is taken from the ingested data. Whereas a full sync has the same sync time for all records, in an incremental sync only modified records are updated and so there should be a set of sync times.

```sql
with s as (
        select
            -- only want the date, so that we can group it
            left(aif._cq_sync_time::text, 10) "_cq_sync_time",
            count(1)
        from ${Table:value} aif
        -- the rollup totals the count
        group by rollup(1) order by 1
)
-- the coalesce is to provide a label for the total
-- rather than null (which isn't obvious!)
select coalesce(_cq_sync_time, 'Total') "sync time",
       "count"
    from s
```

The dashboard has a variable called `Table` which provides the list of tables on which incremental syncs are enabled; the value of the selected table is used in the `where` clause (the lack of escaping of a variable is a known Grafana issue); and all the selected tables are shown by means of a row that repeats on `Table`.

There appears to be no way to determine the list of incrementally syncing tables from the database directly - although it may be possible to assemble something from the cursor tables, the structure of the cursor is different at least for each platform - so at the moment the variable is a hard-coded list of tables and their display names.
