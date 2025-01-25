DO
$do$
    BEGIN
        DROP TABLE IF EXISTS cloudquery_plugin_usage;

        CREATE TABLE cloudquery_plugin_usage (
            timestamp TIMESTAMP(6) NOT NULL
            , name TEXT NOT NULL
            , metric TEXT NOT NULL
            , value INTEGER NOT NULL
        );

        CREATE UNIQUE INDEX cloudquery_plugin_usage_key ON cloudquery_plugin_usage(
            timestamp
            , name
            , metric
        );

        -- Create the `cloudquery_usage` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'cloudquery_usage') THEN
            CREATE USER cloudquery_usage WITH LOGIN;
        END IF;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (SELECT * FROM pg_roles WHERE rolname='rds_iam') THEN
            GRANT rds_iam TO cloudquery_usage;
        END IF;

        GRANT USAGE ON SCHEMA public TO cloudquery_usage;
        GRANT SELECT ON public.github_workflows TO cloudquery_usage;
        GRANT SELECT ON public.github_repositories TO cloudquery_usage;

        -- The cloudquery_usage user owns this table, so can do full CRUD operations
        GRANT ALL ON public.cloudquery_plugin_usage TO cloudquery_usage;
    END
$do$;
