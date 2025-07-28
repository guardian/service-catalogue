BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS riffraff_deploys (
        _cq_sync_time   TIMESTAMP,
        _cq_source_name TEXT,
        id              UUID,
        content         JSONB,

        CONSTRAINT riffraff_deploys_id PRIMARY KEY (id)
    );

    CREATE INDEX IF NOT EXISTS deploy_startTime       ON riffraff_deploys ((content ->> 'startTime'));
    CREATE INDEX IF NOT EXISTS deploy_status          ON riffraff_deploys ((content ->> 'status'));
    CREATE INDEX IF NOT EXISTS deploy_projectName     ON riffraff_deploys ((content -> 'parameters' ->> 'projectName'));
    CREATE INDEX IF NOT EXISTS deploy_deployer        ON riffraff_deploys ((content -> 'parameters' ->> 'deployer'));
    CREATE INDEX IF NOT EXISTS deploy_stage           ON riffraff_deploys ((content -> 'parameters' ->> 'stage'));
    CREATE INDEX IF NOT EXISTS deploy_branch          ON riffraff_deploys ((content -> 'parameters' -> 'tags' ->> 'branch'));
COMMIT TRANSACTION;
