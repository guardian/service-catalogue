-- This view was created using a function which essentially hardcoded the tables the view references.
-- This lead to issues with Cloudquery not being able to update the schema of tables due to cascading issues in the view
DROP VIEW IF EXISTS cq_last_synced;

-- Instead of hardcoding a view with a list of tables, fetch the tables needed on the fly, avoiding cascade issues.
CREATE OR REPLACE FUNCTION cq_last_synced()
    RETURNS TABLE (table_name text, _cq_sync_time timestamp) AS
$$
DECLARE
    selected_table_names record;
    selected_sync_times record;
BEGIN
    FOR selected_table_names IN SELECT DISTINCT table_name FROM information_schema.columns WHERE COLUMN_NAME IN ('_cq_sync_time')
        LOOP
            EXECUTE format('SELECT _cq_sync_time FROM %I LIMIT 1', tbl.table_name) INTO selected_sync_times;
            table_name := selected_table_names.table_name;
            _cq_sync_time := selected_sync_times._cq_sync_time;
            RETURN NEXT;
        END LOOP;
END;
$$ LANGUAGE plpgsql;