BEGIN TRANSACTION;

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "aws_acm_certificates" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "region" TEXT,
        "arn" TEXT,
        "tags" JSONB,
        "certificate_authority_arn" TEXT,
        "created_at" TIMESTAMP(6),
        "domain_name" TEXT,
        "domain_validation_options" JSONB,
        "extended_key_usages" JSONB,
        "failure_reason" TEXT,
        "imported_at" TIMESTAMP(6),
        "in_use_by" TEXT[],
        "issued_at" TIMESTAMP(6),
        "issuer" TEXT,
        "key_algorithm" TEXT,
        "key_usages" JSONB,
        "not_after" TIMESTAMP(6),
        "not_before" TIMESTAMP(6),
        "options" JSONB,
        "renewal_eligibility" TEXT,
        "renewal_summary" JSONB,
        "revocation_reason" TEXT,
        "revoked_at" TIMESTAMP(6),
        "serial" TEXT,
        "signature_algorithm" TEXT,
        "status" TEXT,
        "subject" TEXT,
        "subject_alternative_names" TEXT[],
        "type" TEXT,

        CONSTRAINT "aws_acm_certificates_cqpk" PRIMARY KEY ("_cq_id")
    );

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "aws_apigateway_domain_names" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "region" TEXT,
        "arn" TEXT,
        "certificate_arn" TEXT,
        "certificate_name" TEXT,
        "certificate_upload_date" TIMESTAMP(6),
        "distribution_domain_name" TEXT,
        "distribution_hosted_zone_id" TEXT,
        "domain_name" TEXT,
        "domain_name_status" TEXT,
        "domain_name_status_message" TEXT,
        "endpoint_configuration" JSONB,
        "mutual_tls_authentication" JSONB,
        "ownership_verification_certificate_arn" TEXT,
        "regional_certificate_arn" TEXT,
        "regional_certificate_name" TEXT,
        "regional_domain_name" TEXT,
        "regional_hosted_zone_id" TEXT,
        "security_policy" TEXT,
        "tags" JSONB,

        CONSTRAINT "aws_apigateway_domain_names_cqpk" PRIMARY KEY ("_cq_id")
    );

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "aws_cloudfront_distributions" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "tags" JSONB,
        "arn" TEXT,
        "distribution_config" JSONB,
        "domain_name" TEXT,
        "id" TEXT,
        "in_progress_invalidation_batches" BIGINT,
        "last_modified_time" TIMESTAMP(6),
        "status" TEXT,
        "active_trusted_key_groups" JSONB,
        "active_trusted_signers" JSONB,
        "alias_icp_recordals" JSONB,

        CONSTRAINT "aws_cloudfront_distributions_cqpk" PRIMARY KEY ("_cq_id")
    );

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "aws_elbv1_load_balancers" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "region" TEXT,
        "arn" TEXT,
        "availability_zones" TEXT[],
        "backend_server_descriptions" JSONB,
        "canonical_hosted_zone_name" TEXT,
        "canonical_hosted_zone_name_id" TEXT,
        "created_time" TIMESTAMP(6),
        "dns_name" TEXT,
        "health_check" JSONB,
        "instances" JSONB,
        "listener_descriptions" JSONB,
        "load_balancer_name" TEXT,
        "policies" JSONB,
        "scheme" TEXT,
        "security_groups" TEXT[],
        "source_security_group" JSONB,
        "subnets" TEXT[],
        "vpc_id" TEXT,
        "tags" JSONB,
        "attributes" JSONB,

        CONSTRAINT "aws_elbv1_load_balancers_cqpk" PRIMARY KEY ("_cq_id")
    );

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "aws_elbv2_load_balancers" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "region" TEXT,
        "tags" JSONB,
        "arn" TEXT,
        "availability_zones" JSONB,
        "canonical_hosted_zone_id" TEXT,
        "created_time" TIMESTAMP(6),
        "customer_owned_ipv4_pool" TEXT,
        "dns_name" TEXT,
        "enforce_security_group_inbound_rules_on_private_link_traffic" TEXT,
        "ip_address_type" TEXT,
        "load_balancer_arn" TEXT,
        "load_balancer_name" TEXT,
        "scheme" TEXT,
        "security_groups" TEXT[],
        "state" JSONB,
        "type" TEXT,
        "vpc_id" TEXT,

        CONSTRAINT "aws_elbv2_load_balancers_cqpk" PRIMARY KEY ("_cq_id")
    );

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "fastly_service_backends" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "name" TEXT NOT NULL,
        "sslca_cert" TEXT,
        "service_id" TEXT NOT NULL,
        "service_version" BIGINT NOT NULL,
        "address" TEXT,
        "auto_loadbalance" BOOLEAN,
        "between_bytes_timeout" BIGINT,
        "comment" TEXT,
        "connect_timeout" BIGINT,
        "created_at" TIMESTAMP(6),
        "deleted_at" TIMESTAMP(6),
        "error_threshold" BIGINT,
        "first_byte_timeout" BIGINT,
        "health_check" TEXT,
        "hostname" TEXT,
        "max_conn" BIGINT,
        "max_tls_version" TEXT,
        "min_tls_version" TEXT,
        "override_host" TEXT,
        "port" BIGINT,
        "request_condition" TEXT,
        "ssl_cert_hostname" TEXT,
        "ssl_check_cert" BOOLEAN,
        "ssl_ciphers" TEXT,
        "ssl_client_cert" TEXT,
        "ssl_client_key" TEXT,
        "ssl_hostname" TEXT,
        "sslsni_hostname" TEXT,
        "shield" TEXT,
        "updated_at" TIMESTAMP(6),
        "use_ssl" BOOLEAN,
        "weight" BIGINT,
        "keep_alive_time" BIGINT,
        "share_key" TEXT,

        CONSTRAINT "fastly_service_backends_cqpk" PRIMARY KEY ("name","service_id","service_version")
    );

    -- CreateTable
    CREATE TABLE IF NOT EXISTS "fastly_service_domains" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "name" TEXT NOT NULL,
        "service_id" TEXT NOT NULL,
        "service_version" BIGINT NOT NULL,
        "comment" TEXT,
        "created_at" TIMESTAMP(6),
        "deleted_at" TIMESTAMP(6),
        "updated_at" TIMESTAMP(6),

        CONSTRAINT "fastly_service_domains_cqpk" PRIMARY KEY ("name","service_id","service_version")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX IF NOT EXISTS "fastly_service_backends__cq_id_key" ON "fastly_service_backends"("_cq_id");

    -- CreateIndex
    CREATE UNIQUE INDEX IF NOT EXISTS "fastly_service_domains__cq_id_key" ON "fastly_service_domains"("_cq_id");

    --Create view_domain_tags view

    DROP VIEW IF EXISTS view_domain_tags;
    DROP FUNCTION IF EXISTS fn_view_domain_tags;

    CREATE FUNCTION fn_view_domain_tags() RETURNS TABLE (
        domain_name TEXT
        , app TEXT
        , stack TEXT
        , stage TEXT
        , tool TEXT
        , repo TEXT
        , riffraff_project TEXT
        , account_name TEXT
        , account_id TEXT
        ) as $$
    WITH arn_tag_sets AS (
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_cloudfront_distributions
        UNION
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_elbv1_load_balancers
        UNION
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_elbv2_load_balancers
        UNION
        SELECT
            arn,
            tags,
            account_id
        FROM
            aws_cloudformation_stacks
    ),
         domain_to_tag_sets AS (
             SELECT
                 COALESCE(fd.name, cert.domain_name) as domain_name,
                 (
                     UNNEST(
                             ARRAY_AGG(tag_sets.tags)
                     )
                     ) as tags,
                 -- Takes the fist account_id and assume they are all the same
                 (ARRAY_AGG(cert.account_id)) [1] AS account_id
             FROM
                 aws_acm_certificates AS cert
                     LEFT JOIN arn_tag_sets AS tag_sets ON tag_sets.arn = ANY (cert.in_use_by)
                     LEFT JOIN aws_apigateway_domain_names AS agw ON agw.domain_name = cert.domain_name
                     LEFT JOIN aws_accounts AS acc ON cert.account_id = acc.id
                     LEFT JOIN fastly_service_backends fb ON fb.hostname = cert.domain_name
                     LEFT JOIN fastly_service_domains fd ON fd.service_id = fb.service_id
                     AND fd.service_version = fb.service_version
             GROUP BY
                 fd.name,
                 cert.domain_name
         ),
         domain_to_tag_sets_filtered AS (
             SELECT
                 *
             FROM
                 domain_to_tag_sets
             WHERE
                 tags IS NOT NULL
               AND tags != '{}'
         ),
         tool_to_tag_sets AS (
             SELECT
                 domain_tags.domain_name,
                 arn_tags.tags,
                 arn_tags.account_id
             FROM
                 domain_to_tag_sets domain_tags
                     JOIN arn_tag_sets arn_tags ON domain_tags.tags ->> 'gu:tool' = arn_tags.tags ->> 'gu:tool'
                     JOIN aws_accounts AS acc ON arn_tags.account_id = acc.id
             WHERE
                 domain_tags.tags ->> 'gu:tool' IS NOT NULL
         )
    SELECT
        DISTINCT domain_name,
                 tags ->> 'App' AS app,
                 tags ->> 'Stack' AS stack,
                 tags ->> 'Stage' AS stage,
                 tags ->> 'gu:tool' AS tool,
                 COALESCE(tags ->> 'gu:application-repo', tags ->> 'gu:repo') AS repo,
                 tags ->> 'gu:riff-raff:project' AS riffraff_project,
                 acc.name,
                 account_id
        FROM
        (
            SELECT
                *
            FROM
                domain_to_tag_sets_filtered
            UNION
            SELECT
                *
            FROM
                tool_to_tag_sets
        ) all_tags
            LEFT JOIN aws_accounts AS acc ON all_tags.account_id = acc.id;
    $$ language sql;

    CREATE VIEW view_domain_tags AS (
     SELECT  *
     FROM    fn_view_domain_tags()
     );

COMMIT TRANSACTION;
