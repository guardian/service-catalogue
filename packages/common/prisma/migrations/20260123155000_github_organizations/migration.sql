-- @formatter:off -- this stops IntelliJ from reformatting the SQL
BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS github_organizations (
        _cq_sync_time TIMESTAMP
        , _cq_source_name TEXT
        , _cq_id UUID NOT NULL UNIQUE
        , _cq_parent_id UUID
        , org TEXT NOT NULL
        , login TEXT
        , id BIGINT NOT NULL
        , node_id TEXT
        , avatar_url TEXT
        , html_url TEXT
        , name TEXT
        , company TEXT
        , blog TEXT
        , location TEXT
        , email TEXT
        , twitter_username TEXT
        , description TEXT
        , public_repos BIGINT
        , public_gists BIGINT
        , followers BIGINT
        , following BIGINT
        , created_at timestamp
        , updated_at timestamp
        , total_private_repos BIGINT
        , owned_private_repos BIGINT
        , private_gists BIGINT
        , disk_usage BIGINT
        , collaborators BIGINT
        , billing_email TEXT
        , type TEXT
        , plan JSONB
        , two_factor_requirement_enabled BOOLEAN
        , is_verified BOOLEAN
        , has_organization_projects BOOLEAN
        , has_repository_projects BOOLEAN
        , default_repository_permission TEXT
        , default_repository_settings TEXT
        , members_can_create_repositories BOOLEAN
        , members_can_create_public_repositories BOOLEAN
        , members_can_create_private_repositories BOOLEAN
        , members_can_create_internal_repositories BOOLEAN
        , members_can_fork_private_repositories BOOLEAN
        , members_allowed_repository_creation_type TEXT
        , members_can_create_pages BOOLEAN
        , members_can_create_public_pages BOOLEAN
        , members_can_create_private_pages BOOLEAN
        , web_commit_signoff_required BOOLEAN
        , advanced_security_enabled_for_new_repositories BOOLEAN
        , dependabot_alerts_enabled_for_new_repositories BOOLEAN
        , dependabot_security_updates_enabled_for_new_repositories BOOLEAN
        , dependency_graph_enabled_for_new_repositories BOOLEAN
        , secret_scanning_enabled_for_new_repositories BOOLEAN
        , secret_scanning_push_protection_enabled_for_new_repositories BOOLEAN
        , url TEXT
        , events_url TEXT
        , hooks_url TEXT
        , issues_url TEXT
        , members_url TEXT
        , public_members_url TEXT
        , repos_url TEXT
        , secret_scanning_validity_checks_enabled BOOLEAN

        , CONSTRAINT github_organizations_cqpk PRIMARY KEY (org, id)
    );
COMMIT TRANSACTION;