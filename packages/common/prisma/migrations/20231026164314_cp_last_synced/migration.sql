/*
 The view cq_last_synced
 Shows the last time a table was synced
 */
DROP VIEW IF EXISTS cq_last_synced;

DO $$
    DECLARE
        tbl TEXT;
        strSQL TEXT = '';
    BEGIN
        -- iterate over every table in our information_schema that has an `arn` column available
        FOR tbl IN
            SELECT DISTINCT table_name
            FROM information_schema.columns
            WHERE COLUMN_NAME IN ('_cq_sync_time')
            LOOP
                -- UNION each table query to create one view
                IF NOT (strSQL = ''::TEXT) THEN
                    strSQL = strSQL || ' UNION ALL ';
                END IF;
                -- create an SQL query to select from table and transform it into our resources view schema
                strSQL = strSQL || FORMAT(E'
        (SELECT _cq_sync_time, %L AS table_name
        FROM %s limit 1) ', tbl, tbl);
            END LOOP;

        IF strSQL = ''::TEXT THEN
            RAISE EXCEPTION 'No tables found.';
        ELSE
            RAISE NOTICE '%', strSQL;
            EXECUTE FORMAT('CREATE VIEW cq_last_synced AS (%s)', strSQL);
        END IF;

    END $$;