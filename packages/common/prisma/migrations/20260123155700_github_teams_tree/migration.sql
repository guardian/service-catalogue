/*
 This migration creates a view `github_teams_tree` providing a hierarchical representation of GitHub teams
 and a flag indicating whether a team is part of P&E.
 */

-- @formatter:off -- this stops IntelliJ from reformatting the SQL
BEGIN TRANSACTION;

    -- Uses recursive common table expressions to build an ancestry of GitHub teams.
    CREATE OR REPLACE FUNCTION fn_github_organization_tree() RETURNS TABLE (
        id          TEXT
        , type      TEXT
        , name      TEXT
        , ancestors TEXT[]
        , is_product_and_engineering BOOLEAN
    ) AS $$
        WITH RECURSIVE
            nodes AS (
                -- Root node
                SELECT   o.id::TEXT
                        , o.name
                        , 'ORGANIZATION' AS type
                        , NULL AS parent_id
                FROM    github_organizations o

                UNION ALL

                -- Branch nodes
                SELECT  t.id::TEXT
                        , t.name
                        , 'TEAM' AS type
                        , t.parent ->> 'id' AS parent_id
                FROM    github_teams t
                WHERE   t.parent IS NOT NULL

                UNION ALL

                -- Leaf nodes
                SELECT  t.id::TEXT
                        , t.name
                        , 'TEAM' AS type
                        , o.id::TEXT AS parent_id
                FROM    github_teams t
                        JOIN github_organizations o ON t.org = o.org
                WHERE   t.parent IS NULL
            )
            , tree (id, type, name, ancestors) AS (
                SELECT  nodes.id
                        , nodes.type
                        , nodes.name
                        , ARRAY [nodes.id]
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
            ),
            productAndEngineering AS (
                SELECT  id
                        , slug
                FROM    github_teams
                WHERE   slug = 'product-engineering-department' -- assumes this string will never change
            )
            SELECT  tree.*
                    , productAndEngineering.id::TEXT = ANY (tree.ancestors) as is_product_and_engineering
            FROM    tree
                    , productAndEngineering;
    $$ LANGUAGE SQL;

    CREATE OR REPLACE VIEW github_organization_tree AS (
        SELECT  *
        FROM    fn_github_organization_tree()
    );

    CREATE OR REPLACE FUNCTION fn_github_teams_tree() RETURNS TABLE (
        id TEXT
        , org TEXT
        , slug TEXT
        , name TEXT
        , ancestors TEXT[]
        , is_product_and_engineering BOOLEAN
    ) AS $$
        SELECT  tree.id
                , teams.org
                , teams.slug
                , tree.name
                , tree.ancestors
                , tree.is_product_and_engineering
        FROM    github_organization_tree tree
                JOIN github_teams teams ON tree.id = teams.id::TEXT
        WHERE   tree.type = 'TEAM';
    $$ LANGUAGE SQL;

    CREATE OR REPLACE VIEW github_teams_tree AS (
        SELECT  *
        FROM    fn_github_teams_tree()
    );

COMMIT TRANSACTION;
