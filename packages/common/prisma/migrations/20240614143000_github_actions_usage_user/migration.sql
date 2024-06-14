DO
$do$
    BEGIN
        -- Create the `github_actions_usage` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'github_actions_usage') THEN
            CREATE USER github_actions_usage WITH LOGIN;
        END IF;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (select * from pg_roles where rolname='rds_iam') THEN
            GRANT rds_iam TO github_actions_usage;
        END IF;

        GRANT USAGE ON SCHEMA public TO github_actions_usage;
        GRANT SELECT ON public.github_workflows TO github_actions_usage;
        GRANT SELECT ON public.github_repositories TO github_actions_usage;

        -- The github_actions_usage user owns this table, so can do full CRUD operations
        GRANT ALL ON public.guardian_github_actions_usage TO github_actions_usage;
    END
$do$;
