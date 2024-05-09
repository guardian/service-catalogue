-- Update materialized view aws_resources creation to correct ARN taggable column for iam policies

-- Cloudquery can't update the schema of tables referenced by views.
-- As the view aws_resources references any Cloudquery table containing an ARN column it can make Cloudquery behave strangely.
-- This migration replaces this view with a function which doesn't have the same restriction.
-- But will need a cron job to keep the materialized view up to date.

-- Decide if the resource is taggable when taggable column is present
CREATE OR REPLACE FUNCTION is_resource_taggable(arn text, taggable bool) RETURNS boolean AS $$
BEGIN
    RETURN CASE WHEN arn LIKE '%arn:aws:iam::aws:policy%' THEN 'false'
                ELSE taggable END;
END
$$ LANGUAGE plpgsql;

-- Aggregate rows from all AWS Cloudquery tables
CREATE OR REPLACE FUNCTION aws_resources_raw()
    RETURNS TABLE
            (
                cq_table      text,
                partition     text,
                service       text,
                region        text,
                account_id    text,
                resource_type text,
                arn           text,
                taggable      boolean,
                tags          jsonb
            )
AS
$$
DECLARE
    cloudquery_table   record;
    account_id         text;
    request_account_id text;
    owner_id           text;
    region             text;
    tags               text;
    taggable           text;
BEGIN
    FOR cloudquery_table IN
        -- Find all base tables (no views allowed)
        SELECT DISTINCT table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        -- find the intersection of tables that have an ARN column
        INTERSECT
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_name LIKE 'aws_%s'
          and COLUMN_NAME IN ('arn')
        LOOP
            -- Check if table has an account_id column, or default to NULL
            account_id := CASE WHEN table_has_column(cloudquery_table.table_name, 'account_id') THEN 'account_id' ELSE 'NULL' END;
            -- Check if table has an owner_id column, or default to NULL
            owner_id := CASE WHEN table_has_column(cloudquery_table.table_name, 'owner_id') THEN 'owner_id' ELSE 'NULL' END;
            -- Check if table has an request_account_id column, or default to NULL
            request_account_id := CASE WHEN table_has_column(cloudquery_table.table_name, 'request_account_id') THEN 'request_account_id' ELSE 'NULL' END;
            -- Check if table has an region column, or default to NULL
            region := CASE WHEN table_has_column(cloudquery_table.table_name, 'region') THEN 'region' ELSE 'NULL' END;
            -- Check if table has an tags column, or default to an empty object
            taggable := CASE WHEN table_has_column(cloudquery_table.table_name, 'tags') THEN 'true' ELSE 'false' END;
            tags := CASE WHEN taggable = 'true' THEN 'tags' ELSE '''{}''::jsonb' END;

            -- Fetch rows of table and append to function output
            RETURN QUERY EXECUTE FORMAT(E'
                    SELECT
                        %L as cq_table,
                        arn_to_partition(arn) as partition,
                        arn_to_service(arn) as service,
                        COALESCE(%s, arn_to_region(arn)) AS region,
                        COALESCE(%s, %s, %s, arn_to_account_id(arn)) AS account_id,
                        arn_to_resource_type(arn) as resource_type,
                        arn,
                        is_resource_taggable(arn, %s) as taggable,
                        %s as tags
                    FROM %s',
                                        cloudquery_table.table_name, region, account_id, owner_id, request_account_id,
                                        taggable, tags, cloudquery_table.table_name);
        END LOOP;
END
$$ LANGUAGE plpgsql;

-- Create the materialized view aws_resources without data
DROP INDEX IF EXISTS idx_aws_resources_account_id;
DROP INDEX IF EXISTS idx_aws_resources_arn;
DROP MATERIALIZED VIEW IF EXISTS aws_resources;
CREATE MATERIALIZED VIEW aws_resources AS
SELECT
    partition,
    service,
    region,
    account_id,
    resource_type,
    arn,
    bool_or(taggable) as taggable,
    jsonb_aggregate(tags) as tags
FROM aws_resources_raw()
GROUP BY
    partition,
    service,
    region,
    account_id,
    resource_type,
    arn
WITH NO DATA;

CREATE INDEX idx_aws_resources_account_id ON aws_resources (account_id);
CREATE INDEX idx_aws_resources_arn ON aws_resources (arn);