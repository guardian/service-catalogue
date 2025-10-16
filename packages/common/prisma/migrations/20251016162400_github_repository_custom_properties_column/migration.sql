BEGIN TRANSACTION;

    DO $$
    DECLARE col_type text;
    BEGIN
        SELECT UPPER(data_type) INTO col_type
        FROM information_schema.columns
        WHERE table_name = 'github_repository_custom_properties'
          AND column_name = 'value';

        -- In https://hub.cloudquery.io/plugins/source/cloudquery/github/v12.0.0/versions the type of the value column changed from TEXT to TEXT[]
        -- Alter the table if the type is TEXT.
        IF col_type = 'TEXT' THEN
            ALTER TABLE github_repository_custom_properties
                ALTER COLUMN value TYPE TEXT[]
                    USING (CASE WHEN value IS NULL THEN ARRAY[]::text[] ELSE ARRAY[value] END);
        END IF;
    END $$;

COMMIT;