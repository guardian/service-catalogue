DO
$do$
  BEGIN
    -- fixup for 20260415162625_devreadonly_user: that granted default read privileges to devreadonly from the 'cloudquery' user,
    -- but that user appears to have been removed and not used in creation of new tables. Migrations and cloudquery jobs both connect
    -- using the 'postgres' user

    -- regrant select to all current tables (to include cq_state_* tables)
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO devreadonly;
    -- grant select to all future tables created by the postgres user (which is also running this migration, so no need to switch user for this statement)
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO devreadonly;
  END
$do$;
