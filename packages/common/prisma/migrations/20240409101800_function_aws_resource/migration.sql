-- Cloudquery cant update the schema of tables referenced by views. 
-- As this view references any Cloudquery table containing an ARN column It can make Cloudquery behave strangely.
-- This migration replaces this view with a function which doesn't have the same restriction.
DROP VIEW view_aws_resources;

-- Custom aggregate function that combines two JSONB objects together. Uses the inbuilt `jsonb_concat` function.
-- Useful for when grouping many rows together that share a JSONB column
CREATE AGGREGATE jsonb_aggregate (jsonb)(
    SFUNC = jsonb_concat,
    STYPE = jsonb
);

-- Aggregate rows from all AWS Cloudquery tables
CREATE FUNCTION aws_resources()
    RETURNS TABLE
            (
                account_id         text,
                request_account_id text,
                region             text,
                partition          text,
                service            text,
                type               text,
                arn                text,
                taggable           boolean,
                tags               jsonb
            )
AS
$$
DECLARE
    cloudquery_table   record;
    str_sql            text = '';
    account_id         text;
    request_account_id text;
    region             text;
    tags               text;
    taggable           text;
BEGIN
    FOR cloudquery_table IN
        -- Find all base tables (no views allowed)
        SELECT DISTINCT table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        -- find the intersection of tables that have an account_id or request_account_id column
        INTERSECT
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_name LIKE 'aws_%s'
          and COLUMN_NAME IN ('account_id', 'request_account_id')
        -- find the intersection of tables that have an arn column
        INTERSECT
        SELECT table_name
        FROM information_schema.columns
        WHERE table_name LIKE 'aws_%s'
          and COLUMN_NAME = 'arn'

        LOOP
            -- Check if table has an account_id column, or default to NULL
            account_id := CASE
                              WHEN EXISTS (SELECT 1
                                           FROM information_schema.columns
                                           WHERE column_name = 'account_id'
                                             AND table_name = cloudquery_table.table_name) THEN 'account_id'
                              ELSE 'NULL' END;
            -- Check if table has an request_account_id column, or default to NULL
            request_account_id := CASE
                                      WHEN EXISTS (SELECT 1
                                                   FROM information_schema.columns
                                                   WHERE column_name = 'request_account_id'
                                                     AND table_name = cloudquery_table.table_name)
                                          THEN 'request_account_id'
                                      ELSE 'NULL' END;
            -- Check if table has an region column, or default to unavailable
            region := CASE
                          WHEN EXISTS (SELECT 1
                                       FROM information_schema.columns
                                       WHERE column_name = 'region'
                                         AND table_name = cloudquery_table.table_name)
                              THEN 'region'
                          ELSE E'\'unavailable\'' END;
            -- Check if table has an tags column, or default to an empty object
            tags := CASE
                        WHEN EXISTS (SELECT 1
                                     FROM information_schema.columns
                                     WHERE column_name = 'tags'
                                       AND table_name = cloudquery_table.table_name)
                            THEN 'tags'
                        ELSE '''{}''::jsonb' END;
            -- Does the table have a tags column
            taggable := CASE
                            WHEN EXISTS (SELECT 1
                                         FROM information_schema.columns
                                         WHERE column_name = 'tags'
                                           AND table_name = cloudquery_table.table_name)
                                THEN 'true'
                            ELSE 'false' END;

            IF NOT (str_sql = ''::TEXT) THEN
                str_sql = str_sql || ' UNION ALL ';
            END IF;

            -- Fetch rows of table and append to function output
            str_sql = str_sql || FORMAT(E'
                    SELECT
                        %L as cq_table,
                        COALESCE(%s, SPLIT_PART(arn, \':\', 5)) AS account_id,
                        COALESCE(%s, %s, SPLIT_PART(arn, \':\', 5)) AS request_account_id,
                        %s AS region,
                        SPLIT_PART(arn, \':\', 2) AS partition,
                        SPLIT_PART(arn, \':\', 3) AS service,
                        CASE
                        WHEN SPLIT_PART(SPLIT_PART(ARN, \':\', 6), \'/\', 2) = \'\' AND SPLIT_PART(arn, \':\', 7) = \'\' THEN NULL
                            ELSE SPLIT_PART(SPLIT_PART(arn, \':\', 6), \'/\', 1)
                        END AS type,
                        arn,
                        %s as taggable,
                        %s as tags
                    FROM %s',
                                        cloudquery_table.table_name, account_id, request_account_id, account_id, region,
                                        taggable, tags, cloudquery_table.table_name);
        END LOOP;

    RETURN QUERY EXECUTE FORMAT(
            E'SELECT account_id,
                     request_account_id,
                     region,
                     partition,
                     service,
                     type,
                     arn,
                     bool_or(taggable) as taggable,
                     jsonb_aggregate(tags) as tags
                FROM (%s) data 
            GROUP BY account_id,
                     request_account_id,
                     region,
                     partition,
                     service,
                     type,
                     arn',
            str_sql);
END
$$ LANGUAGE plpgsql;