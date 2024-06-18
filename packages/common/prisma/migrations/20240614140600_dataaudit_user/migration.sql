DO
$do$
    BEGIN
        -- Create the `dataaudit` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'dataaudit') THEN
            CREATE USER dataaudit WITH LOGIN;
        END IF;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (select * from pg_roles where rolname='rds_iam') THEN
            GRANT rds_iam TO dataaudit;
        END IF;

        GRANT USAGE ON SCHEMA public TO dataaudit;
        GRANT SELECT ON public.aws_s3_buckets TO dataaudit;
        GRANT SELECT ON public.aws_lambda_functions TO dataaudit;

        -- These tables...
        GRANT SELECT ON public.aws_organizations_accounts TO dataaudit;
        GRANT SELECT ON public.aws_organizations_account_parents TO dataaudit;
        GRANT SELECT ON public.aws_organizations_organizational_units TO dataaudit;

        -- ...are used in this view
        GRANT SELECT ON public.aws_accounts TO dataaudit;

        -- The dataaudit user owns this table, so can do full CRUD operations
        GRANT ALL ON public.audit_results TO dataaudit;
    END
$do$;
