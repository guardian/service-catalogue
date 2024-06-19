DO
$do$
    BEGIN
        -- Create the `obligatron` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'obligatron') THEN
            CREATE USER obligatron WITH LOGIN;
        END IF;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (select * from pg_roles where rolname='rds_iam') THEN
            GRANT rds_iam TO obligatron;
        END IF;

        GRANT USAGE ON SCHEMA public TO obligatron;
        GRANT SELECT ON public.aws_securityhub_findings TO obligatron;

        -- The obligatron user owns this table, so can do full CRUD operations
        GRANT ALL ON public.obligatron_results TO obligatron;
    END
$do$;
