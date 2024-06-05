CREATE TABLE IF NOT EXISTS obligatron_results (
    "id" SERIAL PRIMARY KEY,
    "date" TIMESTAMP NOT NULL,
    "obligation_name" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "contacts" JSONB NOT NULL,
    "url" TEXT
);

CREATE INDEX IF NOT EXISTS "obligatron_results_date_idx" ON "obligatron_results" ("date");
CREATE INDEX IF NOT EXISTS "obligatron_results_obligation_name_idx" ON "obligatron_results" ("obligation_name");
CREATE INDEX IF NOT EXISTS "obligatron_results_resource_idx" ON "obligatron_results" ("resource");