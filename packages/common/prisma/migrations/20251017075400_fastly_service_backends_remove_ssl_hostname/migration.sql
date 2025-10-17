BEGIN TRANSACTION;
    -- In https://hub.cloudquery.io/plugins/source/cloudquery/fastly/v4.0.0/versions the `ssl_hostname` column was removed from `fastly_service_backends`.
    ALTER TABLE fastly_service_backends DROP COLUMN IF EXISTS ssl_hostname;
COMMIT;