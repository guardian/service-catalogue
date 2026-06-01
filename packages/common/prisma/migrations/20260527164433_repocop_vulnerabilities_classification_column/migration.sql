-- Add alert_type column to repocop_vulnerabilities table. This will enable us to differentiate Dependabot malware alerts from vulnerability alerts.

ALTER TABLE IF EXISTS repocop_vulnerabilities
  ADD COLUMN IF NOT EXISTS alert_type text;

