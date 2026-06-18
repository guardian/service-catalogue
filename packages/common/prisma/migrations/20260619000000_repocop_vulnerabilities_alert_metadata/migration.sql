-- Add advisory and alert metadata columns to repocop_vulnerabilities.
-- Keep existing data by adding columns as nullable first, then backfilling.
-- Epoch defaults are used for historical rows that predate these fields.

BEGIN;

-- Initially add nullable columns
ALTER TABLE repocop_vulnerabilities
  ADD COLUMN ingested_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN advisory_published_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN advisory_updated_at   TIMESTAMP WITH TIME ZONE,
  ADD COLUMN advisory_withdrawn_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN alert_updated_at      TIMESTAMP WITH TIME ZONE,
  ADD COLUMN html_url              TEXT;

-- Set dummy values for existing rows

UPDATE repocop_vulnerabilities
SET advisory_published_at = TIMESTAMPTZ '1970-01-01 00:00:00+00'
WHERE advisory_published_at IS NULL;

UPDATE repocop_vulnerabilities
SET advisory_updated_at = TIMESTAMPTZ '1970-01-01 00:00:00+00'
WHERE advisory_updated_at IS NULL;

UPDATE repocop_vulnerabilities
SET alert_updated_at = TIMESTAMPTZ '1970-01-01 00:00:00+00'
WHERE alert_updated_at IS NULL;

UPDATE repocop_vulnerabilities
SET html_url = ''
WHERE html_url IS NULL;

-- Now set columns non-nullable
ALTER TABLE repocop_vulnerabilities
  ALTER COLUMN advisory_published_at SET NOT NULL,
  ALTER COLUMN advisory_updated_at SET NOT NULL,
  ALTER COLUMN alert_updated_at SET NOT NULL,
  ALTER COLUMN html_url SET NOT NULL;

COMMIT;
