-- Add alert_type column to repocop_vulnerabilities table. This will enable us to differentiate Dependabot malware alerts from vulnerability alerts.

BEGIN;

ALTER TABLE IF EXISTS repocop_vulnerabilities
  ADD COLUMN IF NOT EXISTS alert_type text;

UPDATE repocop_vulnerabilities
SET alert_type = 'general'
WHERE alert_type IS NULL;

ALTER TABLE repocop_vulnerabilities
  ALTER COLUMN alert_type SET NOT NULL;

ALTER TABLE repocop_vulnerabilities
  ADD CONSTRAINT repocop_vulnerabilities_alert_type_check
  CHECK (alert_type IN ('general', 'malware'));

COMMIT;
