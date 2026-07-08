-- makes cloudbuster consistent with other DB users in 20240709104714_user_permissions
BEGIN TRANSACTION;
    -- Grant read access to all current tables, and views
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO cloudbuster;

    -- Grant read access to all future tables, and views
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cloudbuster;
COMMIT TRANSACTION;
