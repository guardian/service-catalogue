-- Cloudquery cant update the schema of tables referenced by views. 
-- As this view references any Cloudquery table containing an ARN column It can make Cloudquery behave strangely.
-- This migration replaces this view with a function which doesn't have the same restriction.
DROP FUNCTION IF EXISTS aws_resources;

-- Check if a table has a given column
CREATE OR REPLACE FUNCTION table_has_column(table_to_check text, column_to_check text) RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE column_name = column_to_check AND table_name = table_to_check)
$$ LANGUAGE SQL;
SET search_path FROM CURRENT;

-- Extract partition from ARN
-- arn:PARTITION:service:region:account-id:resource-id
CREATE OR REPLACE  FUNCTION arn_to_partition(arn text) RETURNS text AS $$
BEGIN
    RETURN SPLIT_PART(arn, ':', 2);
END
$$ LANGUAGE plpgsql;
SET search_path FROM CURRENT;

-- Extract service from ARN
-- arn:partition:SERVICE:region:account-id:resource-id
CREATE OR REPLACE FUNCTION arn_to_service(arn text) RETURNS text AS $$
BEGIN
    RETURN SPLIT_PART(arn, ':', 3);
END
$$ LANGUAGE plpgsql;
SET search_path FROM CURRENT;

-- Extract region from ARN
-- arn:partition:service:REGION:account-id:resource-id
CREATE OR REPLACE FUNCTION arn_to_region(arn text) RETURNS text AS $$
BEGIN
    RETURN SPLIT_PART(arn, ':', 4);
END
$$ LANGUAGE plpgsql;
SET search_path FROM CURRENT;


-- Extract account ID from ARN
-- arn:partition:service:region:ACCOUNT-ID:resource-id
CREATE OR REPLACE FUNCTION arn_to_account_id(arn text) RETURNS text AS $$
BEGIN
    RETURN SPLIT_PART(arn, ':', 5);
END
$$ LANGUAGE plpgsql;
SET search_path FROM CURRENT;

-- Extract resource type from ARN
-- arn:partition:service:region:account-id:RESOURCE-TYPE/resource-id OR
-- arn:partition:service:region:account-id:RESOURCE-TYPE:resource-id
CREATE OR REPLACE FUNCTION arn_to_resource_type(arn text) RETURNS text AS $$
BEGIN
    RETURN CASE WHEN SPLIT_PART(SPLIT_PART(ARN, ':', 6), '/', 2) = '' AND SPLIT_PART(arn, ':', 7) = '' THEN NULL
                ELSE SPLIT_PART(SPLIT_PART(arn, ':', 6), '/', 1) END;
END
$$ LANGUAGE plpgsql;
SET search_path FROM CURRENT;

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
        -- Find all base tables (no views allowed) that look like aws_*
        SELECT DISTINCT t.table_schema, t.table_name
        FROM information_schema.tables t
        WHERE t.table_type = 'BASE TABLE'
          AND t.table_name LIKE 'aws_%'
          AND EXISTS (
            SELECT 1
            FROM information_schema.columns c
            WHERE c.table_schema = t.table_schema
              AND c.table_name = t.table_name
              AND c.column_name = 'arn'
        )
        LOOP
            -- Check if table has an account_id column, or default to NULL
            account_id := CASE WHEN public.table_has_column(cloudquery_table.table_name::text, 'account_id') THEN 'account_id' ELSE 'NULL' END;
            -- Check if table has an owner_id column, or default to NULL
            owner_id := CASE WHEN public.table_has_column(cloudquery_table.table_name::text, 'owner_id') THEN 'owner_id' ELSE 'NULL' END;
            -- Check if table has an request_account_id column, or default to NULL
            request_account_id := CASE WHEN public.table_has_column(cloudquery_table.table_name::text, 'request_account_id') THEN 'request_account_id' ELSE 'NULL' END;
            -- Check if table has an region column, or default to NULL
            region := CASE WHEN public.table_has_column(cloudquery_table.table_name::text, 'region') THEN 'region' ELSE 'NULL' END;
            -- Check if table has an tags column, or default to an empty object
            taggable := CASE WHEN public.table_has_column(cloudquery_table.table_name::text, 'tags') THEN 'true' ELSE 'false' END;
            tags := CASE WHEN taggable = 'true' THEN 'tags' ELSE '''{}''::jsonb' END;

            -- Fetch rows of table and append to function output
            RETURN QUERY EXECUTE FORMAT(E'
                    SELECT
                        %L as cq_table,
                        public.arn_to_partition(arn) as partition,
                        public.arn_to_service(arn) as service,
                        COALESCE(%s, public.arn_to_region(arn)) AS region,
                        COALESCE(%s, %s, %s, public.arn_to_account_id(arn)) AS account_id,
                        public.arn_to_resource_type(arn) as resource_type,
                        arn,
                        %s as taggable,
                        %s as tags
                    FROM %I.%I',
                                        cloudquery_table.table_name, region, account_id, owner_id, request_account_id,
                                        taggable, tags, cloudquery_table.table_schema, cloudquery_table.table_name);
        END LOOP;
END
$$ LANGUAGE plpgsql;
SET search_path FROM CURRENT;

DROP INDEX IF EXISTS idx_aws_resources_account_id;
DROP INDEX IF EXISTS idx_aws_resources_arn;
DROP VIEW IF EXISTS aws_resources;
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
FROM public.aws_resources_raw()
GROUP BY 
    partition,
    service,
    region,
    account_id,
    resource_type,
    arn;
SET search_path FROM CURRENT;

CREATE INDEX idx_aws_resources_account_id ON aws_resources (account_id);
CREATE INDEX idx_aws_resources_arn ON aws_resources (arn);

CREATE PROCEDURE __TEST()
AS
$$
DECLARE
    arn text = 'arn:aws:iam:eu-west-1:123456789012:user/johndoe';
BEGIN
    CASE WHEN public.arn_to_partition(arn::text) <> 'aws'
    THEN RAISE EXCEPTION 'expected aws, got %', public.arn_to_partition(arn::text);
    ELSE END CASE;

    CASE WHEN public.arn_to_service(arn) <> 'iam'
    THEN RAISE EXCEPTION 'expected iam, got %', public.arn_to_partition(arn::text);
    ELSE END CASE;

    CASE WHEN public.arn_to_region(arn) <> 'eu-west-1'
    THEN RAISE EXCEPTION 'expected eu-west-1, got %', public.arn_to_region(arn);
    ELSE END CASE;

    CASE WHEN public.arn_to_account_id(arn) <> '123456789012'
    THEN RAISE EXCEPTION 'expected 123456789012, got %', public.arn_to_region(arn);
    ELSE END CASE;

    CASE WHEN public.arn_to_resource_type(arn) <> 'user'
    THEN RAISE EXCEPTION 'expected user, got %', public.arn_to_region(arn);
    ELSE END CASE;

    CASE WHEN (SELECT jsonb_aggregate(a) FROM (VALUES ('{"TagA": "ValueA"}'::jsonb), ('{"TagB": "ValueB"}'::jsonb)) data(a)) <> '{"TagA": "ValueA", "TagB": "ValueB"}'
    THEN RAISE EXCEPTION 'expected {"TagA": "ValueA", "TagB": "ValueB"}, got %', (SELECT jsonb_aggregate(a) FROM (VALUES ('{"TagA": "ValueA"}'::jsonb), ('{"TagB": "ValueB"}'::jsonb)) data(a));
    ELSE END CASE;
END
$$ LANGUAGE plpgsql;

-- Run unit tests
CALL __TEST();
DROP PROCEDURE __TEST();