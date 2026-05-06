DO
$do$
    BEGIN
        -- Create the `devreadonly` user if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'devreadonly') THEN
            CREATE USER devreadonly;
        END IF;

        GRANT USAGE ON SCHEMA public TO devreadonly;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO devreadonly;

        -- Grant read access to all future tables created by the cloudquery user
        IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE  rolname = 'cloudquery') THEN
            SET ROLE cloudquery;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO devreadonly;
            RESET ROLE;
        END IF;
    END
$do$;
