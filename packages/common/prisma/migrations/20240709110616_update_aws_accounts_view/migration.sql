/*
 Redefine the view `aws_accounts`.

 Removed:
   - organizational_unit

 Added:
   - ancestors
   - is_product_and_engineering
 */

BEGIN TRANSACTION;

DROP VIEW IF EXISTS aws_accounts;
DROP FUNCTION IF EXISTS fn_aws_accounts;

CREATE FUNCTION fn_aws_accounts() RETURNS TABLE (
    id                              TEXT
    , name                          TEXT
    , email                         TEXT
    , status                        TEXT
    , joined_timestamp              TIMESTAMP
    , ancestors                     TEXT[]
    , is_product_and_engineering    BOOLEAN
) AS $$
    SELECT acc.id
           , acc.name
           , acc.email
           , acc.status
           , acc.joined_timestamp
           , tree.ancestors
           , tree.is_product_and_engineering
    FROM    aws_organizations_tree tree
                JOIN aws_organizations_accounts acc ON tree.id = acc.id
    WHERE   tree.type = 'ACCOUNT';
$$ LANGUAGE SQL;

CREATE VIEW aws_accounts AS (
    SELECT  *
    FROM    fn_aws_accounts()
);

COMMIT TRANSACTION;
