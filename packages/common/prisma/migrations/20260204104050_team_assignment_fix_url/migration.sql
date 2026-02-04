-- Add assignment to github_teams
BEGIN TRANSACTION;

ALTER TABLE IF EXISTS github_teams
  ADD COLUMN IF NOT EXISTS assignment text;

ALTER TABLE IF EXISTS repocop_vulnerabilities
  ADD COLUMN fix_url TEXT;

COMMIT;