/*
 This migration converts the frequency column to store frequency in milliseconds.
 This offers greater accuracy and flexibility in scheduling.
 For example, it enables identification of tables that are updated multiple times a day.

 To understand the daily rate:
 ```sql
 SELECT table_name
        , 86400000 / frequency AS daily_rate
 FROM   cloudquery_table_frequency;
 ```
 */
BEGIN;

ALTER TABLE cloudquery_table_frequency ADD COLUMN frequency_milliseconds BIGINT NULL;

UPDATE cloudquery_table_frequency SET frequency_milliseconds = CASE
    WHEN frequency = 'DAILY' THEN 86400000
    WHEN frequency = 'WEEKLY' THEN 604800000
    ELSE 0 -- this should never happen
END;

ALTER TABLE cloudquery_table_frequency ALTER COLUMN frequency_milliseconds SET NOT NULL;

ALTER TABLE cloudquery_table_frequency DROP COLUMN frequency;

ALTER TABLE cloudquery_table_frequency RENAME COLUMN frequency_milliseconds TO frequency;

COMMIT;