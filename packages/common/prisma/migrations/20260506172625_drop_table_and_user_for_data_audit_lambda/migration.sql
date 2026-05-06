-- Remove table and user for data audit lambda
BEGIN TRANSACTION;

DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dataaudit') THEN
            REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM dataaudit;
            REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM dataaudit;
            REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM dataaudit;
            REVOKE ALL PRIVILEGES ON SCHEMA public FROM dataaudit;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM dataaudit;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM dataaudit;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM dataaudit;
            DROP USER IF EXISTS dataaudit;
        END IF;
    END
$$;

  DROP TABLE IF EXISTS "audit_results";

COMMIT TRANSACTION;
