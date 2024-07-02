DO
$do$
    BEGIN
        -- This user is used by the refresh-materialized-view lambda
        -- Create the `refresh_materialized_view` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'refresh_materialized_view') THEN
            CREATE USER refresh_materialized_view WITH LOGIN;
        END IF;


        GRANT USAGE ON SCHEMA public to refresh_materialized_view;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO refresh_materialized_view;

        -- The rds_iam role is created by the RDS IAM extension, which is not available in DEV
        IF EXISTS (select * from pg_roles where rolname='rds_iam') THEN
            GRANT rds_iam TO refresh_materialized_view;
        END IF;

        /*
         Only the owner of a materialized view can refresh it, else the following error is thrown:

           > ERROR: must be owner of materialized view aws_resources

         The current owner is the root user.
         Change owner to the one used by the refresh-materialized-view lambda.
         */
        ALTER MATERIALIZED VIEW aws_resources OWNER TO refresh_materialized_view;
    END
$do$;
