
DO
$do$
    BEGIN
        -- Create the `cloudbuster` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'cloudbuster') THEN
            CREATE USER cloudbuster WITH LOGIN;
        END IF;

        -- Allow cloudbuster to read from all tables and views in the public schema
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO cloudbuster;
        -- Grant read access to all future tables, and views
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cloudbuster;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (select * from pg_roles where rolname='rds_iam') THEN
            GRANT rds_iam TO cloudbuster;
        END IF;

    END
$do$;

