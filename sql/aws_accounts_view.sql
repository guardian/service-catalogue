/*
 The view aws_accounts
 see prisma migration 20231026134216_view_aws_accounts
 in directory packages/repocop/prisma/migrations
 */
-- CREATE OR REPLACE VIEW aws_accounts AS
-- SELECT DISTINCT acc.id,
--                 acc.name,
--                 acc.email,
--                 acc.status,
--                 acc.joined_timestamp,
--                 COALESCE(ou.name, 'ROOT') AS "organizational_unit"
-- FROM aws_organizations_accounts acc
--          LEFT JOIN aws_organizations_account_parents par  ON acc.id = par.id
--          LEFT JOIN aws_organizations_organizational_units ou on par.parent_id = ou.id;