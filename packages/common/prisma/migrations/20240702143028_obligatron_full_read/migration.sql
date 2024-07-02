-- Allow repocop and obligatron read access to all current and future table.

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO repocop;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO obligatron;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO obligatron;