BEGIN TRANSACTION;
    -- This column is new as of v12.0.0.
    -- See https://hub.cloudquery.io/plugins/source/cloudquery/github/v12.0.0/versions.
    ALTER TABLE IF EXISTS github_teams ADD COLUMN IF NOT EXISTS assignment TEXT;
COMMIT TRANSACTION;