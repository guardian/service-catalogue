-- Add assignment to github_teams. This was added in the upgrade to v14.2.0. -- See https://hub.cloudquery.io/plugins/source/cloudquery/github/v14.2.0/tables/github_teams
BEGIN TRANSACTION;

ALTER TABLE IF EXISTS github_teams
    ADD COLUMN IF NOT EXISTS assignment text;

COMMIT;