-- Uses recursive common table expressions to build an ancestry of accounts and organisational units.
CREATE OR REPLACE FUNCTION fn_aws_organizations_tree() RETURNS TABLE (
    id                              TEXT
    , type                          TEXT
    , name                          TEXT
    , ancestors                     TEXT[]
    , is_product_and_engineering    BOOLEAN
) AS $$
    WITH RECURSIVE
        nodes AS (
            -- Root node
            SELECT  r.id
                    , r.name
                    , 'ROOT' AS type
                    , NULL   AS parent_id
            FROM    aws_organizations_roots r

            UNION ALL

            -- Branch nodes
            SELECT  ou.id
                    , ou.name
                    , 'ORGANIZATIONAL_UNIT' AS type
                    , ou_p.parent_id
            FROM    aws_organizations_organizational_units ou
                        JOIN aws_organizations_organizational_unit_parents ou_p ON ou.id = ou_p.id

            UNION ALL

            -- Leaf nodes
            SELECT  acc.id
                    , acc.name
                    , 'ACCOUNT' AS type
                    , p.parent_id
            FROM    aws_organizations_accounts acc
                        JOIN aws_organizations_account_parents p ON acc.id = p.id
        )
        , tree(id, type, name, ancestors) AS (
            SELECT  nodes.id
                    , nodes.type
                    , nodes.name
                    , ARRAY [nodes.name]
            FROM    nodes
            WHERE   nodes.parent_id IS NULL

            UNION ALL

            SELECT  nodes.id
                    , nodes.type
                    , nodes.name
                    , ARRAY_APPEND(tree.ancestors, nodes.id)
            FROM    tree
                    , nodes
            WHERE   nodes.parent_id = tree.id
        )
        , productAndEngineering AS (
            SELECT  id
                    , name
            FROM    aws_organizations_organizational_units
            WHERE   name = 'Product & Engineering' -- assumes this string will never change
    )

    SELECT  tree.*
            , productAndEngineering.id = ANY (tree.ancestors) AS is_product_and_engineering
    FROM    tree
            , productAndEngineering;
$$ LANGUAGE SQL;

CREATE OR REPLACE VIEW aws_organizations_tree AS (
    SELECT  *
    FROM    fn_aws_organizations_tree()
);
