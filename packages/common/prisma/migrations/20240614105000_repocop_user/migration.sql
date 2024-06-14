DO
$do$
    BEGIN
        -- Create the `repocop` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'repocop') THEN
            CREATE USER repocop WITH LOGIN;
        END IF;

        -- Allow repocop to read all tables in the public schema
        -- TODO should we limit permissions to exactly the tables/views that repocop uses, for POLP?
        GRANT USAGE ON SCHEMA public to repocop;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO repocop;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (select * from pg_roles where rolname='rds_iam') THEN
            GRANT rds_iam TO repocop;
        END IF;

        -- These tables are created in a previous migration.
        -- The repocop user owns these tables, so can do full CRUD operations
        GRANT ALL ON public.repocop_github_repository_rules TO repocop;
        GRANT ALL ON public.repocop_vulnerabilities TO repocop;
    END
$do$;

