-- Add classification column to repocop_vulnerabilities table. This will enable us to differentiate Dependabot malware alerts from vulnerability alerts.
BEGIN TRANSACTION;

ALTER TABLE IF EXISTS repocop_vulnerabilities
  ADD COLUMN IF NOT EXISTS classification text;

COMMIT;