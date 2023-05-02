-- The aws_organizations_accounts table appears to get entries from each delegated account.
-- We've delegated the Security and DeployTools account, so the table has duplicated information.
-- This view is de-duped to make joining easier.
CREATE VIEW aws_accounts AS
SELECT DISTINCT oa.id
              , oa.name
              , oa.email
              , oa.status
              , oa.joined_timestamp
FROM aws_organizations_accounts oa;
