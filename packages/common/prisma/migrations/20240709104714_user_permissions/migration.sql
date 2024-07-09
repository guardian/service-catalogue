-- Grant read access to all current tables, and views
GRANT SELECT ON ALL TABLES IN SCHEMA public TO refresh_materialized_view;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO repocop;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dataaudit;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO github_actions_usage;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO obligatron;

-- Grant read access to all future tables, and views
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO refresh_materialized_view;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO repocop;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO dataaudit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO github_actions_usage;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO obligatron;
