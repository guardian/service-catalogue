-- CreateTable
CREATE TABLE "aws_accessanalyzer_analyzer_archive_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "analyzer_arn" TEXT,
    "created_at" TIMESTAMP(6),
    "filter" JSONB,
    "rule_name" TEXT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "aws_accessanalyzer_analyzer_archive_rules_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_accessanalyzer_analyzer_findings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "analyzer_arn" TEXT,
    "analyzed_at" TIMESTAMP(6),
    "condition" JSONB,
    "created_at" TIMESTAMP(6),
    "id" TEXT,
    "resource_owner_account" TEXT,
    "resource_type" TEXT,
    "status" TEXT,
    "updated_at" TIMESTAMP(6),
    "action" TEXT[],
    "error" TEXT,
    "is_public" BOOLEAN,
    "principal" JSONB,
    "resource" TEXT,
    "sources" JSONB,

    CONSTRAINT "aws_accessanalyzer_analyzer_findings_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_accessanalyzer_analyzers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "name" TEXT,
    "status" TEXT,
    "type" TEXT,
    "last_resource_analyzed" TEXT,
    "last_resource_analyzed_at" TIMESTAMP(6),
    "status_reason" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_accessanalyzer_analyzers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_account_alternate_contacts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "alternate_contact_type" TEXT NOT NULL,
    "email_address" TEXT,
    "name" TEXT,
    "phone_number" TEXT,
    "title" TEXT,

    CONSTRAINT "aws_account_alternate_contacts_cqpk" PRIMARY KEY ("account_id","alternate_contact_type")
);

-- CreateTable
CREATE TABLE "aws_account_contacts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "address_line1" TEXT,
    "city" TEXT,
    "country_code" TEXT,
    "full_name" TEXT,
    "phone_number" TEXT,
    "postal_code" TEXT,
    "address_line2" TEXT,
    "address_line3" TEXT,
    "company_name" TEXT,
    "district_or_county" TEXT,
    "state_or_region" TEXT,
    "website_url" TEXT,

    CONSTRAINT "aws_account_contacts_cqpk" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "aws_acm_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
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

    CONSTRAINT "aws_acm_certificates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_acmpca_certificate_authorities" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "certificate_authority_configuration" JSONB,
    "created_at" TIMESTAMP(6),
    "failure_reason" TEXT,
    "key_storage_security_standard" TEXT,
    "last_state_change_at" TIMESTAMP(6),
    "not_after" TIMESTAMP(6),
    "not_before" TIMESTAMP(6),
    "owner_account" TEXT,
    "restorable_until" TIMESTAMP(6),
    "revocation_configuration" JSONB,
    "serial" TEXT,
    "status" TEXT,
    "type" TEXT,
    "usage_mode" TEXT,

    CONSTRAINT "aws_acmpca_certificate_authorities_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_alpha_cloudwatch_metric_statistics" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "parent_input_hash" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "input_json" JSONB,
    "average" DOUBLE PRECISION,
    "extended_statistics" JSONB,
    "maximum" DOUBLE PRECISION,
    "minimum" DOUBLE PRECISION,
    "sample_count" DOUBLE PRECISION,
    "sum" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "unit" TEXT,
    "label" TEXT NOT NULL,

    CONSTRAINT "aws_alpha_cloudwatch_metric_statistics_cqpk" PRIMARY KEY ("account_id","region","parent_input_hash","input_hash","timestamp","label")
);

-- CreateTable
CREATE TABLE "aws_alpha_cloudwatch_metrics" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "input_json" JSONB,
    "dimensions" JSONB,
    "metric_name" TEXT,
    "namespace" TEXT,

    CONSTRAINT "aws_alpha_cloudwatch_metrics_cqpk" PRIMARY KEY ("account_id","region","input_hash")
);

-- CreateTable
CREATE TABLE "aws_alpha_costexplorer_cost_custom" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "input_json" JSONB,
    "estimated" BOOLEAN,
    "groups" JSONB,
    "time_period" JSONB,
    "total" JSONB,

    CONSTRAINT "aws_alpha_costexplorer_cost_custom_cqpk" PRIMARY KEY ("account_id","start_date","end_date","input_hash")
);

-- CreateTable
CREATE TABLE "aws_amplify_apps" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "app_arn" TEXT,
    "app_id" TEXT,
    "create_time" TIMESTAMP(6),
    "default_domain" TEXT,
    "description" TEXT,
    "enable_basic_auth" BOOLEAN,
    "enable_branch_auto_build" BOOLEAN,
    "environment_variables" JSONB,
    "name" TEXT,
    "platform" TEXT,
    "repository" TEXT,
    "update_time" TIMESTAMP(6),
    "auto_branch_creation_config" JSONB,
    "auto_branch_creation_patterns" TEXT[],
    "basic_auth_credentials" TEXT,
    "build_spec" TEXT,
    "custom_headers" TEXT,
    "custom_rules" JSONB,
    "enable_auto_branch_creation" BOOLEAN,
    "enable_branch_auto_deletion" BOOLEAN,
    "iam_service_role_arn" TEXT,
    "production_branch" JSONB,
    "repository_clone_method" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_amplify_apps_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_api_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_date" TIMESTAMP(6),
    "customer_id" TEXT,
    "description" TEXT,
    "enabled" BOOLEAN,
    "id" TEXT,
    "last_updated_date" TIMESTAMP(6),
    "name" TEXT,
    "stage_keys" TEXT[],
    "tags" JSONB,
    "value" TEXT,

    CONSTRAINT "aws_apigateway_api_keys_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_client_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "client_certificate_id" TEXT,
    "created_date" TIMESTAMP(6),
    "description" TEXT,
    "expiration_date" TIMESTAMP(6),
    "pem_encoded_certificate" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_apigateway_client_certificates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_domain_name_base_path_mappings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "domain_name_arn" TEXT,
    "arn" TEXT NOT NULL,
    "base_path" TEXT,
    "rest_api_id" TEXT,
    "stage" TEXT,

    CONSTRAINT "aws_apigateway_domain_name_base_path_mappings_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_domain_names" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
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

    CONSTRAINT "aws_apigateway_domain_names_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_authorizers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "auth_type" TEXT,
    "authorizer_credentials" TEXT,
    "authorizer_result_ttl_in_seconds" BIGINT,
    "authorizer_uri" TEXT,
    "id" TEXT,
    "identity_source" TEXT,
    "identity_validation_expression" TEXT,
    "name" TEXT,
    "provider_arns" TEXT[],
    "type" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_authorizers_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_deployments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "api_summary" JSONB,
    "created_date" TIMESTAMP(6),
    "description" TEXT,
    "id" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_deployments_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_documentation_parts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "location" JSONB,
    "properties" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_documentation_parts_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_documentation_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "created_date" TIMESTAMP(6),
    "description" TEXT,
    "version" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_documentation_versions_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_gateway_responses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "default_response" BOOLEAN,
    "response_parameters" JSONB,
    "response_templates" JSONB,
    "response_type" TEXT,
    "status_code" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_gateway_responses_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_models" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "model_template" TEXT,
    "content_type" TEXT,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "schema" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_models_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_request_validators" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "name" TEXT,
    "validate_request_body" BOOLEAN,
    "validate_request_parameters" BOOLEAN,

    CONSTRAINT "aws_apigateway_rest_api_request_validators_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_resource_method_integrations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "resource_arn" TEXT,
    "method_arn" TEXT,
    "arn" TEXT NOT NULL,
    "cache_key_parameters" TEXT[],
    "cache_namespace" TEXT,
    "connection_id" TEXT,
    "connection_type" TEXT,
    "content_handling" TEXT,
    "credentials" TEXT,
    "http_method" TEXT,
    "integration_responses" JSONB,
    "passthrough_behavior" TEXT,
    "request_parameters" JSONB,
    "request_templates" JSONB,
    "timeout_in_millis" BIGINT,
    "tls_config" JSONB,
    "type" TEXT,
    "uri" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_resource_method_integrations_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_resource_methods" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "resource_arn" TEXT,
    "arn" TEXT NOT NULL,
    "api_key_required" BOOLEAN,
    "authorization_scopes" TEXT[],
    "authorization_type" TEXT,
    "authorizer_id" TEXT,
    "http_method" TEXT,
    "method_integration" JSONB,
    "method_responses" JSONB,
    "operation_name" TEXT,
    "request_models" JSONB,
    "request_parameters" JSONB,
    "request_validator_id" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_resource_methods_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_resources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "parent_id" TEXT,
    "path" TEXT,
    "path_part" TEXT,
    "resource_methods" JSONB,

    CONSTRAINT "aws_apigateway_rest_api_resources_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_api_stages" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "rest_api_arn" TEXT,
    "arn" TEXT NOT NULL,
    "access_log_settings" JSONB,
    "cache_cluster_enabled" BOOLEAN,
    "cache_cluster_size" TEXT,
    "cache_cluster_status" TEXT,
    "canary_settings" JSONB,
    "client_certificate_id" TEXT,
    "created_date" TIMESTAMP(6),
    "deployment_id" TEXT,
    "description" TEXT,
    "documentation_version" TEXT,
    "last_updated_date" TIMESTAMP(6),
    "method_settings" JSONB,
    "stage_name" TEXT,
    "tags" JSONB,
    "tracing_enabled" BOOLEAN,
    "variables" JSONB,
    "web_acl_arn" TEXT,

    CONSTRAINT "aws_apigateway_rest_api_stages_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_rest_apis" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "api_key_source" TEXT,
    "binary_media_types" TEXT[],
    "created_date" TIMESTAMP(6),
    "description" TEXT,
    "disable_execute_api_endpoint" BOOLEAN,
    "endpoint_configuration" JSONB,
    "id" TEXT,
    "minimum_compression_size" BIGINT,
    "name" TEXT,
    "policy" TEXT,
    "tags" JSONB,
    "version" TEXT,
    "warnings" TEXT[],

    CONSTRAINT "aws_apigateway_rest_apis_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_usage_plan_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "usage_plan_arn" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "name" TEXT,
    "type" TEXT,
    "value" TEXT,

    CONSTRAINT "aws_apigateway_usage_plan_keys_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_usage_plans" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "api_stages" JSONB,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "product_code" TEXT,
    "quota" JSONB,
    "tags" JSONB,
    "throttle" JSONB,

    CONSTRAINT "aws_apigateway_usage_plans_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigateway_vpc_links" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "status" TEXT,
    "status_message" TEXT,
    "tags" JSONB,
    "target_arns" TEXT[],

    CONSTRAINT "aws_apigateway_vpc_links_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_authorizers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_arn" TEXT,
    "api_id" TEXT,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "authorizer_credentials_arn" TEXT,
    "authorizer_id" TEXT,
    "authorizer_payload_format_version" TEXT,
    "authorizer_result_ttl_in_seconds" BIGINT,
    "authorizer_type" TEXT,
    "authorizer_uri" TEXT,
    "enable_simple_responses" BOOLEAN,
    "identity_source" TEXT[],
    "identity_validation_expression" TEXT,
    "jwt_configuration" JSONB,

    CONSTRAINT "aws_apigatewayv2_api_authorizers_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_deployments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_arn" TEXT,
    "api_id" TEXT,
    "arn" TEXT NOT NULL,
    "auto_deployed" BOOLEAN,
    "created_date" TIMESTAMP(6),
    "deployment_id" TEXT,
    "deployment_status" TEXT,
    "deployment_status_message" TEXT,
    "description" TEXT,

    CONSTRAINT "aws_apigatewayv2_api_deployments_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_integration_responses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_integration_arn" TEXT,
    "integration_id" TEXT,
    "arn" TEXT NOT NULL,
    "integration_response_key" TEXT,
    "content_handling_strategy" TEXT,
    "integration_response_id" TEXT,
    "response_parameters" JSONB,
    "response_templates" JSONB,
    "template_selection_expression" TEXT,

    CONSTRAINT "aws_apigatewayv2_api_integration_responses_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_integrations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_arn" TEXT,
    "api_id" TEXT,
    "arn" TEXT NOT NULL,
    "api_gateway_managed" BOOLEAN,
    "connection_id" TEXT,
    "connection_type" TEXT,
    "content_handling_strategy" TEXT,
    "credentials_arn" TEXT,
    "description" TEXT,
    "integration_id" TEXT,
    "integration_method" TEXT,
    "integration_response_selection_expression" TEXT,
    "integration_subtype" TEXT,
    "integration_type" TEXT,
    "integration_uri" TEXT,
    "passthrough_behavior" TEXT,
    "payload_format_version" TEXT,
    "request_parameters" JSONB,
    "request_templates" JSONB,
    "response_parameters" JSONB,
    "template_selection_expression" TEXT,
    "timeout_in_millis" BIGINT,
    "tls_config" JSONB,

    CONSTRAINT "aws_apigatewayv2_api_integrations_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_models" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_arn" TEXT,
    "api_id" TEXT,
    "arn" TEXT NOT NULL,
    "model_template" TEXT,
    "name" TEXT,
    "content_type" TEXT,
    "description" TEXT,
    "model_id" TEXT,
    "schema" TEXT,

    CONSTRAINT "aws_apigatewayv2_api_models_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_route_responses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_route_arn" TEXT,
    "route_id" TEXT,
    "arn" TEXT NOT NULL,
    "route_response_key" TEXT,
    "model_selection_expression" TEXT,
    "response_models" JSONB,
    "response_parameters" JSONB,
    "route_response_id" TEXT,

    CONSTRAINT "aws_apigatewayv2_api_route_responses_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_routes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_arn" TEXT,
    "api_id" TEXT,
    "arn" TEXT NOT NULL,
    "route_key" TEXT,
    "api_gateway_managed" BOOLEAN,
    "api_key_required" BOOLEAN,
    "authorization_scopes" TEXT[],
    "authorization_type" TEXT,
    "authorizer_id" TEXT,
    "model_selection_expression" TEXT,
    "operation_name" TEXT,
    "request_models" JSONB,
    "request_parameters" JSONB,
    "route_id" TEXT,
    "route_response_selection_expression" TEXT,
    "target" TEXT,

    CONSTRAINT "aws_apigatewayv2_api_routes_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_api_stages" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "api_arn" TEXT,
    "api_id" TEXT,
    "arn" TEXT NOT NULL,
    "stage_name" TEXT,
    "access_log_settings" JSONB,
    "api_gateway_managed" BOOLEAN,
    "auto_deploy" BOOLEAN,
    "client_certificate_id" TEXT,
    "created_date" TIMESTAMP(6),
    "default_route_settings" JSONB,
    "deployment_id" TEXT,
    "description" TEXT,
    "last_deployment_status_message" TEXT,
    "last_updated_date" TIMESTAMP(6),
    "route_settings" JSONB,
    "stage_variables" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_apigatewayv2_api_stages_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_apis" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "name" TEXT,
    "protocol_type" TEXT,
    "route_selection_expression" TEXT,
    "api_endpoint" TEXT,
    "api_gateway_managed" BOOLEAN,
    "api_id" TEXT,
    "api_key_selection_expression" TEXT,
    "cors_configuration" JSONB,
    "created_date" TIMESTAMP(6),
    "description" TEXT,
    "disable_execute_api_endpoint" BOOLEAN,
    "disable_schema_validation" BOOLEAN,
    "import_info" TEXT[],
    "tags" JSONB,
    "version" TEXT,
    "warnings" TEXT[],

    CONSTRAINT "aws_apigatewayv2_apis_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_domain_name_rest_api_mappings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "domain_name_arn" TEXT,
    "arn" TEXT NOT NULL,
    "api_id" TEXT,
    "stage" TEXT,
    "api_mapping_id" TEXT,
    "api_mapping_key" TEXT,

    CONSTRAINT "aws_apigatewayv2_domain_name_rest_api_mappings_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_domain_names" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "domain_name" TEXT,
    "api_mapping_selection_expression" TEXT,
    "domain_name_configurations" JSONB,
    "mutual_tls_authentication" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_apigatewayv2_domain_names_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_apigatewayv2_vpc_links" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "security_group_ids" TEXT[],
    "subnet_ids" TEXT[],
    "vpc_link_id" TEXT,
    "created_date" TIMESTAMP(6),
    "tags" JSONB,
    "vpc_link_status" TEXT,
    "vpc_link_status_message" TEXT,
    "vpc_link_version" TEXT,

    CONSTRAINT "aws_apigatewayv2_vpc_links_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_appconfig_applications" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_appconfig_applications_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appconfig_configuration_profiles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "application_arn" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "application_id" TEXT,
    "description" TEXT,
    "id" TEXT,
    "location_uri" TEXT,
    "name" TEXT,
    "retrieval_role_arn" TEXT,
    "type" TEXT,
    "validators" JSONB,

    CONSTRAINT "aws_appconfig_configuration_profiles_cqpk" PRIMARY KEY ("application_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_appconfig_deployment_strategies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "deployment_duration_in_minutes" BIGINT,
    "description" TEXT,
    "final_bake_time_in_minutes" BIGINT,
    "growth_factor" DOUBLE PRECISION,
    "growth_type" TEXT,
    "id" TEXT,
    "name" TEXT,
    "replicate_to" TEXT,

    CONSTRAINT "aws_appconfig_deployment_strategies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appconfig_environments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "application_arn" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "application_id" TEXT,
    "description" TEXT,
    "id" TEXT,
    "monitors" JSONB,
    "name" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_appconfig_environments_cqpk" PRIMARY KEY ("application_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_appconfig_hosted_configuration_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "application_arn" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "application_id" TEXT,
    "configuration_profile_id" TEXT,
    "content" BYTEA,
    "content_type" TEXT,
    "description" TEXT,
    "version_label" TEXT,
    "version_number" BIGINT,

    CONSTRAINT "aws_appconfig_hosted_configuration_versions_cqpk" PRIMARY KEY ("application_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_appflow_flows" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "created_by" TEXT,
    "description" TEXT,
    "destination_flow_config_list" JSONB,
    "flow_arn" TEXT,
    "flow_name" TEXT,
    "flow_status" TEXT,
    "flow_status_message" TEXT,
    "kms_arn" TEXT,
    "last_run_execution_details" JSONB,
    "last_run_metadata_catalog_details" JSONB,
    "last_updated_at" TIMESTAMP(6),
    "last_updated_by" TEXT,
    "metadata_catalog_config" JSONB,
    "schema_version" BIGINT,
    "source_flow_config" JSONB,
    "tags" JSONB,
    "tasks" JSONB,
    "trigger_config" JSONB,

    CONSTRAINT "aws_appflow_flows_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_applicationautoscaling_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "policy_arn" TEXT,
    "policy_name" TEXT,
    "policy_type" TEXT,
    "resource_id" TEXT,
    "scalable_dimension" TEXT,
    "service_namespace" TEXT,
    "alarms" JSONB,
    "step_scaling_policy_configuration" JSONB,
    "target_tracking_scaling_policy_configuration" JSONB,

    CONSTRAINT "aws_applicationautoscaling_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_applicationautoscaling_scalable_targets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "max_capacity" BIGINT,
    "min_capacity" BIGINT,
    "resource_id" TEXT NOT NULL,
    "role_arn" TEXT,
    "scalable_dimension" TEXT,
    "service_namespace" TEXT,
    "scalable_target_arn" TEXT,
    "suspended_state" JSONB,

    CONSTRAINT "aws_applicationautoscaling_scalable_targets_cqpk" PRIMARY KEY ("account_id","region","resource_id")
);

-- CreateTable
CREATE TABLE "aws_applicationautoscaling_scaling_activities" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "activity_id" TEXT,
    "cause" TEXT,
    "description" TEXT,
    "resource_id" TEXT NOT NULL,
    "scalable_dimension" TEXT,
    "service_namespace" TEXT,
    "start_time" TIMESTAMP(6),
    "status_code" TEXT,
    "details" TEXT,
    "end_time" TIMESTAMP(6),
    "not_scaled_reasons" JSONB,
    "status_message" TEXT,

    CONSTRAINT "aws_applicationautoscaling_scaling_activities_cqpk" PRIMARY KEY ("account_id","region","resource_id")
);

-- CreateTable
CREATE TABLE "aws_applicationautoscaling_scheduled_actions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "resource_id" TEXT,
    "schedule" TEXT,
    "scheduled_action_arn" TEXT,
    "scheduled_action_name" TEXT,
    "service_namespace" TEXT,
    "end_time" TIMESTAMP(6),
    "scalable_dimension" TEXT,
    "scalable_target_action" JSONB,
    "start_time" TIMESTAMP(6),
    "timezone" TEXT,

    CONSTRAINT "aws_applicationautoscaling_scheduled_actions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appmesh_meshes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "mesh_name" TEXT,
    "metadata" JSONB,
    "spec" JSONB,
    "status" JSONB,

    CONSTRAINT "aws_appmesh_meshes_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_appmesh_virtual_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "mesh_arn" TEXT NOT NULL,
    "mesh_name" TEXT,
    "metadata" JSONB,
    "spec" JSONB,
    "status" JSONB,
    "virtual_gateway_name" TEXT,

    CONSTRAINT "aws_appmesh_virtual_gateways_cqpk" PRIMARY KEY ("request_account_id","request_region","arn","mesh_arn")
);

-- CreateTable
CREATE TABLE "aws_appmesh_virtual_nodes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "mesh_arn" TEXT NOT NULL,
    "mesh_name" TEXT,
    "metadata" JSONB,
    "spec" JSONB,
    "status" JSONB,
    "virtual_node_name" TEXT,

    CONSTRAINT "aws_appmesh_virtual_nodes_cqpk" PRIMARY KEY ("request_account_id","request_region","arn","mesh_arn")
);

-- CreateTable
CREATE TABLE "aws_appmesh_virtual_routers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "mesh_arn" TEXT NOT NULL,
    "mesh_name" TEXT,
    "metadata" JSONB,
    "spec" JSONB,
    "status" JSONB,
    "virtual_router_name" TEXT,

    CONSTRAINT "aws_appmesh_virtual_routers_cqpk" PRIMARY KEY ("request_account_id","request_region","arn","mesh_arn")
);

-- CreateTable
CREATE TABLE "aws_appmesh_virtual_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "mesh_arn" TEXT NOT NULL,
    "mesh_name" TEXT,
    "metadata" JSONB,
    "spec" JSONB,
    "status" JSONB,
    "virtual_service_name" TEXT,

    CONSTRAINT "aws_appmesh_virtual_services_cqpk" PRIMARY KEY ("request_account_id","request_region","arn","mesh_arn")
);

-- CreateTable
CREATE TABLE "aws_apprunner_auto_scaling_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "auto_scaling_configuration_arn" TEXT,
    "auto_scaling_configuration_name" TEXT,
    "auto_scaling_configuration_revision" BIGINT,
    "created_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "latest" BOOLEAN,
    "max_concurrency" BIGINT,
    "max_size" BIGINT,
    "min_size" BIGINT,
    "status" TEXT,

    CONSTRAINT "aws_apprunner_auto_scaling_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apprunner_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "connection_arn" TEXT,
    "connection_name" TEXT,
    "created_at" TIMESTAMP(6),
    "provider_type" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_apprunner_connections_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apprunner_custom_domains" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "enable_www_subdomain" BOOLEAN,
    "domain_name" TEXT,
    "status" TEXT,
    "certificate_validation_records" JSONB,

    CONSTRAINT "aws_apprunner_custom_domains_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_apprunner_observability_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "latest" BOOLEAN,
    "observability_configuration_arn" TEXT,
    "observability_configuration_name" TEXT,
    "observability_configuration_revision" BIGINT,
    "status" TEXT,
    "trace_configuration" JSONB,

    CONSTRAINT "aws_apprunner_observability_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apprunner_operations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "ended_at" TIMESTAMP(6),
    "id" TEXT,
    "started_at" TIMESTAMP(6),
    "status" TEXT,
    "target_arn" TEXT,
    "type" TEXT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "aws_apprunner_operations_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_apprunner_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "auto_scaling_configuration_summary" JSONB,
    "created_at" TIMESTAMP(6),
    "instance_configuration" JSONB,
    "network_configuration" JSONB,
    "service_arn" TEXT,
    "service_id" TEXT,
    "service_name" TEXT,
    "source_configuration" JSONB,
    "status" TEXT,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "encryption_configuration" JSONB,
    "health_check_configuration" JSONB,
    "observability_configuration" JSONB,
    "service_url" TEXT,

    CONSTRAINT "aws_apprunner_services_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apprunner_vpc_connectors" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "security_groups" TEXT[],
    "status" TEXT,
    "subnets" TEXT[],
    "vpc_connector_arn" TEXT,
    "vpc_connector_name" TEXT,
    "vpc_connector_revision" BIGINT,

    CONSTRAINT "aws_apprunner_vpc_connectors_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_apprunner_vpc_ingress_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "source_account_id" TEXT,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "domain_name" TEXT,
    "ingress_vpc_configuration" JSONB,
    "service_arn" TEXT,
    "status" TEXT,
    "vpc_ingress_connection_arn" TEXT,
    "vpc_ingress_connection_name" TEXT,

    CONSTRAINT "aws_apprunner_vpc_ingress_connections_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_app_blocks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "app_block_errors" JSONB,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "display_name" TEXT,
    "packaging_type" TEXT,
    "post_setup_script_details" JSONB,
    "setup_script_details" JSONB,
    "source_s3_location" JSONB,
    "state" TEXT,

    CONSTRAINT "aws_appstream_app_blocks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_application_fleet_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "application_arn" TEXT NOT NULL,
    "fleet_name" TEXT NOT NULL,

    CONSTRAINT "aws_appstream_application_fleet_associations_cqpk" PRIMARY KEY ("application_arn","fleet_name")
);

-- CreateTable
CREATE TABLE "aws_appstream_applications" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "app_block_arn" TEXT,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "display_name" TEXT,
    "enabled" BOOLEAN,
    "icon_s3_location" JSONB,
    "icon_url" TEXT,
    "instance_families" TEXT[],
    "launch_parameters" TEXT,
    "launch_path" TEXT,
    "metadata" JSONB,
    "name" TEXT,
    "platforms" TEXT[],
    "working_directory" TEXT,

    CONSTRAINT "aws_appstream_applications_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_directory_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "directory_name" TEXT NOT NULL,
    "certificate_based_auth_properties" JSONB,
    "created_time" TIMESTAMP(6),
    "organizational_unit_distinguished_names" TEXT[],
    "service_account_credentials" JSONB,

    CONSTRAINT "aws_appstream_directory_configs_cqpk" PRIMARY KEY ("account_id","region","directory_name")
);

-- CreateTable
CREATE TABLE "aws_appstream_fleets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "compute_capacity_status" JSONB,
    "instance_type" TEXT,
    "name" TEXT,
    "state" TEXT,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "disconnect_timeout_in_seconds" BIGINT,
    "display_name" TEXT,
    "domain_join_info" JSONB,
    "enable_default_internet_access" BOOLEAN,
    "fleet_errors" JSONB,
    "fleet_type" TEXT,
    "iam_role_arn" TEXT,
    "idle_disconnect_timeout_in_seconds" BIGINT,
    "image_arn" TEXT,
    "image_name" TEXT,
    "max_concurrent_sessions" BIGINT,
    "max_user_duration_in_seconds" BIGINT,
    "platform" TEXT,
    "session_script_s3_location" JSONB,
    "stream_view" TEXT,
    "usb_device_filter_strings" TEXT[],
    "vpc_config" JSONB,

    CONSTRAINT "aws_appstream_fleets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_image_builders" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "access_endpoints" JSONB,
    "appstream_agent_version" TEXT,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "display_name" TEXT,
    "domain_join_info" JSONB,
    "enable_default_internet_access" BOOLEAN,
    "iam_role_arn" TEXT,
    "image_arn" TEXT,
    "image_builder_errors" JSONB,
    "instance_type" TEXT,
    "network_access_configuration" JSONB,
    "platform" TEXT,
    "state" TEXT,
    "state_change_reason" JSONB,
    "vpc_config" JSONB,

    CONSTRAINT "aws_appstream_image_builders_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_images" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT,
    "applications" JSONB,
    "appstream_agent_version" TEXT,
    "arn" TEXT NOT NULL,
    "base_image_arn" TEXT,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "display_name" TEXT,
    "image_builder_name" TEXT,
    "image_builder_supported" BOOLEAN,
    "image_errors" JSONB,
    "image_permissions" JSONB,
    "platform" TEXT,
    "public_base_image_released_date" TIMESTAMP(6),
    "state" TEXT,
    "state_change_reason" JSONB,
    "visibility" TEXT,

    CONSTRAINT "aws_appstream_images_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_stack_entitlements" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "stack_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "app_visibility" TEXT,
    "attributes" JSONB,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "last_modified_time" TIMESTAMP(6),

    CONSTRAINT "aws_appstream_stack_entitlements_cqpk" PRIMARY KEY ("account_id","region","stack_name","name")
);

-- CreateTable
CREATE TABLE "aws_appstream_stack_user_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "stack_name" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "authentication_type" TEXT NOT NULL,
    "send_email_notification" BOOLEAN,

    CONSTRAINT "aws_appstream_stack_user_associations_cqpk" PRIMARY KEY ("account_id","region","stack_name","user_name","authentication_type")
);

-- CreateTable
CREATE TABLE "aws_appstream_stacks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "access_endpoints" JSONB,
    "application_settings" JSONB,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "display_name" TEXT,
    "embed_host_domains" TEXT[],
    "feedback_url" TEXT,
    "redirect_url" TEXT,
    "stack_errors" JSONB,
    "storage_connectors" JSONB,
    "streaming_experience_settings" JSONB,
    "user_settings" JSONB,

    CONSTRAINT "aws_appstream_stacks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appstream_usage_report_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "s3_bucket_name" TEXT NOT NULL,
    "last_generated_report_date" TIMESTAMP(6),
    "schedule" TEXT,
    "subscription_errors" JSONB,

    CONSTRAINT "aws_appstream_usage_report_subscriptions_cqpk" PRIMARY KEY ("account_id","region","s3_bucket_name")
);

-- CreateTable
CREATE TABLE "aws_appstream_users" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "authentication_type" TEXT,
    "created_time" TIMESTAMP(6),
    "enabled" BOOLEAN,
    "first_name" TEXT,
    "last_name" TEXT,
    "status" TEXT,
    "user_name" TEXT,

    CONSTRAINT "aws_appstream_users_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_appsync_graphql_apis" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "additional_authentication_providers" JSONB,
    "api_id" TEXT,
    "api_type" TEXT,
    "authentication_type" TEXT,
    "dns" JSONB,
    "lambda_authorizer_config" JSONB,
    "log_config" JSONB,
    "merged_api_execution_role_arn" TEXT,
    "name" TEXT,
    "open_id_connect_config" JSONB,
    "owner" TEXT,
    "owner_contact" TEXT,
    "tags" JSONB,
    "uris" JSONB,
    "user_pool_config" JSONB,
    "visibility" TEXT,
    "waf_web_acl_arn" TEXT,
    "xray_enabled" BOOLEAN,

    CONSTRAINT "aws_appsync_graphql_apis_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_athena_data_catalog_database_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "data_catalog_arn" TEXT NOT NULL,
    "data_catalog_database_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columns" JSONB,
    "create_time" TIMESTAMP(6),
    "last_access_time" TIMESTAMP(6),
    "parameters" JSONB,
    "partition_keys" JSONB,
    "table_type" TEXT,

    CONSTRAINT "aws_athena_data_catalog_database_tables_cqpk" PRIMARY KEY ("data_catalog_arn","data_catalog_database_name","name")
);

-- CreateTable
CREATE TABLE "aws_athena_data_catalog_databases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "data_catalog_arn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB,

    CONSTRAINT "aws_athena_data_catalog_databases_cqpk" PRIMARY KEY ("data_catalog_arn","name")
);

-- CreateTable
CREATE TABLE "aws_athena_data_catalogs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "name" TEXT,
    "type" TEXT,
    "description" TEXT,
    "parameters" JSONB,

    CONSTRAINT "aws_athena_data_catalogs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_athena_work_group_named_queries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "work_group_arn" TEXT,
    "database" TEXT,
    "name" TEXT,
    "query_string" TEXT,
    "description" TEXT,
    "named_query_id" TEXT,
    "work_group" TEXT,

    CONSTRAINT "aws_athena_work_group_named_queries_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_athena_work_group_prepared_statements" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "work_group_arn" TEXT,
    "description" TEXT,
    "last_modified_time" TIMESTAMP(6),
    "query_statement" TEXT,
    "statement_name" TEXT,
    "work_group_name" TEXT,

    CONSTRAINT "aws_athena_work_group_prepared_statements_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_athena_work_group_query_executions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "work_group_arn" TEXT,
    "engine_version" JSONB,
    "execution_parameters" TEXT[],
    "query" TEXT,
    "query_execution_context" JSONB,
    "query_execution_id" TEXT,
    "result_configuration" JSONB,
    "result_reuse_configuration" JSONB,
    "statement_type" TEXT,
    "statistics" JSONB,
    "status" JSONB,
    "substatement_type" TEXT,
    "work_group" TEXT,

    CONSTRAINT "aws_athena_work_group_query_executions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_athena_work_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "name" TEXT,
    "configuration" JSONB,
    "creation_time" TIMESTAMP(6),
    "description" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_athena_work_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_auditmanager_assessments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "aws_account" JSONB,
    "framework" JSONB,
    "metadata" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_auditmanager_assessments_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_group_lifecycle_hooks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "group_arn" TEXT,
    "auto_scaling_group_name" TEXT,
    "default_result" TEXT,
    "global_timeout" BIGINT,
    "heartbeat_timeout" BIGINT,
    "lifecycle_hook_name" TEXT,
    "lifecycle_transition" TEXT,
    "notification_metadata" TEXT,
    "notification_target_arn" TEXT,
    "role_arn" TEXT,

    CONSTRAINT "aws_autoscaling_group_lifecycle_hooks_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_group_scaling_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "group_arn" TEXT,
    "arn" TEXT NOT NULL,
    "adjustment_type" TEXT,
    "alarms" JSONB,
    "auto_scaling_group_name" TEXT,
    "cooldown" BIGINT,
    "enabled" BOOLEAN,
    "estimated_instance_warmup" BIGINT,
    "metric_aggregation_type" TEXT,
    "min_adjustment_magnitude" BIGINT,
    "min_adjustment_step" BIGINT,
    "policy_arn" TEXT,
    "policy_name" TEXT,
    "policy_type" TEXT,
    "predictive_scaling_configuration" JSONB,
    "scaling_adjustment" BIGINT,
    "step_adjustments" JSONB,
    "target_tracking_configuration" JSONB,

    CONSTRAINT "aws_autoscaling_group_scaling_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "load_balancers" JSONB,
    "load_balancer_target_groups" JSONB,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "tags_raw" JSONB,
    "auto_scaling_group_name" TEXT,
    "availability_zones" TEXT[],
    "created_time" TIMESTAMP(6),
    "default_cooldown" BIGINT,
    "desired_capacity" BIGINT,
    "health_check_type" TEXT,
    "max_size" BIGINT,
    "min_size" BIGINT,
    "auto_scaling_group_arn" TEXT,
    "capacity_rebalance" BOOLEAN,
    "context" TEXT,
    "default_instance_warmup" BIGINT,
    "desired_capacity_type" TEXT,
    "enabled_metrics" JSONB,
    "health_check_grace_period" BIGINT,
    "instances" JSONB,
    "launch_configuration_name" TEXT,
    "launch_template" JSONB,
    "load_balancer_names" TEXT[],
    "max_instance_lifetime" BIGINT,
    "mixed_instances_policy" JSONB,
    "new_instances_protected_from_scale_in" BOOLEAN,
    "placement_group" TEXT,
    "predicted_capacity" BIGINT,
    "service_linked_role_arn" TEXT,
    "status" TEXT,
    "suspended_processes" JSONB,
    "target_group_arns" TEXT[],
    "termination_policies" TEXT[],
    "traffic_sources" JSONB,
    "vpc_zone_identifier" TEXT,
    "warm_pool_configuration" JSONB,
    "warm_pool_size" BIGINT,
    "notification_configurations" JSONB,

    CONSTRAINT "aws_autoscaling_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_launch_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_time" TIMESTAMP(6),
    "image_id" TEXT,
    "instance_type" TEXT,
    "launch_configuration_name" TEXT,
    "associate_public_ip_address" BOOLEAN,
    "block_device_mappings" JSONB,
    "classic_link_vpc_id" TEXT,
    "classic_link_vpc_security_groups" TEXT[],
    "ebs_optimized" BOOLEAN,
    "iam_instance_profile" TEXT,
    "instance_monitoring" JSONB,
    "kernel_id" TEXT,
    "key_name" TEXT,
    "launch_configuration_arn" TEXT,
    "metadata_options" JSONB,
    "placement_tenancy" TEXT,
    "ramdisk_id" TEXT,
    "security_groups" TEXT[],
    "spot_price" TEXT,
    "user_data" TEXT,

    CONSTRAINT "aws_autoscaling_launch_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_plan_resources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "scalable_dimension" TEXT,
    "scaling_plan_name" TEXT NOT NULL,
    "scaling_plan_version" BIGINT,
    "scaling_status_code" TEXT,
    "service_namespace" TEXT,
    "scaling_policies" JSONB,
    "scaling_status_message" TEXT,

    CONSTRAINT "aws_autoscaling_plan_resources_cqpk" PRIMARY KEY ("account_id","region","resource_id","scaling_plan_name")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_plans" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "application_source" JSONB,
    "scaling_instructions" JSONB,
    "scaling_plan_name" TEXT NOT NULL,
    "scaling_plan_version" BIGINT,
    "status_code" TEXT,
    "creation_time" TIMESTAMP(6),
    "status_message" TEXT,
    "status_start_time" TIMESTAMP(6),

    CONSTRAINT "aws_autoscaling_plans_cqpk" PRIMARY KEY ("account_id","region","scaling_plan_name")
);

-- CreateTable
CREATE TABLE "aws_autoscaling_scheduled_actions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "auto_scaling_group_name" TEXT,
    "desired_capacity" BIGINT,
    "end_time" TIMESTAMP(6),
    "max_size" BIGINT,
    "min_size" BIGINT,
    "recurrence" TEXT,
    "scheduled_action_arn" TEXT,
    "scheduled_action_name" TEXT,
    "start_time" TIMESTAMP(6),
    "time" TIMESTAMP(6),
    "time_zone" TEXT,

    CONSTRAINT "aws_autoscaling_scheduled_actions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_availability_zones" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "enabled" BOOLEAN,
    "partition" TEXT,
    "region" TEXT,
    "group_name" TEXT,
    "messages" JSONB,
    "network_border_group" TEXT,
    "opt_in_status" TEXT,
    "parent_zone_id" TEXT,
    "parent_zone_name" TEXT,
    "region_name" TEXT NOT NULL,
    "state" TEXT,
    "zone_id" TEXT NOT NULL,
    "zone_name" TEXT,
    "zone_type" TEXT,

    CONSTRAINT "aws_availability_zones_cqpk" PRIMARY KEY ("account_id","region_name","zone_id")
);

-- CreateTable
CREATE TABLE "aws_backup_global_settings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "global_settings" JSONB,
    "last_update_time" TIMESTAMP(6),
    "result_metadata" JSONB,

    CONSTRAINT "aws_backup_global_settings_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_backup_jobs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "backup_job_id" TEXT NOT NULL,
    "backup_options" JSONB,
    "backup_size_in_bytes" BIGINT,
    "backup_type" TEXT,
    "backup_vault_arn" TEXT,
    "backup_vault_name" TEXT,
    "bytes_transferred" BIGINT,
    "completion_date" TIMESTAMP(6),
    "created_by" JSONB,
    "creation_date" TIMESTAMP(6),
    "expected_completion_date" TIMESTAMP(6),
    "iam_role_arn" TEXT,
    "is_parent" BOOLEAN,
    "parent_job_id" TEXT,
    "percent_done" TEXT,
    "recovery_point_arn" TEXT,
    "resource_arn" TEXT,
    "resource_name" TEXT,
    "resource_type" TEXT,
    "start_by" TIMESTAMP(6),
    "state" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_backup_jobs_cqpk" PRIMARY KEY ("account_id","region","backup_job_id")
);

-- CreateTable
CREATE TABLE "aws_backup_plan_selections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "plan_arn" TEXT,
    "backup_plan_id" TEXT,
    "backup_selection" JSONB,
    "creation_date" TIMESTAMP(6),
    "creator_request_id" TEXT,
    "selection_id" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_backup_plan_selections_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_backup_plans" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "advanced_backup_settings" JSONB,
    "backup_plan" JSONB,
    "backup_plan_arn" TEXT,
    "backup_plan_id" TEXT,
    "creation_date" TIMESTAMP(6),
    "creator_request_id" TEXT,
    "deletion_date" TIMESTAMP(6),
    "last_execution_date" TIMESTAMP(6),
    "version_id" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_backup_plans_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_backup_protected_resources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "last_backup_time" TIMESTAMP(6),
    "resource_arn" TEXT,
    "resource_name" TEXT,
    "resource_type" TEXT,

    CONSTRAINT "aws_backup_protected_resources_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_backup_region_settings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "resource_type_management_preference" JSONB,
    "resource_type_opt_in_preference" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_backup_region_settings_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_backup_report_plans" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "deployment_status" TEXT,
    "last_attempted_execution_time" TIMESTAMP(6),
    "last_successful_execution_time" TIMESTAMP(6),
    "report_delivery_channel" JSONB,
    "report_plan_arn" TEXT,
    "report_plan_description" TEXT,
    "report_plan_name" TEXT,
    "report_setting" JSONB,

    CONSTRAINT "aws_backup_report_plans_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_backup_vault_recovery_points" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "vault_arn" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "backup_size_in_bytes" BIGINT,
    "backup_vault_arn" TEXT,
    "backup_vault_name" TEXT,
    "calculated_lifecycle" JSONB,
    "completion_date" TIMESTAMP(6),
    "composite_member_identifier" TEXT,
    "created_by" JSONB,
    "creation_date" TIMESTAMP(6),
    "encryption_key_arn" TEXT,
    "iam_role_arn" TEXT,
    "is_encrypted" BOOLEAN,
    "is_parent" BOOLEAN,
    "last_restore_time" TIMESTAMP(6),
    "lifecycle" JSONB,
    "parent_recovery_point_arn" TEXT,
    "recovery_point_arn" TEXT,
    "resource_arn" TEXT,
    "resource_name" TEXT,
    "resource_type" TEXT,
    "source_backup_vault_arn" TEXT,
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_backup_vault_recovery_points_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_backup_vaults" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "access_policy" JSONB,
    "notifications" JSONB,
    "tags" JSONB,
    "backup_vault_arn" TEXT,
    "backup_vault_name" TEXT,
    "creation_date" TIMESTAMP(6),
    "creator_request_id" TEXT,
    "encryption_key_arn" TEXT,
    "lock_date" TIMESTAMP(6),
    "locked" BOOLEAN,
    "max_retention_days" BIGINT,
    "min_retention_days" BIGINT,
    "number_of_recovery_points" BIGINT,

    CONSTRAINT "aws_backup_vaults_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_batch_job_definitions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "job_definition_arn" TEXT,
    "job_definition_name" TEXT,
    "revision" BIGINT,
    "type" TEXT,
    "container_orchestration_type" TEXT,
    "container_properties" JSONB,
    "eks_properties" JSONB,
    "node_properties" JSONB,
    "parameters" JSONB,
    "platform_capabilities" TEXT[],
    "propagate_tags" BOOLEAN,
    "retry_strategy" JSONB,
    "scheduling_priority" BIGINT,
    "status" TEXT,
    "timeout" JSONB,

    CONSTRAINT "aws_batch_job_definitions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_batch_job_queues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "compute_environment_order" JSONB,
    "job_queue_arn" TEXT,
    "job_queue_name" TEXT,
    "priority" BIGINT,
    "state" TEXT,
    "scheduling_policy_arn" TEXT,
    "status" TEXT,
    "status_reason" TEXT,

    CONSTRAINT "aws_batch_job_queues_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_batch_jobs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "job_definition" TEXT,
    "job_id" TEXT,
    "job_name" TEXT,
    "job_queue" TEXT,
    "started_at" BIGINT,
    "status" TEXT,
    "array_properties" JSONB,
    "attempts" JSONB,
    "container" JSONB,
    "created_at" BIGINT,
    "depends_on" JSONB,
    "eks_attempts" JSONB,
    "eks_properties" JSONB,
    "is_cancelled" BOOLEAN,
    "is_terminated" BOOLEAN,
    "job_arn" TEXT,
    "node_details" JSONB,
    "node_properties" JSONB,
    "parameters" JSONB,
    "platform_capabilities" TEXT[],
    "propagate_tags" BOOLEAN,
    "retry_strategy" JSONB,
    "scheduling_priority" BIGINT,
    "share_identifier" TEXT,
    "status_reason" TEXT,
    "stopped_at" BIGINT,
    "timeout" JSONB,

    CONSTRAINT "aws_batch_jobs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_instance_resource_drifts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT,
    "request_region" TEXT,
    "stack_set_arn" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "logical_resource_id" TEXT NOT NULL,
    "resource_type" TEXT,
    "stack_id" TEXT NOT NULL,
    "stack_resource_drift_status" TEXT,
    "timestamp" TIMESTAMP(6),
    "physical_resource_id" TEXT NOT NULL,
    "physical_resource_id_context" JSONB,
    "property_differences" JSONB,

    CONSTRAINT "aws_cloudformation_stack_instance_resource_drifts_cqpk" PRIMARY KEY ("stack_set_arn","operation_id","logical_resource_id","stack_id","physical_resource_id")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_instance_summaries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "id" TEXT,
    "stack_set_arn" TEXT NOT NULL,
    "account" TEXT,
    "drift_status" TEXT,
    "last_drift_check_timestamp" TIMESTAMP(6),
    "last_operation_id" TEXT,
    "organizational_unit_id" TEXT,
    "stack_id" TEXT,
    "stack_instance_status" JSONB,
    "stack_set_id" TEXT NOT NULL,
    "status" TEXT,
    "status_reason" TEXT,

    CONSTRAINT "aws_cloudformation_stack_instance_summaries_cqpk" PRIMARY KEY ("stack_set_arn","stack_set_id")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_resources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "stack_id" TEXT,
    "last_updated_timestamp" TIMESTAMP(6),
    "logical_resource_id" TEXT,
    "resource_status" TEXT,
    "resource_type" TEXT,
    "drift_information" JSONB,
    "module_info" JSONB,
    "physical_resource_id" TEXT,
    "resource_status_reason" TEXT,

    CONSTRAINT "aws_cloudformation_stack_resources_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_set_operation_results" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT,
    "request_region" TEXT,
    "operation_id" TEXT,
    "stack_set_arn" TEXT,
    "account" TEXT,
    "account_gate_result" JSONB,
    "organizational_unit_id" TEXT,
    "region" TEXT,
    "status" TEXT,
    "status_reason" TEXT,

    CONSTRAINT "aws_cloudformation_stack_set_operation_results_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_set_operations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "id" TEXT,
    "stack_set_arn" TEXT NOT NULL,
    "action" TEXT,
    "administration_role_arn" TEXT,
    "creation_timestamp" TIMESTAMP(6) NOT NULL,
    "deployment_targets" JSONB,
    "end_timestamp" TIMESTAMP(6),
    "execution_role_name" TEXT,
    "operation_id" TEXT NOT NULL,
    "operation_preferences" JSONB,
    "retain_stacks" BOOLEAN,
    "stack_set_drift_detection_details" JSONB,
    "stack_set_id" TEXT,
    "status" TEXT,
    "status_details" JSONB,
    "status_reason" TEXT,

    CONSTRAINT "aws_cloudformation_stack_set_operations_cqpk" PRIMARY KEY ("stack_set_arn","creation_timestamp","operation_id")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "administration_role_arn" TEXT,
    "auto_deployment" JSONB,
    "capabilities" TEXT[],
    "description" TEXT,
    "execution_role_name" TEXT,
    "managed_execution" JSONB,
    "organizational_unit_ids" TEXT[],
    "parameters" JSONB,
    "permission_model" TEXT,
    "regions" TEXT[],
    "stack_set_arn" TEXT,
    "stack_set_drift_detection_details" JSONB,
    "stack_set_id" TEXT,
    "stack_set_name" TEXT,
    "status" TEXT,
    "template_body" TEXT,

    CONSTRAINT "aws_cloudformation_stack_sets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stack_templates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "stack_arn" TEXT NOT NULL,
    "template_body" JSONB,
    "template_body_text" TEXT,
    "stages_available" TEXT[],

    CONSTRAINT "aws_cloudformation_stack_templates_cqpk" PRIMARY KEY ("stack_arn")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_stacks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "stack_name" TEXT,
    "stack_status" TEXT,
    "capabilities" TEXT[],
    "change_set_id" TEXT,
    "deletion_time" TIMESTAMP(6),
    "description" TEXT,
    "disable_rollback" BOOLEAN,
    "drift_information" JSONB,
    "enable_termination_protection" BOOLEAN,
    "last_updated_time" TIMESTAMP(6),
    "notification_arns" TEXT[],
    "outputs" JSONB,
    "parameters" JSONB,
    "parent_id" TEXT,
    "retain_except_on_create" BOOLEAN,
    "role_arn" TEXT,
    "rollback_configuration" JSONB,
    "root_id" TEXT,
    "stack_id" TEXT,
    "stack_status_reason" TEXT,
    "timeout_in_minutes" BIGINT,

    CONSTRAINT "aws_cloudformation_stacks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudformation_template_summaries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "stack_id" TEXT,
    "stack_arn" TEXT NOT NULL,
    "metadata" JSONB,
    "capabilities" TEXT[],
    "capabilities_reason" TEXT,
    "declared_transforms" TEXT[],
    "description" TEXT,
    "parameters" JSONB,
    "resource_identifier_summaries" JSONB,
    "resource_types" TEXT[],
    "version" TEXT,
    "warnings" JSONB,

    CONSTRAINT "aws_cloudformation_template_summaries_cqpk" PRIMARY KEY ("stack_arn")
);

-- CreateTable
CREATE TABLE "aws_cloudfront_cache_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "id" TEXT,
    "arn" TEXT NOT NULL,
    "cache_policy" JSONB,
    "type" TEXT,

    CONSTRAINT "aws_cloudfront_cache_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudfront_distributions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "distribution_config" JSONB,
    "domain_name" TEXT,
    "id" TEXT,
    "in_progress_invalidation_batches" BIGINT,
    "last_modified_time" TIMESTAMP(6),
    "status" TEXT,
    "active_trusted_key_groups" JSONB,
    "active_trusted_signers" JSONB,
    "alias_icp_recordals" JSONB,

    CONSTRAINT "aws_cloudfront_distributions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudfront_functions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "stage" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "e_tag" TEXT,
    "function_summary" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_cloudfront_functions_cqpk" PRIMARY KEY ("stage","arn")
);

-- CreateTable
CREATE TABLE "aws_cloudfront_origin_access_identities" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "comment" TEXT,
    "id" TEXT NOT NULL,
    "s3_canonical_user_id" TEXT,

    CONSTRAINT "aws_cloudfront_origin_access_identities_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_cloudfront_origin_request_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "origin_request_policy" JSONB,
    "type" TEXT,

    CONSTRAINT "aws_cloudfront_origin_request_policies_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_cloudfront_response_headers_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "response_headers_policy" JSONB,
    "type" TEXT,

    CONSTRAINT "aws_cloudfront_response_headers_policies_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_cloudhsmv2_backups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "backup_id" TEXT,
    "backup_state" TEXT,
    "cluster_id" TEXT,
    "copy_timestamp" TIMESTAMP(6),
    "create_timestamp" TIMESTAMP(6),
    "delete_timestamp" TIMESTAMP(6),
    "never_expires" BOOLEAN,
    "source_backup" TEXT,
    "source_cluster" TEXT,
    "source_region" TEXT,

    CONSTRAINT "aws_cloudhsmv2_backups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudhsmv2_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "backup_policy" TEXT,
    "backup_retention_policy" JSONB,
    "certificates" JSONB,
    "cluster_id" TEXT,
    "create_timestamp" TIMESTAMP(6),
    "hsm_type" TEXT,
    "hsms" JSONB,
    "pre_co_password" TEXT,
    "security_group" TEXT,
    "source_backup_id" TEXT,
    "state" TEXT,
    "state_message" TEXT,
    "subnet_mapping" JSONB,
    "vpc_id" TEXT,

    CONSTRAINT "aws_cloudhsmv2_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudtrail_channels" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "channel_arn" TEXT,
    "destinations" JSONB,
    "ingestion_status" JSONB,
    "name" TEXT,
    "source" TEXT,
    "source_config" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_cloudtrail_channels_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudtrail_imports" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "created_timestamp" TIMESTAMP(6),
    "destinations" TEXT[],
    "end_event_time" TIMESTAMP(6),
    "import_id" TEXT,
    "import_source" JSONB,
    "import_statistics" JSONB,
    "import_status" TEXT,
    "start_event_time" TIMESTAMP(6),
    "updated_timestamp" TIMESTAMP(6),

    CONSTRAINT "aws_cloudtrail_imports_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_cloudtrail_trail_event_selectors" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "trail_arn" TEXT,
    "data_resources" JSONB,
    "exclude_management_event_sources" TEXT[],
    "include_management_events" BOOLEAN,
    "read_write_type" TEXT,

    CONSTRAINT "aws_cloudtrail_trail_event_selectors_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_cloudtrail_trails" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "cloudwatch_logs_log_group_name" TEXT,
    "arn" TEXT NOT NULL,
    "status" JSONB,
    "cloud_watch_logs_log_group_arn" TEXT,
    "cloud_watch_logs_role_arn" TEXT,
    "has_custom_event_selectors" BOOLEAN,
    "has_insight_selectors" BOOLEAN,
    "home_region" TEXT,
    "include_global_service_events" BOOLEAN,
    "is_multi_region_trail" BOOLEAN,
    "is_organization_trail" BOOLEAN,
    "kms_key_id" TEXT,
    "log_file_validation_enabled" BOOLEAN,
    "name" TEXT,
    "s3_bucket_name" TEXT,
    "s3_key_prefix" TEXT,
    "sns_topic_arn" TEXT,
    "sns_topic_name" TEXT,
    "trail_arn" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_cloudtrail_trails_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_cloudwatch_alarms" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "dimensions" JSONB,
    "actions_enabled" BOOLEAN,
    "alarm_actions" TEXT[],
    "alarm_arn" TEXT,
    "alarm_configuration_updated_timestamp" TIMESTAMP(6),
    "alarm_description" TEXT,
    "alarm_name" TEXT,
    "comparison_operator" TEXT,
    "datapoints_to_alarm" BIGINT,
    "evaluate_low_sample_count_percentile" TEXT,
    "evaluation_periods" BIGINT,
    "evaluation_state" TEXT,
    "extended_statistic" TEXT,
    "insufficient_data_actions" TEXT[],
    "metric_name" TEXT,
    "metrics" JSONB,
    "namespace" TEXT,
    "ok_actions" TEXT[],
    "period" BIGINT,
    "state_reason" TEXT,
    "state_reason_data" TEXT,
    "state_transitioned_timestamp" TIMESTAMP(6),
    "state_updated_timestamp" TIMESTAMP(6),
    "state_value" TEXT,
    "statistic" TEXT,
    "threshold" DOUBLE PRECISION,
    "threshold_metric_id" TEXT,
    "treat_missing_data" TEXT,
    "unit" TEXT,

    CONSTRAINT "aws_cloudwatch_alarms_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudwatchlogs_log_group_data_protection_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "log_group_arn" TEXT NOT NULL,
    "last_updated_time" BIGINT,
    "log_group_identifier" TEXT,
    "policy_document" TEXT,

    CONSTRAINT "aws_cloudwatchlogs_log_group_data_protection_policies_cqpk" PRIMARY KEY ("log_group_arn")
);

-- CreateTable
CREATE TABLE "aws_cloudwatchlogs_log_group_subscription_filters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "log_group_arn" TEXT NOT NULL,
    "creation_time" BIGINT NOT NULL,
    "destination_arn" TEXT,
    "distribution" TEXT,
    "filter_name" TEXT NOT NULL,
    "filter_pattern" TEXT,
    "log_group_name" TEXT,
    "role_arn" TEXT,

    CONSTRAINT "aws_cloudwatchlogs_log_group_subscription_filters_cqpk" PRIMARY KEY ("log_group_arn","creation_time","filter_name")
);

-- CreateTable
CREATE TABLE "aws_cloudwatchlogs_log_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" BIGINT,
    "data_protection_status" TEXT,
    "inherited_properties" TEXT[],
    "kms_key_id" TEXT,
    "log_group_name" TEXT,
    "metric_filter_count" BIGINT,
    "retention_in_days" BIGINT,
    "stored_bytes" BIGINT,

    CONSTRAINT "aws_cloudwatchlogs_log_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cloudwatchlogs_metric_filters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "log_group_arn" TEXT NOT NULL,
    "creation_time" BIGINT,
    "filter_name" TEXT NOT NULL,
    "filter_pattern" TEXT,
    "log_group_name" TEXT,
    "metric_transformations" JSONB,

    CONSTRAINT "aws_cloudwatchlogs_metric_filters_cqpk" PRIMARY KEY ("log_group_arn","filter_name")
);

-- CreateTable
CREATE TABLE "aws_cloudwatchlogs_resource_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "policy_name" TEXT NOT NULL,
    "policy_document" JSONB,
    "last_updated_time" BIGINT,

    CONSTRAINT "aws_cloudwatchlogs_resource_policies_cqpk" PRIMARY KEY ("account_id","region","policy_name")
);

-- CreateTable
CREATE TABLE "aws_codeartifact_domains" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "asset_size_bytes" BIGINT,
    "created_time" TIMESTAMP(6),
    "encryption_key" TEXT,
    "name" TEXT,
    "owner" TEXT,
    "repository_count" BIGINT,
    "s3_bucket_arn" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_codeartifact_domains_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_codeartifact_repositories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "tags" JSONB,
    "administrator_account" TEXT,
    "arn" TEXT NOT NULL,
    "created_time" TIMESTAMP(6),
    "description" TEXT,
    "domain_name" TEXT,
    "domain_owner" TEXT,
    "external_connections" JSONB,
    "name" TEXT,
    "upstreams" JSONB,

    CONSTRAINT "aws_codeartifact_repositories_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_codebuild_builds" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "artifacts" JSONB,
    "build_batch_arn" TEXT,
    "build_complete" BOOLEAN,
    "build_number" BIGINT,
    "build_status" TEXT,
    "cache" JSONB,
    "current_phase" TEXT,
    "debug_session" JSONB,
    "encryption_key" TEXT,
    "end_time" TIMESTAMP(6),
    "environment" JSONB,
    "exported_environment_variables" JSONB,
    "file_system_locations" JSONB,
    "id" TEXT,
    "initiator" TEXT,
    "logs" JSONB,
    "network_interface" JSONB,
    "phases" JSONB,
    "project_name" TEXT,
    "queued_timeout_in_minutes" BIGINT,
    "report_arns" TEXT[],
    "resolved_source_version" TEXT,
    "secondary_artifacts" JSONB,
    "secondary_source_versions" JSONB,
    "secondary_sources" JSONB,
    "service_role" TEXT,
    "source" JSONB,
    "source_version" TEXT,
    "start_time" TIMESTAMP(6),
    "timeout_in_minutes" BIGINT,
    "vpc_config" JSONB,

    CONSTRAINT "aws_codebuild_builds_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_codebuild_projects" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "artifacts" JSONB,
    "badge" JSONB,
    "build_batch_config" JSONB,
    "cache" JSONB,
    "concurrent_build_limit" BIGINT,
    "created" TIMESTAMP(6),
    "description" TEXT,
    "encryption_key" TEXT,
    "environment" JSONB,
    "file_system_locations" JSONB,
    "last_modified" TIMESTAMP(6),
    "logs_config" JSONB,
    "name" TEXT,
    "project_visibility" TEXT,
    "public_project_alias" TEXT,
    "queued_timeout_in_minutes" BIGINT,
    "resource_access_role" TEXT,
    "secondary_artifacts" JSONB,
    "secondary_source_versions" JSONB,
    "secondary_sources" JSONB,
    "service_role" TEXT,
    "source" JSONB,
    "source_version" TEXT,
    "timeout_in_minutes" BIGINT,
    "vpc_config" JSONB,
    "webhook" JSONB,

    CONSTRAINT "aws_codebuild_projects_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_codebuild_source_credentials" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "auth_type" TEXT,
    "server_type" TEXT,

    CONSTRAINT "aws_codebuild_source_credentials_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_codecommit_repositories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "clone_url_http" TEXT,
    "clone_url_ssh" TEXT,
    "creation_date" TIMESTAMP(6),
    "default_branch" TEXT,
    "last_modified_date" TIMESTAMP(6),
    "repository_description" TEXT,
    "repository_id" TEXT,
    "repository_name" TEXT,

    CONSTRAINT "aws_codecommit_repositories_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_codepipeline_pipelines" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "metadata" JSONB,
    "pipeline" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_codepipeline_pipelines_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_codepipeline_webhooks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "definition" JSONB,
    "url" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "last_triggered" TIMESTAMP(6),

    CONSTRAINT "aws_codepipeline_webhooks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_cognito_identity_pools" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT,
    "id" TEXT NOT NULL,
    "saml_provider_arns" TEXT[],
    "allow_unauthenticated_identities" BOOLEAN,
    "identity_pool_id" TEXT,
    "identity_pool_name" TEXT,
    "allow_classic_flow" BOOLEAN,
    "cognito_identity_providers" JSONB,
    "developer_provider_name" TEXT,
    "identity_pool_tags" JSONB,
    "open_id_connect_provider_arns" TEXT[],
    "supported_login_providers" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_cognito_identity_pools_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_cognito_user_pool_identity_providers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "user_pool_arn" TEXT,
    "attribute_mapping" JSONB,
    "creation_date" TIMESTAMP(6),
    "idp_identifiers" TEXT[],
    "last_modified_date" TIMESTAMP(6),
    "provider_details" JSONB,
    "provider_name" TEXT,
    "provider_type" TEXT,
    "user_pool_id" TEXT,

    CONSTRAINT "aws_cognito_user_pool_identity_providers_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_cognito_user_pools" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "account_recovery_setting" JSONB,
    "admin_create_user_config" JSONB,
    "alias_attributes" TEXT[],
    "arn" TEXT,
    "auto_verified_attributes" TEXT[],
    "creation_date" TIMESTAMP(6),
    "custom_domain" TEXT,
    "deletion_protection" TEXT,
    "device_configuration" JSONB,
    "domain" TEXT,
    "email_configuration" JSONB,
    "email_configuration_failure" TEXT,
    "email_verification_message" TEXT,
    "email_verification_subject" TEXT,
    "estimated_number_of_users" BIGINT,
    "lambda_config" JSONB,
    "last_modified_date" TIMESTAMP(6),
    "mfa_configuration" TEXT,
    "name" TEXT,
    "policies" JSONB,
    "schema_attributes" JSONB,
    "sms_authentication_message" TEXT,
    "sms_configuration" JSONB,
    "sms_configuration_failure" TEXT,
    "sms_verification_message" TEXT,
    "status" TEXT,
    "user_attribute_update_settings" JSONB,
    "user_pool_add_ons" JSONB,
    "user_pool_tags" JSONB,
    "username_attributes" TEXT[],
    "username_configuration" JSONB,
    "verification_message_template" JSONB,

    CONSTRAINT "aws_cognito_user_pools_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_computeoptimizer_autoscaling_group_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "auto_scaling_group_arn" TEXT NOT NULL,
    "auto_scaling_group_name" TEXT,
    "current_configuration" JSONB,
    "current_performance_risk" TEXT,
    "effective_recommendation_preferences" JSONB,
    "finding" TEXT,
    "inferred_workload_types" TEXT[],
    "last_refresh_timestamp" TIMESTAMP(6),
    "look_back_period_in_days" DOUBLE PRECISION,
    "recommendation_options" JSONB,
    "utilization_metrics" JSONB,

    CONSTRAINT "aws_computeoptimizer_autoscaling_group_recommendations_cqpk" PRIMARY KEY ("auto_scaling_group_arn")
);

-- CreateTable
CREATE TABLE "aws_computeoptimizer_ebs_volume_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "tags" JSONB,
    "current_configuration" JSONB,
    "current_performance_risk" TEXT,
    "finding" TEXT,
    "last_refresh_timestamp" TIMESTAMP(6),
    "look_back_period_in_days" DOUBLE PRECISION,
    "utilization_metrics" JSONB,
    "volume_arn" TEXT NOT NULL,
    "volume_recommendation_options" JSONB,

    CONSTRAINT "aws_computeoptimizer_ebs_volume_recommendations_cqpk" PRIMARY KEY ("volume_arn")
);

-- CreateTable
CREATE TABLE "aws_computeoptimizer_ec2_instance_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "tags" JSONB,
    "current_instance_type" TEXT,
    "current_performance_risk" TEXT,
    "effective_recommendation_preferences" JSONB,
    "external_metric_status" JSONB,
    "finding" TEXT,
    "finding_reason_codes" TEXT[],
    "inferred_workload_types" TEXT[],
    "instance_arn" TEXT NOT NULL,
    "instance_name" TEXT,
    "instance_state" TEXT,
    "last_refresh_timestamp" TIMESTAMP(6),
    "look_back_period_in_days" DOUBLE PRECISION,
    "recommendation_options" JSONB,
    "recommendation_sources" JSONB,
    "utilization_metrics" JSONB,

    CONSTRAINT "aws_computeoptimizer_ec2_instance_recommendations_cqpk" PRIMARY KEY ("instance_arn")
);

-- CreateTable
CREATE TABLE "aws_computeoptimizer_enrollment_statuses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "last_updated_timestamp" TIMESTAMP(6),
    "member_accounts_enrolled" BOOLEAN,
    "number_of_member_accounts_opted_in" BIGINT,
    "status" TEXT,
    "status_reason" TEXT,

    CONSTRAINT "aws_computeoptimizer_enrollment_statuses_cqpk" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "aws_computeoptimizer_lambda_function_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "tags" JSONB,
    "current_memory_size" BIGINT,
    "current_performance_risk" TEXT,
    "finding" TEXT,
    "finding_reason_codes" TEXT[],
    "function_arn" TEXT NOT NULL,
    "function_version" TEXT,
    "last_refresh_timestamp" TIMESTAMP(6),
    "lookback_period_in_days" DOUBLE PRECISION,
    "memory_size_recommendation_options" JSONB,
    "number_of_invocations" BIGINT,
    "utilization_metrics" JSONB,

    CONSTRAINT "aws_computeoptimizer_lambda_function_recommendations_cqpk" PRIMARY KEY ("function_arn")
);

-- CreateTable
CREATE TABLE "aws_config_config_rule_compliance_details" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "config_rule_name" TEXT,
    "annotation" TEXT,
    "compliance_type" TEXT,
    "config_rule_invoked_time" TIMESTAMP(6),
    "evaluation_result_identifier" JSONB,
    "result_recorded_time" TIMESTAMP(6),
    "result_token" TEXT,

    CONSTRAINT "aws_config_config_rule_compliance_details_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_config_config_rule_compliances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "compliance" JSONB,
    "config_rule_name" TEXT,

    CONSTRAINT "aws_config_config_rule_compliances_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_config_config_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "source" JSONB,
    "config_rule_arn" TEXT,
    "config_rule_id" TEXT,
    "config_rule_name" TEXT,
    "config_rule_state" TEXT,
    "created_by" TEXT,
    "description" TEXT,
    "evaluation_modes" JSONB,
    "input_parameters" TEXT,
    "maximum_execution_frequency" TEXT,
    "scope" JSONB,

    CONSTRAINT "aws_config_config_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_config_configuration_aggregators" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "account_aggregation_sources" JSONB,
    "configuration_aggregator_arn" TEXT,
    "configuration_aggregator_name" TEXT,
    "created_by" TEXT,
    "creation_time" TIMESTAMP(6),
    "last_updated_time" TIMESTAMP(6),
    "organization_aggregation_source" JSONB,

    CONSTRAINT "aws_config_configuration_aggregators_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_config_configuration_recorders" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "recording_group" JSONB,
    "role_arn" TEXT,
    "status_last_error_code" TEXT,
    "status_last_error_message" TEXT,
    "status_last_start_time" TIMESTAMP(6),
    "status_last_status" TEXT,
    "status_last_status_change_time" TIMESTAMP(6),
    "status_last_stop_time" TIMESTAMP(6),
    "status_recording" BOOLEAN,

    CONSTRAINT "aws_config_configuration_recorders_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_config_conformance_pack_rule_compliances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "conformance_pack_arn" TEXT,
    "compliance_type" TEXT,
    "config_rule_name" TEXT,
    "controls" TEXT[],
    "config_rule_invoked_time" TIMESTAMP(6),
    "evaluation_result_identifier" JSONB,
    "result_recorded_time" TIMESTAMP(6),
    "annotation" TEXT,

    CONSTRAINT "aws_config_conformance_pack_rule_compliances_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_config_conformance_packs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "conformance_pack_arn" TEXT,
    "conformance_pack_id" TEXT,
    "conformance_pack_name" TEXT,
    "conformance_pack_input_parameters" JSONB,
    "created_by" TEXT,
    "delivery_s3_bucket" TEXT,
    "delivery_s3_key_prefix" TEXT,
    "last_update_requested_time" TIMESTAMP(6),
    "template_ssm_document_details" JSONB,

    CONSTRAINT "aws_config_conformance_packs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_config_delivery_channel_statuses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "config_history_delivery_info" JSONB,
    "config_snapshot_delivery_info" JSONB,
    "config_stream_delivery_info" JSONB,
    "name" TEXT NOT NULL,

    CONSTRAINT "aws_config_delivery_channel_statuses_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_config_delivery_channels" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "config_snapshot_delivery_properties" JSONB,
    "name" TEXT NOT NULL,
    "s3_bucket_name" TEXT,
    "s3_key_prefix" TEXT,
    "s3_kms_key_arn" TEXT,
    "sns_topic_arn" TEXT,

    CONSTRAINT "aws_config_delivery_channels_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_config_remediation_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "config_rule_name" TEXT,
    "target_id" TEXT,
    "target_type" TEXT,
    "arn" TEXT NOT NULL,
    "automatic" BOOLEAN,
    "created_by_service" TEXT,
    "execution_controls" JSONB,
    "maximum_automatic_attempts" BIGINT,
    "parameters" JSONB,
    "resource_type" TEXT,
    "retry_attempt_seconds" BIGINT,
    "target_version" TEXT,

    CONSTRAINT "aws_config_remediation_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_config_retention_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "retention_period_in_days" BIGINT,

    CONSTRAINT "aws_config_retention_configurations_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_costexplorer_cost_30d" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "estimated" BOOLEAN,
    "groups" JSONB,
    "time_period" JSONB,
    "total" JSONB,

    CONSTRAINT "aws_costexplorer_cost_30d_cqpk" PRIMARY KEY ("account_id","start_date","end_date")
);

-- CreateTable
CREATE TABLE "aws_costexplorer_cost_forecast_30d" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "mean_value" TEXT,
    "prediction_interval_lower_bound" TEXT,
    "prediction_interval_upper_bound" TEXT,
    "time_period" JSONB,

    CONSTRAINT "aws_costexplorer_cost_forecast_30d_cqpk" PRIMARY KEY ("account_id","start_date","end_date")
);

-- CreateTable
CREATE TABLE "aws_dax_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "active_nodes" BIGINT,
    "cluster_arn" TEXT,
    "cluster_discovery_endpoint" JSONB,
    "cluster_endpoint_encryption_type" TEXT,
    "cluster_name" TEXT,
    "description" TEXT,
    "iam_role_arn" TEXT,
    "node_ids_to_remove" TEXT[],
    "node_type" TEXT,
    "nodes" JSONB,
    "notification_configuration" JSONB,
    "parameter_group" JSONB,
    "preferred_maintenance_window" TEXT,
    "sse_description" JSONB,
    "security_groups" JSONB,
    "status" TEXT,
    "subnet_group" TEXT,
    "total_nodes" BIGINT,

    CONSTRAINT "aws_dax_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_db_proxies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "auth" JSONB,
    "created_date" TIMESTAMP(6),
    "db_proxy_arn" TEXT,
    "db_proxy_name" TEXT,
    "debug_logging" BOOLEAN,
    "endpoint" TEXT,
    "engine_family" TEXT,
    "idle_client_timeout" BIGINT,
    "require_tls" BOOLEAN,
    "role_arn" TEXT,
    "status" TEXT,
    "updated_date" TIMESTAMP(6),
    "vpc_id" TEXT,
    "vpc_security_group_ids" TEXT[],
    "vpc_subnet_ids" TEXT[],

    CONSTRAINT "aws_db_proxies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_detective_graph_members" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT,
    "request_region" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "administrator_id" TEXT,
    "datasource_package_ingest_states" JSONB,
    "disabled_reason" TEXT,
    "email_address" TEXT,
    "graph_arn" TEXT NOT NULL,
    "invitation_type" TEXT,
    "invited_time" TIMESTAMP(6),
    "master_id" TEXT,
    "percent_of_graph_utilization" DOUBLE PRECISION,
    "percent_of_graph_utilization_updated_time" TIMESTAMP(6),
    "status" TEXT,
    "updated_time" TIMESTAMP(6),
    "volume_usage_by_datasource_package" JSONB,
    "volume_usage_in_bytes" BIGINT,
    "volume_usage_updated_time" TIMESTAMP(6),

    CONSTRAINT "aws_detective_graph_members_cqpk" PRIMARY KEY ("request_region","account_id","graph_arn")
);

-- CreateTable
CREATE TABLE "aws_detective_graphs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "created_time" TIMESTAMP(6),

    CONSTRAINT "aws_detective_graphs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_directconnect_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "tags" JSONB,
    "aws_device" TEXT,
    "aws_device_v2" TEXT,
    "aws_logical_device_id" TEXT,
    "bandwidth" TEXT,
    "connection_id" TEXT,
    "connection_name" TEXT,
    "connection_state" TEXT,
    "encryption_mode" TEXT,
    "has_logical_redundancy" TEXT,
    "jumbo_frame_capable" BOOLEAN,
    "lag_id" TEXT,
    "loa_issue_time" TIMESTAMP(6),
    "location" TEXT,
    "mac_sec_capable" BOOLEAN,
    "mac_sec_keys" JSONB,
    "owner_account" TEXT,
    "partner_name" TEXT,
    "port_encryption_status" TEXT,
    "provider_name" TEXT,
    "vlan" BIGINT,

    CONSTRAINT "aws_directconnect_connections_cqpk" PRIMARY KEY ("arn","id")
);

-- CreateTable
CREATE TABLE "aws_directconnect_gateway_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "gateway_arn" TEXT,
    "gateway_id" TEXT,
    "allowed_prefixes_to_direct_connect_gateway" JSONB,
    "associated_gateway" JSONB,
    "association_id" TEXT,
    "association_state" TEXT,
    "direct_connect_gateway_id" TEXT,
    "direct_connect_gateway_owner_account" TEXT,
    "state_change_error" TEXT,
    "virtual_gateway_id" TEXT,
    "virtual_gateway_owner_account" TEXT,
    "virtual_gateway_region" TEXT,

    CONSTRAINT "aws_directconnect_gateway_associations_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_directconnect_gateway_attachments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "gateway_arn" TEXT,
    "gateway_id" TEXT,
    "attachment_state" TEXT,
    "attachment_type" TEXT,
    "direct_connect_gateway_id" TEXT,
    "state_change_error" TEXT,
    "virtual_interface_id" TEXT,
    "virtual_interface_owner_account" TEXT,
    "virtual_interface_region" TEXT,

    CONSTRAINT "aws_directconnect_gateway_attachments_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_directconnect_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "amazon_side_asn" BIGINT,
    "direct_connect_gateway_id" TEXT,
    "direct_connect_gateway_name" TEXT,
    "direct_connect_gateway_state" TEXT,
    "owner_account" TEXT,
    "state_change_error" TEXT,

    CONSTRAINT "aws_directconnect_gateways_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_directconnect_lags" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "tags" JSONB,
    "allows_hosted_connections" BOOLEAN,
    "aws_device" TEXT,
    "aws_device_v2" TEXT,
    "aws_logical_device_id" TEXT,
    "connections" JSONB,
    "connections_bandwidth" TEXT,
    "encryption_mode" TEXT,
    "has_logical_redundancy" TEXT,
    "jumbo_frame_capable" BOOLEAN,
    "lag_id" TEXT,
    "lag_name" TEXT,
    "lag_state" TEXT,
    "location" TEXT,
    "mac_sec_capable" BOOLEAN,
    "mac_sec_keys" JSONB,
    "minimum_links" BIGINT,
    "number_of_connections" BIGINT,
    "owner_account" TEXT,
    "provider_name" TEXT,

    CONSTRAINT "aws_directconnect_lags_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_directconnect_locations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "available_mac_sec_port_speeds" TEXT[],
    "available_port_speeds" TEXT[],
    "available_providers" TEXT[],
    "location_code" TEXT NOT NULL,
    "location_name" TEXT,

    CONSTRAINT "aws_directconnect_locations_cqpk" PRIMARY KEY ("account_id","region","location_code")
);

-- CreateTable
CREATE TABLE "aws_directconnect_virtual_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "virtual_gateway_id" TEXT,
    "virtual_gateway_state" TEXT,

    CONSTRAINT "aws_directconnect_virtual_gateways_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_directconnect_virtual_interfaces" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "tags" JSONB,
    "address_family" TEXT,
    "amazon_address" TEXT,
    "amazon_side_asn" BIGINT,
    "asn" BIGINT,
    "auth_key" TEXT,
    "aws_device_v2" TEXT,
    "aws_logical_device_id" TEXT,
    "bgp_peers" JSONB,
    "connection_id" TEXT,
    "customer_address" TEXT,
    "customer_router_config" TEXT,
    "direct_connect_gateway_id" TEXT,
    "jumbo_frame_capable" BOOLEAN,
    "location" TEXT,
    "mtu" BIGINT,
    "owner_account" TEXT,
    "route_filter_prefixes" JSONB,
    "site_link_enabled" BOOLEAN,
    "virtual_gateway_id" TEXT,
    "virtual_interface_id" TEXT,
    "virtual_interface_name" TEXT,
    "virtual_interface_state" TEXT,
    "virtual_interface_type" TEXT,
    "vlan" BIGINT,

    CONSTRAINT "aws_directconnect_virtual_interfaces_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_dms_replication_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "allocated_storage" BIGINT,
    "auto_minor_version_upgrade" BOOLEAN,
    "availability_zone" TEXT,
    "dns_name_servers" TEXT,
    "engine_version" TEXT,
    "free_until" TIMESTAMP(6),
    "instance_create_time" TIMESTAMP(6),
    "kms_key_id" TEXT,
    "multi_az" BOOLEAN,
    "network_type" TEXT,
    "pending_modified_values" JSONB,
    "preferred_maintenance_window" TEXT,
    "publicly_accessible" BOOLEAN,
    "replication_instance_arn" TEXT,
    "replication_instance_class" TEXT,
    "replication_instance_identifier" TEXT,
    "replication_instance_ipv6_addresses" TEXT[],
    "replication_instance_private_ip_address" TEXT,
    "replication_instance_private_ip_addresses" TEXT[],
    "replication_instance_public_ip_address" TEXT,
    "replication_instance_public_ip_addresses" TEXT[],
    "replication_instance_status" TEXT,
    "replication_subnet_group" JSONB,
    "secondary_availability_zone" TEXT,
    "vpc_security_groups" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_dms_replication_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_docdb_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "certificate_arn" TEXT,
    "certificate_identifier" TEXT,
    "certificate_type" TEXT,
    "thumbprint" TEXT,
    "valid_from" TIMESTAMP(6),
    "valid_till" TIMESTAMP(6),

    CONSTRAINT "aws_docdb_certificates_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_docdb_cluster_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "attributes" JSONB,
    "db_cluster_identifier" TEXT,
    "db_cluster_snapshot_identifier" TEXT,
    "availability_zones" TEXT[],
    "cluster_create_time" TIMESTAMP(6),
    "db_cluster_snapshot_arn" TEXT,
    "engine" TEXT,
    "engine_version" TEXT,
    "kms_key_id" TEXT,
    "master_username" TEXT,
    "percent_progress" BIGINT,
    "port" BIGINT,
    "snapshot_create_time" TIMESTAMP(6),
    "snapshot_type" TEXT,
    "source_db_cluster_snapshot_arn" TEXT,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,
    "vpc_id" TEXT,

    CONSTRAINT "aws_docdb_cluster_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_docdb_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "associated_roles" JSONB,
    "availability_zones" TEXT[],
    "backup_retention_period" BIGINT,
    "clone_group_id" TEXT,
    "cluster_create_time" TIMESTAMP(6),
    "db_cluster_arn" TEXT,
    "db_cluster_identifier" TEXT,
    "db_cluster_members" JSONB,
    "db_cluster_parameter_group" TEXT,
    "db_subnet_group" TEXT,
    "db_cluster_resource_id" TEXT,
    "deletion_protection" BOOLEAN,
    "earliest_restorable_time" TIMESTAMP(6),
    "enabled_cloudwatch_logs_exports" TEXT[],
    "endpoint" TEXT,
    "engine" TEXT,
    "engine_version" TEXT,
    "hosted_zone_id" TEXT,
    "kms_key_id" TEXT,
    "latest_restorable_time" TIMESTAMP(6),
    "master_username" TEXT,
    "multi_az" BOOLEAN,
    "percent_progress" TEXT,
    "port" BIGINT,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "read_replica_identifiers" TEXT[],
    "reader_endpoint" TEXT,
    "replication_source_identifier" TEXT,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_docdb_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_docdb_event_categories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "event_categories" TEXT[],
    "source_type" TEXT,

    CONSTRAINT "aws_docdb_event_categories_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_docdb_event_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cust_subscription_id" TEXT,
    "customer_aws_id" TEXT,
    "enabled" BOOLEAN,
    "event_categories_list" TEXT[],
    "event_subscription_arn" TEXT,
    "sns_topic_arn" TEXT,
    "source_ids_list" TEXT[],
    "source_type" TEXT,
    "status" TEXT,
    "subscription_creation_time" TEXT,

    CONSTRAINT "aws_docdb_event_subscriptions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_docdb_events" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "date" TIMESTAMP(6),
    "event_categories" TEXT[],
    "message" TEXT,
    "source_arn" TEXT,
    "source_identifier" TEXT,
    "source_type" TEXT,

    CONSTRAINT "aws_docdb_events_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_docdb_global_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "database_name" TEXT,
    "deletion_protection" BOOLEAN,
    "engine" TEXT,
    "engine_version" TEXT,
    "global_cluster_arn" TEXT,
    "global_cluster_identifier" TEXT,
    "global_cluster_members" JSONB,
    "global_cluster_resource_id" TEXT,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,

    CONSTRAINT "aws_docdb_global_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_docdb_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "auto_minor_version_upgrade" BOOLEAN,
    "availability_zone" TEXT,
    "backup_retention_period" BIGINT,
    "ca_certificate_identifier" TEXT,
    "copy_tags_to_snapshot" BOOLEAN,
    "db_cluster_identifier" TEXT,
    "db_instance_arn" TEXT,
    "db_instance_class" TEXT,
    "db_instance_identifier" TEXT,
    "db_instance_status" TEXT,
    "db_subnet_group" JSONB,
    "dbi_resource_id" TEXT,
    "enabled_cloudwatch_logs_exports" TEXT[],
    "endpoint" JSONB,
    "engine" TEXT,
    "engine_version" TEXT,
    "instance_create_time" TIMESTAMP(6),
    "kms_key_id" TEXT,
    "latest_restorable_time" TIMESTAMP(6),
    "pending_modified_values" JSONB,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "promotion_tier" BIGINT,
    "publicly_accessible" BOOLEAN,
    "status_infos" JSONB,
    "storage_encrypted" BOOLEAN,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_docdb_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_docdb_pending_maintenance_actions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "pending_maintenance_action_details" JSONB,
    "resource_identifier" TEXT,

    CONSTRAINT "aws_docdb_pending_maintenance_actions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_docdb_subnet_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "db_subnet_group_arn" TEXT,
    "db_subnet_group_description" TEXT,
    "db_subnet_group_name" TEXT,
    "subnet_group_status" TEXT,
    "subnets" JSONB,
    "vpc_id" TEXT,

    CONSTRAINT "aws_docdb_subnet_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_dynamodb_backups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "backup_details" JSONB,
    "source_table_details" JSONB,
    "source_table_feature_details" JSONB,

    CONSTRAINT "aws_dynamodb_backups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_dynamodb_exports" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "billed_size_bytes" BIGINT,
    "client_token" TEXT,
    "end_time" TIMESTAMP(6),
    "export_arn" TEXT,
    "export_format" TEXT,
    "export_manifest" TEXT,
    "export_status" TEXT,
    "export_time" TIMESTAMP(6),
    "failure_code" TEXT,
    "failure_message" TEXT,
    "item_count" BIGINT,
    "s3_bucket" TEXT,
    "s3_bucket_owner" TEXT,
    "s3_prefix" TEXT,
    "s3_sse_algorithm" TEXT,
    "s3_sse_kms_key_id" TEXT,
    "start_time" TIMESTAMP(6),
    "table_arn" TEXT,
    "table_id" TEXT,

    CONSTRAINT "aws_dynamodb_exports_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_dynamodb_global_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_date_time" TIMESTAMP(6),
    "global_table_arn" TEXT,
    "global_table_name" TEXT,
    "global_table_status" TEXT,
    "replication_group" JSONB,

    CONSTRAINT "aws_dynamodb_global_tables_cqpk" PRIMARY KEY ("region","arn")
);

-- CreateTable
CREATE TABLE "aws_dynamodb_table_continuous_backups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "table_arn" TEXT NOT NULL,
    "continuous_backups_status" TEXT,
    "point_in_time_recovery_description" JSONB,

    CONSTRAINT "aws_dynamodb_table_continuous_backups_cqpk" PRIMARY KEY ("table_arn")
);

-- CreateTable
CREATE TABLE "aws_dynamodb_table_replica_auto_scalings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "table_arn" TEXT,
    "global_secondary_indexes" JSONB,
    "region_name" TEXT,
    "replica_provisioned_read_capacity_auto_scaling_settings" JSONB,
    "replica_provisioned_write_capacity_auto_scaling_settings" JSONB,
    "replica_status" TEXT,

    CONSTRAINT "aws_dynamodb_table_replica_auto_scalings_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_dynamodb_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "archival_summary" JSONB,
    "attribute_definitions" JSONB,
    "billing_mode_summary" JSONB,
    "creation_date_time" TIMESTAMP(6),
    "deletion_protection_enabled" BOOLEAN,
    "global_secondary_indexes" JSONB,
    "global_table_version" TEXT,
    "item_count" BIGINT,
    "key_schema" JSONB,
    "latest_stream_arn" TEXT,
    "latest_stream_label" TEXT,
    "local_secondary_indexes" JSONB,
    "provisioned_throughput" JSONB,
    "replicas" JSONB,
    "restore_summary" JSONB,
    "sse_description" JSONB,
    "stream_specification" JSONB,
    "table_arn" TEXT,
    "table_class_summary" JSONB,
    "table_id" TEXT,
    "table_name" TEXT,
    "table_size_bytes" BIGINT,
    "table_status" TEXT,

    CONSTRAINT "aws_dynamodb_tables_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_dynamodbstreams_streams" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_request_date_time" TIMESTAMP(6),
    "key_schema" JSONB,
    "last_evaluated_shard_id" TEXT,
    "shards" JSONB,
    "stream_arn" TEXT,
    "stream_label" TEXT,
    "stream_status" TEXT,
    "stream_view_type" TEXT,
    "table_name" TEXT,

    CONSTRAINT "aws_dynamodbstreams_streams_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_account_attributes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "partition" TEXT,
    "attribute_name" TEXT NOT NULL,
    "attribute_values" JSONB,

    CONSTRAINT "aws_ec2_account_attributes_cqpk" PRIMARY KEY ("account_id","attribute_name")
);

-- CreateTable
CREATE TABLE "aws_ec2_byoip_cidrs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_ec2_byoip_cidrs_cqpk" PRIMARY KEY ("account_id","region","cidr")
);

-- CreateTable
CREATE TABLE "aws_ec2_capacity_reservations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "availability_zone" TEXT,
    "availability_zone_id" TEXT,
    "available_instance_count" BIGINT,
    "capacity_allocations" JSONB,
    "capacity_reservation_arn" TEXT,
    "capacity_reservation_fleet_id" TEXT,
    "capacity_reservation_id" TEXT,
    "create_date" TIMESTAMP(6),
    "ebs_optimized" BOOLEAN,
    "end_date" TIMESTAMP(6),
    "end_date_type" TEXT,
    "ephemeral_storage" BOOLEAN,
    "instance_match_criteria" TEXT,
    "instance_platform" TEXT,
    "instance_type" TEXT,
    "outpost_arn" TEXT,
    "owner_id" TEXT,
    "placement_group_arn" TEXT,
    "start_date" TIMESTAMP(6),
    "state" TEXT,
    "tenancy" TEXT,
    "total_instance_count" BIGINT,

    CONSTRAINT "aws_ec2_capacity_reservations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_customer_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "bgp_asn" TEXT,
    "certificate_arn" TEXT,
    "customer_gateway_id" TEXT,
    "device_name" TEXT,
    "ip_address" TEXT,
    "state" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_ec2_customer_gateways_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_dhcp_options" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "dhcp_configurations" JSONB,
    "dhcp_options_id" TEXT NOT NULL,
    "owner_id" TEXT,

    CONSTRAINT "aws_ec2_dhcp_options_cqpk" PRIMARY KEY ("account_id","region","dhcp_options_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_ebs_snapshot_attributes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "snapshot_arn" TEXT NOT NULL,
    "create_volume_permissions" JSONB,
    "product_codes" JSONB,
    "snapshot_id" TEXT,

    CONSTRAINT "aws_ec2_ebs_snapshot_attributes_cqpk" PRIMARY KEY ("snapshot_arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_ebs_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "data_encryption_key_id" TEXT,
    "description" TEXT,
    "encrypted" BOOLEAN,
    "kms_key_id" TEXT,
    "outpost_arn" TEXT,
    "owner_alias" TEXT,
    "owner_id" TEXT,
    "progress" TEXT,
    "restore_expiry_time" TIMESTAMP(6),
    "snapshot_id" TEXT,
    "sse_type" TEXT,
    "start_time" TIMESTAMP(6),
    "state" TEXT,
    "state_message" TEXT,
    "storage_tier" TEXT,
    "volume_id" TEXT,
    "volume_size" BIGINT,

    CONSTRAINT "aws_ec2_ebs_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_ebs_volume_statuses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "volume_arn" TEXT NOT NULL,
    "actions" JSONB,
    "attachment_statuses" JSONB,
    "availability_zone" TEXT,
    "events" JSONB,
    "outpost_arn" TEXT,
    "volume_id" TEXT,
    "volume_status" JSONB,

    CONSTRAINT "aws_ec2_ebs_volume_statuses_cqpk" PRIMARY KEY ("volume_arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_ebs_volumes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "attachments" JSONB,
    "availability_zone" TEXT,
    "create_time" TIMESTAMP(6),
    "encrypted" BOOLEAN,
    "fast_restored" BOOLEAN,
    "iops" BIGINT,
    "kms_key_id" TEXT,
    "multi_attach_enabled" BOOLEAN,
    "outpost_arn" TEXT,
    "size" BIGINT,
    "snapshot_id" TEXT,
    "sse_type" TEXT,
    "state" TEXT,
    "throughput" BIGINT,
    "volume_id" TEXT,
    "volume_type" TEXT,

    CONSTRAINT "aws_ec2_ebs_volumes_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_egress_only_internet_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "attachments" JSONB,
    "egress_only_internet_gateway_id" TEXT,

    CONSTRAINT "aws_ec2_egress_only_internet_gateways_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_eips" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "allocation_id" TEXT NOT NULL,
    "association_id" TEXT,
    "carrier_ip" TEXT,
    "customer_owned_ip" TEXT,
    "customer_owned_ipv4_pool" TEXT,
    "domain" TEXT,
    "instance_id" TEXT,
    "network_border_group" TEXT,
    "network_interface_id" TEXT,
    "network_interface_owner_id" TEXT,
    "private_ip_address" TEXT,
    "public_ip" TEXT,
    "public_ipv4_pool" TEXT,

    CONSTRAINT "aws_ec2_eips_cqpk" PRIMARY KEY ("account_id","region","allocation_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_flow_logs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "deliver_cross_account_role" TEXT,
    "deliver_logs_error_message" TEXT,
    "deliver_logs_permission_arn" TEXT,
    "deliver_logs_status" TEXT,
    "destination_options" JSONB,
    "flow_log_id" TEXT,
    "flow_log_status" TEXT,
    "log_destination" TEXT,
    "log_destination_type" TEXT,
    "log_format" TEXT,
    "log_group_name" TEXT,
    "max_aggregation_interval" BIGINT,
    "resource_id" TEXT,
    "traffic_type" TEXT,

    CONSTRAINT "aws_ec2_flow_logs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_hosts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "allocation_time" TIMESTAMP(6),
    "allows_multiple_instance_types" TEXT,
    "asset_id" TEXT,
    "auto_placement" TEXT,
    "availability_zone" TEXT,
    "availability_zone_id" TEXT,
    "available_capacity" JSONB,
    "client_token" TEXT,
    "host_id" TEXT,
    "host_maintenance" TEXT,
    "host_properties" JSONB,
    "host_recovery" TEXT,
    "host_reservation_id" TEXT,
    "instances" JSONB,
    "member_of_service_linked_resource_group" BOOLEAN,
    "outpost_arn" TEXT,
    "owner_id" TEXT,
    "release_time" TIMESTAMP(6),
    "state" TEXT,

    CONSTRAINT "aws_ec2_hosts_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_image_last_launched_times" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "image_arn" TEXT NOT NULL,
    "last_launched_time" TIMESTAMP(6),

    CONSTRAINT "aws_ec2_image_last_launched_times_cqpk" PRIMARY KEY ("image_arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_image_launch_permissions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "image_arn" TEXT,
    "group" TEXT,
    "organization_arn" TEXT,
    "organizational_unit_arn" TEXT,
    "user_id" TEXT,

    CONSTRAINT "aws_ec2_image_launch_permissions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_images" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "architecture" TEXT,
    "block_device_mappings" JSONB,
    "boot_mode" TEXT,
    "creation_date" TEXT,
    "deprecation_time" TEXT,
    "description" TEXT,
    "ena_support" BOOLEAN,
    "hypervisor" TEXT,
    "image_id" TEXT,
    "image_location" TEXT,
    "image_owner_alias" TEXT,
    "image_type" TEXT,
    "imds_support" TEXT,
    "kernel_id" TEXT,
    "name" TEXT,
    "owner_id" TEXT,
    "platform" TEXT,
    "platform_details" TEXT,
    "product_codes" JSONB,
    "public" BOOLEAN,
    "ramdisk_id" TEXT,
    "root_device_name" TEXT,
    "root_device_type" TEXT,
    "sriov_net_support" TEXT,
    "state" TEXT,
    "state_reason" JSONB,
    "tpm_support" TEXT,
    "usage_operation" TEXT,
    "virtualization_type" TEXT,

    CONSTRAINT "aws_ec2_images_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_instance_connect_endpoints" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "availability_zone" TEXT,
    "created_at" TIMESTAMP(6),
    "dns_name" TEXT,
    "fips_dns_name" TEXT,
    "instance_connect_endpoint_arn" TEXT,
    "instance_connect_endpoint_id" TEXT,
    "network_interface_ids" TEXT[],
    "owner_id" TEXT,
    "preserve_client_ip" BOOLEAN,
    "security_group_ids" TEXT[],
    "state" TEXT,
    "state_message" TEXT,
    "subnet_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_instance_connect_endpoints_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_instance_statuses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "availability_zone" TEXT,
    "events" JSONB,
    "instance_id" TEXT,
    "instance_state" JSONB,
    "instance_status" JSONB,
    "outpost_arn" TEXT,
    "system_status" JSONB,

    CONSTRAINT "aws_ec2_instance_statuses_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "state_transition_reason_time" TIMESTAMP(6),
    "tags" JSONB,
    "ami_launch_index" BIGINT,
    "architecture" TEXT,
    "block_device_mappings" JSONB,
    "boot_mode" TEXT,
    "capacity_reservation_id" TEXT,
    "capacity_reservation_specification" JSONB,
    "client_token" TEXT,
    "cpu_options" JSONB,
    "current_instance_boot_mode" TEXT,
    "ebs_optimized" BOOLEAN,
    "elastic_gpu_associations" JSONB,
    "elastic_inference_accelerator_associations" JSONB,
    "ena_support" BOOLEAN,
    "enclave_options" JSONB,
    "hibernation_options" JSONB,
    "hypervisor" TEXT,
    "iam_instance_profile" JSONB,
    "image_id" TEXT,
    "instance_id" TEXT,
    "instance_lifecycle" TEXT,
    "instance_type" TEXT,
    "ipv6_address" TEXT,
    "kernel_id" TEXT,
    "key_name" TEXT,
    "launch_time" TIMESTAMP(6),
    "licenses" JSONB,
    "maintenance_options" JSONB,
    "metadata_options" JSONB,
    "monitoring" JSONB,
    "network_interfaces" JSONB,
    "outpost_arn" TEXT,
    "placement" JSONB,
    "platform" TEXT,
    "platform_details" TEXT,
    "private_dns_name" TEXT,
    "private_dns_name_options" JSONB,
    "private_ip_address" TEXT,
    "product_codes" JSONB,
    "public_dns_name" TEXT,
    "public_ip_address" TEXT,
    "ramdisk_id" TEXT,
    "root_device_name" TEXT,
    "root_device_type" TEXT,
    "security_groups" JSONB,
    "source_dest_check" BOOLEAN,
    "spot_instance_request_id" TEXT,
    "sriov_net_support" TEXT,
    "state" JSONB,
    "state_reason" JSONB,
    "state_transition_reason" TEXT,
    "subnet_id" TEXT,
    "tpm_support" TEXT,
    "usage_operation" TEXT,
    "usage_operation_update_time" TIMESTAMP(6),
    "virtualization_type" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_internet_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "attachments" JSONB,
    "internet_gateway_id" TEXT,
    "owner_id" TEXT,

    CONSTRAINT "aws_ec2_internet_gateways_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_key_pairs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "create_time" TIMESTAMP(6),
    "key_fingerprint" TEXT,
    "key_name" TEXT,
    "key_pair_id" TEXT,
    "key_type" TEXT,
    "public_key" TEXT,

    CONSTRAINT "aws_ec2_key_pairs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_launch_template_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "version_number" BIGINT NOT NULL,
    "create_time" TIMESTAMP(6),
    "created_by" TEXT,
    "default_version" BOOLEAN,
    "launch_template_data" JSONB,
    "launch_template_id" TEXT,
    "launch_template_name" TEXT,
    "version_description" TEXT,

    CONSTRAINT "aws_ec2_launch_template_versions_cqpk" PRIMARY KEY ("arn","version_number")
);

-- CreateTable
CREATE TABLE "aws_ec2_launch_templates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "create_time" TIMESTAMP(6),
    "created_by" TEXT,
    "default_version_number" BIGINT,
    "latest_version_number" BIGINT,
    "launch_template_id" TEXT,
    "launch_template_name" TEXT,

    CONSTRAINT "aws_ec2_launch_templates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_managed_prefix_lists" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "address_family" TEXT,
    "max_entries" BIGINT,
    "owner_id" TEXT,
    "prefix_list_arn" TEXT,
    "prefix_list_id" TEXT,
    "prefix_list_name" TEXT,
    "state" TEXT,
    "state_message" TEXT,
    "version" BIGINT,

    CONSTRAINT "aws_ec2_managed_prefix_lists_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_nat_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "connectivity_type" TEXT,
    "create_time" TIMESTAMP(6),
    "delete_time" TIMESTAMP(6),
    "failure_code" TEXT,
    "failure_message" TEXT,
    "nat_gateway_addresses" JSONB,
    "nat_gateway_id" TEXT,
    "provisioned_bandwidth" JSONB,
    "state" TEXT,
    "subnet_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_nat_gateways_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_network_acls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "associations" JSONB,
    "entries" JSONB,
    "is_default" BOOLEAN,
    "network_acl_id" TEXT,
    "owner_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_network_acls_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_network_interfaces" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "association" JSONB,
    "attachment" JSONB,
    "availability_zone" TEXT,
    "deny_all_igw_traffic" BOOLEAN,
    "description" TEXT,
    "groups" JSONB,
    "interface_type" TEXT,
    "ipv4_prefixes" JSONB,
    "ipv6_address" TEXT,
    "ipv6_addresses" JSONB,
    "ipv6_native" BOOLEAN,
    "ipv6_prefixes" JSONB,
    "mac_address" TEXT,
    "network_interface_id" TEXT,
    "outpost_arn" TEXT,
    "owner_id" TEXT,
    "private_dns_name" TEXT,
    "private_ip_address" TEXT,
    "private_ip_addresses" JSONB,
    "requester_id" TEXT,
    "requester_managed" BOOLEAN,
    "source_dest_check" BOOLEAN,
    "status" TEXT,
    "subnet_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_network_interfaces_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_regional_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ebs_encryption_enabled_by_default" BOOLEAN,
    "ebs_default_kms_key_id" TEXT,

    CONSTRAINT "aws_ec2_regional_configs_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_ec2_reserved_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "availability_zone" TEXT,
    "currency_code" TEXT,
    "duration" BIGINT,
    "end" TIMESTAMP(6),
    "fixed_price" DOUBLE PRECISION,
    "instance_count" BIGINT,
    "instance_tenancy" TEXT,
    "instance_type" TEXT,
    "offering_class" TEXT,
    "offering_type" TEXT,
    "product_description" TEXT,
    "recurring_charges" JSONB,
    "reserved_instances_id" TEXT,
    "scope" TEXT,
    "start" TIMESTAMP(6),
    "state" TEXT,
    "usage_price" DOUBLE PRECISION,

    CONSTRAINT "aws_ec2_reserved_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_route_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "associations" JSONB,
    "owner_id" TEXT,
    "propagating_vgws" JSONB,
    "route_table_id" TEXT,
    "routes" JSONB,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_route_tables_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_security_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "description" TEXT,
    "group_id" TEXT,
    "group_name" TEXT,
    "ip_permissions" JSONB,
    "ip_permissions_egress" JSONB,
    "owner_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_security_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_spot_fleet_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "spot_fleet_request_id" TEXT,
    "instance_health" TEXT,
    "instance_id" TEXT,
    "instance_type" TEXT,
    "spot_instance_request_id" TEXT,

    CONSTRAINT "aws_ec2_spot_fleet_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_spot_fleet_requests" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "activity_status" TEXT,
    "create_time" TIMESTAMP(6),
    "spot_fleet_request_config" JSONB,
    "spot_fleet_request_id" TEXT NOT NULL,
    "spot_fleet_request_state" TEXT,

    CONSTRAINT "aws_ec2_spot_fleet_requests_cqpk" PRIMARY KEY ("account_id","region","spot_fleet_request_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_spot_instance_requests" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "actual_block_hourly_price" TEXT,
    "availability_zone_group" TEXT,
    "block_duration_minutes" BIGINT,
    "create_time" TIMESTAMP(6),
    "fault" JSONB,
    "instance_id" TEXT,
    "instance_interruption_behavior" TEXT,
    "launch_group" TEXT,
    "launch_specification" JSONB,
    "launched_availability_zone" TEXT,
    "product_description" TEXT,
    "spot_instance_request_id" TEXT NOT NULL,
    "spot_price" TEXT,
    "state" TEXT,
    "status" JSONB,
    "type" TEXT,
    "valid_from" TIMESTAMP(6),
    "valid_until" TIMESTAMP(6),

    CONSTRAINT "aws_ec2_spot_instance_requests_cqpk" PRIMARY KEY ("account_id","region","spot_instance_request_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_subnets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "assign_ipv6_address_on_creation" BOOLEAN,
    "availability_zone" TEXT,
    "availability_zone_id" TEXT,
    "available_ip_address_count" BIGINT,
    "cidr_block" TEXT,
    "customer_owned_ipv4_pool" TEXT,
    "default_for_az" BOOLEAN,
    "enable_dns64" BOOLEAN,
    "enable_lni_at_device_index" BIGINT,
    "ipv6_cidr_block_association_set" JSONB,
    "ipv6_native" BOOLEAN,
    "map_customer_owned_ip_on_launch" BOOLEAN,
    "map_public_ip_on_launch" BOOLEAN,
    "outpost_arn" TEXT,
    "owner_id" TEXT,
    "private_dns_name_options_on_launch" JSONB,
    "state" TEXT,
    "subnet_arn" TEXT,
    "subnet_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_subnets_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_transit_gateway_attachments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "transit_gateway_arn" TEXT,
    "tags" JSONB,
    "association" JSONB,
    "creation_time" TIMESTAMP(6),
    "resource_id" TEXT,
    "resource_owner_id" TEXT,
    "resource_type" TEXT,
    "state" TEXT,
    "transit_gateway_attachment_id" TEXT,
    "transit_gateway_id" TEXT,
    "transit_gateway_owner_id" TEXT,

    CONSTRAINT "aws_ec2_transit_gateway_attachments_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_transit_gateway_multicast_domains" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "transit_gateway_arn" TEXT,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "options" JSONB,
    "owner_id" TEXT,
    "state" TEXT,
    "transit_gateway_id" TEXT,
    "transit_gateway_multicast_domain_arn" TEXT,
    "transit_gateway_multicast_domain_id" TEXT,

    CONSTRAINT "aws_ec2_transit_gateway_multicast_domains_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_transit_gateway_peering_attachments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "transit_gateway_arn" TEXT,
    "tags" JSONB,
    "accepter_tgw_info" JSONB,
    "accepter_transit_gateway_attachment_id" TEXT,
    "creation_time" TIMESTAMP(6),
    "options" JSONB,
    "requester_tgw_info" JSONB,
    "state" TEXT,
    "status" JSONB,
    "transit_gateway_attachment_id" TEXT,

    CONSTRAINT "aws_ec2_transit_gateway_peering_attachments_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_transit_gateway_route_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "transit_gateway_arn" TEXT,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "default_association_route_table" BOOLEAN,
    "default_propagation_route_table" BOOLEAN,
    "state" TEXT,
    "transit_gateway_id" TEXT,
    "transit_gateway_route_table_id" TEXT,

    CONSTRAINT "aws_ec2_transit_gateway_route_tables_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_transit_gateway_vpc_attachments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "transit_gateway_arn" TEXT,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "options" JSONB,
    "state" TEXT,
    "subnet_ids" TEXT[],
    "transit_gateway_attachment_id" TEXT,
    "transit_gateway_id" TEXT,
    "vpc_id" TEXT,
    "vpc_owner_id" TEXT,

    CONSTRAINT "aws_ec2_transit_gateway_vpc_attachments_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_transit_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "description" TEXT,
    "options" JSONB,
    "owner_id" TEXT,
    "state" TEXT,
    "transit_gateway_arn" TEXT,
    "transit_gateway_id" TEXT,

    CONSTRAINT "aws_ec2_transit_gateways_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_vpc_endpoint_service_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "acceptance_required" BOOLEAN,
    "availability_zones" TEXT[],
    "base_endpoint_dns_names" TEXT[],
    "gateway_load_balancer_arns" TEXT[],
    "manages_vpc_endpoints" BOOLEAN,
    "network_load_balancer_arns" TEXT[],
    "payer_responsibility" TEXT,
    "private_dns_name" TEXT,
    "private_dns_name_configuration" JSONB,
    "service_id" TEXT,
    "service_name" TEXT,
    "service_state" TEXT,
    "service_type" JSONB,
    "supported_ip_address_types" TEXT[],

    CONSTRAINT "aws_ec2_vpc_endpoint_service_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_vpc_endpoints" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_timestamp" TIMESTAMP(6),
    "dns_entries" JSONB,
    "dns_options" JSONB,
    "groups" JSONB,
    "ip_address_type" TEXT,
    "last_error" JSONB,
    "network_interface_ids" TEXT[],
    "owner_id" TEXT,
    "policy_document" TEXT,
    "private_dns_enabled" BOOLEAN,
    "requester_managed" BOOLEAN,
    "route_table_ids" TEXT[],
    "service_name" TEXT,
    "state" TEXT,
    "subnet_ids" TEXT[],
    "vpc_endpoint_id" TEXT,
    "vpc_endpoint_type" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_vpc_endpoints_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_vpc_peering_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "accepter_vpc_info" JSONB,
    "expiration_time" TIMESTAMP(6),
    "requester_vpc_info" JSONB,
    "status" JSONB,
    "vpc_peering_connection_id" TEXT,

    CONSTRAINT "aws_ec2_vpc_peering_connections_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_vpcs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "cidr_block" TEXT,
    "cidr_block_association_set" JSONB,
    "dhcp_options_id" TEXT,
    "instance_tenancy" TEXT,
    "ipv6_cidr_block_association_set" JSONB,
    "is_default" BOOLEAN,
    "owner_id" TEXT,
    "state" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_ec2_vpcs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_vpn_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "category" TEXT,
    "core_network_arn" TEXT,
    "core_network_attachment_arn" TEXT,
    "customer_gateway_configuration" TEXT,
    "customer_gateway_id" TEXT,
    "gateway_association_state" TEXT,
    "options" JSONB,
    "routes" JSONB,
    "state" TEXT,
    "transit_gateway_id" TEXT,
    "type" TEXT,
    "vgw_telemetry" JSONB,
    "vpn_connection_id" TEXT NOT NULL,
    "vpn_gateway_id" TEXT,

    CONSTRAINT "aws_ec2_vpn_connections_cqpk" PRIMARY KEY ("account_id","region","vpn_connection_id")
);

-- CreateTable
CREATE TABLE "aws_ec2_vpn_gateways" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "amazon_side_asn" BIGINT,
    "availability_zone" TEXT,
    "state" TEXT,
    "type" TEXT,
    "vpc_attachments" JSONB,
    "vpn_gateway_id" TEXT,

    CONSTRAINT "aws_ec2_vpn_gateways_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecr_pull_through_cache_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "ecr_repository_prefix" TEXT NOT NULL,
    "registry_id" TEXT NOT NULL,
    "upstream_registry_url" TEXT NOT NULL,

    CONSTRAINT "aws_ecr_pull_through_cache_rules_cqpk" PRIMARY KEY ("account_id","region","ecr_repository_prefix","registry_id","upstream_registry_url")
);

-- CreateTable
CREATE TABLE "aws_ecr_registries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "registry_id" TEXT NOT NULL,
    "replication_configuration" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_ecr_registries_cqpk" PRIMARY KEY ("account_id","region","registry_id")
);

-- CreateTable
CREATE TABLE "aws_ecr_registry_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "registry_id" TEXT NOT NULL,
    "policy_text" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_ecr_registry_policies_cqpk" PRIMARY KEY ("account_id","region","registry_id")
);

-- CreateTable
CREATE TABLE "aws_ecr_repositories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "policy_text" JSONB,
    "created_at" TIMESTAMP(6),
    "encryption_configuration" JSONB,
    "image_scanning_configuration" JSONB,
    "image_tag_mutability" TEXT,
    "registry_id" TEXT,
    "repository_arn" TEXT,
    "repository_name" TEXT,
    "repository_uri" TEXT,

    CONSTRAINT "aws_ecr_repositories_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecr_repository_image_scan_findings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "image_tag" TEXT,
    "image_digest" TEXT,
    "image_scan_findings" JSONB,
    "image_scan_status" JSONB,
    "registry_id" TEXT,
    "repository_name" TEXT,

    CONSTRAINT "aws_ecr_repository_image_scan_findings_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ecr_repository_images" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "artifact_media_type" TEXT,
    "image_digest" TEXT,
    "image_manifest_media_type" TEXT,
    "image_pushed_at" TIMESTAMP(6),
    "image_scan_findings_summary" JSONB,
    "image_scan_status" JSONB,
    "image_size_in_bytes" BIGINT,
    "image_tags" TEXT[],
    "last_recorded_pull_time" TIMESTAMP(6),
    "registry_id" TEXT,
    "repository_name" TEXT,

    CONSTRAINT "aws_ecr_repository_images_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecr_repository_lifecycle_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "policy_json" JSONB,
    "last_evaluated_at" TIMESTAMP(6),
    "lifecycle_policy_text" TEXT,
    "registry_id" TEXT NOT NULL,
    "repository_name" TEXT NOT NULL,

    CONSTRAINT "aws_ecr_repository_lifecycle_policies_cqpk" PRIMARY KEY ("account_id","region","registry_id","repository_name")
);

-- CreateTable
CREATE TABLE "aws_ecrpublic_repositories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "registry_id" TEXT,
    "repository_arn" TEXT,
    "repository_name" TEXT,
    "repository_uri" TEXT,

    CONSTRAINT "aws_ecrpublic_repositories_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecrpublic_repository_images" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "artifact_media_type" TEXT,
    "image_digest" TEXT,
    "image_manifest_media_type" TEXT,
    "image_pushed_at" TIMESTAMP(6),
    "image_size_in_bytes" BIGINT,
    "image_tags" TEXT[],
    "registry_id" TEXT,
    "repository_name" TEXT,

    CONSTRAINT "aws_ecrpublic_repository_images_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecs_cluster_container_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT,
    "tags" JSONB,
    "agent_connected" BOOLEAN,
    "agent_update_status" TEXT,
    "attachments" JSONB,
    "attributes" JSONB,
    "capacity_provider_name" TEXT,
    "container_instance_arn" TEXT,
    "ec2_instance_id" TEXT,
    "health_status" JSONB,
    "pending_tasks_count" BIGINT,
    "registered_at" TIMESTAMP(6),
    "registered_resources" JSONB,
    "remaining_resources" JSONB,
    "running_tasks_count" BIGINT,
    "status" TEXT,
    "status_reason" TEXT,
    "version" BIGINT,
    "version_info" JSONB,

    CONSTRAINT "aws_ecs_cluster_container_instances_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_ecs_cluster_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "capacity_provider_strategy" JSONB,
    "cluster_arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "created_by" TEXT,
    "deployment_configuration" JSONB,
    "deployment_controller" JSONB,
    "deployments" JSONB,
    "desired_count" BIGINT,
    "enable_ecs_managed_tags" BOOLEAN,
    "enable_execute_command" BOOLEAN,
    "events" JSONB,
    "health_check_grace_period_seconds" BIGINT,
    "launch_type" TEXT,
    "load_balancers" JSONB,
    "network_configuration" JSONB,
    "pending_count" BIGINT,
    "placement_constraints" JSONB,
    "placement_strategy" JSONB,
    "platform_family" TEXT,
    "platform_version" TEXT,
    "propagate_tags" TEXT,
    "role_arn" TEXT,
    "running_count" BIGINT,
    "scheduling_strategy" TEXT,
    "service_arn" TEXT,
    "service_name" TEXT,
    "service_registries" JSONB,
    "status" TEXT,
    "task_definition" TEXT,
    "task_sets" JSONB,

    CONSTRAINT "aws_ecs_cluster_services_cqpk" PRIMARY KEY ("arn","cluster_arn")
);

-- CreateTable
CREATE TABLE "aws_ecs_cluster_task_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "capacity_provider_strategy" JSONB,
    "cluster_arn" TEXT,
    "computed_desired_count" BIGINT,
    "created_at" TIMESTAMP(6),
    "external_id" TEXT,
    "id" TEXT,
    "launch_type" TEXT,
    "load_balancers" JSONB,
    "network_configuration" JSONB,
    "pending_count" BIGINT,
    "platform_family" TEXT,
    "platform_version" TEXT,
    "running_count" BIGINT,
    "scale" JSONB,
    "service_arn" TEXT,
    "service_registries" JSONB,
    "stability_status" TEXT,
    "stability_status_at" TIMESTAMP(6),
    "started_by" TEXT,
    "status" TEXT,
    "task_definition" TEXT,
    "task_set_arn" TEXT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "aws_ecs_cluster_task_sets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecs_cluster_tasks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "task_protection" JSONB,
    "attachments" JSONB,
    "attributes" JSONB,
    "availability_zone" TEXT,
    "capacity_provider_name" TEXT,
    "cluster_arn" TEXT,
    "connectivity" TEXT,
    "connectivity_at" TIMESTAMP(6),
    "container_instance_arn" TEXT,
    "containers" JSONB,
    "cpu" TEXT,
    "created_at" TIMESTAMP(6),
    "desired_status" TEXT,
    "enable_execute_command" BOOLEAN,
    "ephemeral_storage" JSONB,
    "execution_stopped_at" TIMESTAMP(6),
    "group" TEXT,
    "health_status" TEXT,
    "inference_accelerators" JSONB,
    "last_status" TEXT,
    "launch_type" TEXT,
    "memory" TEXT,
    "overrides" JSONB,
    "platform_family" TEXT,
    "platform_version" TEXT,
    "pull_started_at" TIMESTAMP(6),
    "pull_stopped_at" TIMESTAMP(6),
    "started_at" TIMESTAMP(6),
    "started_by" TEXT,
    "stop_code" TEXT,
    "stopped_at" TIMESTAMP(6),
    "stopped_reason" TEXT,
    "stopping_at" TIMESTAMP(6),
    "task_arn" TEXT,
    "task_definition_arn" TEXT,
    "version" BIGINT,

    CONSTRAINT "aws_ecs_cluster_tasks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecs_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "active_services_count" BIGINT,
    "attachments" JSONB,
    "attachments_status" TEXT,
    "capacity_providers" TEXT[],
    "cluster_arn" TEXT,
    "cluster_name" TEXT,
    "configuration" JSONB,
    "default_capacity_provider_strategy" JSONB,
    "pending_tasks_count" BIGINT,
    "registered_container_instances_count" BIGINT,
    "running_tasks_count" BIGINT,
    "service_connect_defaults" JSONB,
    "settings" JSONB,
    "statistics" JSONB,
    "status" TEXT,

    CONSTRAINT "aws_ecs_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ecs_task_definitions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "compatibilities" TEXT[],
    "container_definitions" JSONB,
    "cpu" TEXT,
    "deregistered_at" TIMESTAMP(6),
    "ephemeral_storage" JSONB,
    "execution_role_arn" TEXT,
    "family" TEXT,
    "inference_accelerators" JSONB,
    "ipc_mode" TEXT,
    "memory" TEXT,
    "network_mode" TEXT,
    "pid_mode" TEXT,
    "placement_constraints" JSONB,
    "proxy_configuration" JSONB,
    "registered_at" TIMESTAMP(6),
    "registered_by" TEXT,
    "requires_attributes" JSONB,
    "requires_compatibilities" TEXT[],
    "revision" BIGINT,
    "runtime_platform" JSONB,
    "status" TEXT,
    "task_definition_arn" TEXT,
    "task_role_arn" TEXT,
    "volumes" JSONB,

    CONSTRAINT "aws_ecs_task_definitions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_efs_access_points" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "access_point_arn" TEXT,
    "access_point_id" TEXT,
    "client_token" TEXT,
    "file_system_id" TEXT,
    "life_cycle_state" TEXT,
    "name" TEXT,
    "owner_id" TEXT,
    "posix_user" JSONB,
    "root_directory" JSONB,

    CONSTRAINT "aws_efs_access_points_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_efs_filesystems" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "backup_policy_status" TEXT,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "creation_token" TEXT,
    "file_system_id" TEXT,
    "life_cycle_state" TEXT,
    "number_of_mount_targets" BIGINT,
    "owner_id" TEXT,
    "performance_mode" TEXT,
    "size_in_bytes" JSONB,
    "availability_zone_id" TEXT,
    "availability_zone_name" TEXT,
    "encrypted" BOOLEAN,
    "file_system_arn" TEXT,
    "kms_key_id" TEXT,
    "name" TEXT,
    "provisioned_throughput_in_mibps" DOUBLE PRECISION,
    "throughput_mode" TEXT,

    CONSTRAINT "aws_efs_filesystems_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eks_cluster_addons" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_arn" TEXT NOT NULL,
    "addon_arn" TEXT,
    "addon_name" TEXT,
    "addon_version" TEXT,
    "cluster_name" TEXT,
    "configuration_values" TEXT,
    "created_at" TIMESTAMP(6),
    "health" JSONB,
    "marketplace_information" JSONB,
    "modified_at" TIMESTAMP(6),
    "owner" TEXT,
    "publisher" TEXT,
    "service_account_role_arn" TEXT,
    "status" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_eks_cluster_addons_cqpk" PRIMARY KEY ("arn","cluster_arn")
);

-- CreateTable
CREATE TABLE "aws_eks_cluster_node_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "ami_type" TEXT,
    "capacity_type" TEXT,
    "cluster_name" TEXT,
    "created_at" TIMESTAMP(6),
    "disk_size" BIGINT,
    "health" JSONB,
    "instance_types" TEXT[],
    "labels" JSONB,
    "launch_template" JSONB,
    "modified_at" TIMESTAMP(6),
    "node_role" TEXT,
    "nodegroup_arn" TEXT,
    "nodegroup_name" TEXT,
    "release_version" TEXT,
    "remote_access" JSONB,
    "resources" JSONB,
    "scaling_config" JSONB,
    "status" TEXT,
    "subnets" TEXT[],
    "tags" JSONB,
    "taints" JSONB,
    "update_config" JSONB,
    "version" TEXT,

    CONSTRAINT "aws_eks_cluster_node_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eks_cluster_oidc_identity_provider_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_arn" TEXT NOT NULL,
    "client_id" TEXT,
    "cluster_name" TEXT,
    "groups_claim" TEXT,
    "groups_prefix" TEXT,
    "identity_provider_config_arn" TEXT,
    "identity_provider_config_name" TEXT,
    "issuer_url" TEXT,
    "required_claims" JSONB,
    "status" TEXT,
    "tags" JSONB,
    "username_claim" TEXT,
    "username_prefix" TEXT,

    CONSTRAINT "aws_eks_cluster_oidc_identity_provider_configs_cqpk" PRIMARY KEY ("arn","cluster_arn")
);

-- CreateTable
CREATE TABLE "aws_eks_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "certificate_authority" JSONB,
    "client_request_token" TEXT,
    "connector_config" JSONB,
    "created_at" TIMESTAMP(6),
    "encryption_config" JSONB,
    "endpoint" TEXT,
    "health" JSONB,
    "id" TEXT,
    "identity" JSONB,
    "kubernetes_network_config" JSONB,
    "logging" JSONB,
    "name" TEXT,
    "outpost_config" JSONB,
    "platform_version" TEXT,
    "resources_vpc_config" JSONB,
    "role_arn" TEXT,
    "status" TEXT,
    "tags" JSONB,
    "version" TEXT,

    CONSTRAINT "aws_eks_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eks_fargate_profiles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_name" TEXT,
    "created_at" TIMESTAMP(6),
    "fargate_profile_arn" TEXT,
    "fargate_profile_name" TEXT,
    "pod_execution_role_arn" TEXT,
    "selectors" JSONB,
    "status" TEXT,
    "subnets" TEXT[],
    "tags" JSONB,

    CONSTRAINT "aws_eks_fargate_profiles_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "at_rest_encryption_enabled" BOOLEAN,
    "auth_token_enabled" BOOLEAN,
    "auth_token_last_modified_date" TIMESTAMP(6),
    "auto_minor_version_upgrade" BOOLEAN,
    "cache_cluster_create_time" TIMESTAMP(6),
    "cache_cluster_id" TEXT,
    "cache_cluster_status" TEXT,
    "cache_node_type" TEXT,
    "cache_nodes" JSONB,
    "cache_parameter_group" JSONB,
    "cache_security_groups" JSONB,
    "cache_subnet_group_name" TEXT,
    "client_download_landing_page" TEXT,
    "configuration_endpoint" JSONB,
    "engine" TEXT,
    "engine_version" TEXT,
    "ip_discovery" TEXT,
    "log_delivery_configurations" JSONB,
    "network_type" TEXT,
    "notification_configuration" JSONB,
    "num_cache_nodes" BIGINT,
    "pending_modified_values" JSONB,
    "preferred_availability_zone" TEXT,
    "preferred_maintenance_window" TEXT,
    "preferred_outpost_arn" TEXT,
    "replication_group_id" TEXT,
    "replication_group_log_delivery_enabled" BOOLEAN,
    "security_groups" JSONB,
    "snapshot_retention_limit" BIGINT,
    "snapshot_window" TEXT,
    "transit_encryption_enabled" BOOLEAN,
    "transit_encryption_mode" TEXT,

    CONSTRAINT "aws_elasticache_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_events" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "_event_hash" TEXT NOT NULL,
    "date" TIMESTAMP(6),
    "message" TEXT,
    "source_identifier" TEXT,
    "source_type" TEXT,

    CONSTRAINT "aws_elasticache_events_cqpk" PRIMARY KEY ("_event_hash")
);

-- CreateTable
CREATE TABLE "aws_elasticache_global_replication_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "at_rest_encryption_enabled" BOOLEAN,
    "auth_token_enabled" BOOLEAN,
    "cache_node_type" TEXT,
    "cluster_enabled" BOOLEAN,
    "engine" TEXT,
    "engine_version" TEXT,
    "global_node_groups" JSONB,
    "global_replication_group_description" TEXT,
    "global_replication_group_id" TEXT,
    "members" JSONB,
    "status" TEXT,
    "transit_encryption_enabled" BOOLEAN,

    CONSTRAINT "aws_elasticache_global_replication_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_replication_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "at_rest_encryption_enabled" BOOLEAN,
    "auth_token_enabled" BOOLEAN,
    "auth_token_last_modified_date" TIMESTAMP(6),
    "auto_minor_version_upgrade" BOOLEAN,
    "automatic_failover" TEXT,
    "cache_node_type" TEXT,
    "cluster_enabled" BOOLEAN,
    "cluster_mode" TEXT,
    "configuration_endpoint" JSONB,
    "data_tiering" TEXT,
    "description" TEXT,
    "global_replication_group_info" JSONB,
    "ip_discovery" TEXT,
    "kms_key_id" TEXT,
    "log_delivery_configurations" JSONB,
    "member_clusters" TEXT[],
    "member_clusters_outpost_arns" TEXT[],
    "multi_az" TEXT,
    "network_type" TEXT,
    "node_groups" JSONB,
    "pending_modified_values" JSONB,
    "replication_group_create_time" TIMESTAMP(6),
    "replication_group_id" TEXT,
    "snapshot_retention_limit" BIGINT,
    "snapshot_window" TEXT,
    "snapshotting_cluster_id" TEXT,
    "status" TEXT,
    "transit_encryption_enabled" BOOLEAN,
    "transit_encryption_mode" TEXT,
    "user_group_ids" TEXT[],

    CONSTRAINT "aws_elasticache_replication_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_reserved_cache_nodes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "cache_node_count" BIGINT,
    "cache_node_type" TEXT,
    "duration" BIGINT,
    "fixed_price" DOUBLE PRECISION,
    "offering_type" TEXT,
    "product_description" TEXT,
    "recurring_charges" JSONB,
    "reservation_arn" TEXT,
    "reserved_cache_node_id" TEXT,
    "reserved_cache_nodes_offering_id" TEXT,
    "start_time" TIMESTAMP(6),
    "state" TEXT,
    "usage_price" DOUBLE PRECISION,

    CONSTRAINT "aws_elasticache_reserved_cache_nodes_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "auto_minor_version_upgrade" BOOLEAN,
    "automatic_failover" TEXT,
    "cache_cluster_create_time" TIMESTAMP(6),
    "cache_cluster_id" TEXT,
    "cache_node_type" TEXT,
    "cache_parameter_group_name" TEXT,
    "cache_subnet_group_name" TEXT,
    "data_tiering" TEXT,
    "engine" TEXT,
    "engine_version" TEXT,
    "kms_key_id" TEXT,
    "node_snapshots" JSONB,
    "num_cache_nodes" BIGINT,
    "num_node_groups" BIGINT,
    "port" BIGINT,
    "preferred_availability_zone" TEXT,
    "preferred_maintenance_window" TEXT,
    "preferred_outpost_arn" TEXT,
    "replication_group_description" TEXT,
    "replication_group_id" TEXT,
    "snapshot_name" TEXT,
    "snapshot_retention_limit" BIGINT,
    "snapshot_source" TEXT,
    "snapshot_status" TEXT,
    "snapshot_window" TEXT,
    "topic_arn" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_elasticache_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_subnet_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "cache_subnet_group_description" TEXT,
    "cache_subnet_group_name" TEXT,
    "subnets" JSONB,
    "supported_network_types" TEXT[],
    "vpc_id" TEXT,

    CONSTRAINT "aws_elasticache_subnet_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_update_actions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cache_cluster_id" TEXT,
    "cache_node_update_status" JSONB,
    "engine" TEXT,
    "estimated_update_time" TEXT,
    "node_group_update_status" JSONB,
    "nodes_updated" TEXT,
    "replication_group_id" TEXT,
    "service_update_name" TEXT,
    "service_update_recommended_apply_by_date" TIMESTAMP(6),
    "service_update_release_date" TIMESTAMP(6),
    "service_update_severity" TEXT,
    "service_update_status" TEXT,
    "service_update_type" TEXT,
    "sla_met" TEXT,
    "update_action_available_date" TIMESTAMP(6),
    "update_action_status" TEXT,
    "update_action_status_modified_date" TIMESTAMP(6),

    CONSTRAINT "aws_elasticache_update_actions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elasticache_user_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "engine" TEXT,
    "minimum_engine_version" TEXT,
    "pending_changes" JSONB,
    "replication_groups" TEXT[],
    "status" TEXT,
    "user_group_id" TEXT,
    "user_ids" TEXT[],

    CONSTRAINT "aws_elasticache_user_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticache_users" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "access_string" TEXT,
    "authentication" JSONB,
    "engine" TEXT,
    "minimum_engine_version" TEXT,
    "status" TEXT,
    "user_group_ids" TEXT[],
    "user_id" TEXT,
    "user_name" TEXT,

    CONSTRAINT "aws_elasticache_users_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticbeanstalk_application_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "application_name" TEXT,
    "application_version_arn" TEXT,
    "build_arn" TEXT,
    "date_created" TIMESTAMP(6),
    "date_updated" TIMESTAMP(6),
    "description" TEXT,
    "source_build_information" JSONB,
    "source_bundle" JSONB,
    "status" TEXT,
    "version_label" TEXT,

    CONSTRAINT "aws_elasticbeanstalk_application_versions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticbeanstalk_applications" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "date_created" TIMESTAMP(6) NOT NULL,
    "tags" JSONB,
    "application_arn" TEXT,
    "application_name" TEXT,
    "configuration_templates" TEXT[],
    "date_updated" TIMESTAMP(6),
    "description" TEXT,
    "resource_lifecycle_config" JSONB,
    "versions" TEXT[],

    CONSTRAINT "aws_elasticbeanstalk_applications_cqpk" PRIMARY KEY ("arn","date_created")
);

-- CreateTable
CREATE TABLE "aws_elasticbeanstalk_configuration_options" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "environment_id" TEXT,
    "change_severity" TEXT,
    "default_value" TEXT,
    "max_length" BIGINT,
    "max_value" BIGINT,
    "min_value" BIGINT,
    "name" TEXT,
    "namespace" TEXT,
    "regex" JSONB,
    "user_defined" BOOLEAN,
    "value_options" TEXT[],
    "value_type" TEXT,
    "application_arn" TEXT,

    CONSTRAINT "aws_elasticbeanstalk_configuration_options_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elasticbeanstalk_configuration_settings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "environment_id" TEXT,
    "application_name" TEXT,
    "date_created" TIMESTAMP(6),
    "date_updated" TIMESTAMP(6),
    "deployment_status" TEXT,
    "description" TEXT,
    "environment_name" TEXT,
    "option_settings" JSONB,
    "platform_arn" TEXT,
    "solution_stack_name" TEXT,
    "template_name" TEXT,
    "application_arn" TEXT,

    CONSTRAINT "aws_elasticbeanstalk_configuration_settings_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elasticbeanstalk_environments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "id" TEXT NOT NULL,
    "listeners" JSONB,
    "abortable_operation_in_progress" BOOLEAN,
    "application_name" TEXT,
    "cname" TEXT,
    "date_created" TIMESTAMP(6),
    "date_updated" TIMESTAMP(6),
    "description" TEXT,
    "endpoint_url" TEXT,
    "environment_arn" TEXT,
    "environment_id" TEXT,
    "environment_links" JSONB,
    "environment_name" TEXT,
    "health" TEXT,
    "health_status" TEXT,
    "operations_role" TEXT,
    "platform_arn" TEXT,
    "resources" JSONB,
    "solution_stack_name" TEXT,
    "status" TEXT,
    "template_name" TEXT,
    "tier" JSONB,
    "version_label" TEXT,

    CONSTRAINT "aws_elasticbeanstalk_environments_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_elasticsearch_domains" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "authorized_principals" JSONB,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "domain_id" TEXT,
    "domain_name" TEXT,
    "elasticsearch_cluster_config" JSONB,
    "access_policies" TEXT,
    "advanced_options" JSONB,
    "advanced_security_options" JSONB,
    "auto_tune_options" JSONB,
    "change_progress_details" JSONB,
    "cognito_options" JSONB,
    "created" BOOLEAN,
    "deleted" BOOLEAN,
    "domain_endpoint_options" JSONB,
    "ebs_options" JSONB,
    "elasticsearch_version" TEXT,
    "encryption_at_rest_options" JSONB,
    "endpoint" TEXT,
    "endpoints" JSONB,
    "log_publishing_options" JSONB,
    "node_to_node_encryption_options" JSONB,
    "processing" BOOLEAN,
    "service_software_options" JSONB,
    "snapshot_options" JSONB,
    "upgrade_processing" BOOLEAN,
    "vpc_options" JSONB,

    CONSTRAINT "aws_elasticsearch_domains_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elasticsearch_packages" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "available_package_version" TEXT,
    "created_at" TIMESTAMP(6),
    "error_details" JSONB,
    "last_updated_at" TIMESTAMP(6),
    "package_description" TEXT,
    "package_id" TEXT,
    "package_name" TEXT,
    "package_status" TEXT,
    "package_type" TEXT,

    CONSTRAINT "aws_elasticsearch_packages_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_elasticsearch_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "instance_types" JSONB,

    CONSTRAINT "aws_elasticsearch_versions_cqpk" PRIMARY KEY ("account_id","region","version")
);

-- CreateTable
CREATE TABLE "aws_elasticsearch_vpc_endpoints" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "id" TEXT NOT NULL,
    "domain_arn" TEXT,
    "endpoint" TEXT,
    "status" TEXT,
    "vpc_endpoint_id" TEXT,
    "vpc_endpoint_owner" TEXT,
    "vpc_options" JSONB,

    CONSTRAINT "aws_elasticsearch_vpc_endpoints_cqpk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aws_elastictranscoder_pipeline_jobs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "input" JSONB,
    "inputs" JSONB,
    "output" JSONB,
    "output_key_prefix" TEXT,
    "outputs" JSONB,
    "pipeline_id" TEXT,
    "playlists" JSONB,
    "status" TEXT,
    "timing" JSONB,
    "user_metadata" JSONB,

    CONSTRAINT "aws_elastictranscoder_pipeline_jobs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elastictranscoder_pipelines" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "aws_kms_key_arn" TEXT,
    "content_config" JSONB,
    "id" TEXT,
    "input_bucket" TEXT,
    "name" TEXT,
    "notifications" JSONB,
    "output_bucket" TEXT,
    "role" TEXT,
    "status" TEXT,
    "thumbnail_config" JSONB,

    CONSTRAINT "aws_elastictranscoder_pipelines_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elastictranscoder_presets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "audio" JSONB,
    "container" TEXT,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "thumbnails" JSONB,
    "type" TEXT,
    "video" JSONB,

    CONSTRAINT "aws_elastictranscoder_presets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elbv1_load_balancer_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "load_balancer_arn" TEXT,
    "load_balancer_name" TEXT,
    "policy_attribute_descriptions" JSONB,
    "policy_name" TEXT,
    "policy_type_name" TEXT,

    CONSTRAINT "aws_elbv1_load_balancer_policies_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elbv1_load_balancers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
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

    CONSTRAINT "aws_elbv1_load_balancers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elbv2_listener_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "listener_arn" TEXT,
    "certificate_arn" TEXT,
    "is_default" BOOLEAN,

    CONSTRAINT "aws_elbv2_listener_certificates_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elbv2_listener_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "listener_arn" TEXT,
    "arn" TEXT NOT NULL,
    "actions" JSONB,
    "conditions" JSONB,
    "is_default" BOOLEAN,
    "priority" TEXT,
    "rule_arn" TEXT,

    CONSTRAINT "aws_elbv2_listener_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elbv2_listeners" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "alpn_policy" TEXT[],
    "certificates" JSONB,
    "default_actions" JSONB,
    "listener_arn" TEXT,
    "load_balancer_arn" TEXT,
    "port" BIGINT,
    "protocol" TEXT,
    "ssl_policy" TEXT,

    CONSTRAINT "aws_elbv2_listeners_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elbv2_load_balancer_attributes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "load_balancer_arn" TEXT,
    "key" TEXT,
    "value" TEXT,

    CONSTRAINT "aws_elbv2_load_balancer_attributes_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elbv2_load_balancer_web_acls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "load_balancer_arn" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "default_action" JSONB,
    "id" TEXT,
    "name" TEXT,
    "visibility_config" JSONB,
    "association_config" JSONB,
    "capacity" BIGINT,
    "captcha_config" JSONB,
    "challenge_config" JSONB,
    "custom_response_bodies" JSONB,
    "description" TEXT,
    "label_namespace" TEXT,
    "managed_by_firewall_manager" BOOLEAN,
    "post_process_firewall_manager_rule_groups" JSONB,
    "pre_process_firewall_manager_rule_groups" JSONB,
    "rules" JSONB,
    "token_domains" TEXT[],

    CONSTRAINT "aws_elbv2_load_balancer_web_acls_cqpk" PRIMARY KEY ("load_balancer_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_elbv2_load_balancers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
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

    CONSTRAINT "aws_elbv2_load_balancers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_elbv2_target_group_target_health_descriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "target_group_arn" TEXT,
    "health_check_port" TEXT,
    "target" JSONB,
    "target_health" JSONB,

    CONSTRAINT "aws_elbv2_target_group_target_health_descriptions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_elbv2_target_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "health_check_enabled" BOOLEAN,
    "health_check_interval_seconds" BIGINT,
    "health_check_path" TEXT,
    "health_check_port" TEXT,
    "health_check_protocol" TEXT,
    "health_check_timeout_seconds" BIGINT,
    "healthy_threshold_count" BIGINT,
    "ip_address_type" TEXT,
    "load_balancer_arns" TEXT[],
    "matcher" JSONB,
    "port" BIGINT,
    "protocol" TEXT,
    "protocol_version" TEXT,
    "target_group_arn" TEXT,
    "target_group_name" TEXT,
    "target_type" TEXT,
    "unhealthy_threshold_count" BIGINT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_elbv2_target_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_emr_block_public_access_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "block_public_access_configuration" JSONB,
    "block_public_access_configuration_metadata" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_emr_block_public_access_configs_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_emr_cluster_instance_fleets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "instance_fleet_type" TEXT,
    "instance_type_specifications" JSONB,
    "launch_specifications" JSONB,
    "name" TEXT,
    "provisioned_on_demand_capacity" BIGINT,
    "provisioned_spot_capacity" BIGINT,
    "resize_specifications" JSONB,
    "status" JSONB,
    "target_on_demand_capacity" BIGINT,
    "target_spot_capacity" BIGINT,

    CONSTRAINT "aws_emr_cluster_instance_fleets_cqpk" PRIMARY KEY ("cluster_arn","id")
);

-- CreateTable
CREATE TABLE "aws_emr_cluster_instance_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT NOT NULL,
    "auto_scaling_policy" JSONB,
    "bid_price" TEXT,
    "configurations" JSONB,
    "configurations_version" BIGINT,
    "custom_ami_id" TEXT,
    "ebs_block_devices" JSONB,
    "ebs_optimized" BOOLEAN,
    "id" TEXT NOT NULL,
    "instance_group_type" TEXT,
    "instance_type" TEXT,
    "last_successfully_applied_configurations" JSONB,
    "last_successfully_applied_configurations_version" BIGINT,
    "market" TEXT,
    "name" TEXT,
    "requested_instance_count" BIGINT,
    "running_instance_count" BIGINT,
    "shrink_policy" JSONB,
    "status" JSONB,

    CONSTRAINT "aws_emr_cluster_instance_groups_cqpk" PRIMARY KEY ("cluster_arn","id")
);

-- CreateTable
CREATE TABLE "aws_emr_cluster_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "ebs_volumes" JSONB,
    "ec2_instance_id" TEXT,
    "id" TEXT,
    "instance_fleet_id" TEXT,
    "instance_group_id" TEXT,
    "instance_type" TEXT,
    "market" TEXT,
    "private_dns_name" TEXT,
    "private_ip_address" TEXT,
    "public_dns_name" TEXT,
    "public_ip_address" TEXT,
    "status" JSONB,

    CONSTRAINT "aws_emr_cluster_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_emr_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "applications" JSONB,
    "auto_scaling_role" TEXT,
    "auto_terminate" BOOLEAN,
    "cluster_arn" TEXT,
    "configurations" JSONB,
    "custom_ami_id" TEXT,
    "ebs_root_volume_size" BIGINT,
    "ec2_instance_attributes" JSONB,
    "id" TEXT,
    "instance_collection_type" TEXT,
    "kerberos_attributes" JSONB,
    "log_encryption_kms_key_id" TEXT,
    "log_uri" TEXT,
    "master_public_dns_name" TEXT,
    "name" TEXT,
    "normalized_instance_hours" BIGINT,
    "os_release_label" TEXT,
    "outpost_arn" TEXT,
    "placement_groups" JSONB,
    "release_label" TEXT,
    "repo_upgrade_on_boot" TEXT,
    "requested_ami_version" TEXT,
    "running_ami_version" TEXT,
    "scale_down_behavior" TEXT,
    "security_configuration" TEXT,
    "service_role" TEXT,
    "status" JSONB,
    "step_concurrency_level" BIGINT,
    "termination_protected" BOOLEAN,
    "visible_to_all_users" BOOLEAN,

    CONSTRAINT "aws_emr_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_emr_notebook_executions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT,
    "arn" TEXT NOT NULL,
    "editor_id" TEXT,
    "end_time" TIMESTAMP(6),
    "environment_variables" JSONB,
    "execution_engine" JSONB,
    "last_state_change_reason" TEXT,
    "notebook_execution_id" TEXT,
    "notebook_execution_name" TEXT,
    "notebook_instance_security_group_id" TEXT,
    "notebook_params" TEXT,
    "notebook_s3_location" JSONB,
    "output_notebook_format" TEXT,
    "output_notebook_s3_location" JSONB,
    "output_notebook_uri" TEXT,
    "start_time" TIMESTAMP(6),
    "status" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_emr_notebook_executions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_emr_release_labels" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "applications" JSONB,
    "available_os_releases" JSONB,
    "release_label" TEXT NOT NULL,

    CONSTRAINT "aws_emr_release_labels_cqpk" PRIMARY KEY ("account_id","region","release_label")
);

-- CreateTable
CREATE TABLE "aws_emr_security_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "security_configuration" JSONB,
    "creation_date_time" TIMESTAMP(6),
    "name" TEXT NOT NULL,

    CONSTRAINT "aws_emr_security_configurations_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_emr_steps" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT NOT NULL,
    "action_on_failure" TEXT,
    "config" JSONB,
    "execution_role_arn" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" JSONB,

    CONSTRAINT "aws_emr_steps_cqpk" PRIMARY KEY ("cluster_arn","id")
);

-- CreateTable
CREATE TABLE "aws_emr_studio_session_mappings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "studio_arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "identity_id" TEXT NOT NULL,
    "identity_name" TEXT,
    "identity_type" TEXT NOT NULL,
    "last_modified_time" TIMESTAMP(6),
    "session_policy_arn" TEXT,
    "studio_id" TEXT,

    CONSTRAINT "aws_emr_studio_session_mappings_cqpk" PRIMARY KEY ("studio_arn","identity_id","identity_type")
);

-- CreateTable
CREATE TABLE "aws_emr_studios" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "auth_mode" TEXT,
    "creation_time" TIMESTAMP(6),
    "default_s3_location" TEXT,
    "description" TEXT,
    "engine_security_group_id" TEXT,
    "idp_auth_url" TEXT,
    "idp_relay_state_parameter_name" TEXT,
    "name" TEXT,
    "service_role" TEXT,
    "studio_arn" TEXT,
    "studio_id" TEXT,
    "subnet_ids" TEXT[],
    "tags" JSONB,
    "url" TEXT,
    "user_role" TEXT,
    "vpc_id" TEXT,
    "workspace_security_group_id" TEXT,

    CONSTRAINT "aws_emr_studios_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_emr_supported_instance_types" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "release_label" TEXT NOT NULL,
    "architecture" TEXT,
    "ebs_optimized_available" BOOLEAN,
    "ebs_optimized_by_default" BOOLEAN,
    "ebs_storage_only" BOOLEAN,
    "instance_family_id" TEXT,
    "is64_bits_only" BOOLEAN,
    "memory_gb" DOUBLE PRECISION,
    "number_of_disks" BIGINT,
    "storage_gb" BIGINT,
    "type" TEXT NOT NULL,
    "vcpu" BIGINT,

    CONSTRAINT "aws_emr_supported_instance_types_cqpk" PRIMARY KEY ("account_id","region","release_label","type")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_api_destinations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "api_destination_arn" TEXT,
    "api_destination_state" TEXT,
    "connection_arn" TEXT,
    "creation_time" TIMESTAMP(6),
    "http_method" TEXT,
    "invocation_endpoint" TEXT,
    "invocation_rate_limit_per_second" BIGINT,
    "last_modified_time" TIMESTAMP(6),
    "name" TEXT,

    CONSTRAINT "aws_eventbridge_api_destinations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_archives" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "archive_name" TEXT,
    "creation_time" TIMESTAMP(6),
    "event_count" BIGINT,
    "event_source_arn" TEXT,
    "retention_days" BIGINT,
    "size_bytes" BIGINT,
    "state" TEXT,
    "state_reason" TEXT,

    CONSTRAINT "aws_eventbridge_archives_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "authorization_type" TEXT,
    "connection_arn" TEXT,
    "connection_state" TEXT,
    "creation_time" TIMESTAMP(6),
    "last_authorized_time" TIMESTAMP(6),
    "last_modified_time" TIMESTAMP(6),
    "name" TEXT,
    "state_reason" TEXT,

    CONSTRAINT "aws_eventbridge_connections_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_endpoints" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "description" TEXT,
    "endpoint_id" TEXT,
    "endpoint_url" TEXT,
    "event_buses" JSONB,
    "last_modified_time" TIMESTAMP(6),
    "name" TEXT,
    "replication_config" JSONB,
    "role_arn" TEXT,
    "routing_config" JSONB,
    "state" TEXT,
    "state_reason" TEXT,

    CONSTRAINT "aws_eventbridge_endpoints_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_event_bus_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "event_bus_arn" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "description" TEXT,
    "event_bus_name" TEXT,
    "event_pattern" TEXT,
    "managed_by" TEXT,
    "name" TEXT,
    "role_arn" TEXT,
    "schedule_expression" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_eventbridge_event_bus_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_event_bus_targets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "rule_arn" TEXT NOT NULL,
    "event_bus_arn" TEXT NOT NULL,
    "arn" TEXT,
    "id" TEXT NOT NULL,
    "batch_parameters" JSONB,
    "dead_letter_config" JSONB,
    "ecs_parameters" JSONB,
    "http_parameters" JSONB,
    "input" TEXT,
    "input_path" TEXT,
    "input_transformer" JSONB,
    "kinesis_parameters" JSONB,
    "redshift_data_parameters" JSONB,
    "retry_policy" JSONB,
    "role_arn" TEXT,
    "run_command_parameters" JSONB,
    "sage_maker_pipeline_parameters" JSONB,
    "sqs_parameters" JSONB,

    CONSTRAINT "aws_eventbridge_event_bus_targets_cqpk" PRIMARY KEY ("rule_arn","event_bus_arn","id")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_event_buses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "name" TEXT,
    "policy" TEXT,

    CONSTRAINT "aws_eventbridge_event_buses_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_event_sources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_by" TEXT,
    "creation_time" TIMESTAMP(6),
    "expiration_time" TIMESTAMP(6),
    "name" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_eventbridge_event_sources_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_eventbridge_replays" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "description" TEXT,
    "destination" JSONB,
    "event_end_time" TIMESTAMP(6),
    "event_last_replayed_time" TIMESTAMP(6),
    "event_source_arn" TEXT,
    "event_start_time" TIMESTAMP(6),
    "replay_arn" TEXT,
    "replay_end_time" TIMESTAMP(6),
    "replay_name" TEXT,
    "replay_start_time" TIMESTAMP(6),
    "state" TEXT,
    "state_reason" TEXT,

    CONSTRAINT "aws_eventbridge_replays_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_firehose_delivery_streams" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "delivery_stream_arn" TEXT,
    "delivery_stream_name" TEXT,
    "delivery_stream_status" TEXT,
    "delivery_stream_type" TEXT,
    "destinations" JSONB,
    "has_more_destinations" BOOLEAN,
    "version_id" TEXT,
    "create_timestamp" TIMESTAMP(6),
    "delivery_stream_encryption_configuration" JSONB,
    "failure_description" JSONB,
    "last_update_timestamp" TIMESTAMP(6),
    "source" JSONB,

    CONSTRAINT "aws_firehose_delivery_streams_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_batch_imports" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "completion_time" TEXT,
    "event_type_name" TEXT,
    "failed_records_count" BIGINT,
    "failure_reason" TEXT,
    "iam_role_arn" TEXT,
    "input_path" TEXT,
    "job_id" TEXT,
    "output_path" TEXT,
    "processed_records_count" BIGINT,
    "start_time" TEXT,
    "status" TEXT,
    "total_records_count" BIGINT,

    CONSTRAINT "aws_frauddetector_batch_imports_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_batch_predictions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "completion_time" TEXT,
    "detector_name" TEXT,
    "detector_version" TEXT,
    "event_type_name" TEXT,
    "failure_reason" TEXT,
    "iam_role_arn" TEXT,
    "input_path" TEXT,
    "job_id" TEXT,
    "last_heartbeat_time" TEXT,
    "output_path" TEXT,
    "processed_records_count" BIGINT,
    "start_time" TEXT,
    "status" TEXT,
    "total_records_count" BIGINT,

    CONSTRAINT "aws_frauddetector_batch_predictions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_detectors" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TEXT,
    "description" TEXT,
    "detector_id" TEXT,
    "event_type_name" TEXT,
    "last_updated_time" TEXT,

    CONSTRAINT "aws_frauddetector_detectors_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_entity_types" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TEXT,
    "description" TEXT,
    "last_updated_time" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_frauddetector_entity_types_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_event_types" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TEXT,
    "description" TEXT,
    "entity_types" TEXT[],
    "event_ingestion" TEXT,
    "event_orchestration" JSONB,
    "event_variables" TEXT[],
    "ingested_event_statistics" JSONB,
    "labels" TEXT[],
    "last_updated_time" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_frauddetector_event_types_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_external_models" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_time" TEXT,
    "input_configuration" JSONB,
    "invoke_model_endpoint_role_arn" TEXT,
    "last_updated_time" TEXT,
    "model_endpoint" TEXT,
    "model_endpoint_status" TEXT,
    "model_source" TEXT,
    "output_configuration" JSONB,

    CONSTRAINT "aws_frauddetector_external_models_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_labels" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TEXT,
    "description" TEXT,
    "last_updated_time" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_frauddetector_labels_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_model_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_time" TEXT,
    "external_events_detail" JSONB,
    "ingested_events_detail" JSONB,
    "last_updated_time" TEXT,
    "model_id" TEXT,
    "model_type" TEXT,
    "model_version_number" TEXT,
    "status" TEXT,
    "training_data_schema" JSONB,
    "training_data_source" TEXT,
    "training_result" JSONB,
    "training_result_v2" JSONB,

    CONSTRAINT "aws_frauddetector_model_versions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_models" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_time" TEXT,
    "description" TEXT,
    "event_type_name" TEXT,
    "last_updated_time" TEXT,
    "model_id" TEXT,
    "model_type" TEXT,

    CONSTRAINT "aws_frauddetector_models_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_outcomes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TEXT,
    "description" TEXT,
    "last_updated_time" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_frauddetector_outcomes_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_time" TEXT,
    "description" TEXT,
    "detector_id" TEXT,
    "expression" TEXT,
    "language" TEXT,
    "last_updated_time" TEXT,
    "outcomes" TEXT[],
    "rule_id" TEXT,
    "rule_version" TEXT,

    CONSTRAINT "aws_frauddetector_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_frauddetector_variables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TEXT,
    "data_source" TEXT,
    "data_type" TEXT,
    "default_value" TEXT,
    "description" TEXT,
    "last_updated_time" TEXT,
    "name" TEXT,
    "variable_type" TEXT,

    CONSTRAINT "aws_frauddetector_variables_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_backups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "tags" JSONB,
    "backup_id" TEXT,
    "creation_time" TIMESTAMP(6),
    "file_system" JSONB,
    "lifecycle" TEXT,
    "type" TEXT,
    "directory_information" JSONB,
    "failure_details" JSONB,
    "kms_key_id" TEXT,
    "owner_id" TEXT,
    "progress_percent" BIGINT,
    "resource_arn" TEXT,
    "resource_type" TEXT,
    "source_backup_id" TEXT,
    "source_backup_region" TEXT,
    "volume" JSONB,

    CONSTRAINT "aws_fsx_backups_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_fsx_data_repository_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "association_id" TEXT,
    "batch_import_meta_data_on_create" BOOLEAN,
    "creation_time" TIMESTAMP(6),
    "data_repository_path" TEXT,
    "data_repository_subdirectories" TEXT[],
    "failure_details" JSONB,
    "file_cache_id" TEXT,
    "file_cache_path" TEXT,
    "file_system_id" TEXT,
    "file_system_path" TEXT,
    "imported_file_chunk_size" BIGINT,
    "lifecycle" TEXT,
    "nfs" JSONB,
    "resource_arn" TEXT,
    "s3" JSONB,

    CONSTRAINT "aws_fsx_data_repository_associations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_data_repository_tasks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "lifecycle" TEXT,
    "task_id" TEXT,
    "type" TEXT,
    "capacity_to_release" BIGINT,
    "end_time" TIMESTAMP(6),
    "failure_details" JSONB,
    "file_cache_id" TEXT,
    "file_system_id" TEXT,
    "paths" TEXT[],
    "release_configuration" JSONB,
    "report" JSONB,
    "resource_arn" TEXT,
    "start_time" TIMESTAMP(6),
    "status" JSONB,

    CONSTRAINT "aws_fsx_data_repository_tasks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_file_caches" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "dns_name" TEXT,
    "data_repository_association_ids" TEXT[],
    "failure_details" JSONB,
    "file_cache_id" TEXT,
    "file_cache_type" TEXT,
    "file_cache_type_version" TEXT,
    "kms_key_id" TEXT,
    "lifecycle" TEXT,
    "lustre_configuration" JSONB,
    "network_interface_ids" TEXT[],
    "owner_id" TEXT,
    "resource_arn" TEXT,
    "storage_capacity" BIGINT,
    "subnet_ids" TEXT[],
    "vpc_id" TEXT,

    CONSTRAINT "aws_fsx_file_caches_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_file_systems" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "administrative_actions" JSONB,
    "creation_time" TIMESTAMP(6),
    "dns_name" TEXT,
    "failure_details" JSONB,
    "file_system_id" TEXT,
    "file_system_type" TEXT,
    "file_system_type_version" TEXT,
    "kms_key_id" TEXT,
    "lifecycle" TEXT,
    "lustre_configuration" JSONB,
    "network_interface_ids" TEXT[],
    "ontap_configuration" JSONB,
    "open_zfs_configuration" JSONB,
    "owner_id" TEXT,
    "resource_arn" TEXT,
    "storage_capacity" BIGINT,
    "storage_type" TEXT,
    "subnet_ids" TEXT[],
    "vpc_id" TEXT,
    "windows_configuration" JSONB,

    CONSTRAINT "aws_fsx_file_systems_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "administrative_actions" JSONB,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "lifecycle" TEXT,
    "lifecycle_transition_reason" JSONB,
    "name" TEXT,
    "resource_arn" TEXT,
    "snapshot_id" TEXT,
    "volume_id" TEXT,

    CONSTRAINT "aws_fsx_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_storage_virtual_machines" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "active_directory_configuration" JSONB,
    "creation_time" TIMESTAMP(6),
    "endpoints" JSONB,
    "file_system_id" TEXT,
    "lifecycle" TEXT,
    "lifecycle_transition_reason" JSONB,
    "name" TEXT,
    "resource_arn" TEXT,
    "root_volume_security_style" TEXT,
    "storage_virtual_machine_id" TEXT,
    "subtype" TEXT,
    "uuid" TEXT,

    CONSTRAINT "aws_fsx_storage_virtual_machines_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_fsx_volumes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "administrative_actions" JSONB,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "file_system_id" TEXT,
    "lifecycle" TEXT,
    "lifecycle_transition_reason" JSONB,
    "name" TEXT,
    "ontap_configuration" JSONB,
    "open_zfs_configuration" JSONB,
    "resource_arn" TEXT,
    "volume_id" TEXT,
    "volume_type" TEXT,

    CONSTRAINT "aws_fsx_volumes_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glacier_data_retrieval_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "rules" JSONB,

    CONSTRAINT "aws_glacier_data_retrieval_policies_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_glacier_vault_access_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "vault_arn" TEXT NOT NULL,
    "policy" JSONB,

    CONSTRAINT "aws_glacier_vault_access_policies_cqpk" PRIMARY KEY ("vault_arn")
);

-- CreateTable
CREATE TABLE "aws_glacier_vault_lock_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "vault_arn" TEXT NOT NULL,
    "policy" JSONB,
    "creation_date" TEXT,
    "expiration_date" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_glacier_vault_lock_policies_cqpk" PRIMARY KEY ("vault_arn")
);

-- CreateTable
CREATE TABLE "aws_glacier_vault_notifications" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "vault_arn" TEXT NOT NULL,
    "events" TEXT[],
    "sns_topic" TEXT,

    CONSTRAINT "aws_glacier_vault_notifications_cqpk" PRIMARY KEY ("vault_arn")
);

-- CreateTable
CREATE TABLE "aws_glacier_vaults" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "creation_date" TEXT,
    "last_inventory_date" TEXT,
    "number_of_archives" BIGINT,
    "size_in_bytes" BIGINT,
    "vault_arn" TEXT,
    "vault_name" TEXT,

    CONSTRAINT "aws_glacier_vaults_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_classifiers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "csv_classifier" JSONB,
    "grok_classifier" JSONB,
    "json_classifier" JSONB,
    "xml_classifier" JSONB,

    CONSTRAINT "aws_glue_classifiers_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_glue_crawlers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "classifiers" TEXT[],
    "configuration" TEXT,
    "crawl_elapsed_time" BIGINT,
    "crawler_security_configuration" TEXT,
    "creation_time" TIMESTAMP(6),
    "database_name" TEXT,
    "description" TEXT,
    "lake_formation_configuration" JSONB,
    "last_crawl" JSONB,
    "last_updated" TIMESTAMP(6),
    "lineage_configuration" JSONB,
    "name" TEXT,
    "recrawl_policy" JSONB,
    "role" TEXT,
    "schedule" JSONB,
    "schema_change_policy" JSONB,
    "state" TEXT,
    "table_prefix" TEXT,
    "targets" JSONB,
    "version" BIGINT,

    CONSTRAINT "aws_glue_crawlers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_database_table_indexes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "database_arn" TEXT NOT NULL,
    "database_table_name" TEXT NOT NULL,
    "index_name" TEXT NOT NULL,
    "index_status" TEXT,
    "keys" JSONB,
    "backfill_errors" JSONB,

    CONSTRAINT "aws_glue_database_table_indexes_cqpk" PRIMARY KEY ("database_arn","database_table_name","index_name")
);

-- CreateTable
CREATE TABLE "aws_glue_database_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "database_arn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "catalog_id" TEXT,
    "create_time" TIMESTAMP(6),
    "created_by" TEXT,
    "database_name" TEXT,
    "description" TEXT,
    "federated_table" JSONB,
    "is_registered_with_lake_formation" BOOLEAN,
    "last_access_time" TIMESTAMP(6),
    "last_analyzed_time" TIMESTAMP(6),
    "owner" TEXT,
    "parameters" JSONB,
    "partition_keys" JSONB,
    "retention" BIGINT,
    "storage_descriptor" JSONB,
    "table_type" TEXT,
    "target_table" JSONB,
    "update_time" TIMESTAMP(6),
    "version_id" TEXT,
    "view_expanded_text" TEXT,
    "view_original_text" TEXT,

    CONSTRAINT "aws_glue_database_tables_cqpk" PRIMARY KEY ("database_arn","name")
);

-- CreateTable
CREATE TABLE "aws_glue_databases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "name" TEXT,
    "catalog_id" TEXT,
    "create_table_default_permissions" JSONB,
    "create_time" TIMESTAMP(6),
    "description" TEXT,
    "federated_database" JSONB,
    "location_uri" TEXT,
    "parameters" JSONB,
    "target_database" JSONB,

    CONSTRAINT "aws_glue_databases_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_datacatalog_encryption_settings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "connection_password_encryption" JSONB,
    "encryption_at_rest" JSONB,

    CONSTRAINT "aws_glue_datacatalog_encryption_settings_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_glue_dev_endpoints" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "arguments" JSONB,
    "availability_zone" TEXT,
    "created_timestamp" TIMESTAMP(6),
    "endpoint_name" TEXT,
    "extra_jars_s3_path" TEXT,
    "extra_python_libs_s3_path" TEXT,
    "failure_reason" TEXT,
    "glue_version" TEXT,
    "last_modified_timestamp" TIMESTAMP(6),
    "last_update_status" TEXT,
    "number_of_nodes" BIGINT,
    "number_of_workers" BIGINT,
    "private_address" TEXT,
    "public_address" TEXT,
    "public_key" TEXT,
    "public_keys" TEXT[],
    "role_arn" TEXT,
    "security_configuration" TEXT,
    "security_group_ids" TEXT[],
    "status" TEXT,
    "subnet_id" TEXT,
    "vpc_id" TEXT,
    "worker_type" TEXT,
    "yarn_endpoint_address" TEXT,
    "zeppelin_remote_spark_interpreter_port" BIGINT,

    CONSTRAINT "aws_glue_dev_endpoints_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_job_runs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "job_arn" TEXT,
    "allocated_capacity" BIGINT,
    "arguments" JSONB,
    "attempt" BIGINT,
    "completed_on" TIMESTAMP(6),
    "dpu_seconds" DOUBLE PRECISION,
    "error_message" TEXT,
    "execution_class" TEXT,
    "execution_time" BIGINT,
    "glue_version" TEXT,
    "id" TEXT,
    "job_name" TEXT,
    "job_run_state" TEXT,
    "last_modified_on" TIMESTAMP(6),
    "log_group_name" TEXT,
    "max_capacity" DOUBLE PRECISION,
    "notification_property" JSONB,
    "number_of_workers" BIGINT,
    "predecessor_runs" JSONB,
    "previous_run_id" TEXT,
    "security_configuration" TEXT,
    "started_on" TIMESTAMP(6),
    "timeout" BIGINT,
    "trigger_name" TEXT,
    "worker_type" TEXT,

    CONSTRAINT "aws_glue_job_runs_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_glue_jobs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "allocated_capacity" BIGINT,
    "code_gen_configuration_nodes" JSONB,
    "command" JSONB,
    "connections" JSONB,
    "created_on" TIMESTAMP(6),
    "default_arguments" JSONB,
    "description" TEXT,
    "execution_class" TEXT,
    "execution_property" JSONB,
    "glue_version" TEXT,
    "last_modified_on" TIMESTAMP(6),
    "log_uri" TEXT,
    "max_capacity" DOUBLE PRECISION,
    "max_retries" BIGINT,
    "name" TEXT,
    "non_overridable_arguments" JSONB,
    "notification_property" JSONB,
    "number_of_workers" BIGINT,
    "role" TEXT,
    "security_configuration" TEXT,
    "source_control_details" JSONB,
    "timeout" BIGINT,
    "worker_type" TEXT,

    CONSTRAINT "aws_glue_jobs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_ml_transform_task_runs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "ml_transform_arn" TEXT,
    "completed_on" TIMESTAMP(6),
    "error_string" TEXT,
    "execution_time" BIGINT,
    "last_modified_on" TIMESTAMP(6),
    "log_group_name" TEXT,
    "properties" JSONB,
    "started_on" TIMESTAMP(6),
    "status" TEXT,
    "task_run_id" TEXT,
    "transform_id" TEXT,

    CONSTRAINT "aws_glue_ml_transform_task_runs_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_glue_ml_transforms" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "schema" JSONB,
    "created_on" TIMESTAMP(6),
    "description" TEXT,
    "evaluation_metrics" JSONB,
    "glue_version" TEXT,
    "input_record_tables" JSONB,
    "label_count" BIGINT,
    "last_modified_on" TIMESTAMP(6),
    "max_capacity" DOUBLE PRECISION,
    "max_retries" BIGINT,
    "name" TEXT,
    "number_of_workers" BIGINT,
    "parameters" JSONB,
    "role" TEXT,
    "status" TEXT,
    "timeout" BIGINT,
    "transform_encryption" JSONB,
    "transform_id" TEXT,
    "worker_type" TEXT,

    CONSTRAINT "aws_glue_ml_transforms_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_registries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "created_time" TEXT,
    "description" TEXT,
    "registry_arn" TEXT,
    "registry_name" TEXT,
    "status" TEXT,
    "updated_time" TEXT,

    CONSTRAINT "aws_glue_registries_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_registry_schema_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "registry_schema_arn" TEXT,
    "metadata" JSONB,
    "created_time" TEXT,
    "data_format" TEXT,
    "schema_arn" TEXT,
    "schema_definition" TEXT,
    "schema_version_id" TEXT,
    "status" TEXT,
    "version_number" BIGINT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_glue_registry_schema_versions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_glue_registry_schemas" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "compatibility" TEXT,
    "created_time" TEXT,
    "data_format" TEXT,
    "description" TEXT,
    "latest_schema_version" BIGINT,
    "next_schema_version" BIGINT,
    "registry_arn" TEXT,
    "registry_name" TEXT,
    "schema_arn" TEXT,
    "schema_checkpoint" BIGINT,
    "schema_name" TEXT,
    "schema_status" TEXT,
    "updated_time" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_glue_registry_schemas_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_security_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_time_stamp" TIMESTAMP(6),
    "encryption_configuration" JSONB,

    CONSTRAINT "aws_glue_security_configurations_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_glue_triggers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "actions" JSONB,
    "description" TEXT,
    "event_batching_condition" JSONB,
    "id" TEXT,
    "name" TEXT,
    "predicate" JSONB,
    "schedule" TEXT,
    "state" TEXT,
    "type" TEXT,
    "workflow_name" TEXT,

    CONSTRAINT "aws_glue_triggers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_glue_workflows" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "blueprint_details" JSONB,
    "created_on" TIMESTAMP(6),
    "default_run_properties" JSONB,
    "description" TEXT,
    "graph" JSONB,
    "last_modified_on" TIMESTAMP(6),
    "last_run" JSONB,
    "max_concurrent_runs" BIGINT,
    "name" TEXT,

    CONSTRAINT "aws_glue_workflows_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detector_filters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "detector_arn" TEXT NOT NULL,
    "action" TEXT,
    "finding_criteria" JSONB,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rank" BIGINT,
    "tags" JSONB,

    CONSTRAINT "aws_guardduty_detector_filters_cqpk" PRIMARY KEY ("detector_arn","name")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detector_findings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "detector_arn" TEXT NOT NULL,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "id" TEXT,
    "region" TEXT,
    "resource" JSONB,
    "schema_version" TEXT,
    "severity" DOUBLE PRECISION,
    "type" TEXT,
    "updated_at" TIMESTAMP(6),
    "confidence" DOUBLE PRECISION,
    "description" TEXT,
    "partition" TEXT,
    "service" JSONB,
    "title" TEXT,

    CONSTRAINT "aws_guardduty_detector_findings_cqpk" PRIMARY KEY ("detector_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detector_intel_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "detector_arn" TEXT NOT NULL,
    "format" TEXT,
    "location" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_guardduty_detector_intel_sets_cqpk" PRIMARY KEY ("detector_arn","name")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detector_ip_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "detector_arn" TEXT NOT NULL,
    "format" TEXT,
    "location" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_guardduty_detector_ip_sets_cqpk" PRIMARY KEY ("detector_arn","name")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detector_members" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "region" TEXT,
    "detector_arn" TEXT,
    "account_id" TEXT,
    "email" TEXT,
    "master_id" TEXT,
    "relationship_status" TEXT,
    "updated_at" TIMESTAMP(6),
    "administrator_id" TEXT,
    "detector_id" TEXT,
    "invited_at" TIMESTAMP(6),

    CONSTRAINT "aws_guardduty_detector_members_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detector_publishing_destinations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "detector_arn" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "destination_type" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_guardduty_detector_publishing_destinations_cqpk" PRIMARY KEY ("detector_arn","destination_id")
);

-- CreateTable
CREATE TABLE "aws_guardduty_detectors" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT,
    "id" TEXT NOT NULL,
    "service_role" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(6),
    "data_sources" JSONB,
    "features" JSONB,
    "finding_publishing_frequency" TEXT,
    "tags" JSONB,
    "updated_at" TIMESTAMP(6),
    "result_metadata" JSONB,

    CONSTRAINT "aws_guardduty_detectors_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_iam_accounts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "users" BIGINT,
    "users_quota" BIGINT,
    "groups" BIGINT,
    "groups_quota" BIGINT,
    "server_certificates" BIGINT,
    "server_certificates_quota" BIGINT,
    "user_policy_size_quota" BIGINT,
    "group_policy_size_quota" BIGINT,
    "groups_per_user_quota" BIGINT,
    "signing_certificates_per_user_quota" BIGINT,
    "access_keys_per_user_quota" BIGINT,
    "mfa_devices" BIGINT,
    "mfa_devices_in_use" BIGINT,
    "account_mfa_enabled" BOOLEAN,
    "account_access_keys_present" BOOLEAN,
    "account_signing_certificates_present" BOOLEAN,
    "attached_policies_per_group_quota" BIGINT,
    "attached_policies_per_role_quota" BIGINT,
    "attached_policies_per_user_quota" BIGINT,
    "policies" BIGINT,
    "policies_quota" BIGINT,
    "policy_size_quota" BIGINT,
    "policy_versions_in_use" BIGINT,
    "policy_versions_in_use_quota" BIGINT,
    "versions_per_policy_quota" BIGINT,
    "global_endpoint_token_version" BIGINT,
    "aliases" TEXT[],

    CONSTRAINT "aws_iam_accounts_cqpk" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "aws_iam_credential_reports" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "arn" TEXT NOT NULL,
    "user_creation_time" TIMESTAMP(6) NOT NULL,
    "password_last_changed" TIMESTAMP(6),
    "password_next_rotation" TIMESTAMP(6),
    "access_key_1_last_rotated" TIMESTAMP(6),
    "access_key_2_last_rotated" TIMESTAMP(6),
    "cert_1_last_rotated" TIMESTAMP(6),
    "cert_2_last_rotated" TIMESTAMP(6),
    "access_key_1_last_used_date" TIMESTAMP(6),
    "access_key_2_last_used_date" TIMESTAMP(6),
    "password_last_used" TIMESTAMP(6),
    "password_enabled" TEXT,
    "user" TEXT,
    "password_status" TEXT,
    "mfa_active" BOOLEAN,
    "access_key1_active" BOOLEAN,
    "access_key2_active" BOOLEAN,
    "cert1_active" BOOLEAN,
    "cert2_active" BOOLEAN,
    "access_key1_last_used_region" TEXT,
    "access_key1_last_used_service" TEXT,
    "access_key2_last_used_region" TEXT,
    "access_key2_last_used_service" TEXT,

    CONSTRAINT "aws_iam_credential_reports_cqpk" PRIMARY KEY ("arn","user_creation_time")
);

-- CreateTable
CREATE TABLE "aws_iam_group_attached_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "group_arn" TEXT NOT NULL,
    "policy_arn" TEXT NOT NULL,
    "policy_name" TEXT,

    CONSTRAINT "aws_iam_group_attached_policies_cqpk" PRIMARY KEY ("account_id","group_arn","policy_arn")
);

-- CreateTable
CREATE TABLE "aws_iam_group_last_accessed_details" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "group_arn" TEXT NOT NULL,
    "job_id" TEXT,
    "service_name" TEXT,
    "service_namespace" TEXT NOT NULL,
    "last_authenticated" TIMESTAMP(6),
    "last_authenticated_entity" TEXT,
    "last_authenticated_region" TEXT,
    "total_authenticated_entities" BIGINT,
    "tracked_actions_last_accessed" JSONB,

    CONSTRAINT "aws_iam_group_last_accessed_details_cqpk" PRIMARY KEY ("account_id","group_arn","service_namespace")
);

-- CreateTable
CREATE TABLE "aws_iam_group_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "group_arn" TEXT NOT NULL,
    "policy_document" JSONB,
    "group_name" TEXT,
    "policy_name" TEXT NOT NULL,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iam_group_policies_cqpk" PRIMARY KEY ("account_id","group_arn","policy_name")
);

-- CreateTable
CREATE TABLE "aws_iam_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "create_date" TIMESTAMP(6),
    "group_id" TEXT,
    "group_name" TEXT,
    "path" TEXT,

    CONSTRAINT "aws_iam_groups_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_iam_instance_profiles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "tags" JSONB,
    "arn" TEXT,
    "create_date" TIMESTAMP(6),
    "instance_profile_id" TEXT,
    "instance_profile_name" TEXT,
    "path" TEXT,
    "roles" JSONB,

    CONSTRAINT "aws_iam_instance_profiles_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_iam_openid_connect_identity_providers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "client_id_list" TEXT[],
    "create_date" TIMESTAMP(6),
    "thumbprint_list" TEXT[],
    "url" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iam_openid_connect_identity_providers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iam_password_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "allow_users_to_change_password" BOOLEAN,
    "expire_passwords" BOOLEAN,
    "hard_expiry" BOOLEAN,
    "max_password_age" BIGINT,
    "minimum_password_length" BIGINT,
    "password_reuse_prevention" BIGINT,
    "require_lowercase_characters" BOOLEAN,
    "require_numbers" BOOLEAN,
    "require_symbols" BOOLEAN,
    "require_uppercase_characters" BOOLEAN,
    "policy_exists" BOOLEAN,

    CONSTRAINT "aws_iam_password_policies_cqpk" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "aws_iam_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "tags" JSONB,
    "policy_version_list" JSONB,
    "arn" TEXT,
    "attachment_count" BIGINT,
    "create_date" TIMESTAMP(6),
    "default_version_id" TEXT,
    "description" TEXT,
    "is_attachable" BOOLEAN,
    "path" TEXT,
    "permissions_boundary_usage_count" BIGINT,
    "policy_id" TEXT,
    "policy_name" TEXT,
    "update_date" TIMESTAMP(6),

    CONSTRAINT "aws_iam_policies_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_iam_policy_last_accessed_details" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "job_id" TEXT,
    "service_name" TEXT,
    "service_namespace" TEXT NOT NULL,
    "last_authenticated" TIMESTAMP(6),
    "last_authenticated_entity" TEXT,
    "last_authenticated_region" TEXT,
    "total_authenticated_entities" BIGINT,
    "tracked_actions_last_accessed" JSONB,

    CONSTRAINT "aws_iam_policy_last_accessed_details_cqpk" PRIMARY KEY ("account_id","arn","service_namespace")
);

-- CreateTable
CREATE TABLE "aws_iam_role_attached_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "role_arn" TEXT NOT NULL,
    "policy_arn" TEXT NOT NULL,
    "policy_name" TEXT,

    CONSTRAINT "aws_iam_role_attached_policies_cqpk" PRIMARY KEY ("account_id","role_arn","policy_arn")
);

-- CreateTable
CREATE TABLE "aws_iam_role_last_accessed_details" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "role_arn" TEXT NOT NULL,
    "job_id" TEXT,
    "service_name" TEXT,
    "service_namespace" TEXT NOT NULL,
    "last_authenticated" TIMESTAMP(6),
    "last_authenticated_entity" TEXT,
    "last_authenticated_region" TEXT,
    "total_authenticated_entities" BIGINT,
    "tracked_actions_last_accessed" JSONB,

    CONSTRAINT "aws_iam_role_last_accessed_details_cqpk" PRIMARY KEY ("account_id","role_arn","service_namespace")
);

-- CreateTable
CREATE TABLE "aws_iam_role_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "role_arn" TEXT NOT NULL,
    "policy_document" JSONB,
    "policy_name" TEXT NOT NULL,
    "role_name" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iam_role_policies_cqpk" PRIMARY KEY ("account_id","role_arn","policy_name")
);

-- CreateTable
CREATE TABLE "aws_iam_roles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "assume_role_policy_document" JSONB,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "create_date" TIMESTAMP(6),
    "path" TEXT,
    "role_id" TEXT,
    "role_name" TEXT,
    "description" TEXT,
    "max_session_duration" BIGINT,
    "permissions_boundary" JSONB,
    "role_last_used" JSONB,

    CONSTRAINT "aws_iam_roles_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_iam_saml_identity_providers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "create_date" TIMESTAMP(6),
    "saml_metadata_document" TEXT,
    "tags" JSONB,
    "valid_until" TIMESTAMP(6),

    CONSTRAINT "aws_iam_saml_identity_providers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iam_server_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "arn" TEXT,
    "path" TEXT,
    "server_certificate_id" TEXT,
    "server_certificate_name" TEXT,
    "expiration" TIMESTAMP(6),
    "upload_date" TIMESTAMP(6),

    CONSTRAINT "aws_iam_server_certificates_cqpk" PRIMARY KEY ("account_id","id")
);

-- CreateTable
CREATE TABLE "aws_iam_signing_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "user_id" TEXT,
    "certificate_body" TEXT,
    "certificate_id" TEXT NOT NULL,
    "status" TEXT,
    "user_name" TEXT,
    "upload_date" TIMESTAMP(6),

    CONSTRAINT "aws_iam_signing_certificates_cqpk" PRIMARY KEY ("account_id","user_arn","certificate_id")
);

-- CreateTable
CREATE TABLE "aws_iam_ssh_public_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "user_id" TEXT,
    "ssh_public_key_id" TEXT NOT NULL,
    "status" TEXT,
    "upload_date" TIMESTAMP(6),
    "user_name" TEXT,

    CONSTRAINT "aws_iam_ssh_public_keys_cqpk" PRIMARY KEY ("account_id","user_arn","ssh_public_key_id")
);

-- CreateTable
CREATE TABLE "aws_iam_user_access_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "access_key_id" TEXT NOT NULL,
    "user_id" TEXT,
    "last_used" TIMESTAMP(6),
    "last_used_service_name" TEXT,
    "create_date" TIMESTAMP(6),
    "status" TEXT,
    "user_name" TEXT,
    "last_rotated" TIMESTAMP(6),

    CONSTRAINT "aws_iam_user_access_keys_cqpk" PRIMARY KEY ("account_id","user_arn","access_key_id")
);

-- CreateTable
CREATE TABLE "aws_iam_user_attached_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "policy_name" TEXT NOT NULL,
    "user_id" TEXT,
    "policy_arn" TEXT,

    CONSTRAINT "aws_iam_user_attached_policies_cqpk" PRIMARY KEY ("account_id","user_arn","policy_name")
);

-- CreateTable
CREATE TABLE "aws_iam_user_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "user_id" TEXT,
    "arn" TEXT NOT NULL,
    "create_date" TIMESTAMP(6),
    "group_id" TEXT,
    "group_name" TEXT,
    "path" TEXT,

    CONSTRAINT "aws_iam_user_groups_cqpk" PRIMARY KEY ("account_id","user_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_iam_user_last_accessed_details" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "job_id" TEXT,
    "service_name" TEXT,
    "service_namespace" TEXT NOT NULL,
    "last_authenticated" TIMESTAMP(6),
    "last_authenticated_entity" TEXT,
    "last_authenticated_region" TEXT,
    "total_authenticated_entities" BIGINT,
    "tracked_actions_last_accessed" JSONB,

    CONSTRAINT "aws_iam_user_last_accessed_details_cqpk" PRIMARY KEY ("account_id","user_arn","service_namespace")
);

-- CreateTable
CREATE TABLE "aws_iam_user_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "user_arn" TEXT NOT NULL,
    "user_id" TEXT,
    "policy_document" JSONB,
    "policy_name" TEXT NOT NULL,
    "user_name" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iam_user_policies_cqpk" PRIMARY KEY ("account_id","user_arn","policy_name")
);

-- CreateTable
CREATE TABLE "aws_iam_users" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "create_date" TIMESTAMP(6),
    "path" TEXT,
    "user_id" TEXT,
    "user_name" TEXT,
    "password_last_used" TIMESTAMP(6),
    "permissions_boundary" JSONB,

    CONSTRAINT "aws_iam_users_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_iam_virtual_mfa_devices" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "serial_number" TEXT NOT NULL,
    "tags" JSONB,
    "base32_string_seed" BYTEA,
    "enable_date" TIMESTAMP(6),
    "qr_code_png" BYTEA,
    "user" JSONB,

    CONSTRAINT "aws_iam_virtual_mfa_devices_cqpk" PRIMARY KEY ("serial_number")
);

-- CreateTable
CREATE TABLE "aws_inspector2_findings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "aws_account_id" TEXT,
    "description" TEXT,
    "finding_arn" TEXT,
    "first_observed_at" TIMESTAMP(6),
    "last_observed_at" TIMESTAMP(6),
    "remediation" JSONB,
    "resources" JSONB,
    "severity" TEXT,
    "status" TEXT,
    "type" TEXT,
    "code_vulnerability_details" JSONB,
    "epss" JSONB,
    "exploit_available" TEXT,
    "exploitability_details" JSONB,
    "fix_available" TEXT,
    "inspector_score" DOUBLE PRECISION,
    "inspector_score_details" JSONB,
    "network_reachability_details" JSONB,
    "package_vulnerability_details" JSONB,
    "title" TEXT,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "aws_inspector2_findings_cqpk" PRIMARY KEY ("request_account_id","request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_inspector_findings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "attributes" JSONB,
    "user_attributes" JSONB,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "asset_attributes" JSONB,
    "asset_type" TEXT,
    "confidence" BIGINT,
    "description" TEXT,
    "id" TEXT,
    "indicator_of_compromise" BOOLEAN,
    "numeric_severity" DOUBLE PRECISION,
    "recommendation" TEXT,
    "schema_version" BIGINT,
    "service" TEXT,
    "service_attributes" JSONB,
    "severity" TEXT,
    "title" TEXT,

    CONSTRAINT "aws_inspector_findings_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_billing_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "things_in_group" TEXT[],
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "billing_group_arn" TEXT,
    "billing_group_id" TEXT,
    "billing_group_metadata" JSONB,
    "billing_group_name" TEXT,
    "billing_group_properties" JSONB,
    "version" BIGINT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iot_billing_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_ca_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "certificates" TEXT[],
    "arn" TEXT NOT NULL,
    "auto_registration_status" TEXT,
    "certificate_arn" TEXT,
    "certificate_id" TEXT,
    "certificate_mode" TEXT,
    "certificate_pem" TEXT,
    "creation_date" TIMESTAMP(6),
    "customer_version" BIGINT,
    "generation_id" TEXT,
    "last_modified_date" TIMESTAMP(6),
    "owned_by" TEXT,
    "status" TEXT,
    "validity" JSONB,

    CONSTRAINT "aws_iot_ca_certificates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "policies" TEXT[],
    "arn" TEXT NOT NULL,
    "ca_certificate_id" TEXT,
    "certificate_arn" TEXT,
    "certificate_id" TEXT,
    "certificate_mode" TEXT,
    "certificate_pem" TEXT,
    "creation_date" TIMESTAMP(6),
    "customer_version" BIGINT,
    "generation_id" TEXT,
    "last_modified_date" TIMESTAMP(6),
    "owned_by" TEXT,
    "previous_owned_by" TEXT,
    "status" TEXT,
    "transfer_data" JSONB,
    "validity" JSONB,

    CONSTRAINT "aws_iot_certificates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_jobs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "abort_config" JSONB,
    "comment" TEXT,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "description" TEXT,
    "destination_package_versions" TEXT[],
    "document_parameters" JSONB,
    "force_canceled" BOOLEAN,
    "is_concurrent" BOOLEAN,
    "job_arn" TEXT,
    "job_executions_retry_config" JSONB,
    "job_executions_rollout_config" JSONB,
    "job_id" TEXT,
    "job_process_details" JSONB,
    "job_template_arn" TEXT,
    "last_updated_at" TIMESTAMP(6),
    "namespace_id" TEXT,
    "presigned_url_config" JSONB,
    "reason_code" TEXT,
    "scheduled_job_rollouts" JSONB,
    "scheduling_config" JSONB,
    "status" TEXT,
    "target_selection" TEXT,
    "targets" TEXT[],
    "timeout_config" JSONB,

    CONSTRAINT "aws_iot_jobs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "policy_arn" TEXT,
    "policy_name" TEXT,

    CONSTRAINT "aws_iot_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_security_profiles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "targets" TEXT[],
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "additional_metrics_to_retain" TEXT[],
    "additional_metrics_to_retain_v2" JSONB,
    "alert_targets" JSONB,
    "behaviors" JSONB,
    "creation_date" TIMESTAMP(6),
    "last_modified_date" TIMESTAMP(6),
    "security_profile_arn" TEXT,
    "security_profile_description" TEXT,
    "security_profile_name" TEXT,
    "version" BIGINT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iot_security_profiles_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_streams" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "description" TEXT,
    "files" JSONB,
    "last_updated_at" TIMESTAMP(6),
    "role_arn" TEXT,
    "stream_arn" TEXT,
    "stream_id" TEXT,
    "stream_version" BIGINT,

    CONSTRAINT "aws_iot_streams_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_thing_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "things_in_group" TEXT[],
    "policies" TEXT[],
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "index_name" TEXT,
    "query_string" TEXT,
    "query_version" TEXT,
    "status" TEXT,
    "thing_group_arn" TEXT,
    "thing_group_id" TEXT,
    "thing_group_metadata" JSONB,
    "thing_group_name" TEXT,
    "thing_group_properties" JSONB,
    "version" BIGINT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iot_thing_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_thing_types" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "thing_type_arn" TEXT,
    "thing_type_metadata" JSONB,
    "thing_type_name" TEXT,
    "thing_type_properties" JSONB,

    CONSTRAINT "aws_iot_thing_types_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_things" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "principals" TEXT[],
    "arn" TEXT NOT NULL,
    "attributes" JSONB,
    "thing_arn" TEXT,
    "thing_name" TEXT,
    "thing_type_name" TEXT,
    "version" BIGINT,

    CONSTRAINT "aws_iot_things_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_iot_topic_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "rule" JSONB,
    "rule_arn" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_iot_topic_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kafka_cluster_operations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_arn" TEXT,
    "tags" JSONB,
    "client_request_id" TEXT,
    "creation_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "error_info" JSONB,
    "operation_arn" TEXT,
    "operation_state" TEXT,
    "operation_steps" JSONB,
    "operation_type" TEXT,
    "source_cluster_info" JSONB,
    "target_cluster_info" JSONB,
    "vpc_connection_info" JSONB,

    CONSTRAINT "aws_kafka_cluster_operations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kafka_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "active_operation_arn" TEXT,
    "cluster_arn" TEXT,
    "cluster_name" TEXT,
    "cluster_type" TEXT,
    "creation_time" TIMESTAMP(6),
    "current_version" TEXT,
    "provisioned" JSONB,
    "serverless" JSONB,
    "state" TEXT,
    "state_info" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_kafka_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kafka_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "description" TEXT,
    "kafka_versions" TEXT[],
    "latest_revision" JSONB,
    "name" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_kafka_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kafka_nodes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_arn" TEXT,
    "added_to_cluster_time" TEXT,
    "broker_node_info" JSONB,
    "instance_type" TEXT,
    "node_arn" TEXT,
    "node_type" TEXT,
    "zookeeper_node_info" JSONB,

    CONSTRAINT "aws_kafka_nodes_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kinesis_streams" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "enhanced_monitoring" JSONB,
    "open_shard_count" BIGINT,
    "retention_period_hours" BIGINT,
    "stream_arn" TEXT,
    "stream_creation_timestamp" TIMESTAMP(6),
    "stream_name" TEXT,
    "stream_status" TEXT,
    "consumer_count" BIGINT,
    "encryption_type" TEXT,
    "key_id" TEXT,
    "stream_mode_details" JSONB,

    CONSTRAINT "aws_kinesis_streams_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kms_aliases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "alias_arn" TEXT,
    "alias_name" TEXT,
    "creation_date" TIMESTAMP(6),
    "last_updated_date" TIMESTAMP(6),
    "target_key_id" TEXT,

    CONSTRAINT "aws_kms_aliases_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_kms_key_grants" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "key_arn" TEXT NOT NULL,
    "grant_id" TEXT NOT NULL,
    "constraints" JSONB,
    "creation_date" TIMESTAMP(6),
    "grantee_principal" TEXT,
    "issuing_account" TEXT,
    "key_id" TEXT,
    "name" TEXT,
    "operations" TEXT[],
    "retiring_principal" TEXT,

    CONSTRAINT "aws_kms_key_grants_cqpk" PRIMARY KEY ("key_arn","grant_id")
);

-- CreateTable
CREATE TABLE "aws_kms_key_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "key_arn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy" JSONB,

    CONSTRAINT "aws_kms_key_policies_cqpk" PRIMARY KEY ("key_arn","name")
);

-- CreateTable
CREATE TABLE "aws_kms_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "rotation_enabled" BOOLEAN,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "replica_keys" JSONB,
    "key_id" TEXT,
    "aws_account_id" TEXT,
    "cloud_hsm_cluster_id" TEXT,
    "creation_date" TIMESTAMP(6),
    "custom_key_store_id" TEXT,
    "customer_master_key_spec" TEXT,
    "deletion_date" TIMESTAMP(6),
    "description" TEXT,
    "enabled" BOOLEAN,
    "encryption_algorithms" TEXT[],
    "expiration_model" TEXT,
    "key_manager" TEXT,
    "key_spec" TEXT,
    "key_state" TEXT,
    "key_usage" TEXT,
    "mac_algorithms" TEXT[],
    "multi_region" BOOLEAN,
    "multi_region_configuration" JSONB,
    "origin" TEXT,
    "pending_deletion_window_in_days" BIGINT,
    "signing_algorithms" TEXT[],
    "valid_to" TIMESTAMP(6),
    "xks_key_configuration" JSONB,

    CONSTRAINT "aws_kms_keys_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lambda_function_aliases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "function_arn" TEXT,
    "arn" TEXT NOT NULL,
    "alias_arn" TEXT,
    "description" TEXT,
    "function_version" TEXT,
    "name" TEXT,
    "revision_id" TEXT,
    "routing_config" JSONB,
    "url_config" JSONB,

    CONSTRAINT "aws_lambda_function_aliases_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lambda_function_concurrency_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "function_arn" TEXT,
    "allocated_provisioned_concurrent_executions" BIGINT,
    "available_provisioned_concurrent_executions" BIGINT,
    "last_modified" TEXT,
    "requested_provisioned_concurrent_executions" BIGINT,
    "status" TEXT,
    "status_reason" TEXT,

    CONSTRAINT "aws_lambda_function_concurrency_configs_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lambda_function_event_invoke_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "function_arn" TEXT,
    "destination_config" JSONB,
    "last_modified" TIMESTAMP(6),
    "maximum_event_age_in_seconds" BIGINT,
    "maximum_retry_attempts" BIGINT,

    CONSTRAINT "aws_lambda_function_event_invoke_configs_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lambda_function_event_source_mappings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "function_arn" TEXT,
    "amazon_managed_kafka_event_source_config" JSONB,
    "batch_size" BIGINT,
    "bisect_batch_on_function_error" BOOLEAN,
    "destination_config" JSONB,
    "document_db_event_source_config" JSONB,
    "event_source_arn" TEXT,
    "filter_criteria" JSONB,
    "function_response_types" TEXT[],
    "last_modified" TIMESTAMP(6),
    "last_processing_result" TEXT,
    "maximum_batching_window_in_seconds" BIGINT,
    "maximum_record_age_in_seconds" BIGINT,
    "maximum_retry_attempts" BIGINT,
    "parallelization_factor" BIGINT,
    "queues" TEXT[],
    "scaling_config" JSONB,
    "self_managed_event_source" JSONB,
    "self_managed_kafka_event_source_config" JSONB,
    "source_access_configurations" JSONB,
    "starting_position" TEXT,
    "starting_position_timestamp" TIMESTAMP(6),
    "state" TEXT,
    "state_transition_reason" TEXT,
    "topics" TEXT[],
    "tumbling_window_in_seconds" BIGINT,
    "uuid" TEXT,

    CONSTRAINT "aws_lambda_function_event_source_mappings_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lambda_function_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "function_arn" TEXT NOT NULL,
    "architectures" TEXT[],
    "code_sha256" TEXT,
    "code_size" BIGINT,
    "dead_letter_config" JSONB,
    "description" TEXT,
    "environment" JSONB,
    "ephemeral_storage" JSONB,
    "file_system_configs" JSONB,
    "function_name" TEXT,
    "handler" TEXT,
    "image_config_response" JSONB,
    "kms_key_arn" TEXT,
    "last_modified" TEXT,
    "last_update_status" TEXT,
    "last_update_status_reason" TEXT,
    "last_update_status_reason_code" TEXT,
    "layers" JSONB,
    "master_arn" TEXT,
    "memory_size" BIGINT,
    "package_type" TEXT,
    "revision_id" TEXT,
    "role" TEXT,
    "runtime" TEXT,
    "runtime_version_config" JSONB,
    "signing_job_arn" TEXT,
    "signing_profile_version_arn" TEXT,
    "snap_start" JSONB,
    "state" TEXT,
    "state_reason" TEXT,
    "state_reason_code" TEXT,
    "timeout" BIGINT,
    "tracing_config" JSONB,
    "version" TEXT NOT NULL,
    "vpc_config" JSONB,

    CONSTRAINT "aws_lambda_function_versions_cqpk" PRIMARY KEY ("function_arn","version")
);

-- CreateTable
CREATE TABLE "aws_lambda_functions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "policy_revision_id" TEXT,
    "policy_document" JSONB,
    "code_signing_config" JSONB,
    "code_repository_type" TEXT,
    "update_runtime_on" TEXT,
    "runtime_version_arn" TEXT,
    "code" JSONB,
    "concurrency" JSONB,
    "configuration" JSONB,
    "tags" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_lambda_functions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lambda_layer_version_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "layer_version_arn" TEXT,
    "layer_version" BIGINT,
    "policy" TEXT,
    "revision_id" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_lambda_layer_version_policies_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lambda_layer_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "layer_arn" TEXT,
    "compatible_architectures" TEXT[],
    "compatible_runtimes" TEXT[],
    "created_date" TEXT,
    "description" TEXT,
    "layer_version_arn" TEXT,
    "license_info" TEXT,
    "version" BIGINT,

    CONSTRAINT "aws_lambda_layer_versions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lambda_layers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "latest_matching_version" JSONB,
    "layer_arn" TEXT,
    "layer_name" TEXT,

    CONSTRAINT "aws_lambda_layers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lambda_runtimes" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "name" TEXT NOT NULL,

    CONSTRAINT "aws_lambda_runtimes_cqpk" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "aws_lightsail_alarms" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "comparison_operator" TEXT,
    "contact_protocols" TEXT[],
    "created_at" TIMESTAMP(6),
    "datapoints_to_alarm" BIGINT,
    "evaluation_periods" BIGINT,
    "location" JSONB,
    "metric_name" TEXT,
    "monitored_resource_info" JSONB,
    "name" TEXT,
    "notification_enabled" BOOLEAN,
    "notification_triggers" TEXT[],
    "period" BIGINT,
    "resource_type" TEXT,
    "state" TEXT,
    "statistic" TEXT,
    "support_code" TEXT,
    "threshold" DOUBLE PRECISION,
    "treat_missing_data" TEXT,
    "unit" TEXT,

    CONSTRAINT "aws_lightsail_alarms_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_bucket_access_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "bucket_arn" TEXT,
    "access_key_id" TEXT,
    "created_at" TIMESTAMP(6),
    "last_used" JSONB,
    "secret_access_key" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_lightsail_bucket_access_keys_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_buckets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "able_to_update_bundle" BOOLEAN,
    "tags" JSONB,
    "access_log_config" JSONB,
    "access_rules" JSONB,
    "arn" TEXT NOT NULL,
    "bundle_id" TEXT,
    "created_at" TIMESTAMP(6),
    "location" JSONB,
    "name" TEXT,
    "object_versioning" TEXT,
    "readonly_access_accounts" TEXT[],
    "resource_type" TEXT,
    "resources_receiving_access" JSONB,
    "state" JSONB,
    "support_code" TEXT,
    "url" TEXT,

    CONSTRAINT "aws_lightsail_buckets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "domain_name" TEXT,
    "domain_validation_records" JSONB,
    "eligible_to_renew" TEXT,
    "in_use_resource_count" BIGINT,
    "issued_at" TIMESTAMP(6),
    "issuer_ca" TEXT,
    "key_algorithm" TEXT,
    "name" TEXT,
    "not_after" TIMESTAMP(6),
    "not_before" TIMESTAMP(6),
    "renewal_summary" JSONB,
    "request_failure_reason" TEXT,
    "revocation_reason" TEXT,
    "revoked_at" TIMESTAMP(6),
    "serial_number" TEXT,
    "status" TEXT,
    "subject_alternative_names" TEXT[],
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_certificates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_container_service_deployments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "container_service_arn" TEXT,
    "containers" JSONB,
    "created_at" TIMESTAMP(6),
    "public_endpoint" JSONB,
    "state" TEXT,
    "version" BIGINT,

    CONSTRAINT "aws_lightsail_container_service_deployments_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_container_service_images" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "container_service_arn" TEXT,
    "created_at" TIMESTAMP(6),
    "digest" TEXT,
    "image" TEXT,

    CONSTRAINT "aws_lightsail_container_service_images_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_container_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "container_service_name" TEXT,
    "created_at" TIMESTAMP(6),
    "current_deployment" JSONB,
    "is_disabled" BOOLEAN,
    "location" JSONB,
    "next_deployment" JSONB,
    "power" TEXT,
    "power_id" TEXT,
    "principal_arn" TEXT,
    "private_domain_name" TEXT,
    "private_registry_access" JSONB,
    "public_domain_names" JSONB,
    "resource_type" TEXT,
    "scale" BIGINT,
    "state" TEXT,
    "state_detail" JSONB,
    "url" TEXT,

    CONSTRAINT "aws_lightsail_container_services_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_database_events" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "database_arn" TEXT,
    "created_at" TIMESTAMP(6),
    "event_categories" TEXT[],
    "message" TEXT,
    "resource" TEXT,

    CONSTRAINT "aws_lightsail_database_events_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_database_log_events" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "database_arn" TEXT,
    "created_at" TIMESTAMP(6),
    "message" TEXT,
    "log_stream_name" TEXT,

    CONSTRAINT "aws_lightsail_database_log_events_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_database_parameters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "database_arn" TEXT,
    "allowed_values" TEXT,
    "apply_method" TEXT,
    "apply_type" TEXT,
    "data_type" TEXT,
    "description" TEXT,
    "is_modifiable" BOOLEAN,
    "parameter_name" TEXT,
    "parameter_value" TEXT,

    CONSTRAINT "aws_lightsail_database_parameters_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_database_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "engine" TEXT,
    "engine_version" TEXT,
    "from_relational_database_arn" TEXT,
    "from_relational_database_blueprint_id" TEXT,
    "from_relational_database_bundle_id" TEXT,
    "from_relational_database_name" TEXT,
    "location" JSONB,
    "name" TEXT,
    "resource_type" TEXT,
    "size_in_gb" BIGINT,
    "state" TEXT,
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_database_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_databases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "backup_retention_enabled" BOOLEAN,
    "ca_certificate_identifier" TEXT,
    "created_at" TIMESTAMP(6),
    "engine" TEXT,
    "engine_version" TEXT,
    "hardware" JSONB,
    "latest_restorable_time" TIMESTAMP(6),
    "location" JSONB,
    "master_database_name" TEXT,
    "master_endpoint" JSONB,
    "master_username" TEXT,
    "name" TEXT,
    "parameter_apply_status" TEXT,
    "pending_maintenance_actions" JSONB,
    "pending_modified_values" JSONB,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "publicly_accessible" BOOLEAN,
    "relational_database_blueprint_id" TEXT,
    "relational_database_bundle_id" TEXT,
    "resource_type" TEXT,
    "secondary_availability_zone" TEXT,
    "state" TEXT,
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_databases_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_disk_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "disk_arn" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "from_disk_arn" TEXT,
    "from_disk_name" TEXT,
    "from_instance_arn" TEXT,
    "from_instance_name" TEXT,
    "is_from_auto_snapshot" BOOLEAN,
    "location" JSONB,
    "name" TEXT,
    "progress" TEXT,
    "resource_type" TEXT,
    "size_in_gb" BIGINT,
    "state" TEXT,
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_disk_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_disks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "add_ons" JSONB,
    "attached_to" TEXT,
    "attachment_state" TEXT,
    "auto_mount_status" TEXT,
    "created_at" TIMESTAMP(6),
    "gb_in_use" BIGINT,
    "iops" BIGINT,
    "is_attached" BOOLEAN,
    "is_system_disk" BOOLEAN,
    "location" JSONB,
    "name" TEXT,
    "path" TEXT,
    "resource_type" TEXT,
    "size_in_gb" BIGINT,
    "state" TEXT,
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_disks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_distributions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "able_to_update_bundle" BOOLEAN,
    "alternative_domain_names" TEXT[],
    "bundle_id" TEXT,
    "cache_behavior_settings" JSONB,
    "cache_behaviors" JSONB,
    "certificate_name" TEXT,
    "created_at" TIMESTAMP(6),
    "default_cache_behavior" JSONB,
    "domain_name" TEXT,
    "ip_address_type" TEXT,
    "is_enabled" BOOLEAN,
    "location" JSONB,
    "name" TEXT,
    "origin" JSONB,
    "origin_public_dns" TEXT,
    "resource_type" TEXT,
    "status" TEXT,
    "support_code" TEXT,
    "latest_cache_reset" JSONB,

    CONSTRAINT "aws_lightsail_distributions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_instance_port_states" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "instance_arn" TEXT,
    "cidr_list_aliases" TEXT[],
    "cidrs" TEXT[],
    "from_port" BIGINT,
    "ipv6_cidrs" TEXT[],
    "protocol" TEXT,
    "state" TEXT,
    "to_port" BIGINT,

    CONSTRAINT "aws_lightsail_instance_port_states_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lightsail_instance_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "from_attached_disks" JSONB,
    "from_blueprint_id" TEXT,
    "from_bundle_id" TEXT,
    "from_instance_arn" TEXT,
    "from_instance_name" TEXT,
    "is_from_auto_snapshot" BOOLEAN,
    "location" JSONB,
    "name" TEXT,
    "progress" TEXT,
    "resource_type" TEXT,
    "size_in_gb" BIGINT,
    "state" TEXT,
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_instance_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "access_details" JSONB,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "add_ons" JSONB,
    "blueprint_id" TEXT,
    "blueprint_name" TEXT,
    "bundle_id" TEXT,
    "created_at" TIMESTAMP(6),
    "hardware" JSONB,
    "ip_address_type" TEXT,
    "ipv6_addresses" TEXT[],
    "is_static_ip" BOOLEAN,
    "location" JSONB,
    "metadata_options" JSONB,
    "name" TEXT,
    "networking" JSONB,
    "private_ip_address" TEXT,
    "public_ip_address" TEXT,
    "resource_type" TEXT,
    "ssh_key_name" TEXT,
    "state" JSONB,
    "support_code" TEXT,
    "username" TEXT,

    CONSTRAINT "aws_lightsail_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_load_balancer_tls_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "load_balancer_arn" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "domain_name" TEXT,
    "domain_validation_records" JSONB,
    "failure_reason" TEXT,
    "is_attached" BOOLEAN,
    "issued_at" TIMESTAMP(6),
    "issuer" TEXT,
    "key_algorithm" TEXT,
    "load_balancer_name" TEXT,
    "location" JSONB,
    "name" TEXT,
    "not_after" TIMESTAMP(6),
    "not_before" TIMESTAMP(6),
    "renewal_summary" JSONB,
    "resource_type" TEXT,
    "revocation_reason" TEXT,
    "revoked_at" TIMESTAMP(6),
    "serial" TEXT,
    "signature_algorithm" TEXT,
    "status" TEXT,
    "subject" TEXT,
    "subject_alternative_names" TEXT[],
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_load_balancer_tls_certificates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_load_balancers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "configuration_options" JSONB,
    "created_at" TIMESTAMP(6),
    "dns_name" TEXT,
    "health_check_path" TEXT,
    "https_redirection_enabled" BOOLEAN,
    "instance_health_summary" JSONB,
    "instance_port" BIGINT,
    "ip_address_type" TEXT,
    "location" JSONB,
    "name" TEXT,
    "protocol" TEXT,
    "public_ports" BIGINT[],
    "resource_type" TEXT,
    "state" TEXT,
    "support_code" TEXT,
    "tls_certificate_summaries" JSONB,
    "tls_policy_name" TEXT,

    CONSTRAINT "aws_lightsail_load_balancers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_lightsail_static_ips" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "attached_to" TEXT,
    "created_at" TIMESTAMP(6),
    "ip_address" TEXT,
    "is_attached" BOOLEAN,
    "location" JSONB,
    "name" TEXT,
    "resource_type" TEXT,
    "support_code" TEXT,

    CONSTRAINT "aws_lightsail_static_ips_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_mq_broker_configuration_revisions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "broker_configuration_arn" TEXT,
    "data" JSONB,
    "configuration_id" TEXT,
    "created" TIMESTAMP(6),
    "description" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_mq_broker_configuration_revisions_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_mq_broker_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "broker_arn" TEXT,
    "arn" TEXT NOT NULL,
    "authentication_strategy" TEXT,
    "created" TIMESTAMP(6),
    "description" TEXT,
    "engine_type" TEXT,
    "engine_version" TEXT,
    "id" TEXT,
    "latest_revision" JSONB,
    "name" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_mq_broker_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_mq_broker_users" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "broker_arn" TEXT,
    "broker_id" TEXT,
    "console_access" BOOLEAN,
    "groups" TEXT[],
    "pending" JSONB,
    "replication_user" BOOLEAN,
    "username" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_mq_broker_users_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_mq_brokers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "actions_required" JSONB,
    "authentication_strategy" TEXT,
    "auto_minor_version_upgrade" BOOLEAN,
    "broker_arn" TEXT,
    "broker_id" TEXT,
    "broker_instances" JSONB,
    "broker_name" TEXT,
    "broker_state" TEXT,
    "configurations" JSONB,
    "created" TIMESTAMP(6),
    "data_replication_metadata" JSONB,
    "data_replication_mode" TEXT,
    "deployment_mode" TEXT,
    "encryption_options" JSONB,
    "engine_type" TEXT,
    "engine_version" TEXT,
    "host_instance_type" TEXT,
    "ldap_server_metadata" JSONB,
    "logs" JSONB,
    "maintenance_window_start_time" JSONB,
    "pending_authentication_strategy" TEXT,
    "pending_data_replication_metadata" JSONB,
    "pending_data_replication_mode" TEXT,
    "pending_engine_version" TEXT,
    "pending_host_instance_type" TEXT,
    "pending_ldap_server_metadata" JSONB,
    "pending_security_groups" TEXT[],
    "publicly_accessible" BOOLEAN,
    "security_groups" TEXT[],
    "storage_type" TEXT,
    "subnet_ids" TEXT[],
    "tags" JSONB,
    "users" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_mq_brokers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_mwaa_environments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "airflow_configuration_options" JSONB,
    "airflow_version" TEXT,
    "created_at" TIMESTAMP(6),
    "dag_s3_path" TEXT,
    "environment_class" TEXT,
    "execution_role_arn" TEXT,
    "kms_key" TEXT,
    "last_update" JSONB,
    "logging_configuration" JSONB,
    "max_workers" BIGINT,
    "min_workers" BIGINT,
    "name" TEXT,
    "network_configuration" JSONB,
    "plugins_s3_object_version" TEXT,
    "plugins_s3_path" TEXT,
    "requirements_s3_object_version" TEXT,
    "requirements_s3_path" TEXT,
    "schedulers" BIGINT,
    "service_role_arn" TEXT,
    "source_bucket_arn" TEXT,
    "startup_script_s3_object_version" TEXT,
    "startup_script_s3_path" TEXT,
    "status" TEXT,
    "tags" JSONB,
    "webserver_access_mode" TEXT,
    "webserver_url" TEXT,
    "weekly_maintenance_window_start" TEXT,

    CONSTRAINT "aws_mwaa_environments_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_neptune_cluster_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "attributes" JSONB,
    "tags" JSONB,
    "allocated_storage" BIGINT,
    "availability_zones" TEXT[],
    "cluster_create_time" TIMESTAMP(6),
    "db_cluster_identifier" TEXT,
    "db_cluster_snapshot_arn" TEXT,
    "db_cluster_snapshot_identifier" TEXT,
    "engine" TEXT,
    "engine_version" TEXT,
    "iam_database_authentication_enabled" BOOLEAN,
    "kms_key_id" TEXT,
    "license_model" TEXT,
    "master_username" TEXT,
    "percent_progress" BIGINT,
    "port" BIGINT,
    "snapshot_create_time" TIMESTAMP(6),
    "snapshot_type" TEXT,
    "source_db_cluster_snapshot_arn" TEXT,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,
    "vpc_id" TEXT,

    CONSTRAINT "aws_neptune_cluster_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_neptune_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "allocated_storage" BIGINT,
    "associated_roles" JSONB,
    "automatic_restart_time" TIMESTAMP(6),
    "availability_zones" TEXT[],
    "backup_retention_period" BIGINT,
    "character_set_name" TEXT,
    "clone_group_id" TEXT,
    "cluster_create_time" TIMESTAMP(6),
    "copy_tags_to_snapshot" BOOLEAN,
    "cross_account_clone" BOOLEAN,
    "db_cluster_arn" TEXT,
    "db_cluster_identifier" TEXT,
    "db_cluster_members" JSONB,
    "db_cluster_option_group_memberships" JSONB,
    "db_cluster_parameter_group" TEXT,
    "db_subnet_group" TEXT,
    "database_name" TEXT,
    "db_cluster_resource_id" TEXT,
    "deletion_protection" BOOLEAN,
    "earliest_restorable_time" TIMESTAMP(6),
    "enabled_cloudwatch_logs_exports" TEXT[],
    "endpoint" TEXT,
    "engine" TEXT,
    "engine_version" TEXT,
    "global_cluster_identifier" TEXT,
    "hosted_zone_id" TEXT,
    "iam_database_authentication_enabled" BOOLEAN,
    "kms_key_id" TEXT,
    "latest_restorable_time" TIMESTAMP(6),
    "master_username" TEXT,
    "multi_az" BOOLEAN,
    "pending_modified_values" JSONB,
    "percent_progress" TEXT,
    "port" BIGINT,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "read_replica_identifiers" TEXT[],
    "reader_endpoint" TEXT,
    "replication_source_identifier" TEXT,
    "serverless_v2_scaling_configuration" JSONB,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_neptune_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_neptune_event_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "cust_subscription_id" TEXT,
    "customer_aws_id" TEXT,
    "enabled" BOOLEAN,
    "event_categories_list" TEXT[],
    "event_subscription_arn" TEXT,
    "sns_topic_arn" TEXT,
    "source_ids_list" TEXT[],
    "source_type" TEXT,
    "status" TEXT,
    "subscription_creation_time" TEXT,

    CONSTRAINT "aws_neptune_event_subscriptions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_neptune_global_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "deletion_protection" BOOLEAN,
    "engine" TEXT,
    "engine_version" TEXT,
    "global_cluster_arn" TEXT,
    "global_cluster_identifier" TEXT,
    "global_cluster_members" JSONB,
    "global_cluster_resource_id" TEXT,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,

    CONSTRAINT "aws_neptune_global_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_neptune_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "allocated_storage" BIGINT,
    "auto_minor_version_upgrade" BOOLEAN,
    "availability_zone" TEXT,
    "backup_retention_period" BIGINT,
    "ca_certificate_identifier" TEXT,
    "character_set_name" TEXT,
    "copy_tags_to_snapshot" BOOLEAN,
    "db_cluster_identifier" TEXT,
    "db_instance_arn" TEXT,
    "db_instance_class" TEXT,
    "db_instance_identifier" TEXT,
    "db_instance_status" TEXT,
    "db_name" TEXT,
    "db_parameter_groups" JSONB,
    "db_security_groups" JSONB,
    "db_subnet_group" JSONB,
    "db_instance_port" BIGINT,
    "dbi_resource_id" TEXT,
    "deletion_protection" BOOLEAN,
    "domain_memberships" JSONB,
    "enabled_cloudwatch_logs_exports" TEXT[],
    "endpoint" JSONB,
    "engine" TEXT,
    "engine_version" TEXT,
    "enhanced_monitoring_resource_arn" TEXT,
    "iam_database_authentication_enabled" BOOLEAN,
    "instance_create_time" TIMESTAMP(6),
    "iops" BIGINT,
    "kms_key_id" TEXT,
    "latest_restorable_time" TIMESTAMP(6),
    "license_model" TEXT,
    "master_username" TEXT,
    "monitoring_interval" BIGINT,
    "monitoring_role_arn" TEXT,
    "multi_az" BOOLEAN,
    "option_group_memberships" JSONB,
    "pending_modified_values" JSONB,
    "performance_insights_enabled" BOOLEAN,
    "performance_insights_kms_key_id" TEXT,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "promotion_tier" BIGINT,
    "publicly_accessible" BOOLEAN,
    "read_replica_db_cluster_identifiers" TEXT[],
    "read_replica_db_instance_identifiers" TEXT[],
    "read_replica_source_db_instance_identifier" TEXT,
    "secondary_availability_zone" TEXT,
    "status_infos" JSONB,
    "storage_encrypted" BOOLEAN,
    "storage_type" TEXT,
    "tde_credential_arn" TEXT,
    "timezone" TEXT,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_neptune_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_neptune_subnet_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "db_subnet_group_description" TEXT,
    "db_subnet_group_name" TEXT,
    "subnet_group_status" TEXT,
    "subnets" JSONB,
    "vpc_id" TEXT,
    "db_subnet_group_arn" TEXT,

    CONSTRAINT "aws_neptune_subnet_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_networkfirewall_firewall_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "stateless_default_actions" TEXT[],
    "stateless_fragment_default_actions" TEXT[],
    "policy_variables" JSONB,
    "stateful_default_actions" TEXT[],
    "stateful_engine_options" JSONB,
    "stateful_rule_group_references" JSONB,
    "stateless_custom_actions" JSONB,
    "stateless_rule_group_references" JSONB,
    "tls_inspection_configuration_arn" TEXT,
    "firewall_policy_arn" TEXT,
    "firewall_policy_id" TEXT,
    "firewall_policy_name" TEXT,
    "consumed_stateful_rule_capacity" BIGINT,
    "consumed_stateless_rule_capacity" BIGINT,
    "description" TEXT,
    "encryption_configuration" JSONB,
    "firewall_policy_status" TEXT,
    "last_modified_time" TIMESTAMP(6),
    "number_of_associations" BIGINT,

    CONSTRAINT "aws_networkfirewall_firewall_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_networkfirewall_firewalls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "configuration_sync_state_summary" TEXT,
    "status" TEXT,
    "capacity_usage_summary" JSONB,
    "sync_states" JSONB,
    "firewall_id" TEXT,
    "firewall_policy_arn" TEXT,
    "subnet_mappings" JSONB,
    "vpc_id" TEXT,
    "delete_protection" BOOLEAN,
    "description" TEXT,
    "encryption_configuration" JSONB,
    "firewall_arn" TEXT,
    "firewall_name" TEXT,
    "firewall_policy_change_protection" BOOLEAN,
    "subnet_change_protection" BOOLEAN,

    CONSTRAINT "aws_networkfirewall_firewalls_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_networkfirewall_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "rules_source" JSONB,
    "reference_sets" JSONB,
    "rule_variables" JSONB,
    "stateful_rule_options" JSONB,
    "rule_group_arn" TEXT,
    "rule_group_id" TEXT,
    "rule_group_name" TEXT,
    "capacity" BIGINT,
    "consumed_capacity" BIGINT,
    "description" TEXT,
    "encryption_configuration" JSONB,
    "last_modified_time" TIMESTAMP(6),
    "number_of_associations" BIGINT,
    "rule_group_status" TEXT,
    "sns_topic" TEXT,
    "source_metadata" JSONB,
    "type" TEXT,

    CONSTRAINT "aws_networkfirewall_rule_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_networkfirewall_tls_inspection_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "server_certificate_configurations" JSONB,
    "tls_inspection_configuration_arn" TEXT,
    "tls_inspection_configuration_id" TEXT,
    "tls_inspection_configuration_name" TEXT,
    "certificates" JSONB,
    "description" TEXT,
    "encryption_configuration" JSONB,
    "last_modified_time" TIMESTAMP(6),
    "number_of_associations" BIGINT,
    "tls_inspection_configuration_status" TEXT,

    CONSTRAINT "aws_networkfirewall_tls_inspection_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_networkmanager_global_networks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "description" TEXT,
    "global_network_arn" TEXT,
    "global_network_id" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_networkmanager_global_networks_cqpk" PRIMARY KEY ("request_region","arn")
);

-- CreateTable
CREATE TABLE "aws_networkmanager_links" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "bandwidth" JSONB,
    "created_at" TIMESTAMP(6),
    "description" TEXT,
    "global_network_id" TEXT NOT NULL,
    "link_arn" TEXT,
    "link_id" TEXT,
    "provider" TEXT,
    "site_id" TEXT,
    "state" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_networkmanager_links_cqpk" PRIMARY KEY ("request_region","arn","global_network_id")
);

-- CreateTable
CREATE TABLE "aws_networkmanager_sites" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "request_region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(6),
    "description" TEXT,
    "global_network_id" TEXT NOT NULL,
    "location" JSONB,
    "site_arn" TEXT,
    "site_id" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_networkmanager_sites_cqpk" PRIMARY KEY ("request_region","arn","global_network_id")
);

-- CreateTable
CREATE TABLE "aws_networkmanager_transit_gateway_registrations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "request_region" TEXT NOT NULL,
    "global_network_id" TEXT NOT NULL,
    "state" JSONB,
    "transit_gateway_arn" TEXT NOT NULL,

    CONSTRAINT "aws_networkmanager_transit_gateway_registrations_cqpk" PRIMARY KEY ("request_region","global_network_id","transit_gateway_arn")
);

-- CreateTable
CREATE TABLE "aws_organization_resource_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "content" TEXT,
    "resource_policy_summary" JSONB,

    CONSTRAINT "aws_organization_resource_policies_cqpk" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "aws_organizations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "feature_set" TEXT,
    "id" TEXT,
    "master_account_arn" TEXT,
    "master_account_email" TEXT,
    "master_account_id" TEXT,

    CONSTRAINT "aws_organizations_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_account_parents" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "aws_organizations_account_parents_cqpk" PRIMARY KEY ("request_account_id","id","parent_id","type")
);

-- CreateTable
CREATE TABLE "aws_organizations_accounts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "email" TEXT,
    "id" TEXT,
    "joined_method" TEXT,
    "joined_timestamp" TIMESTAMP(6),
    "name" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_organizations_accounts_cqpk" PRIMARY KEY ("request_account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_delegated_administrators" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "delegation_enabled_date" TIMESTAMP(6),
    "email" TEXT,
    "id" TEXT,
    "joined_method" TEXT,
    "joined_timestamp" TIMESTAMP(6),
    "name" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_organizations_delegated_administrators_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_delegated_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "delegation_enabled_date" TIMESTAMP(6),
    "service_principal" TEXT NOT NULL,

    CONSTRAINT "aws_organizations_delegated_services_cqpk" PRIMARY KEY ("account_id","service_principal")
);

-- CreateTable
CREATE TABLE "aws_organizations_organizational_unit_parents" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "aws_organizations_organizational_unit_parents_cqpk" PRIMARY KEY ("request_account_id","id","parent_id","type")
);

-- CreateTable
CREATE TABLE "aws_organizations_organizational_units" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_organizations_organizational_units_cqpk" PRIMARY KEY ("request_account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "content" JSONB,
    "arn" TEXT NOT NULL,
    "aws_managed" BOOLEAN,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_organizations_policies_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_roots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "name" TEXT,
    "policy_types" JSONB,

    CONSTRAINT "aws_organizations_roots_cqpk" PRIMARY KEY ("request_account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_qldb_ledger_journal_kinesis_streams" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "ledger_arn" TEXT,
    "kinesis_configuration" JSONB,
    "ledger_name" TEXT,
    "role_arn" TEXT,
    "status" TEXT,
    "stream_id" TEXT,
    "stream_name" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "error_cause" TEXT,
    "exclusive_end_time" TIMESTAMP(6),
    "inclusive_start_time" TIMESTAMP(6),

    CONSTRAINT "aws_qldb_ledger_journal_kinesis_streams_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_qldb_ledger_journal_s3_exports" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "ledger_arn" TEXT,
    "exclusive_end_time" TIMESTAMP(6),
    "export_creation_time" TIMESTAMP(6),
    "export_id" TEXT,
    "inclusive_start_time" TIMESTAMP(6),
    "ledger_name" TEXT,
    "role_arn" TEXT,
    "s3_export_configuration" JSONB,
    "status" TEXT,
    "output_format" TEXT,

    CONSTRAINT "aws_qldb_ledger_journal_s3_exports_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_qldb_ledgers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "creation_date_time" TIMESTAMP(6),
    "deletion_protection" BOOLEAN,
    "encryption_description" JSONB,
    "name" TEXT,
    "permissions_mode" TEXT,
    "state" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_qldb_ledgers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ram_principals" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "external" BOOLEAN,
    "id" TEXT NOT NULL,
    "last_updated_time" TIMESTAMP(6),
    "resource_share_arn" TEXT NOT NULL,

    CONSTRAINT "aws_ram_principals_cqpk" PRIMARY KEY ("account_id","region","id","resource_share_arn")
);

-- CreateTable
CREATE TABLE "aws_ram_resource_share_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "associated_entity" TEXT NOT NULL,
    "association_type" TEXT,
    "creation_time" TIMESTAMP(6),
    "external" BOOLEAN,
    "last_updated_time" TIMESTAMP(6),
    "resource_share_arn" TEXT NOT NULL,
    "resource_share_name" TEXT,
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_ram_resource_share_associations_cqpk" PRIMARY KEY ("associated_entity","resource_share_arn")
);

-- CreateTable
CREATE TABLE "aws_ram_resource_share_invitations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "receiver_combined" TEXT NOT NULL,
    "invitation_timestamp" TIMESTAMP(6),
    "receiver_account_id" TEXT,
    "receiver_arn" TEXT,
    "resource_share_arn" TEXT,
    "resource_share_associations" JSONB,
    "resource_share_invitation_arn" TEXT,
    "resource_share_name" TEXT,
    "sender_account_id" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_ram_resource_share_invitations_cqpk" PRIMARY KEY ("account_id","region","arn","receiver_combined")
);

-- CreateTable
CREATE TABLE "aws_ram_resource_share_permissions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "resource_share_arn" TEXT NOT NULL,
    "permission" JSONB,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "default_version" BOOLEAN,
    "feature_set" TEXT,
    "is_resource_type_default" BOOLEAN,
    "last_updated_time" TIMESTAMP(6),
    "name" TEXT,
    "permission_type" TEXT,
    "resource_type" TEXT,
    "status" TEXT,
    "version" TEXT NOT NULL,

    CONSTRAINT "aws_ram_resource_share_permissions_cqpk" PRIMARY KEY ("account_id","region","resource_share_arn","arn","version")
);

-- CreateTable
CREATE TABLE "aws_ram_resource_shares" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "allow_external_principals" BOOLEAN,
    "creation_time" TIMESTAMP(6),
    "feature_set" TEXT,
    "last_updated_time" TIMESTAMP(6),
    "name" TEXT,
    "owning_account_id" TEXT,
    "resource_share_arn" TEXT,
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_ram_resource_shares_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_ram_resource_types" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "resource_region_scope" TEXT,
    "resource_type" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,

    CONSTRAINT "aws_ram_resource_types_cqpk" PRIMARY KEY ("account_id","region","resource_type","service_name")
);

-- CreateTable
CREATE TABLE "aws_ram_resources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "last_updated_time" TIMESTAMP(6),
    "resource_group_arn" TEXT,
    "resource_region_scope" TEXT,
    "resource_share_arn" TEXT NOT NULL,
    "status" TEXT,
    "status_message" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_ram_resources_cqpk" PRIMARY KEY ("account_id","region","arn","resource_share_arn")
);

-- CreateTable
CREATE TABLE "aws_rds_certificates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "certificate_arn" TEXT,
    "certificate_identifier" TEXT,
    "certificate_type" TEXT,
    "customer_override" BOOLEAN,
    "customer_override_valid_till" TIMESTAMP(6),
    "thumbprint" TEXT,
    "valid_from" TIMESTAMP(6),
    "valid_till" TIMESTAMP(6),

    CONSTRAINT "aws_rds_certificates_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_rds_cluster_backtracks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "db_cluster_arn" TEXT NOT NULL,
    "backtrack_identifier" TEXT NOT NULL,
    "backtrack_request_creation_time" TIMESTAMP(6),
    "backtrack_to" TIMESTAMP(6),
    "backtracked_from" TIMESTAMP(6),
    "db_cluster_identifier" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_rds_cluster_backtracks_cqpk" PRIMARY KEY ("db_cluster_arn","backtrack_identifier")
);

-- CreateTable
CREATE TABLE "aws_rds_cluster_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "attributes" JSONB,
    "allocated_storage" BIGINT,
    "availability_zones" TEXT[],
    "cluster_create_time" TIMESTAMP(6),
    "db_cluster_identifier" TEXT,
    "db_cluster_snapshot_arn" TEXT,
    "db_cluster_snapshot_identifier" TEXT,
    "db_system_id" TEXT,
    "db_cluster_resource_id" TEXT,
    "engine" TEXT,
    "engine_mode" TEXT,
    "engine_version" TEXT,
    "iam_database_authentication_enabled" BOOLEAN,
    "kms_key_id" TEXT,
    "license_model" TEXT,
    "master_username" TEXT,
    "percent_progress" BIGINT,
    "port" BIGINT,
    "snapshot_create_time" TIMESTAMP(6),
    "snapshot_type" TEXT,
    "source_db_cluster_snapshot_arn" TEXT,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,
    "storage_type" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_rds_cluster_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "activity_stream_kinesis_stream_name" TEXT,
    "activity_stream_kms_key_id" TEXT,
    "activity_stream_mode" TEXT,
    "activity_stream_status" TEXT,
    "allocated_storage" BIGINT,
    "associated_roles" JSONB,
    "auto_minor_version_upgrade" BOOLEAN,
    "automatic_restart_time" TIMESTAMP(6),
    "availability_zones" TEXT[],
    "backtrack_consumed_change_records" BIGINT,
    "backtrack_window" BIGINT,
    "backup_retention_period" BIGINT,
    "capacity" BIGINT,
    "character_set_name" TEXT,
    "clone_group_id" TEXT,
    "cluster_create_time" TIMESTAMP(6),
    "copy_tags_to_snapshot" BOOLEAN,
    "cross_account_clone" BOOLEAN,
    "custom_endpoints" TEXT[],
    "db_cluster_arn" TEXT,
    "db_cluster_identifier" TEXT,
    "db_cluster_instance_class" TEXT,
    "db_cluster_members" JSONB,
    "db_cluster_option_group_memberships" JSONB,
    "db_cluster_parameter_group" TEXT,
    "db_subnet_group" TEXT,
    "db_system_id" TEXT,
    "database_name" TEXT,
    "db_cluster_resource_id" TEXT,
    "deletion_protection" BOOLEAN,
    "domain_memberships" JSONB,
    "earliest_backtrack_time" TIMESTAMP(6),
    "earliest_restorable_time" TIMESTAMP(6),
    "enabled_cloudwatch_logs_exports" TEXT[],
    "endpoint" TEXT,
    "engine" TEXT,
    "engine_mode" TEXT,
    "engine_version" TEXT,
    "global_write_forwarding_requested" BOOLEAN,
    "global_write_forwarding_status" TEXT,
    "hosted_zone_id" TEXT,
    "http_endpoint_enabled" BOOLEAN,
    "iam_database_authentication_enabled" BOOLEAN,
    "io_optimized_next_allowed_modification_time" TIMESTAMP(6),
    "iops" BIGINT,
    "kms_key_id" TEXT,
    "latest_restorable_time" TIMESTAMP(6),
    "local_write_forwarding_status" TEXT,
    "master_user_secret" JSONB,
    "master_username" TEXT,
    "monitoring_interval" BIGINT,
    "monitoring_role_arn" TEXT,
    "multi_az" BOOLEAN,
    "network_type" TEXT,
    "pending_modified_values" JSONB,
    "percent_progress" TEXT,
    "performance_insights_enabled" BOOLEAN,
    "performance_insights_kms_key_id" TEXT,
    "performance_insights_retention_period" BIGINT,
    "port" BIGINT,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "publicly_accessible" BOOLEAN,
    "read_replica_identifiers" TEXT[],
    "reader_endpoint" TEXT,
    "replication_source_identifier" TEXT,
    "scaling_configuration_info" JSONB,
    "serverless_v2_scaling_configuration" JSONB,
    "status" TEXT,
    "storage_encrypted" BOOLEAN,
    "storage_type" TEXT,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_rds_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_db_security_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "db_security_group_arn" TEXT,
    "db_security_group_description" TEXT,
    "db_security_group_name" TEXT,
    "ec2_security_groups" JSONB,
    "ip_ranges" JSONB,
    "owner_id" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_rds_db_security_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_db_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "attributes" JSONB,
    "allocated_storage" BIGINT,
    "availability_zone" TEXT,
    "db_instance_identifier" TEXT,
    "db_snapshot_arn" TEXT,
    "db_snapshot_identifier" TEXT,
    "db_system_id" TEXT,
    "dbi_resource_id" TEXT,
    "encrypted" BOOLEAN,
    "engine" TEXT,
    "engine_version" TEXT,
    "iam_database_authentication_enabled" BOOLEAN,
    "instance_create_time" TIMESTAMP(6),
    "iops" BIGINT,
    "kms_key_id" TEXT,
    "license_model" TEXT,
    "master_username" TEXT,
    "option_group_name" TEXT,
    "original_snapshot_create_time" TIMESTAMP(6),
    "percent_progress" BIGINT,
    "port" BIGINT,
    "processor_features" JSONB,
    "snapshot_create_time" TIMESTAMP(6),
    "snapshot_database_time" TIMESTAMP(6),
    "snapshot_target" TEXT,
    "snapshot_type" TEXT,
    "source_db_snapshot_identifier" TEXT,
    "source_region" TEXT,
    "status" TEXT,
    "storage_throughput" BIGINT,
    "storage_type" TEXT,
    "tde_credential_arn" TEXT,
    "timezone" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_rds_db_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_event_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "cust_subscription_id" TEXT,
    "customer_aws_id" TEXT,
    "enabled" BOOLEAN,
    "event_categories_list" TEXT[],
    "event_subscription_arn" TEXT,
    "sns_topic_arn" TEXT,
    "source_ids_list" TEXT[],
    "source_type" TEXT,
    "status" TEXT,
    "subscription_creation_time" TEXT,

    CONSTRAINT "aws_rds_event_subscriptions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_events" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "date" TIMESTAMP(6),
    "event_categories" TEXT[],
    "message" TEXT,
    "source_arn" TEXT,
    "source_identifier" TEXT,
    "source_type" TEXT,

    CONSTRAINT "aws_rds_events_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_rds_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "processor_features" JSONB,
    "tags" JSONB,
    "activity_stream_engine_native_audit_fields_included" BOOLEAN,
    "activity_stream_kinesis_stream_name" TEXT,
    "activity_stream_kms_key_id" TEXT,
    "activity_stream_mode" TEXT,
    "activity_stream_policy_status" TEXT,
    "activity_stream_status" TEXT,
    "allocated_storage" BIGINT,
    "associated_roles" JSONB,
    "auto_minor_version_upgrade" BOOLEAN,
    "automatic_restart_time" TIMESTAMP(6),
    "automation_mode" TEXT,
    "availability_zone" TEXT,
    "aws_backup_recovery_point_arn" TEXT,
    "backup_retention_period" BIGINT,
    "backup_target" TEXT,
    "ca_certificate_identifier" TEXT,
    "certificate_details" JSONB,
    "character_set_name" TEXT,
    "copy_tags_to_snapshot" BOOLEAN,
    "custom_iam_instance_profile" TEXT,
    "customer_owned_ip_enabled" BOOLEAN,
    "db_cluster_identifier" TEXT,
    "db_instance_arn" TEXT,
    "db_instance_automated_backups_replications" JSONB,
    "db_instance_class" TEXT,
    "db_instance_identifier" TEXT,
    "db_instance_status" TEXT,
    "db_name" TEXT,
    "db_parameter_groups" JSONB,
    "db_security_groups" JSONB,
    "db_subnet_group" JSONB,
    "db_system_id" TEXT,
    "db_instance_port" BIGINT,
    "dbi_resource_id" TEXT,
    "deletion_protection" BOOLEAN,
    "domain_memberships" JSONB,
    "enabled_cloudwatch_logs_exports" TEXT[],
    "endpoint" JSONB,
    "engine" TEXT,
    "engine_version" TEXT,
    "enhanced_monitoring_resource_arn" TEXT,
    "iam_database_authentication_enabled" BOOLEAN,
    "instance_create_time" TIMESTAMP(6),
    "iops" BIGINT,
    "kms_key_id" TEXT,
    "latest_restorable_time" TIMESTAMP(6),
    "license_model" TEXT,
    "listener_endpoint" JSONB,
    "master_user_secret" JSONB,
    "master_username" TEXT,
    "max_allocated_storage" BIGINT,
    "monitoring_interval" BIGINT,
    "monitoring_role_arn" TEXT,
    "multi_az" BOOLEAN,
    "nchar_character_set_name" TEXT,
    "network_type" TEXT,
    "option_group_memberships" JSONB,
    "pending_modified_values" JSONB,
    "percent_progress" TEXT,
    "performance_insights_enabled" BOOLEAN,
    "performance_insights_kms_key_id" TEXT,
    "performance_insights_retention_period" BIGINT,
    "preferred_backup_window" TEXT,
    "preferred_maintenance_window" TEXT,
    "promotion_tier" BIGINT,
    "publicly_accessible" BOOLEAN,
    "read_replica_db_cluster_identifiers" TEXT[],
    "read_replica_db_instance_identifiers" TEXT[],
    "read_replica_source_db_cluster_identifier" TEXT,
    "read_replica_source_db_instance_identifier" TEXT,
    "replica_mode" TEXT,
    "resume_full_automation_mode_time" TIMESTAMP(6),
    "secondary_availability_zone" TEXT,
    "status_infos" JSONB,
    "storage_encrypted" BOOLEAN,
    "storage_throughput" BIGINT,
    "storage_type" TEXT,
    "tde_credential_arn" TEXT,
    "timezone" TEXT,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_rds_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_option_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "allows_vpc_and_non_vpc_instance_memberships" BOOLEAN,
    "copy_timestamp" TIMESTAMP(6),
    "engine_name" TEXT,
    "major_engine_version" TEXT,
    "option_group_arn" TEXT,
    "option_group_description" TEXT,
    "option_group_name" TEXT,
    "options" JSONB,
    "source_account_id" TEXT,
    "source_option_group" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_rds_option_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_reserved_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "currency_code" TEXT,
    "db_instance_class" TEXT,
    "db_instance_count" BIGINT,
    "duration" BIGINT,
    "fixed_price" DOUBLE PRECISION,
    "lease_id" TEXT,
    "multi_az" BOOLEAN,
    "offering_type" TEXT,
    "product_description" TEXT,
    "recurring_charges" JSONB,
    "reserved_db_instance_arn" TEXT,
    "reserved_db_instance_id" TEXT,
    "reserved_db_instances_offering_id" TEXT,
    "start_time" TIMESTAMP(6),
    "state" TEXT,
    "usage_price" DOUBLE PRECISION,

    CONSTRAINT "aws_rds_reserved_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_rds_subnet_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "db_subnet_group_arn" TEXT,
    "db_subnet_group_description" TEXT,
    "db_subnet_group_name" TEXT,
    "subnet_group_status" TEXT,
    "subnets" JSONB,
    "supported_network_types" TEXT[],
    "vpc_id" TEXT,

    CONSTRAINT "aws_rds_subnet_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_redshift_cluster_parameter_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT NOT NULL,
    "parameter_group_name" TEXT NOT NULL,
    "cluster_parameter_status_list" JSONB,
    "parameter_apply_status" TEXT,

    CONSTRAINT "aws_redshift_cluster_parameter_groups_cqpk" PRIMARY KEY ("cluster_arn","parameter_group_name")
);

-- CreateTable
CREATE TABLE "aws_redshift_cluster_parameters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "allowed_values" TEXT,
    "apply_type" TEXT,
    "data_type" TEXT,
    "description" TEXT,
    "is_modifiable" BOOLEAN,
    "minimum_engine_version" TEXT,
    "parameter_value" TEXT,
    "source" TEXT,

    CONSTRAINT "aws_redshift_cluster_parameters_cqpk" PRIMARY KEY ("cluster_arn","parameter_name")
);

-- CreateTable
CREATE TABLE "aws_redshift_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "logging_status" JSONB,
    "tags" JSONB,
    "allow_version_upgrade" BOOLEAN,
    "aqua_configuration" JSONB,
    "automated_snapshot_retention_period" BIGINT,
    "availability_zone" TEXT,
    "availability_zone_relocation_status" TEXT,
    "cluster_availability_status" TEXT,
    "cluster_create_time" TIMESTAMP(6),
    "cluster_identifier" TEXT,
    "cluster_namespace_arn" TEXT,
    "cluster_nodes" JSONB,
    "cluster_public_key" TEXT,
    "cluster_revision_number" TEXT,
    "cluster_security_groups" JSONB,
    "cluster_snapshot_copy_status" JSONB,
    "cluster_status" TEXT,
    "cluster_subnet_group_name" TEXT,
    "cluster_version" TEXT,
    "custom_domain_certificate_arn" TEXT,
    "custom_domain_certificate_expiry_date" TIMESTAMP(6),
    "custom_domain_name" TEXT,
    "db_name" TEXT,
    "data_transfer_progress" JSONB,
    "default_iam_role_arn" TEXT,
    "deferred_maintenance_windows" JSONB,
    "elastic_ip_status" JSONB,
    "elastic_resize_number_of_node_options" TEXT,
    "encrypted" BOOLEAN,
    "endpoint" JSONB,
    "enhanced_vpc_routing" BOOLEAN,
    "expected_next_snapshot_schedule_time" TIMESTAMP(6),
    "expected_next_snapshot_schedule_time_status" TEXT,
    "hsm_status" JSONB,
    "iam_roles" JSONB,
    "kms_key_id" TEXT,
    "maintenance_track_name" TEXT,
    "manual_snapshot_retention_period" BIGINT,
    "master_username" TEXT,
    "modify_status" TEXT,
    "next_maintenance_window_start_time" TIMESTAMP(6),
    "node_type" TEXT,
    "number_of_nodes" BIGINT,
    "pending_actions" TEXT[],
    "pending_modified_values" JSONB,
    "preferred_maintenance_window" TEXT,
    "publicly_accessible" BOOLEAN,
    "reserved_node_exchange_status" JSONB,
    "resize_info" JSONB,
    "restore_status" JSONB,
    "snapshot_schedule_identifier" TEXT,
    "snapshot_schedule_state" TEXT,
    "total_storage_capacity_in_mega_bytes" BIGINT,
    "vpc_id" TEXT,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_redshift_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_redshift_data_shares" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "allow_publicly_accessible_consumers" BOOLEAN,
    "data_share_arn" TEXT,
    "data_share_associations" JSONB,
    "managed_by" TEXT,
    "producer_arn" TEXT,

    CONSTRAINT "aws_redshift_data_shares_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_redshift_endpoint_access" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT,
    "address" TEXT,
    "cluster_identifier" TEXT,
    "endpoint_create_time" TIMESTAMP(6),
    "endpoint_name" TEXT,
    "endpoint_status" TEXT,
    "port" BIGINT,
    "resource_owner" TEXT,
    "subnet_group_name" TEXT,
    "vpc_endpoint" JSONB,
    "vpc_security_groups" JSONB,

    CONSTRAINT "aws_redshift_endpoint_access_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_redshift_endpoint_authorization" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "cluster_arn" TEXT,
    "allowed_all_vp_cs" BOOLEAN,
    "allowed_vp_cs" TEXT[],
    "authorize_time" TIMESTAMP(6),
    "cluster_identifier" TEXT,
    "cluster_status" TEXT,
    "endpoint_count" BIGINT,
    "grantee" TEXT,
    "grantor" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_redshift_endpoint_authorization_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_redshift_event_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "cust_subscription_id" TEXT,
    "customer_aws_id" TEXT,
    "enabled" BOOLEAN,
    "event_categories_list" TEXT[],
    "severity" TEXT,
    "sns_topic_arn" TEXT,
    "source_ids_list" TEXT[],
    "source_type" TEXT,
    "status" TEXT,
    "subscription_creation_time" TIMESTAMP(6),

    CONSTRAINT "aws_redshift_event_subscriptions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_redshift_events" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "date" TIMESTAMP(6),
    "event_categories" TEXT[],
    "event_id" TEXT,
    "message" TEXT,
    "severity" TEXT,
    "source_identifier" TEXT,
    "source_type" TEXT,

    CONSTRAINT "aws_redshift_events_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_redshift_snapshots" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "accounts_with_restore_access" JSONB,
    "actual_incremental_backup_size_in_mega_bytes" DOUBLE PRECISION,
    "availability_zone" TEXT,
    "backup_progress_in_mega_bytes" DOUBLE PRECISION,
    "cluster_create_time" TIMESTAMP(6),
    "cluster_identifier" TEXT,
    "cluster_version" TEXT,
    "current_backup_rate_in_mega_bytes_per_second" DOUBLE PRECISION,
    "db_name" TEXT,
    "elapsed_time_in_seconds" BIGINT,
    "encrypted" BOOLEAN,
    "encrypted_with_hsm" BOOLEAN,
    "engine_full_version" TEXT,
    "enhanced_vpc_routing" BOOLEAN,
    "estimated_seconds_to_completion" BIGINT,
    "kms_key_id" TEXT,
    "maintenance_track_name" TEXT,
    "manual_snapshot_remaining_days" BIGINT,
    "manual_snapshot_retention_period" BIGINT,
    "master_username" TEXT,
    "node_type" TEXT,
    "number_of_nodes" BIGINT,
    "owner_account" TEXT,
    "port" BIGINT,
    "restorable_node_types" TEXT[],
    "snapshot_create_time" TIMESTAMP(6),
    "snapshot_identifier" TEXT,
    "snapshot_retention_start_time" TIMESTAMP(6),
    "snapshot_type" TEXT,
    "source_region" TEXT,
    "status" TEXT,
    "total_backup_size_in_mega_bytes" DOUBLE PRECISION,
    "vpc_id" TEXT,

    CONSTRAINT "aws_redshift_snapshots_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_redshift_subnet_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "cluster_subnet_group_name" TEXT,
    "description" TEXT,
    "subnet_group_status" TEXT,
    "subnets" JSONB,
    "vpc_id" TEXT,

    CONSTRAINT "aws_redshift_subnet_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_regions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "enabled" BOOLEAN,
    "partition" TEXT,
    "region" TEXT NOT NULL,
    "endpoint" TEXT,
    "opt_in_status" TEXT,
    "region_name" TEXT,

    CONSTRAINT "aws_regions_cqpk" PRIMARY KEY ("account_id","region")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_alarm_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "assessment_arn" TEXT NOT NULL,
    "name" TEXT,
    "recommendation_id" TEXT NOT NULL,
    "reference_id" TEXT,
    "type" TEXT,
    "app_component_name" TEXT,
    "app_component_names" TEXT[],
    "description" TEXT,
    "items" JSONB,
    "prerequisite" TEXT,

    CONSTRAINT "aws_resiliencehub_alarm_recommendations_cqpk" PRIMARY KEY ("app_arn","assessment_arn","recommendation_id")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_app_assessments" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "assessment_arn" TEXT,
    "assessment_status" TEXT,
    "invoker" TEXT,
    "app_version" TEXT,
    "assessment_name" TEXT,
    "compliance" JSONB,
    "compliance_status" TEXT,
    "cost" JSONB,
    "drift_status" TEXT,
    "end_time" TIMESTAMP(6),
    "message" TEXT,
    "policy" JSONB,
    "resiliency_score" JSONB,
    "resource_errors_details" JSONB,
    "start_time" TIMESTAMP(6),
    "tags" JSONB,
    "version_name" TEXT,

    CONSTRAINT "aws_resiliencehub_app_assessments_cqpk" PRIMARY KEY ("app_arn","arn")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_app_component_compliances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "assessment_arn" TEXT NOT NULL,
    "app_component_name" TEXT NOT NULL,
    "compliance" JSONB,
    "cost" JSONB,
    "message" TEXT,
    "resiliency_score" JSONB,
    "status" TEXT,

    CONSTRAINT "aws_resiliencehub_app_component_compliances_cqpk" PRIMARY KEY ("app_arn","assessment_arn","app_component_name")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_app_version_resource_mappings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "app_version" TEXT NOT NULL,
    "physical_resource_identifier" TEXT NOT NULL,
    "mapping_type" TEXT,
    "physical_resource_id" JSONB,
    "app_registry_app_name" TEXT,
    "eks_source_name" TEXT,
    "logical_stack_name" TEXT,
    "resource_group_name" TEXT,
    "resource_name" TEXT,
    "terraform_source_name" TEXT,

    CONSTRAINT "aws_resiliencehub_app_version_resource_mappings_cqpk" PRIMARY KEY ("app_arn","app_version","physical_resource_identifier")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_app_version_resources" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "app_version" TEXT NOT NULL,
    "physical_resource_identifier" TEXT NOT NULL,
    "logical_resource_id" JSONB,
    "physical_resource_id" JSONB,
    "resource_type" TEXT,
    "additional_info" JSONB,
    "app_components" JSONB,
    "excluded" BOOLEAN,
    "parent_resource_name" TEXT,
    "resource_name" TEXT,
    "source_type" TEXT,

    CONSTRAINT "aws_resiliencehub_app_version_resources_cqpk" PRIMARY KEY ("app_arn","app_version","physical_resource_identifier")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_app_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "app_version" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "identifier" BIGINT,
    "version_name" TEXT,

    CONSTRAINT "aws_resiliencehub_app_versions_cqpk" PRIMARY KEY ("app_arn","app_version")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_apps" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "app_arn" TEXT,
    "creation_time" TIMESTAMP(6),
    "name" TEXT,
    "assessment_schedule" TEXT,
    "compliance_status" TEXT,
    "description" TEXT,
    "drift_status" TEXT,
    "event_subscriptions" JSONB,
    "last_app_compliance_evaluation_time" TIMESTAMP(6),
    "last_drift_evaluation_time" TIMESTAMP(6),
    "last_resiliency_score_evaluation_time" TIMESTAMP(6),
    "permission_model" JSONB,
    "policy_arn" TEXT,
    "resiliency_score" DOUBLE PRECISION,
    "status" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_resiliencehub_apps_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_component_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "assessment_arn" TEXT NOT NULL,
    "app_component_name" TEXT NOT NULL,
    "config_recommendations" JSONB,
    "recommendation_status" TEXT,

    CONSTRAINT "aws_resiliencehub_component_recommendations_cqpk" PRIMARY KEY ("app_arn","assessment_arn","app_component_name")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_recommendation_templates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "assessment_arn" TEXT NOT NULL,
    "format" TEXT,
    "name" TEXT,
    "recommendation_template_arn" TEXT,
    "recommendation_types" TEXT[],
    "status" TEXT,
    "app_arn" TEXT NOT NULL,
    "end_time" TIMESTAMP(6),
    "message" TEXT,
    "needs_replacements" BOOLEAN,
    "recommendation_ids" TEXT[],
    "start_time" TIMESTAMP(6),
    "tags" JSONB,
    "templates_location" JSONB,

    CONSTRAINT "aws_resiliencehub_recommendation_templates_cqpk" PRIMARY KEY ("arn","assessment_arn","app_arn")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_resiliency_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "data_location_constraint" TEXT,
    "estimated_cost_tier" TEXT,
    "policy" JSONB,
    "policy_arn" TEXT,
    "policy_description" TEXT,
    "policy_name" TEXT,
    "tags" JSONB,
    "tier" TEXT,

    CONSTRAINT "aws_resiliencehub_resiliency_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_sop_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "assessment_arn" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "reference_id" TEXT,
    "service_type" TEXT,
    "app_component_name" TEXT,
    "description" TEXT,
    "items" JSONB,
    "name" TEXT,
    "prerequisite" TEXT,

    CONSTRAINT "aws_resiliencehub_sop_recommendations_cqpk" PRIMARY KEY ("app_arn","assessment_arn","recommendation_id")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_suggested_resiliency_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "data_location_constraint" TEXT,
    "estimated_cost_tier" TEXT,
    "policy" JSONB,
    "policy_arn" TEXT,
    "policy_description" TEXT,
    "policy_name" TEXT,
    "tags" JSONB,
    "tier" TEXT,

    CONSTRAINT "aws_resiliencehub_suggested_resiliency_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_resiliencehub_test_recommendations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "app_arn" TEXT NOT NULL,
    "assessment_arn" TEXT NOT NULL,
    "reference_id" TEXT,
    "app_component_name" TEXT,
    "depends_on_alarms" TEXT[],
    "description" TEXT,
    "intent" TEXT,
    "items" JSONB,
    "name" TEXT,
    "prerequisite" TEXT,
    "recommendation_id" TEXT NOT NULL,
    "risk" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_resiliencehub_test_recommendations_cqpk" PRIMARY KEY ("app_arn","assessment_arn","recommendation_id")
);

-- CreateTable
CREATE TABLE "aws_resourcegroups_resource_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "group_arn" TEXT,
    "name" TEXT,
    "description" TEXT,
    "query" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_resourcegroups_resource_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53_delegation_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "name_servers" TEXT[],
    "caller_reference" TEXT,
    "id" TEXT,

    CONSTRAINT "aws_route53_delegation_sets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53_domains" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "domain_name" TEXT NOT NULL,
    "tags" JSONB,
    "transfer_lock" BOOLEAN,
    "abuse_contact_email" TEXT,
    "abuse_contact_phone" TEXT,
    "admin_contact" JSONB,
    "admin_privacy" BOOLEAN,
    "auto_renew" BOOLEAN,
    "creation_date" TIMESTAMP(6),
    "dns_sec" TEXT,
    "dnssec_keys" JSONB,
    "expiration_date" TIMESTAMP(6),
    "nameservers" JSONB,
    "registrant_contact" JSONB,
    "registrant_privacy" BOOLEAN,
    "registrar_name" TEXT,
    "registrar_url" TEXT,
    "registry_domain_id" TEXT,
    "reseller" TEXT,
    "status_list" TEXT[],
    "tech_contact" JSONB,
    "tech_privacy" BOOLEAN,
    "updated_date" TIMESTAMP(6),
    "who_is_server" TEXT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_route53_domains_cqpk" PRIMARY KEY ("account_id","domain_name")
);

-- CreateTable
CREATE TABLE "aws_route53_health_checks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "cloud_watch_alarm_configuration_dimensions" JSONB,
    "caller_reference" TEXT,
    "health_check_config" JSONB,
    "health_check_version" BIGINT,
    "id" TEXT,
    "cloud_watch_alarm_configuration" JSONB,
    "linked_service" JSONB,

    CONSTRAINT "aws_route53_health_checks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53_hosted_zone_query_logging_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "hosted_zone_arn" TEXT,
    "cloud_watch_logs_log_group_arn" TEXT,
    "hosted_zone_id" TEXT,
    "id" TEXT,

    CONSTRAINT "aws_route53_hosted_zone_query_logging_configs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53_hosted_zone_resource_record_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "hosted_zone_arn" TEXT,
    "name" TEXT,
    "type" TEXT,
    "alias_target" JSONB,
    "cidr_routing_config" JSONB,
    "failover" TEXT,
    "geo_location" JSONB,
    "health_check_id" TEXT,
    "multi_value_answer" BOOLEAN,
    "region" TEXT,
    "resource_records" JSONB,
    "set_identifier" TEXT,
    "ttl" BIGINT,
    "traffic_policy_instance_id" TEXT,
    "weight" BIGINT,

    CONSTRAINT "aws_route53_hosted_zone_resource_record_sets_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_route53_hosted_zone_traffic_policy_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "hosted_zone_arn" TEXT,
    "hosted_zone_id" TEXT,
    "id" TEXT,
    "message" TEXT,
    "name" TEXT,
    "state" TEXT,
    "ttl" BIGINT,
    "traffic_policy_id" TEXT,
    "traffic_policy_type" TEXT,
    "traffic_policy_version" BIGINT,

    CONSTRAINT "aws_route53_hosted_zone_traffic_policy_instances_cqpk" PRIMARY KEY ("account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_route53_hosted_zones" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "caller_reference" TEXT,
    "id" TEXT,
    "name" TEXT,
    "config" JSONB,
    "linked_service" JSONB,
    "resource_record_set_count" BIGINT,
    "tags" JSONB,
    "delegation_set_id" TEXT,
    "delegation_set" JSONB,
    "vpcs" JSONB,

    CONSTRAINT "aws_route53_hosted_zones_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53_operations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "domain_name" TEXT,
    "last_updated_date" TIMESTAMP(6),
    "message" TEXT,
    "operation_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "status_flag" TEXT,
    "submitted_date" TIMESTAMP(6) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "aws_route53_operations_cqpk" PRIMARY KEY ("account_id","operation_id","status","submitted_date","type")
);

-- CreateTable
CREATE TABLE "aws_route53_traffic_policies" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "id" TEXT,
    "latest_version" BIGINT,
    "name" TEXT,
    "traffic_policy_count" BIGINT,
    "type" TEXT,

    CONSTRAINT "aws_route53_traffic_policies_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53_traffic_policy_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "traffic_policy_arn" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "version" BIGINT NOT NULL,
    "document" JSONB,
    "name" TEXT,
    "type" TEXT,
    "comment" TEXT,

    CONSTRAINT "aws_route53_traffic_policy_versions_cqpk" PRIMARY KEY ("traffic_policy_arn","id","version")
);

-- CreateTable
CREATE TABLE "aws_route53recoverycontrolconfig_clusters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_arn" TEXT,
    "cluster_endpoints" JSONB,
    "name" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_route53recoverycontrolconfig_clusters_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoverycontrolconfig_control_panels" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "cluster_arn" TEXT,
    "control_panel_arn" TEXT,
    "default_control_panel" BOOLEAN,
    "name" TEXT,
    "routing_control_count" BIGINT,
    "status" TEXT,

    CONSTRAINT "aws_route53recoverycontrolconfig_control_panels_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoverycontrolconfig_routing_controls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "control_panel_arn" TEXT NOT NULL,
    "name" TEXT,
    "routing_control_arn" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_route53recoverycontrolconfig_routing_controls_cqpk" PRIMARY KEY ("arn","control_panel_arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoverycontrolconfig_safety_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "assertion" JSONB,
    "gating" JSONB,

    CONSTRAINT "aws_route53recoverycontrolconfig_safety_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoveryreadiness_cells" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "cell_arn" TEXT,
    "cell_name" TEXT,
    "cells" TEXT[],
    "parent_readiness_scopes" TEXT[],
    "tags" JSONB,

    CONSTRAINT "aws_route53recoveryreadiness_cells_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoveryreadiness_readiness_checks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "readiness_check_arn" TEXT,
    "resource_set" TEXT,
    "readiness_check_name" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_route53recoveryreadiness_readiness_checks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoveryreadiness_recovery_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "cells" TEXT[],
    "recovery_group_arn" TEXT,
    "recovery_group_name" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_route53recoveryreadiness_recovery_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53recoveryreadiness_resource_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "resource_set_arn" TEXT,
    "resource_set_name" TEXT,
    "resource_set_type" TEXT,
    "resources" JSONB,
    "tags" JSONB,

    CONSTRAINT "aws_route53recoveryreadiness_resource_sets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_firewall_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "firewall_fail_open" TEXT,
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "resource_id" TEXT,

    CONSTRAINT "aws_route53resolver_firewall_configs_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_firewall_domain_lists" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TEXT,
    "creator_request_id" TEXT,
    "domain_count" BIGINT,
    "id" TEXT,
    "managed_owner_name" TEXT,
    "modification_time" TEXT,
    "name" TEXT,
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_route53resolver_firewall_domain_lists_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_firewall_rule_group_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TEXT,
    "creator_request_id" TEXT,
    "firewall_rule_group_id" TEXT,
    "id" TEXT,
    "managed_owner_name" TEXT,
    "modification_time" TEXT,
    "mutation_protection" TEXT,
    "name" TEXT,
    "priority" BIGINT,
    "status" TEXT,
    "status_message" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_route53resolver_firewall_rule_group_associations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_firewall_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TEXT,
    "creator_request_id" TEXT,
    "id" TEXT,
    "modification_time" TEXT,
    "name" TEXT,
    "owner_id" TEXT,
    "rule_count" BIGINT,
    "share_status" TEXT,
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_route53resolver_firewall_rule_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_resolver_endpoints" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TEXT,
    "creator_request_id" TEXT,
    "direction" TEXT,
    "host_vpc_id" TEXT,
    "id" TEXT,
    "ip_address_count" BIGINT,
    "modification_time" TEXT,
    "name" TEXT,
    "outpost_arn" TEXT,
    "preferred_instance_type" TEXT,
    "resolver_endpoint_type" TEXT,
    "security_group_ids" TEXT[],
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_route53resolver_resolver_endpoints_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_resolver_query_log_config_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "creation_time" TEXT,
    "error" TEXT,
    "error_message" TEXT,
    "id" TEXT NOT NULL,
    "resolver_query_log_config_id" TEXT,
    "resource_id" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_route53resolver_resolver_query_log_config_associations_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_resolver_query_log_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "association_count" BIGINT,
    "creation_time" TEXT,
    "creator_request_id" TEXT,
    "destination_arn" TEXT,
    "id" TEXT,
    "name" TEXT,
    "owner_id" TEXT,
    "share_status" TEXT,
    "status" TEXT,

    CONSTRAINT "aws_route53resolver_resolver_query_log_configs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_resolver_rule_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "resolver_rule_id" TEXT,
    "status" TEXT,
    "status_message" TEXT,
    "vpc_id" TEXT,

    CONSTRAINT "aws_route53resolver_resolver_rule_associations_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_route53resolver_resolver_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TEXT,
    "creator_request_id" TEXT,
    "domain_name" TEXT,
    "id" TEXT,
    "modification_time" TEXT,
    "name" TEXT,
    "owner_id" TEXT,
    "resolver_endpoint_id" TEXT,
    "rule_type" TEXT,
    "share_status" TEXT,
    "status" TEXT,
    "status_message" TEXT,
    "target_ips" JSONB,

    CONSTRAINT "aws_route53resolver_resolver_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_s3_access_points" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "bucket" TEXT,
    "name" TEXT,
    "network_origin" TEXT,
    "access_point_arn" TEXT,
    "alias" TEXT,
    "bucket_account_id" TEXT,
    "vpc_configuration" JSONB,

    CONSTRAINT "aws_s3_access_points_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_s3_accounts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "block_public_acls" BOOLEAN,
    "block_public_policy" BOOLEAN,
    "ignore_public_acls" BOOLEAN,
    "restrict_public_buckets" BOOLEAN,
    "config_exists" BOOLEAN,

    CONSTRAINT "aws_s3_accounts_cqpk" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_cors_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT,
    "allowed_methods" TEXT[],
    "allowed_origins" TEXT[],
    "allowed_headers" TEXT[],
    "expose_headers" TEXT[],
    "id" TEXT,
    "max_age_seconds" BIGINT,

    CONSTRAINT "aws_s3_bucket_cors_rules_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_encryption_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT NOT NULL,
    "apply_server_side_encryption_by_default" JSONB,
    "bucket_key_enabled" BOOLEAN,

    CONSTRAINT "aws_s3_bucket_encryption_rules_cqpk" PRIMARY KEY ("bucket_arn")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_grants" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT NOT NULL,
    "grantee_type" TEXT NOT NULL,
    "grantee_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "grantee" JSONB,

    CONSTRAINT "aws_s3_bucket_grants_cqpk" PRIMARY KEY ("bucket_arn","grantee_type","grantee_id","permission")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_lifecycles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT,
    "status" TEXT,
    "abort_incomplete_multipart_upload" JSONB,
    "expiration" JSONB,
    "id" TEXT,
    "noncurrent_version_expiration" JSONB,
    "noncurrent_version_transitions" JSONB,
    "prefix" TEXT,
    "transitions" JSONB,

    CONSTRAINT "aws_s3_bucket_lifecycles_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_websites" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT,
    "error_document" JSONB,
    "index_document" JSONB,
    "redirect_all_requests_to" JSONB,
    "routing_rules" JSONB,

    CONSTRAINT "aws_s3_bucket_websites_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_s3_buckets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "creation_date" TIMESTAMP(6),
    "name" TEXT,
    "replication_role" TEXT,
    "replication_rules" JSONB,
    "region" TEXT,
    "logging_target_bucket" TEXT,
    "logging_target_prefix" TEXT,
    "policy" JSONB,
    "policy_status" JSONB,
    "versioning_status" TEXT,
    "versioning_mfa_delete" TEXT,
    "block_public_acls" BOOLEAN,
    "block_public_policy" BOOLEAN,
    "ignore_public_acls" BOOLEAN,
    "restrict_public_buckets" BOOLEAN,
    "tags" JSONB,
    "ownership_controls" TEXT[],

    CONSTRAINT "aws_s3_buckets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_s3_multi_region_access_points" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "alias" TEXT,
    "created_at" TIMESTAMP(6),
    "name" TEXT,
    "public_access_block" JSONB,
    "regions" JSONB,
    "status" TEXT,

    CONSTRAINT "aws_s3_multi_region_access_points_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sagemaker_apps" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "app_arn" TEXT,
    "app_name" TEXT,
    "app_type" TEXT,
    "creation_time" TIMESTAMP(6),
    "domain_id" TEXT,
    "failure_reason" TEXT,
    "last_health_check_timestamp" TIMESTAMP(6),
    "last_user_activity_timestamp" TIMESTAMP(6),
    "resource_spec" JSONB,
    "space_name" TEXT,
    "status" TEXT,
    "user_profile_name" TEXT,

    CONSTRAINT "aws_sagemaker_apps_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sagemaker_endpoint_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "endpoint_config_arn" TEXT,
    "endpoint_config_name" TEXT,
    "production_variants" JSONB,
    "async_inference_config" JSONB,
    "data_capture_config" JSONB,
    "explainer_config" JSONB,
    "kms_key_id" TEXT,
    "shadow_production_variants" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_sagemaker_endpoint_configurations_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sagemaker_models" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_time" TIMESTAMP(6),
    "execution_role_arn" TEXT,
    "model_arn" TEXT,
    "model_name" TEXT,
    "containers" JSONB,
    "deployment_recommendation" JSONB,
    "enable_network_isolation" BOOLEAN,
    "inference_execution_config" JSONB,
    "primary_container" JSONB,
    "vpc_config" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_sagemaker_models_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sagemaker_notebook_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "accelerator_types" TEXT[],
    "additional_code_repositories" TEXT[],
    "creation_time" TIMESTAMP(6),
    "default_code_repository" TEXT,
    "direct_internet_access" TEXT,
    "failure_reason" TEXT,
    "instance_metadata_service_configuration" JSONB,
    "instance_type" TEXT,
    "kms_key_id" TEXT,
    "last_modified_time" TIMESTAMP(6),
    "network_interface_id" TEXT,
    "notebook_instance_arn" TEXT,
    "notebook_instance_lifecycle_config_name" TEXT,
    "notebook_instance_name" TEXT,
    "notebook_instance_status" TEXT,
    "platform_identifier" TEXT,
    "role_arn" TEXT,
    "root_access" TEXT,
    "security_groups" TEXT[],
    "subnet_id" TEXT,
    "url" TEXT,
    "volume_size_in_gb" BIGINT,
    "result_metadata" JSONB,

    CONSTRAINT "aws_sagemaker_notebook_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sagemaker_training_jobs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "algorithm_specification" JSONB,
    "creation_time" TIMESTAMP(6),
    "model_artifacts" JSONB,
    "resource_config" JSONB,
    "secondary_status" TEXT,
    "stopping_condition" JSONB,
    "training_job_arn" TEXT,
    "training_job_name" TEXT,
    "training_job_status" TEXT,
    "auto_ml_job_arn" TEXT,
    "billable_time_in_seconds" BIGINT,
    "checkpoint_config" JSONB,
    "debug_hook_config" JSONB,
    "debug_rule_configurations" JSONB,
    "debug_rule_evaluation_statuses" JSONB,
    "enable_inter_container_traffic_encryption" BOOLEAN,
    "enable_managed_spot_training" BOOLEAN,
    "enable_network_isolation" BOOLEAN,
    "environment" JSONB,
    "experiment_config" JSONB,
    "failure_reason" TEXT,
    "final_metric_data_list" JSONB,
    "hyper_parameters" JSONB,
    "input_data_config" JSONB,
    "labeling_job_arn" TEXT,
    "last_modified_time" TIMESTAMP(6),
    "output_data_config" JSONB,
    "profiler_config" JSONB,
    "profiler_rule_configurations" JSONB,
    "profiler_rule_evaluation_statuses" JSONB,
    "profiling_status" TEXT,
    "retry_strategy" JSONB,
    "role_arn" TEXT,
    "secondary_status_transitions" JSONB,
    "tensor_board_output_config" JSONB,
    "training_end_time" TIMESTAMP(6),
    "training_start_time" TIMESTAMP(6),
    "training_time_in_seconds" BIGINT,
    "tuning_job_arn" TEXT,
    "vpc_config" JSONB,
    "warm_pool_status" JSONB,
    "result_metadata" JSONB,

    CONSTRAINT "aws_sagemaker_training_jobs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_savingsplans_plans" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "commitment" TEXT,
    "currency" TEXT,
    "description" TEXT,
    "ec2_instance_family" TEXT,
    "end" TEXT,
    "offering_id" TEXT,
    "payment_option" TEXT,
    "product_types" TEXT[],
    "recurring_payment_amount" TEXT,
    "region" TEXT,
    "savings_plan_arn" TEXT,
    "savings_plan_id" TEXT,
    "savings_plan_type" TEXT,
    "start" TEXT,
    "state" TEXT,
    "tags" JSONB,
    "term_duration_in_seconds" BIGINT,
    "upfront_payment_amount" TEXT,

    CONSTRAINT "aws_savingsplans_plans_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_scheduler_schedule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "creation_date" TIMESTAMP(6),
    "last_modification_date" TIMESTAMP(6),
    "name" TEXT,
    "state" TEXT,

    CONSTRAINT "aws_scheduler_schedule_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_scheduler_schedules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "action_after_completion" TEXT,
    "creation_date" TIMESTAMP(6),
    "description" TEXT,
    "end_date" TIMESTAMP(6),
    "flexible_time_window" JSONB,
    "group_name" TEXT,
    "kms_key_arn" TEXT,
    "last_modification_date" TIMESTAMP(6),
    "name" TEXT,
    "schedule_expression" TEXT,
    "schedule_expression_timezone" TEXT,
    "start_date" TIMESTAMP(6),
    "state" TEXT,
    "target" JSONB,

    CONSTRAINT "aws_scheduler_schedules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_secretsmanager_secret_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "secret_arn" TEXT NOT NULL,
    "created_date" TIMESTAMP(6),
    "kms_key_ids" TEXT[],
    "last_accessed_date" TIMESTAMP(6),
    "version_id" TEXT NOT NULL,
    "version_stages" TEXT[],

    CONSTRAINT "aws_secretsmanager_secret_versions_cqpk" PRIMARY KEY ("secret_arn","version_id")
);

-- CreateTable
CREATE TABLE "aws_secretsmanager_secrets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "policy" JSONB,
    "tags" JSONB,
    "created_date" TIMESTAMP(6),
    "deleted_date" TIMESTAMP(6),
    "description" TEXT,
    "kms_key_id" TEXT,
    "last_accessed_date" TIMESTAMP(6),
    "last_changed_date" TIMESTAMP(6),
    "last_rotated_date" TIMESTAMP(6),
    "name" TEXT,
    "next_rotation_date" TIMESTAMP(6),
    "owning_service" TEXT,
    "primary_region" TEXT,
    "replication_status" JSONB,
    "rotation_enabled" BOOLEAN,
    "rotation_lambda_arn" TEXT,
    "rotation_rules" JSONB,
    "version_ids_to_stages" JSONB,

    CONSTRAINT "aws_secretsmanager_secrets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_securityhub_enabled_standards" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "standards_arn" TEXT NOT NULL,
    "standards_input" JSONB,
    "standards_status" TEXT,
    "standards_subscription_arn" TEXT NOT NULL,
    "standards_status_reason" JSONB,

    CONSTRAINT "aws_securityhub_enabled_standards_cqpk" PRIMARY KEY ("account_id","region","standards_arn","standards_subscription_arn")
);

-- CreateTable
CREATE TABLE "aws_securityhub_findings" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "request_account_id" TEXT NOT NULL,
    "request_region" TEXT NOT NULL,
    "aws_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "description" TEXT NOT NULL,
    "generator_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "product_arn" TEXT NOT NULL,
    "resources" JSONB,
    "schema_version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "action" JSONB,
    "company_name" TEXT,
    "compliance" JSONB,
    "confidence" BIGINT,
    "criticality" BIGINT,
    "finding_provider_fields" JSONB,
    "first_observed_at" TIMESTAMP(6),
    "last_observed_at" TIMESTAMP(6),
    "malware" JSONB,
    "network" JSONB,
    "network_path" JSONB,
    "note" JSONB,
    "patch_summary" JSONB,
    "process" JSONB,
    "product_fields" JSONB,
    "product_name" TEXT,
    "record_state" TEXT,
    "region" TEXT NOT NULL,
    "related_findings" JSONB,
    "remediation" JSONB,
    "sample" BOOLEAN,
    "severity" JSONB,
    "source_url" TEXT,
    "threat_intel_indicators" JSONB,
    "threats" JSONB,
    "types" TEXT[],
    "user_defined_fields" JSONB,
    "verification_state" TEXT,
    "vulnerabilities" JSONB,
    "workflow" JSONB,
    "workflow_state" TEXT,

    CONSTRAINT "aws_securityhub_findings_cqpk" PRIMARY KEY ("request_account_id","request_region","aws_account_id","created_at","description","generator_id","id","product_arn","schema_version","title","updated_at","region")
);

-- CreateTable
CREATE TABLE "aws_securityhub_hubs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "auto_enable_controls" BOOLEAN,
    "control_finding_generator" TEXT,
    "hub_arn" TEXT NOT NULL,
    "subscribed_at" TIMESTAMP(6),
    "result_metadata" JSONB,

    CONSTRAINT "aws_securityhub_hubs_cqpk" PRIMARY KEY ("account_id","region","hub_arn")
);

-- CreateTable
CREATE TABLE "aws_servicecatalog_launch_paths" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "provisioned_product_arn" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "provisioning_artifact_id" TEXT NOT NULL,
    "tags" JSONB,
    "constraint_summaries" JSONB,
    "id" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_servicecatalog_launch_paths_cqpk" PRIMARY KEY ("account_id","region","provisioned_product_arn","product_id","provisioning_artifact_id")
);

-- CreateTable
CREATE TABLE "aws_servicecatalog_portfolios" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "budgets" JSONB,
    "portfolio_detail" JSONB,
    "tag_options" JSONB,

    CONSTRAINT "aws_servicecatalog_portfolios_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_servicecatalog_products" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "budgets" JSONB,
    "product_view_detail" JSONB,
    "provisioning_artifact_summaries" JSONB,
    "tag_options" JSONB,

    CONSTRAINT "aws_servicecatalog_products_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_servicecatalog_provisioned_products" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "created_time" TIMESTAMP(6),
    "id" TEXT,
    "idempotency_token" TEXT,
    "last_provisioning_record_id" TEXT,
    "last_record_id" TEXT,
    "last_successful_provisioning_record_id" TEXT,
    "name" TEXT,
    "physical_id" TEXT,
    "product_id" TEXT,
    "product_name" TEXT,
    "provisioning_artifact_id" TEXT,
    "provisioning_artifact_name" TEXT,
    "status" TEXT,
    "status_message" TEXT,
    "type" TEXT,
    "user_arn" TEXT,
    "user_arn_session" TEXT,

    CONSTRAINT "aws_servicecatalog_provisioned_products_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_servicecatalog_provisioning_artifacts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "provisioned_product_arn" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "provisioning_artifact_id" TEXT NOT NULL,
    "info" JSONB,
    "provisioning_artifact_detail" JSONB,
    "provisioning_artifact_parameters" JSONB,
    "status" TEXT,

    CONSTRAINT "aws_servicecatalog_provisioning_artifacts_cqpk" PRIMARY KEY ("provisioned_product_arn","product_id","provisioning_artifact_id")
);

-- CreateTable
CREATE TABLE "aws_servicecatalog_provisioning_parameters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "provisioned_product_arn" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "provisioning_artifact_id" TEXT NOT NULL,
    "path_id" TEXT NOT NULL,
    "constraint_summaries" JSONB,
    "provisioning_artifact_output_keys" JSONB,
    "provisioning_artifact_parameters" JSONB,
    "provisioning_artifact_preferences" JSONB,
    "tag_options" JSONB,
    "usage_instructions" JSONB,

    CONSTRAINT "aws_servicecatalog_provisioning_parameters_cqpk" PRIMARY KEY ("account_id","region","provisioned_product_arn","product_id","provisioning_artifact_id","path_id")
);

-- CreateTable
CREATE TABLE "aws_servicediscovery_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "attributes" JSONB,
    "creator_request_id" TEXT,

    CONSTRAINT "aws_servicediscovery_instances_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_servicediscovery_namespaces" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "create_date" TIMESTAMP(6),
    "creator_request_id" TEXT,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "properties" JSONB,
    "service_count" BIGINT,
    "type" TEXT,

    CONSTRAINT "aws_servicediscovery_namespaces_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_servicediscovery_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "create_date" TIMESTAMP(6),
    "creator_request_id" TEXT,
    "description" TEXT,
    "dns_config" JSONB,
    "health_check_config" JSONB,
    "health_check_custom_config" JSONB,
    "id" TEXT,
    "instance_count" BIGINT,
    "name" TEXT,
    "namespace_id" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_servicediscovery_services_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ses_active_receipt_rule_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_timestamp" TIMESTAMP(6),
    "rules" JSONB,

    CONSTRAINT "aws_ses_active_receipt_rule_sets_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_ses_configuration_set_event_destinations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "configuration_set_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "matching_event_types" TEXT[],
    "cloud_watch_destination" JSONB,
    "enabled" BOOLEAN,
    "kinesis_firehose_destination" JSONB,
    "pinpoint_destination" JSONB,
    "sns_destination" JSONB,

    CONSTRAINT "aws_ses_configuration_set_event_destinations_cqpk" PRIMARY KEY ("account_id","region","configuration_set_name","name")
);

-- CreateTable
CREATE TABLE "aws_ses_configuration_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "name" TEXT,
    "delivery_options" JSONB,
    "reputation_options" JSONB,
    "sending_options" JSONB,
    "suppression_options" JSONB,
    "tracking_options" JSONB,
    "vdm_options" JSONB,

    CONSTRAINT "aws_ses_configuration_sets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ses_contact_lists" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" JSONB,
    "contact_list_name" TEXT,
    "created_timestamp" TIMESTAMP(6),
    "description" TEXT,
    "last_updated_timestamp" TIMESTAMP(6),
    "topics" JSONB,

    CONSTRAINT "aws_ses_contact_lists_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_ses_custom_verification_email_templates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "failure_redirection_url" TEXT,
    "from_email_address" TEXT,
    "success_redirection_url" TEXT,
    "content" TEXT,
    "name" TEXT,
    "subject" TEXT,

    CONSTRAINT "aws_ses_custom_verification_email_templates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ses_identities" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "identity_name" TEXT,
    "sending_enabled" BOOLEAN,
    "configuration_set_name" TEXT,
    "dkim_attributes" JSONB,
    "feedback_forwarding_status" BOOLEAN,
    "identity_type" TEXT,
    "mail_from_attributes" JSONB,
    "policies" JSONB,
    "verification_status" TEXT,
    "verified_for_sending_status" BOOLEAN,

    CONSTRAINT "aws_ses_identities_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ses_templates" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "template_name" TEXT,
    "html" TEXT,
    "subject" TEXT,
    "text" TEXT,
    "created_timestamp" TIMESTAMP(6),

    CONSTRAINT "aws_ses_templates_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_shield_attacks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "id" TEXT NOT NULL,
    "attack_counters" JSONB,
    "attack_id" TEXT,
    "attack_properties" JSONB,
    "end_time" TIMESTAMP(6),
    "mitigations" JSONB,
    "resource_arn" TEXT,
    "start_time" TIMESTAMP(6),
    "sub_resources" JSONB,

    CONSTRAINT "aws_shield_attacks_cqpk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aws_shield_protection_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "aggregation" TEXT,
    "members" TEXT[],
    "pattern" TEXT,
    "protection_group_id" TEXT,
    "protection_group_arn" TEXT,
    "resource_type" TEXT,

    CONSTRAINT "aws_shield_protection_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_shield_protections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "application_layer_automatic_response_configuration" JSONB,
    "health_check_ids" TEXT[],
    "id" TEXT,
    "name" TEXT,
    "protection_arn" TEXT,
    "resource_arn" TEXT,

    CONSTRAINT "aws_shield_protections_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_shield_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "subscription_limits" JSONB,
    "auto_renew" TEXT,
    "end_time" TIMESTAMP(6),
    "limits" JSONB,
    "proactive_engagement_status" TEXT,
    "start_time" TIMESTAMP(6),
    "subscription_arn" TEXT,
    "time_commitment_in_seconds" BIGINT,

    CONSTRAINT "aws_shield_subscriptions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_signer_signing_profiles" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT,
    "overrides" JSONB,
    "platform_display_name" TEXT,
    "platform_id" TEXT,
    "profile_name" TEXT,
    "profile_version" TEXT,
    "profile_version_arn" TEXT NOT NULL,
    "revocation_record" JSONB,
    "signature_validity_period" JSONB,
    "signing_material" JSONB,
    "signing_parameters" JSONB,
    "status" TEXT,
    "status_reason" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_signer_signing_profiles_cqpk" PRIMARY KEY ("profile_version_arn")
);

-- CreateTable
CREATE TABLE "aws_sns_subscriptions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "delivery_policy" JSONB,
    "effective_delivery_policy" JSONB,
    "filter_policy" JSONB,
    "redrive_policy" JSONB,
    "endpoint" TEXT,
    "owner" TEXT,
    "protocol" TEXT,
    "subscription_arn" TEXT,
    "topic_arn" TEXT,
    "confirmation_was_authenticated" BOOLEAN,
    "pending_confirmation" BOOLEAN,
    "raw_message_delivery" BOOLEAN,
    "subscription_role_arn" TEXT,
    "unknown_fields" JSONB,

    CONSTRAINT "aws_sns_subscriptions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sns_topics" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "delivery_policy" JSONB,
    "policy" JSONB,
    "effective_delivery_policy" JSONB,
    "display_name" TEXT,
    "owner" TEXT,
    "subscriptions_confirmed" BIGINT,
    "subscriptions_deleted" BIGINT,
    "subscriptions_pending" BIGINT,
    "kms_master_key_id" TEXT,
    "fifo_topic" BOOLEAN,
    "content_based_deduplication" BOOLEAN,
    "unknown_fields" JSONB,

    CONSTRAINT "aws_sns_topics_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_sqs_queues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "policy" JSONB,
    "redrive_policy" JSONB,
    "redrive_allow_policy" JSONB,
    "tags" JSONB,
    "url" TEXT,
    "approximate_number_of_messages" BIGINT,
    "approximate_number_of_messages_delayed" BIGINT,
    "approximate_number_of_messages_not_visible" BIGINT,
    "created_timestamp" BIGINT,
    "delay_seconds" BIGINT,
    "last_modified_timestamp" BIGINT,
    "maximum_message_size" BIGINT,
    "message_retention_period" BIGINT,
    "receive_message_wait_time_seconds" BIGINT,
    "visibility_timeout" BIGINT,
    "kms_master_key_id" TEXT,
    "kms_data_key_reuse_period_seconds" BIGINT,
    "sqs_managed_sse_enabled" BOOLEAN,
    "fifo_queue" BOOLEAN,
    "content_based_deduplication" BOOLEAN,
    "deduplication_scope" TEXT,
    "fifo_throughput_limit" TEXT,
    "unknown_fields" JSONB,

    CONSTRAINT "aws_sqs_queues_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ssm_associations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "association_name" TEXT,
    "association_version" TEXT,
    "document_version" TEXT,
    "instance_id" TEXT,
    "last_execution_date" TIMESTAMP(6),
    "name" TEXT,
    "overview" JSONB,
    "schedule_expression" TEXT,
    "schedule_offset" BIGINT,
    "target_maps" JSONB,
    "targets" JSONB,

    CONSTRAINT "aws_ssm_associations_cqpk" PRIMARY KEY ("account_id","region","association_id")
);

-- CreateTable
CREATE TABLE "aws_ssm_compliance_summary_items" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "compliance_type" TEXT NOT NULL,
    "compliant_summary" JSONB,
    "non_compliant_summary" JSONB,

    CONSTRAINT "aws_ssm_compliance_summary_items_cqpk" PRIMARY KEY ("account_id","region","compliance_type")
);

-- CreateTable
CREATE TABLE "aws_ssm_document_versions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "document_arn" TEXT NOT NULL,
    "created_date" TIMESTAMP(6),
    "display_name" TEXT,
    "document_format" TEXT,
    "document_version" TEXT NOT NULL,
    "is_default_version" BOOLEAN,
    "name" TEXT,
    "review_status" TEXT,
    "status" TEXT,
    "status_information" TEXT,
    "version_name" TEXT,

    CONSTRAINT "aws_ssm_document_versions_cqpk" PRIMARY KEY ("document_arn","document_version")
);

-- CreateTable
CREATE TABLE "aws_ssm_documents" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "permissions" JSONB,
    "tags" JSONB,
    "approved_version" TEXT,
    "attachments_information" JSONB,
    "author" TEXT,
    "category" TEXT[],
    "category_enum" TEXT[],
    "created_date" TIMESTAMP(6),
    "default_version" TEXT,
    "description" TEXT,
    "display_name" TEXT,
    "document_format" TEXT,
    "document_type" TEXT,
    "document_version" TEXT,
    "hash" TEXT,
    "hash_type" TEXT,
    "latest_version" TEXT,
    "name" TEXT,
    "owner" TEXT,
    "parameters" JSONB,
    "pending_review_version" TEXT,
    "platform_types" TEXT[],
    "requires" JSONB,
    "review_information" JSONB,
    "review_status" TEXT,
    "schema_version" TEXT,
    "sha1" TEXT,
    "status" TEXT,
    "status_information" TEXT,
    "target_type" TEXT,
    "version_name" TEXT,

    CONSTRAINT "aws_ssm_documents_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ssm_instance_compliance_items" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "id" TEXT NOT NULL,
    "instance_arn" TEXT NOT NULL,
    "compliance_type" TEXT,
    "details" JSONB,
    "execution_summary" JSONB,
    "resource_id" TEXT,
    "resource_type" TEXT,
    "severity" TEXT,
    "status" TEXT,
    "title" TEXT,

    CONSTRAINT "aws_ssm_instance_compliance_items_cqpk" PRIMARY KEY ("id","instance_arn")
);

-- CreateTable
CREATE TABLE "aws_ssm_instance_patches" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "instance_arn" TEXT NOT NULL,
    "kb_id" TEXT NOT NULL,
    "classification" TEXT,
    "installed_time" TIMESTAMP(6),
    "severity" TEXT,
    "state" TEXT,
    "title" TEXT,
    "cve_ids" TEXT,

    CONSTRAINT "aws_ssm_instance_patches_cqpk" PRIMARY KEY ("instance_arn","kb_id")
);

-- CreateTable
CREATE TABLE "aws_ssm_instances" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "activation_id" TEXT,
    "agent_version" TEXT,
    "association_overview" JSONB,
    "association_status" TEXT,
    "computer_name" TEXT,
    "ip_address" TEXT,
    "iam_role" TEXT,
    "instance_id" TEXT,
    "is_latest_version" BOOLEAN,
    "last_association_execution_date" TIMESTAMP(6),
    "last_ping_date_time" TIMESTAMP(6),
    "last_successful_association_execution_date" TIMESTAMP(6),
    "name" TEXT,
    "ping_status" TEXT,
    "platform_name" TEXT,
    "platform_type" TEXT,
    "platform_version" TEXT,
    "registration_date" TIMESTAMP(6),
    "resource_type" TEXT,
    "source_id" TEXT,
    "source_type" TEXT,

    CONSTRAINT "aws_ssm_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ssm_inventories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "aws_ssm_inventories_cqpk" PRIMARY KEY ("account_id","region","id")
);

-- CreateTable
CREATE TABLE "aws_ssm_inventory_schemas" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "attributes" JSONB,
    "display_name" TEXT,

    CONSTRAINT "aws_ssm_inventory_schemas_cqpk" PRIMARY KEY ("account_id","region","type_name","version")
);

-- CreateTable
CREATE TABLE "aws_ssm_parameters" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allowed_pattern" TEXT,
    "data_type" TEXT,
    "description" TEXT,
    "key_id" TEXT,
    "last_modified_date" TIMESTAMP(6),
    "last_modified_user" TEXT,
    "policies" JSONB,
    "tier" TEXT,
    "type" TEXT,
    "version" BIGINT,

    CONSTRAINT "aws_ssm_parameters_cqpk" PRIMARY KEY ("account_id","region","name")
);

-- CreateTable
CREATE TABLE "aws_ssm_patch_baselines" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "baseline_id" TEXT NOT NULL,
    "baseline_description" TEXT,
    "baseline_name" TEXT,
    "default_baseline" BOOLEAN,
    "operating_system" TEXT,

    CONSTRAINT "aws_ssm_patch_baselines_cqpk" PRIMARY KEY ("account_id","region","baseline_id")
);

-- CreateTable
CREATE TABLE "aws_ssm_sessions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "details" TEXT,
    "document_name" TEXT,
    "end_date" TIMESTAMP(6),
    "max_session_duration" TEXT,
    "output_url" JSONB,
    "owner" TEXT,
    "reason" TEXT,
    "session_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(6),
    "status" TEXT,
    "target" TEXT,

    CONSTRAINT "aws_ssm_sessions_cqpk" PRIMARY KEY ("account_id","region","session_id")
);

-- CreateTable
CREATE TABLE "aws_stepfunctions_activities" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "activity_arn" TEXT,
    "creation_date" TIMESTAMP(6),
    "name" TEXT,

    CONSTRAINT "aws_stepfunctions_activities_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_stepfunctions_executions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "state_machine_arn" TEXT,
    "execution_arn" TEXT,
    "start_date" TIMESTAMP(6),
    "status" TEXT,
    "cause" TEXT,
    "error" TEXT,
    "input" TEXT,
    "input_details" JSONB,
    "map_run_arn" TEXT,
    "name" TEXT,
    "output" TEXT,
    "output_details" JSONB,
    "state_machine_alias_arn" TEXT,
    "state_machine_version_arn" TEXT,
    "stop_date" TIMESTAMP(6),
    "trace_header" TEXT,

    CONSTRAINT "aws_stepfunctions_executions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_stepfunctions_map_run_executions" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "map_run_arn" TEXT,
    "state_machine_arn" TEXT,
    "execution_arn" TEXT,
    "start_date" TIMESTAMP(6),
    "status" TEXT,
    "cause" TEXT,
    "error" TEXT,
    "input" TEXT,
    "input_details" JSONB,
    "name" TEXT,
    "output" TEXT,
    "output_details" JSONB,
    "state_machine_alias_arn" TEXT,
    "state_machine_version_arn" TEXT,
    "stop_date" TIMESTAMP(6),
    "trace_header" TEXT,

    CONSTRAINT "aws_stepfunctions_map_run_executions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_stepfunctions_map_runs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "state_machine_arn" TEXT,
    "execution_arn" TEXT,
    "execution_counts" JSONB,
    "item_counts" JSONB,
    "map_run_arn" TEXT,
    "max_concurrency" BIGINT,
    "start_date" TIMESTAMP(6),
    "status" TEXT,
    "tolerated_failure_count" BIGINT,
    "tolerated_failure_percentage" DOUBLE PRECISION,
    "stop_date" TIMESTAMP(6),

    CONSTRAINT "aws_stepfunctions_map_runs_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_stepfunctions_state_machines" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "creation_date" TIMESTAMP(6),
    "definition" TEXT,
    "name" TEXT,
    "role_arn" TEXT,
    "state_machine_arn" TEXT,
    "type" TEXT,
    "description" TEXT,
    "label" TEXT,
    "logging_configuration" JSONB,
    "revision_id" TEXT,
    "status" TEXT,
    "tracing_configuration" JSONB,

    CONSTRAINT "aws_stepfunctions_state_machines_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_support_case_communications" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "attachment_set" JSONB,
    "body" TEXT,
    "case_id" TEXT,
    "submitted_by" TEXT,
    "time_created" TEXT,

    CONSTRAINT "aws_support_case_communications_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_support_cases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "category_code" TEXT,
    "cc_email_addresses" TEXT[],
    "display_id" TEXT,
    "language" TEXT,
    "recent_communications" JSONB,
    "service_code" TEXT,
    "severity_code" TEXT,
    "status" TEXT,
    "subject" TEXT,
    "submitted_by" TEXT,
    "time_created" TEXT,

    CONSTRAINT "aws_support_cases_cqpk" PRIMARY KEY ("account_id","region","case_id")
);

-- CreateTable
CREATE TABLE "aws_support_services" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "categories" JSONB,
    "code" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "aws_support_services_cqpk" PRIMARY KEY ("account_id","region","language_code","code")
);

-- CreateTable
CREATE TABLE "aws_support_severity_levels" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "aws_support_severity_levels_cqpk" PRIMARY KEY ("account_id","region","language_code","code")
);

-- CreateTable
CREATE TABLE "aws_support_trusted_advisor_check_results" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "category_specific_summary" JSONB,
    "check_id" TEXT NOT NULL,
    "flagged_resources" JSONB,
    "resources_summary" JSONB,
    "status" TEXT,
    "timestamp" TEXT,

    CONSTRAINT "aws_support_trusted_advisor_check_results_cqpk" PRIMARY KEY ("account_id","region","language_code","check_id")
);

-- CreateTable
CREATE TABLE "aws_support_trusted_advisor_check_summaries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "category_specific_summary" JSONB,
    "check_id" TEXT NOT NULL,
    "resources_summary" JSONB,
    "status" TEXT,
    "timestamp" TEXT,
    "has_flagged_resources" BOOLEAN,

    CONSTRAINT "aws_support_trusted_advisor_check_summaries_cqpk" PRIMARY KEY ("account_id","region","language_code","check_id")
);

-- CreateTable
CREATE TABLE "aws_support_trusted_advisor_checks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "metadata" TEXT[],
    "name" TEXT,

    CONSTRAINT "aws_support_trusted_advisor_checks_cqpk" PRIMARY KEY ("account_id","region","language_code","id")
);

-- CreateTable
CREATE TABLE "aws_timestream_databases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "database_name" TEXT,
    "kms_key_id" TEXT,
    "last_updated_time" TIMESTAMP(6),
    "table_count" BIGINT,

    CONSTRAINT "aws_timestream_databases_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_timestream_tables" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "creation_time" TIMESTAMP(6),
    "database_name" TEXT,
    "last_updated_time" TIMESTAMP(6),
    "magnetic_store_write_properties" JSONB,
    "retention_properties" JSONB,
    "schema" JSONB,
    "table_name" TEXT,
    "table_status" TEXT,

    CONSTRAINT "aws_timestream_tables_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_transfer_servers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "certificate" TEXT,
    "domain" TEXT,
    "endpoint_details" JSONB,
    "endpoint_type" TEXT,
    "host_key_fingerprint" TEXT,
    "identity_provider_details" JSONB,
    "identity_provider_type" TEXT,
    "logging_role" TEXT,
    "post_authentication_login_banner" TEXT,
    "pre_authentication_login_banner" TEXT,
    "protocol_details" JSONB,
    "protocols" TEXT[],
    "security_policy_name" TEXT,
    "server_id" TEXT,
    "state" TEXT,
    "structured_log_destinations" TEXT[],
    "user_count" BIGINT,
    "workflow_details" JSONB,

    CONSTRAINT "aws_transfer_servers_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_waf_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "rule_ids" TEXT[],
    "rule_group_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_waf_rule_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_waf_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "predicates" JSONB,
    "rule_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_waf_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_waf_subscribed_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "rule_group_id" TEXT NOT NULL,
    "metric_name" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_waf_subscribed_rule_groups_cqpk" PRIMARY KEY ("account_id","rule_group_id")
);

-- CreateTable
CREATE TABLE "aws_waf_web_acls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "default_action" JSONB,
    "rules" JSONB,
    "web_acl_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,
    "web_acl_arn" TEXT,
    "logging_configuration" JSONB,

    CONSTRAINT "aws_waf_web_acls_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafregional_rate_based_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "match_predicates" JSONB,
    "rate_key" TEXT,
    "rate_limit" BIGINT,
    "rule_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_wafregional_rate_based_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafregional_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "rule_ids" TEXT[],
    "rule_group_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_wafregional_rule_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafregional_rules" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "predicates" JSONB,
    "rule_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,

    CONSTRAINT "aws_wafregional_rules_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafregional_web_acls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "tags" JSONB,
    "resources_for_web_acl" TEXT[],
    "default_action" JSONB,
    "rules" JSONB,
    "web_acl_id" TEXT,
    "metric_name" TEXT,
    "name" TEXT,
    "web_acl_arn" TEXT,

    CONSTRAINT "aws_wafregional_web_acls_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafv2_ipsets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "addresses" INET[],
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "ip_address_version" TEXT,
    "id" TEXT,
    "name" TEXT,
    "description" TEXT,

    CONSTRAINT "aws_wafv2_ipsets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafv2_managed_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "properties" JSONB,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "versioning_supported" BOOLEAN,

    CONSTRAINT "aws_wafv2_managed_rule_groups_cqpk" PRIMARY KEY ("account_id","region","scope","name","vendor_name")
);

-- CreateTable
CREATE TABLE "aws_wafv2_regex_pattern_sets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "description" TEXT,
    "id" TEXT,
    "name" TEXT,
    "regular_expression_list" JSONB,

    CONSTRAINT "aws_wafv2_regex_pattern_sets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafv2_rule_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "arn" TEXT NOT NULL,
    "policy" JSONB,
    "capacity" BIGINT,
    "id" TEXT,
    "name" TEXT,
    "visibility_config" JSONB,
    "available_labels" JSONB,
    "consumed_labels" JSONB,
    "custom_response_bodies" JSONB,
    "description" TEXT,
    "label_namespace" TEXT,
    "rules" JSONB,

    CONSTRAINT "aws_wafv2_rule_groups_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wafv2_web_acls" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "tags" JSONB,
    "resources_for_web_acl" TEXT[],
    "arn" TEXT NOT NULL,
    "default_action" JSONB,
    "id" TEXT,
    "name" TEXT,
    "visibility_config" JSONB,
    "association_config" JSONB,
    "capacity" BIGINT,
    "captcha_config" JSONB,
    "challenge_config" JSONB,
    "custom_response_bodies" JSONB,
    "description" TEXT,
    "label_namespace" TEXT,
    "managed_by_firewall_manager" BOOLEAN,
    "post_process_firewall_manager_rule_groups" JSONB,
    "pre_process_firewall_manager_rule_groups" JSONB,
    "rules" JSONB,
    "token_domains" TEXT[],
    "logging_configuration" JSONB,

    CONSTRAINT "aws_wafv2_web_acls_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_lens_review_improvements" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "workload_arn" TEXT NOT NULL,
    "workload_id" TEXT,
    "milestone_number" BIGINT NOT NULL,
    "lens_alias" TEXT NOT NULL,
    "improvement_plan_url" TEXT,
    "improvement_plans" JSONB,
    "pillar_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "question_title" TEXT,
    "risk" TEXT,

    CONSTRAINT "aws_wellarchitected_lens_review_improvements_cqpk" PRIMARY KEY ("workload_arn","milestone_number","lens_alias","pillar_id","question_id")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_lens_reviews" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "workload_arn" TEXT NOT NULL,
    "workload_id" TEXT,
    "milestone_number" BIGINT NOT NULL,
    "lens_alias" TEXT NOT NULL,
    "lens_arn" TEXT,
    "lens_name" TEXT,
    "lens_status" TEXT,
    "lens_version" TEXT,
    "next_token" TEXT,
    "notes" TEXT,
    "pillar_review_summaries" JSONB,
    "prioritized_risk_counts" JSONB,
    "profiles" JSONB,
    "risk_counts" JSONB,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "aws_wellarchitected_lens_reviews_cqpk" PRIMARY KEY ("workload_arn","milestone_number","lens_alias")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_lenses" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "description" TEXT,
    "lens_alias" TEXT,
    "lens_arn" TEXT,
    "lens_name" TEXT,
    "lens_status" TEXT,
    "lens_type" TEXT,
    "lens_version" TEXT,
    "owner" TEXT,
    "updated_at" TIMESTAMP(6),
    "share_invitation_id" TEXT,
    "tags" JSONB,

    CONSTRAINT "aws_wellarchitected_lenses_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_share_invitations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lens_arn" TEXT,
    "lens_name" TEXT,
    "permission_type" TEXT,
    "profile_arn" TEXT,
    "profile_name" TEXT,
    "share_invitation_id" TEXT NOT NULL,
    "share_resource_type" TEXT,
    "shared_by" TEXT,
    "shared_with" TEXT,
    "workload_id" TEXT,
    "workload_name" TEXT,

    CONSTRAINT "aws_wellarchitected_share_invitations_cqpk" PRIMARY KEY ("account_id","region","share_invitation_id")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_workload_milestones" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "workload_arn" TEXT NOT NULL,
    "workload_id" TEXT,
    "milestone_name" TEXT NOT NULL,
    "milestone_number" BIGINT,
    "recorded_at" TIMESTAMP(6),

    CONSTRAINT "aws_wellarchitected_workload_milestones_cqpk" PRIMARY KEY ("workload_arn","milestone_name")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_workload_shares" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "workload_arn" TEXT NOT NULL,
    "permission_type" TEXT,
    "share_id" TEXT NOT NULL,
    "shared_with" TEXT,
    "status" TEXT,
    "status_message" TEXT,

    CONSTRAINT "aws_wellarchitected_workload_shares_cqpk" PRIMARY KEY ("workload_arn","share_id")
);

-- CreateTable
CREATE TABLE "aws_wellarchitected_workloads" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "arn" TEXT NOT NULL,
    "account_ids" TEXT[],
    "applications" TEXT[],
    "architectural_design" TEXT,
    "aws_regions" TEXT[],
    "description" TEXT,
    "discovery_config" JSONB,
    "environment" TEXT,
    "improvement_status" TEXT,
    "industry" TEXT,
    "industry_type" TEXT,
    "is_review_owner_update_acknowledged" BOOLEAN,
    "lenses" TEXT[],
    "non_aws_regions" TEXT[],
    "notes" TEXT,
    "owner" TEXT,
    "pillar_priorities" TEXT[],
    "prioritized_risk_counts" JSONB,
    "profiles" JSONB,
    "review_owner" TEXT,
    "review_restriction_date" TIMESTAMP(6),
    "risk_counts" JSONB,
    "share_invitation_id" TEXT,
    "tags" JSONB,
    "updated_at" TIMESTAMP(6),
    "workload_arn" TEXT,
    "workload_id" TEXT,
    "workload_name" TEXT,

    CONSTRAINT "aws_wellarchitected_workloads_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_workspaces_directories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "alias" TEXT,
    "certificate_based_auth_properties" JSONB,
    "customer_user_name" TEXT,
    "directory_id" TEXT,
    "directory_name" TEXT,
    "directory_type" TEXT,
    "dns_ip_addresses" TEXT[],
    "iam_role_id" TEXT,
    "ip_group_ids" TEXT[],
    "registration_code" TEXT,
    "saml_properties" JSONB,
    "selfservice_permissions" JSONB,
    "state" TEXT,
    "subnet_ids" TEXT[],
    "tenancy" TEXT,
    "workspace_access_properties" JSONB,
    "workspace_creation_properties" JSONB,
    "workspace_security_group_id" TEXT,

    CONSTRAINT "aws_workspaces_directories_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_workspaces_workspaces" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "arn" TEXT NOT NULL,
    "bundle_id" TEXT,
    "computer_name" TEXT,
    "directory_id" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "ip_address" TEXT,
    "modification_states" JSONB,
    "related_workspaces" JSONB,
    "root_volume_encryption_enabled" BOOLEAN,
    "state" TEXT,
    "subnet_id" TEXT,
    "user_name" TEXT,
    "user_volume_encryption_enabled" BOOLEAN,
    "volume_encryption_key" TEXT,
    "workspace_id" TEXT,
    "workspace_properties" JSONB,

    CONSTRAINT "aws_workspaces_workspaces_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_xray_encryption_configs" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "region" TEXT,
    "key_id" TEXT,
    "status" TEXT,
    "type" TEXT,

    CONSTRAINT "aws_xray_encryption_configs_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "github_billing_action" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "total_minutes_used" BIGINT,
    "total_paid_minutes_used" DOUBLE PRECISION,
    "included_minutes" BIGINT,
    "minutes_used_breakdown" JSONB,

    CONSTRAINT "github_billing_action_cqpk" PRIMARY KEY ("org")
);

-- CreateTable
CREATE TABLE "github_billing_package" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "total_gigabytes_bandwidth_used" BIGINT,
    "total_paid_gigabytes_bandwidth_used" BIGINT,
    "included_gigabytes_bandwidth" BIGINT,

    CONSTRAINT "github_billing_package_cqpk" PRIMARY KEY ("org")
);

-- CreateTable
CREATE TABLE "github_billing_storage" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "days_left_in_billing_cycle" BIGINT,
    "estimated_paid_storage_for_month" DOUBLE PRECISION,
    "estimated_storage_for_month" BIGINT,

    CONSTRAINT "github_billing_storage_cqpk" PRIMARY KEY ("org")
);

-- CreateTable
CREATE TABLE "github_external_groups" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "group_id" BIGINT NOT NULL,
    "group_name" TEXT,
    "updated_at" TIMESTAMP(6),
    "teams" JSONB,
    "members" JSONB,

    CONSTRAINT "github_external_groups_cqpk" PRIMARY KEY ("org","group_id")
);

-- CreateTable
CREATE TABLE "github_hook_deliveries" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "hook_id" BIGINT NOT NULL,
    "id" BIGINT NOT NULL,
    "guid" TEXT,
    "delivered_at" TIMESTAMP(6),
    "redelivery" BOOLEAN,
    "duration" DOUBLE PRECISION,
    "status" TEXT,
    "status_code" BIGINT,
    "event" TEXT,
    "action" TEXT,
    "installation_id" BIGINT,
    "repository_id" BIGINT,
    "request" JSONB,
    "response" JSONB,

    CONSTRAINT "github_hook_deliveries_cqpk" PRIMARY KEY ("org","hook_id","id")
);

-- CreateTable
CREATE TABLE "github_hooks" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "url" TEXT,
    "id" BIGINT NOT NULL,
    "type" TEXT,
    "name" TEXT,
    "test_url" TEXT,
    "ping_url" TEXT,
    "last_response" JSONB,
    "config" JSONB,
    "events" TEXT[],
    "active" BOOLEAN,

    CONSTRAINT "github_hooks_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_installations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "app_id" BIGINT,
    "app_slug" TEXT,
    "target_id" BIGINT,
    "account" JSONB,
    "access_tokens_url" TEXT,
    "repositories_url" TEXT,
    "html_url" TEXT,
    "target_type" TEXT,
    "single_file_name" TEXT,
    "repository_selection" TEXT,
    "events" TEXT[],
    "single_file_paths" TEXT[],
    "permissions" JSONB,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "has_multiple_single_files" BOOLEAN,
    "suspended_by" JSONB,
    "suspended_at" TIMESTAMP(6),

    CONSTRAINT "github_installations_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_issues" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "id" BIGINT NOT NULL,
    "number" BIGINT,
    "state" TEXT,
    "state_reason" TEXT,
    "locked" BOOLEAN,
    "title" TEXT,
    "body" TEXT,
    "author_association" TEXT,
    "user" JSONB,
    "labels" JSONB,
    "assignee" JSONB,
    "comments" BIGINT,
    "closed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "closed_by" JSONB,
    "url" TEXT,
    "html_url" TEXT,
    "comments_url" TEXT,
    "events_url" TEXT,
    "labels_url" TEXT,
    "repository_url" TEXT,
    "milestone" JSONB,
    "pull_request" JSONB,
    "repository" JSONB,
    "reactions" JSONB,
    "assignees" JSONB,
    "node_id" TEXT,
    "text_matches" JSONB,
    "active_lock_reason" TEXT,

    CONSTRAINT "github_issues_cqpk" PRIMARY KEY ("org","repository_id","id")
);

-- CreateTable
CREATE TABLE "github_organization_dependabot_alerts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "number" BIGINT,
    "state" TEXT,
    "dependency" JSONB,
    "security_advisory" JSONB,
    "security_vulnerability" JSONB,
    "url" TEXT,
    "html_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "dismissed_at" TIMESTAMP(6),
    "dismissed_by" JSONB,
    "dismissed_reason" TEXT,
    "dismissed_comment" TEXT,
    "fixed_at" TIMESTAMP(6),

    CONSTRAINT "github_organization_dependabot_alerts_cqpk" PRIMARY KEY ("org","html_url")
);

-- CreateTable
CREATE TABLE "github_organization_dependabot_secrets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "visibility" TEXT,
    "selected_repositories_url" TEXT,

    CONSTRAINT "github_organization_dependabot_secrets_cqpk" PRIMARY KEY ("org","name")
);

-- CreateTable
CREATE TABLE "github_organization_members" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "membership" JSONB,
    "login" TEXT,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "avatar_url" TEXT,
    "html_url" TEXT,
    "gravatar_id" TEXT,
    "name" TEXT,
    "company" TEXT,
    "blog" TEXT,
    "location" TEXT,
    "email" TEXT,
    "hireable" BOOLEAN,
    "bio" TEXT,
    "twitter_username" TEXT,
    "public_repos" BIGINT,
    "public_gists" BIGINT,
    "followers" BIGINT,
    "following" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "suspended_at" TIMESTAMP(6),
    "type" TEXT,
    "site_admin" BOOLEAN,
    "total_private_repos" BIGINT,
    "owned_private_repos" BIGINT,
    "private_gists" BIGINT,
    "disk_usage" BIGINT,
    "collaborators" BIGINT,
    "two_factor_authentication" BOOLEAN,
    "plan" JSONB,
    "ldap_dn" TEXT,
    "url" TEXT,
    "events_url" TEXT,
    "following_url" TEXT,
    "followers_url" TEXT,
    "gists_url" TEXT,
    "organizations_url" TEXT,
    "received_events_url" TEXT,
    "repos_url" TEXT,
    "starred_url" TEXT,
    "subscriptions_url" TEXT,
    "text_matches" JSONB,
    "permissions" JSONB,
    "role_name" TEXT,

    CONSTRAINT "github_organization_members_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_organizations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "login" TEXT,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "avatar_url" TEXT,
    "html_url" TEXT,
    "name" TEXT,
    "company" TEXT,
    "blog" TEXT,
    "location" TEXT,
    "email" TEXT,
    "twitter_username" TEXT,
    "description" TEXT,
    "public_repos" BIGINT,
    "public_gists" BIGINT,
    "followers" BIGINT,
    "following" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "total_private_repos" BIGINT,
    "owned_private_repos" BIGINT,
    "private_gists" BIGINT,
    "disk_usage" BIGINT,
    "collaborators" BIGINT,
    "billing_email" TEXT,
    "type" TEXT,
    "plan" JSONB,
    "two_factor_requirement_enabled" BOOLEAN,
    "is_verified" BOOLEAN,
    "has_organization_projects" BOOLEAN,
    "has_repository_projects" BOOLEAN,
    "default_repository_permission" TEXT,
    "default_repository_settings" TEXT,
    "members_can_create_repositories" BOOLEAN,
    "members_can_create_public_repositories" BOOLEAN,
    "members_can_create_private_repositories" BOOLEAN,
    "members_can_create_internal_repositories" BOOLEAN,
    "members_can_fork_private_repositories" BOOLEAN,
    "members_allowed_repository_creation_type" TEXT,
    "members_can_create_pages" BOOLEAN,
    "members_can_create_public_pages" BOOLEAN,
    "members_can_create_private_pages" BOOLEAN,
    "web_commit_signoff_required" BOOLEAN,
    "advanced_security_enabled_for_new_repositories" BOOLEAN,
    "dependabot_alerts_enabled_for_new_repositories" BOOLEAN,
    "dependabot_security_updates_enabled_for_new_repositories" BOOLEAN,
    "dependency_graph_enabled_for_new_repositories" BOOLEAN,
    "secret_scanning_enabled_for_new_repositories" BOOLEAN,
    "secret_scanning_push_protection_enabled_for_new_repositories" BOOLEAN,
    "url" TEXT,
    "events_url" TEXT,
    "hooks_url" TEXT,
    "issues_url" TEXT,
    "members_url" TEXT,
    "public_members_url" TEXT,
    "repos_url" TEXT,

    CONSTRAINT "github_organizations_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_release_assets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "id" BIGINT NOT NULL,
    "url" TEXT,
    "name" TEXT,
    "label" TEXT,
    "state" TEXT,
    "content_type" TEXT,
    "size" BIGINT,
    "download_count" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "browser_download_url" TEXT,
    "uploader" JSONB,
    "node_id" TEXT,

    CONSTRAINT "github_release_assets_cqpk" PRIMARY KEY ("org","repository_id","id")
);

-- CreateTable
CREATE TABLE "github_releases" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "tag_name" TEXT,
    "target_commitish" TEXT,
    "name" TEXT,
    "body" TEXT,
    "draft" BOOLEAN,
    "prerelease" BOOLEAN,
    "make_latest" TEXT,
    "discussion_category_name" TEXT,
    "generate_release_notes" BOOLEAN,
    "id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "url" TEXT,
    "html_url" TEXT,
    "assets_url" TEXT,
    "assets" JSONB,
    "upload_url" TEXT,
    "zipball_url" TEXT,
    "tarball_url" TEXT,
    "author" JSONB,
    "node_id" TEXT,

    CONSTRAINT "github_releases_cqpk" PRIMARY KEY ("org","repository_id","id")
);

-- CreateTable
CREATE TABLE "github_repositories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "owner" JSONB,
    "name" TEXT,
    "full_name" TEXT,
    "description" TEXT,
    "homepage" TEXT,
    "code_of_conduct" JSONB,
    "default_branch" TEXT,
    "master_branch" TEXT,
    "created_at" TIMESTAMP(6),
    "pushed_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "html_url" TEXT,
    "clone_url" TEXT,
    "git_url" TEXT,
    "mirror_url" TEXT,
    "ssh_url" TEXT,
    "svn_url" TEXT,
    "language" TEXT,
    "fork" BOOLEAN,
    "forks_count" BIGINT,
    "network_count" BIGINT,
    "open_issues_count" BIGINT,
    "open_issues" BIGINT,
    "stargazers_count" BIGINT,
    "subscribers_count" BIGINT,
    "watchers_count" BIGINT,
    "watchers" BIGINT,
    "size" BIGINT,
    "auto_init" BOOLEAN,
    "parent" JSONB,
    "source" JSONB,
    "template_repository" JSONB,
    "organization" JSONB,
    "permissions" JSONB,
    "allow_rebase_merge" BOOLEAN,
    "allow_update_branch" BOOLEAN,
    "allow_squash_merge" BOOLEAN,
    "allow_merge_commit" BOOLEAN,
    "allow_auto_merge" BOOLEAN,
    "allow_forking" BOOLEAN,
    "delete_branch_on_merge" BOOLEAN,
    "use_squash_pr_title_as_default" BOOLEAN,
    "squash_merge_commit_title" TEXT,
    "squash_merge_commit_message" TEXT,
    "merge_commit_title" TEXT,
    "merge_commit_message" TEXT,
    "topics" TEXT[],
    "archived" BOOLEAN,
    "disabled" BOOLEAN,
    "license" JSONB,
    "private" BOOLEAN,
    "has_issues" BOOLEAN,
    "has_wiki" BOOLEAN,
    "has_pages" BOOLEAN,
    "has_projects" BOOLEAN,
    "has_downloads" BOOLEAN,
    "has_discussions" BOOLEAN,
    "is_template" BOOLEAN,
    "license_template" TEXT,
    "gitignore_template" TEXT,
    "security_and_analysis" JSONB,
    "team_id" BIGINT,
    "url" TEXT,
    "archive_url" TEXT,
    "assignees_url" TEXT,
    "blobs_url" TEXT,
    "branches_url" TEXT,
    "collaborators_url" TEXT,
    "comments_url" TEXT,
    "commits_url" TEXT,
    "compare_url" TEXT,
    "contents_url" TEXT,
    "contributors_url" TEXT,
    "deployments_url" TEXT,
    "downloads_url" TEXT,
    "events_url" TEXT,
    "forks_url" TEXT,
    "git_commits_url" TEXT,
    "git_refs_url" TEXT,
    "git_tags_url" TEXT,
    "hooks_url" TEXT,
    "issue_comment_url" TEXT,
    "issue_events_url" TEXT,
    "issues_url" TEXT,
    "keys_url" TEXT,
    "labels_url" TEXT,
    "languages_url" TEXT,
    "merges_url" TEXT,
    "milestones_url" TEXT,
    "notifications_url" TEXT,
    "pulls_url" TEXT,
    "releases_url" TEXT,
    "stargazers_url" TEXT,
    "statuses_url" TEXT,
    "subscribers_url" TEXT,
    "subscription_url" TEXT,
    "tags_url" TEXT,
    "trees_url" TEXT,
    "teams_url" TEXT,
    "text_matches" JSONB,
    "visibility" TEXT,
    "role_name" TEXT,

    CONSTRAINT "github_repositories_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_repository_branches" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "protection" JSONB,
    "name" TEXT NOT NULL,
    "commit" JSONB,
    "protected" BOOLEAN,

    CONSTRAINT "github_repository_branches_cqpk" PRIMARY KEY ("org","repository_id","name")
);

-- CreateTable
CREATE TABLE "github_repository_dependabot_alerts" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "number" BIGINT NOT NULL,
    "state" TEXT,
    "dependency" JSONB,
    "security_advisory" JSONB,
    "security_vulnerability" JSONB,
    "url" TEXT,
    "html_url" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "dismissed_at" TIMESTAMP(6),
    "dismissed_by" JSONB,
    "dismissed_reason" TEXT,
    "dismissed_comment" TEXT,
    "fixed_at" TIMESTAMP(6),

    CONSTRAINT "github_repository_dependabot_alerts_cqpk" PRIMARY KEY ("org","repository_id","number")
);

-- CreateTable
CREATE TABLE "github_repository_dependabot_secrets" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "visibility" TEXT,
    "selected_repositories_url" TEXT,

    CONSTRAINT "github_repository_dependabot_secrets_cqpk" PRIMARY KEY ("org","repository_id","name")
);

-- CreateTable
CREATE TABLE "github_repository_keys" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "id" BIGINT NOT NULL,
    "key" TEXT,
    "url" TEXT,
    "title" TEXT,
    "read_only" BOOLEAN,
    "verified" BOOLEAN,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "github_repository_keys_cqpk" PRIMARY KEY ("org","repository_id","id")
);

-- CreateTable
CREATE TABLE "github_team_members" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "team_id" BIGINT NOT NULL,
    "membership" JSONB,
    "login" TEXT,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "avatar_url" TEXT,
    "html_url" TEXT,
    "gravatar_id" TEXT,
    "name" TEXT,
    "company" TEXT,
    "blog" TEXT,
    "location" TEXT,
    "email" TEXT,
    "hireable" BOOLEAN,
    "bio" TEXT,
    "twitter_username" TEXT,
    "public_repos" BIGINT,
    "public_gists" BIGINT,
    "followers" BIGINT,
    "following" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "suspended_at" TIMESTAMP(6),
    "type" TEXT,
    "site_admin" BOOLEAN,
    "total_private_repos" BIGINT,
    "owned_private_repos" BIGINT,
    "private_gists" BIGINT,
    "disk_usage" BIGINT,
    "collaborators" BIGINT,
    "two_factor_authentication" BOOLEAN,
    "plan" JSONB,
    "ldap_dn" TEXT,
    "url" TEXT,
    "events_url" TEXT,
    "following_url" TEXT,
    "followers_url" TEXT,
    "gists_url" TEXT,
    "organizations_url" TEXT,
    "received_events_url" TEXT,
    "repos_url" TEXT,
    "starred_url" TEXT,
    "subscriptions_url" TEXT,
    "text_matches" JSONB,
    "permissions" JSONB,
    "role_name" TEXT,

    CONSTRAINT "github_team_members_cqpk" PRIMARY KEY ("org","team_id","id")
);

-- CreateTable
CREATE TABLE "github_team_repositories" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "team_id" BIGINT NOT NULL,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "owner" JSONB,
    "name" TEXT,
    "full_name" TEXT,
    "description" TEXT,
    "homepage" TEXT,
    "code_of_conduct" JSONB,
    "default_branch" TEXT,
    "master_branch" TEXT,
    "created_at" TIMESTAMP(6),
    "pushed_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "html_url" TEXT,
    "clone_url" TEXT,
    "git_url" TEXT,
    "mirror_url" TEXT,
    "ssh_url" TEXT,
    "svn_url" TEXT,
    "language" TEXT,
    "fork" BOOLEAN,
    "forks_count" BIGINT,
    "network_count" BIGINT,
    "open_issues_count" BIGINT,
    "open_issues" BIGINT,
    "stargazers_count" BIGINT,
    "subscribers_count" BIGINT,
    "watchers_count" BIGINT,
    "watchers" BIGINT,
    "size" BIGINT,
    "auto_init" BOOLEAN,
    "parent" JSONB,
    "source" JSONB,
    "template_repository" JSONB,
    "organization" JSONB,
    "permissions" JSONB,
    "allow_rebase_merge" BOOLEAN,
    "allow_update_branch" BOOLEAN,
    "allow_squash_merge" BOOLEAN,
    "allow_merge_commit" BOOLEAN,
    "allow_auto_merge" BOOLEAN,
    "allow_forking" BOOLEAN,
    "delete_branch_on_merge" BOOLEAN,
    "use_squash_pr_title_as_default" BOOLEAN,
    "squash_merge_commit_title" TEXT,
    "squash_merge_commit_message" TEXT,
    "merge_commit_title" TEXT,
    "merge_commit_message" TEXT,
    "topics" TEXT[],
    "archived" BOOLEAN,
    "disabled" BOOLEAN,
    "license" JSONB,
    "private" BOOLEAN,
    "has_issues" BOOLEAN,
    "has_wiki" BOOLEAN,
    "has_pages" BOOLEAN,
    "has_projects" BOOLEAN,
    "has_downloads" BOOLEAN,
    "has_discussions" BOOLEAN,
    "is_template" BOOLEAN,
    "license_template" TEXT,
    "gitignore_template" TEXT,
    "security_and_analysis" JSONB,
    "url" TEXT,
    "archive_url" TEXT,
    "assignees_url" TEXT,
    "blobs_url" TEXT,
    "branches_url" TEXT,
    "collaborators_url" TEXT,
    "comments_url" TEXT,
    "commits_url" TEXT,
    "compare_url" TEXT,
    "contents_url" TEXT,
    "contributors_url" TEXT,
    "deployments_url" TEXT,
    "downloads_url" TEXT,
    "events_url" TEXT,
    "forks_url" TEXT,
    "git_commits_url" TEXT,
    "git_refs_url" TEXT,
    "git_tags_url" TEXT,
    "hooks_url" TEXT,
    "issue_comment_url" TEXT,
    "issue_events_url" TEXT,
    "issues_url" TEXT,
    "keys_url" TEXT,
    "labels_url" TEXT,
    "languages_url" TEXT,
    "merges_url" TEXT,
    "milestones_url" TEXT,
    "notifications_url" TEXT,
    "pulls_url" TEXT,
    "releases_url" TEXT,
    "stargazers_url" TEXT,
    "statuses_url" TEXT,
    "subscribers_url" TEXT,
    "subscription_url" TEXT,
    "tags_url" TEXT,
    "trees_url" TEXT,
    "teams_url" TEXT,
    "text_matches" JSONB,
    "visibility" TEXT,
    "role_name" TEXT,

    CONSTRAINT "github_team_repositories_cqpk" PRIMARY KEY ("org","team_id","id")
);

-- CreateTable
CREATE TABLE "github_teams" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "name" TEXT,
    "description" TEXT,
    "url" TEXT,
    "slug" TEXT,
    "permission" TEXT,
    "permissions" JSONB,
    "privacy" TEXT,
    "members_count" BIGINT,
    "repos_count" BIGINT,
    "organization" JSONB,
    "html_url" TEXT,
    "members_url" TEXT,
    "repositories_url" TEXT,
    "parent" JSONB,
    "ldap_dn" TEXT,

    CONSTRAINT "github_teams_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_traffic_clones" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "clones" JSONB,
    "count" BIGINT,
    "uniques" BIGINT,

    CONSTRAINT "github_traffic_clones_cqpk" PRIMARY KEY ("org","repository_id")
);

-- CreateTable
CREATE TABLE "github_traffic_paths" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "count" BIGINT,
    "uniques" BIGINT,

    CONSTRAINT "github_traffic_paths_cqpk" PRIMARY KEY ("org","repository_id","path")
);

-- CreateTable
CREATE TABLE "github_traffic_referrers" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "referrer" TEXT NOT NULL,
    "count" BIGINT,
    "uniques" BIGINT,

    CONSTRAINT "github_traffic_referrers_cqpk" PRIMARY KEY ("org","repository_id","referrer")
);

-- CreateTable
CREATE TABLE "github_traffic_views" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "views" JSONB,
    "count" BIGINT,
    "uniques" BIGINT,

    CONSTRAINT "github_traffic_views_cqpk" PRIMARY KEY ("org","repository_id")
);

-- CreateTable
CREATE TABLE "github_workflows" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "org" TEXT NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "contents" TEXT,
    "id" BIGINT NOT NULL,
    "node_id" TEXT,
    "name" TEXT,
    "path" TEXT,
    "state" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "url" TEXT,
    "html_url" TEXT,
    "badge_url" TEXT,

    CONSTRAINT "github_workflows_cqpk" PRIMARY KEY ("org","repository_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aws_accessanalyzer_analyzer_findings__cq_id_key" ON "aws_accessanalyzer_analyzer_findings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_accessanalyzer_analyzers__cq_id_key" ON "aws_accessanalyzer_analyzers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_account_alternate_contacts__cq_id_key" ON "aws_account_alternate_contacts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_account_contacts__cq_id_key" ON "aws_account_contacts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_acm_certificates__cq_id_key" ON "aws_acm_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_acmpca_certificate_authorities__cq_id_key" ON "aws_acmpca_certificate_authorities"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_alpha_cloudwatch_metric_statistics__cq_id_key" ON "aws_alpha_cloudwatch_metric_statistics"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_alpha_cloudwatch_metrics__cq_id_key" ON "aws_alpha_cloudwatch_metrics"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_alpha_costexplorer_cost_custom__cq_id_key" ON "aws_alpha_costexplorer_cost_custom"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_amplify_apps__cq_id_key" ON "aws_amplify_apps"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_api_keys__cq_id_key" ON "aws_apigateway_api_keys"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_client_certificates__cq_id_key" ON "aws_apigateway_client_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_domain_name_base_path_mappings__cq_id_key" ON "aws_apigateway_domain_name_base_path_mappings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_domain_names__cq_id_key" ON "aws_apigateway_domain_names"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_authorizers__cq_id_key" ON "aws_apigateway_rest_api_authorizers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_deployments__cq_id_key" ON "aws_apigateway_rest_api_deployments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_documentation_parts__cq_id_key" ON "aws_apigateway_rest_api_documentation_parts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_documentation_versions__cq_id_key" ON "aws_apigateway_rest_api_documentation_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_gateway_responses__cq_id_key" ON "aws_apigateway_rest_api_gateway_responses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_models__cq_id_key" ON "aws_apigateway_rest_api_models"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_request_validators__cq_id_key" ON "aws_apigateway_rest_api_request_validators"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_resource_method_integrations__cq_id_key" ON "aws_apigateway_rest_api_resource_method_integrations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_resource_methods__cq_id_key" ON "aws_apigateway_rest_api_resource_methods"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_resources__cq_id_key" ON "aws_apigateway_rest_api_resources"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_api_stages__cq_id_key" ON "aws_apigateway_rest_api_stages"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_rest_apis__cq_id_key" ON "aws_apigateway_rest_apis"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_usage_plan_keys__cq_id_key" ON "aws_apigateway_usage_plan_keys"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_usage_plans__cq_id_key" ON "aws_apigateway_usage_plans"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigateway_vpc_links__cq_id_key" ON "aws_apigateway_vpc_links"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_authorizers__cq_id_key" ON "aws_apigatewayv2_api_authorizers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_deployments__cq_id_key" ON "aws_apigatewayv2_api_deployments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_integration_responses__cq_id_key" ON "aws_apigatewayv2_api_integration_responses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_integrations__cq_id_key" ON "aws_apigatewayv2_api_integrations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_models__cq_id_key" ON "aws_apigatewayv2_api_models"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_route_responses__cq_id_key" ON "aws_apigatewayv2_api_route_responses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_routes__cq_id_key" ON "aws_apigatewayv2_api_routes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_api_stages__cq_id_key" ON "aws_apigatewayv2_api_stages"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_apis__cq_id_key" ON "aws_apigatewayv2_apis"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_domain_name_rest_api_mappings__cq_id_key" ON "aws_apigatewayv2_domain_name_rest_api_mappings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_domain_names__cq_id_key" ON "aws_apigatewayv2_domain_names"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apigatewayv2_vpc_links__cq_id_key" ON "aws_apigatewayv2_vpc_links"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appconfig_applications__cq_id_key" ON "aws_appconfig_applications"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appconfig_configuration_profiles__cq_id_key" ON "aws_appconfig_configuration_profiles"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appconfig_deployment_strategies__cq_id_key" ON "aws_appconfig_deployment_strategies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appconfig_environments__cq_id_key" ON "aws_appconfig_environments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appconfig_hosted_configuration_versions__cq_id_key" ON "aws_appconfig_hosted_configuration_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appflow_flows__cq_id_key" ON "aws_appflow_flows"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_applicationautoscaling_policies__cq_id_key" ON "aws_applicationautoscaling_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_applicationautoscaling_scalable_targets__cq_id_key" ON "aws_applicationautoscaling_scalable_targets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_applicationautoscaling_scaling_activities__cq_id_key" ON "aws_applicationautoscaling_scaling_activities"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_applicationautoscaling_scheduled_actions__cq_id_key" ON "aws_applicationautoscaling_scheduled_actions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appmesh_meshes__cq_id_key" ON "aws_appmesh_meshes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appmesh_virtual_gateways__cq_id_key" ON "aws_appmesh_virtual_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appmesh_virtual_nodes__cq_id_key" ON "aws_appmesh_virtual_nodes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appmesh_virtual_routers__cq_id_key" ON "aws_appmesh_virtual_routers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appmesh_virtual_services__cq_id_key" ON "aws_appmesh_virtual_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apprunner_auto_scaling_configurations__cq_id_key" ON "aws_apprunner_auto_scaling_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apprunner_connections__cq_id_key" ON "aws_apprunner_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apprunner_observability_configurations__cq_id_key" ON "aws_apprunner_observability_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apprunner_services__cq_id_key" ON "aws_apprunner_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apprunner_vpc_connectors__cq_id_key" ON "aws_apprunner_vpc_connectors"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_apprunner_vpc_ingress_connections__cq_id_key" ON "aws_apprunner_vpc_ingress_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_app_blocks__cq_id_key" ON "aws_appstream_app_blocks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_application_fleet_associations__cq_id_key" ON "aws_appstream_application_fleet_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_applications__cq_id_key" ON "aws_appstream_applications"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_directory_configs__cq_id_key" ON "aws_appstream_directory_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_fleets__cq_id_key" ON "aws_appstream_fleets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_image_builders__cq_id_key" ON "aws_appstream_image_builders"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_images__cq_id_key" ON "aws_appstream_images"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_stack_entitlements__cq_id_key" ON "aws_appstream_stack_entitlements"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_stack_user_associations__cq_id_key" ON "aws_appstream_stack_user_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_stacks__cq_id_key" ON "aws_appstream_stacks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_usage_report_subscriptions__cq_id_key" ON "aws_appstream_usage_report_subscriptions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appstream_users__cq_id_key" ON "aws_appstream_users"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_appsync_graphql_apis__cq_id_key" ON "aws_appsync_graphql_apis"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_athena_data_catalog_database_tables__cq_id_key" ON "aws_athena_data_catalog_database_tables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_athena_data_catalog_databases__cq_id_key" ON "aws_athena_data_catalog_databases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_athena_data_catalogs__cq_id_key" ON "aws_athena_data_catalogs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_athena_work_groups__cq_id_key" ON "aws_athena_work_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_auditmanager_assessments__cq_id_key" ON "aws_auditmanager_assessments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_autoscaling_group_scaling_policies__cq_id_key" ON "aws_autoscaling_group_scaling_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_autoscaling_groups__cq_id_key" ON "aws_autoscaling_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_autoscaling_launch_configurations__cq_id_key" ON "aws_autoscaling_launch_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_autoscaling_plan_resources__cq_id_key" ON "aws_autoscaling_plan_resources"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_autoscaling_plans__cq_id_key" ON "aws_autoscaling_plans"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_autoscaling_scheduled_actions__cq_id_key" ON "aws_autoscaling_scheduled_actions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_availability_zones__cq_id_key" ON "aws_availability_zones"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_global_settings__cq_id_key" ON "aws_backup_global_settings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_jobs__cq_id_key" ON "aws_backup_jobs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_plans__cq_id_key" ON "aws_backup_plans"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_protected_resources__cq_id_key" ON "aws_backup_protected_resources"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_region_settings__cq_id_key" ON "aws_backup_region_settings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_report_plans__cq_id_key" ON "aws_backup_report_plans"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_vault_recovery_points__cq_id_key" ON "aws_backup_vault_recovery_points"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_backup_vaults__cq_id_key" ON "aws_backup_vaults"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_batch_job_definitions__cq_id_key" ON "aws_batch_job_definitions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_batch_job_queues__cq_id_key" ON "aws_batch_job_queues"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_batch_jobs__cq_id_key" ON "aws_batch_jobs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stack_instance_resource_drifts__cq_id_key" ON "aws_cloudformation_stack_instance_resource_drifts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stack_instance_summaries__cq_id_key" ON "aws_cloudformation_stack_instance_summaries"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stack_set_operations__cq_id_key" ON "aws_cloudformation_stack_set_operations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stack_sets__cq_id_key" ON "aws_cloudformation_stack_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stack_templates__cq_id_key" ON "aws_cloudformation_stack_templates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stacks__cq_id_key" ON "aws_cloudformation_stacks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_template_summaries__cq_id_key" ON "aws_cloudformation_template_summaries"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudfront_cache_policies__cq_id_key" ON "aws_cloudfront_cache_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudfront_distributions__cq_id_key" ON "aws_cloudfront_distributions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudfront_functions__cq_id_key" ON "aws_cloudfront_functions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudfront_origin_access_identities__cq_id_key" ON "aws_cloudfront_origin_access_identities"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudfront_origin_request_policies__cq_id_key" ON "aws_cloudfront_origin_request_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudfront_response_headers_policies__cq_id_key" ON "aws_cloudfront_response_headers_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudhsmv2_backups__cq_id_key" ON "aws_cloudhsmv2_backups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudhsmv2_clusters__cq_id_key" ON "aws_cloudhsmv2_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudtrail_channels__cq_id_key" ON "aws_cloudtrail_channels"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudtrail_imports__cq_id_key" ON "aws_cloudtrail_imports"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudtrail_trails__cq_id_key" ON "aws_cloudtrail_trails"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudwatch_alarms__cq_id_key" ON "aws_cloudwatch_alarms"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudwatchlogs_log_group_data_protection_policie__cq_id_key" ON "aws_cloudwatchlogs_log_group_data_protection_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudwatchlogs_log_group_subscription_filters__cq_id_key" ON "aws_cloudwatchlogs_log_group_subscription_filters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudwatchlogs_log_groups__cq_id_key" ON "aws_cloudwatchlogs_log_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudwatchlogs_metric_filters__cq_id_key" ON "aws_cloudwatchlogs_metric_filters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudwatchlogs_resource_policies__cq_id_key" ON "aws_cloudwatchlogs_resource_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codeartifact_domains__cq_id_key" ON "aws_codeartifact_domains"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codeartifact_repositories__cq_id_key" ON "aws_codeartifact_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codebuild_builds__cq_id_key" ON "aws_codebuild_builds"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codebuild_projects__cq_id_key" ON "aws_codebuild_projects"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codebuild_source_credentials__cq_id_key" ON "aws_codebuild_source_credentials"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codecommit_repositories__cq_id_key" ON "aws_codecommit_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codepipeline_pipelines__cq_id_key" ON "aws_codepipeline_pipelines"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_codepipeline_webhooks__cq_id_key" ON "aws_codepipeline_webhooks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cognito_identity_pools__cq_id_key" ON "aws_cognito_identity_pools"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_cognito_user_pools__cq_id_key" ON "aws_cognito_user_pools"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_computeoptimizer_autoscaling_group_recommendatio__cq_id_key" ON "aws_computeoptimizer_autoscaling_group_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_computeoptimizer_ebs_volume_recommendations__cq_id_key" ON "aws_computeoptimizer_ebs_volume_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_computeoptimizer_ec2_instance_recommendations__cq_id_key" ON "aws_computeoptimizer_ec2_instance_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_computeoptimizer_enrollment_statuses__cq_id_key" ON "aws_computeoptimizer_enrollment_statuses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_computeoptimizer_lambda_function_recommendations__cq_id_key" ON "aws_computeoptimizer_lambda_function_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_config_rules__cq_id_key" ON "aws_config_config_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_configuration_aggregators__cq_id_key" ON "aws_config_configuration_aggregators"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_configuration_recorders__cq_id_key" ON "aws_config_configuration_recorders"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_conformance_packs__cq_id_key" ON "aws_config_conformance_packs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_delivery_channel_statuses__cq_id_key" ON "aws_config_delivery_channel_statuses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_delivery_channels__cq_id_key" ON "aws_config_delivery_channels"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_remediation_configurations__cq_id_key" ON "aws_config_remediation_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_config_retention_configurations__cq_id_key" ON "aws_config_retention_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_costexplorer_cost_30d__cq_id_key" ON "aws_costexplorer_cost_30d"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_costexplorer_cost_forecast_30d__cq_id_key" ON "aws_costexplorer_cost_forecast_30d"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dax_clusters__cq_id_key" ON "aws_dax_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_db_proxies__cq_id_key" ON "aws_db_proxies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_detective_graph_members__cq_id_key" ON "aws_detective_graph_members"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_detective_graphs__cq_id_key" ON "aws_detective_graphs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_directconnect_connections__cq_id_key" ON "aws_directconnect_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_directconnect_gateways__cq_id_key" ON "aws_directconnect_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_directconnect_lags__cq_id_key" ON "aws_directconnect_lags"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_directconnect_locations__cq_id_key" ON "aws_directconnect_locations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_directconnect_virtual_gateways__cq_id_key" ON "aws_directconnect_virtual_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_directconnect_virtual_interfaces__cq_id_key" ON "aws_directconnect_virtual_interfaces"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dms_replication_instances__cq_id_key" ON "aws_dms_replication_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_docdb_certificates__cq_id_key" ON "aws_docdb_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_docdb_cluster_snapshots__cq_id_key" ON "aws_docdb_cluster_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_docdb_clusters__cq_id_key" ON "aws_docdb_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_docdb_global_clusters__cq_id_key" ON "aws_docdb_global_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_docdb_instances__cq_id_key" ON "aws_docdb_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_docdb_subnet_groups__cq_id_key" ON "aws_docdb_subnet_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dynamodb_backups__cq_id_key" ON "aws_dynamodb_backups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dynamodb_exports__cq_id_key" ON "aws_dynamodb_exports"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dynamodb_global_tables__cq_id_key" ON "aws_dynamodb_global_tables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dynamodb_table_continuous_backups__cq_id_key" ON "aws_dynamodb_table_continuous_backups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dynamodb_tables__cq_id_key" ON "aws_dynamodb_tables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_dynamodbstreams_streams__cq_id_key" ON "aws_dynamodbstreams_streams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_account_attributes__cq_id_key" ON "aws_ec2_account_attributes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_byoip_cidrs__cq_id_key" ON "aws_ec2_byoip_cidrs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_capacity_reservations__cq_id_key" ON "aws_ec2_capacity_reservations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_customer_gateways__cq_id_key" ON "aws_ec2_customer_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_dhcp_options__cq_id_key" ON "aws_ec2_dhcp_options"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_ebs_snapshot_attributes__cq_id_key" ON "aws_ec2_ebs_snapshot_attributes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_ebs_snapshots__cq_id_key" ON "aws_ec2_ebs_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_ebs_volume_statuses__cq_id_key" ON "aws_ec2_ebs_volume_statuses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_ebs_volumes__cq_id_key" ON "aws_ec2_ebs_volumes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_egress_only_internet_gateways__cq_id_key" ON "aws_ec2_egress_only_internet_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_eips__cq_id_key" ON "aws_ec2_eips"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_flow_logs__cq_id_key" ON "aws_ec2_flow_logs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_hosts__cq_id_key" ON "aws_ec2_hosts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_image_last_launched_times__cq_id_key" ON "aws_ec2_image_last_launched_times"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_images__cq_id_key" ON "aws_ec2_images"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_instance_connect_endpoints__cq_id_key" ON "aws_ec2_instance_connect_endpoints"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_instance_statuses__cq_id_key" ON "aws_ec2_instance_statuses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_instances__cq_id_key" ON "aws_ec2_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_internet_gateways__cq_id_key" ON "aws_ec2_internet_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_key_pairs__cq_id_key" ON "aws_ec2_key_pairs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_launch_template_versions__cq_id_key" ON "aws_ec2_launch_template_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_launch_templates__cq_id_key" ON "aws_ec2_launch_templates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_managed_prefix_lists__cq_id_key" ON "aws_ec2_managed_prefix_lists"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_nat_gateways__cq_id_key" ON "aws_ec2_nat_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_network_acls__cq_id_key" ON "aws_ec2_network_acls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_network_interfaces__cq_id_key" ON "aws_ec2_network_interfaces"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_regional_configs__cq_id_key" ON "aws_ec2_regional_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_reserved_instances__cq_id_key" ON "aws_ec2_reserved_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_route_tables__cq_id_key" ON "aws_ec2_route_tables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_security_groups__cq_id_key" ON "aws_ec2_security_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_spot_fleet_instances__cq_id_key" ON "aws_ec2_spot_fleet_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_spot_fleet_requests__cq_id_key" ON "aws_ec2_spot_fleet_requests"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_spot_instance_requests__cq_id_key" ON "aws_ec2_spot_instance_requests"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_subnets__cq_id_key" ON "aws_ec2_subnets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_transit_gateways__cq_id_key" ON "aws_ec2_transit_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpc_endpoint_service_configurations__cq_id_key" ON "aws_ec2_vpc_endpoint_service_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpc_endpoints__cq_id_key" ON "aws_ec2_vpc_endpoints"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpc_peering_connections__cq_id_key" ON "aws_ec2_vpc_peering_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpcs__cq_id_key" ON "aws_ec2_vpcs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpn_connections__cq_id_key" ON "aws_ec2_vpn_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpn_gateways__cq_id_key" ON "aws_ec2_vpn_gateways"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecr_pull_through_cache_rules__cq_id_key" ON "aws_ecr_pull_through_cache_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecr_registries__cq_id_key" ON "aws_ecr_registries"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecr_registry_policies__cq_id_key" ON "aws_ecr_registry_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecr_repositories__cq_id_key" ON "aws_ecr_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecr_repository_images__cq_id_key" ON "aws_ecr_repository_images"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecr_repository_lifecycle_policies__cq_id_key" ON "aws_ecr_repository_lifecycle_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecrpublic_repositories__cq_id_key" ON "aws_ecrpublic_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecrpublic_repository_images__cq_id_key" ON "aws_ecrpublic_repository_images"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecs_cluster_services__cq_id_key" ON "aws_ecs_cluster_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecs_cluster_task_sets__cq_id_key" ON "aws_ecs_cluster_task_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecs_cluster_tasks__cq_id_key" ON "aws_ecs_cluster_tasks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecs_clusters__cq_id_key" ON "aws_ecs_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ecs_task_definitions__cq_id_key" ON "aws_ecs_task_definitions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_efs_access_points__cq_id_key" ON "aws_efs_access_points"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_efs_filesystems__cq_id_key" ON "aws_efs_filesystems"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eks_cluster_addons__cq_id_key" ON "aws_eks_cluster_addons"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eks_cluster_node_groups__cq_id_key" ON "aws_eks_cluster_node_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eks_cluster_oidc_identity_provider_configs__cq_id_key" ON "aws_eks_cluster_oidc_identity_provider_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eks_clusters__cq_id_key" ON "aws_eks_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eks_fargate_profiles__cq_id_key" ON "aws_eks_fargate_profiles"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_clusters__cq_id_key" ON "aws_elasticache_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_events__cq_id_key" ON "aws_elasticache_events"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_global_replication_groups__cq_id_key" ON "aws_elasticache_global_replication_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_replication_groups__cq_id_key" ON "aws_elasticache_replication_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_reserved_cache_nodes__cq_id_key" ON "aws_elasticache_reserved_cache_nodes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_snapshots__cq_id_key" ON "aws_elasticache_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_subnet_groups__cq_id_key" ON "aws_elasticache_subnet_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_user_groups__cq_id_key" ON "aws_elasticache_user_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticache_users__cq_id_key" ON "aws_elasticache_users"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticbeanstalk_application_versions__cq_id_key" ON "aws_elasticbeanstalk_application_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticbeanstalk_applications__cq_id_key" ON "aws_elasticbeanstalk_applications"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticbeanstalk_environments__cq_id_key" ON "aws_elasticbeanstalk_environments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticsearch_domains__cq_id_key" ON "aws_elasticsearch_domains"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticsearch_packages__cq_id_key" ON "aws_elasticsearch_packages"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticsearch_versions__cq_id_key" ON "aws_elasticsearch_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elasticsearch_vpc_endpoints__cq_id_key" ON "aws_elasticsearch_vpc_endpoints"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elastictranscoder_pipeline_jobs__cq_id_key" ON "aws_elastictranscoder_pipeline_jobs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elastictranscoder_pipelines__cq_id_key" ON "aws_elastictranscoder_pipelines"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elastictranscoder_presets__cq_id_key" ON "aws_elastictranscoder_presets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elbv1_load_balancers__cq_id_key" ON "aws_elbv1_load_balancers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elbv2_listener_rules__cq_id_key" ON "aws_elbv2_listener_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elbv2_listeners__cq_id_key" ON "aws_elbv2_listeners"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elbv2_load_balancer_web_acls__cq_id_key" ON "aws_elbv2_load_balancer_web_acls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elbv2_load_balancers__cq_id_key" ON "aws_elbv2_load_balancers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_elbv2_target_groups__cq_id_key" ON "aws_elbv2_target_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_block_public_access_configs__cq_id_key" ON "aws_emr_block_public_access_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_cluster_instance_fleets__cq_id_key" ON "aws_emr_cluster_instance_fleets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_cluster_instance_groups__cq_id_key" ON "aws_emr_cluster_instance_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_cluster_instances__cq_id_key" ON "aws_emr_cluster_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_clusters__cq_id_key" ON "aws_emr_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_notebook_executions__cq_id_key" ON "aws_emr_notebook_executions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_release_labels__cq_id_key" ON "aws_emr_release_labels"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_security_configurations__cq_id_key" ON "aws_emr_security_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_steps__cq_id_key" ON "aws_emr_steps"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_studio_session_mappings__cq_id_key" ON "aws_emr_studio_session_mappings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_studios__cq_id_key" ON "aws_emr_studios"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_emr_supported_instance_types__cq_id_key" ON "aws_emr_supported_instance_types"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_api_destinations__cq_id_key" ON "aws_eventbridge_api_destinations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_archives__cq_id_key" ON "aws_eventbridge_archives"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_connections__cq_id_key" ON "aws_eventbridge_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_endpoints__cq_id_key" ON "aws_eventbridge_endpoints"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_event_bus_rules__cq_id_key" ON "aws_eventbridge_event_bus_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_event_bus_targets__cq_id_key" ON "aws_eventbridge_event_bus_targets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_event_buses__cq_id_key" ON "aws_eventbridge_event_buses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_event_sources__cq_id_key" ON "aws_eventbridge_event_sources"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_eventbridge_replays__cq_id_key" ON "aws_eventbridge_replays"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_firehose_delivery_streams__cq_id_key" ON "aws_firehose_delivery_streams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_batch_imports__cq_id_key" ON "aws_frauddetector_batch_imports"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_batch_predictions__cq_id_key" ON "aws_frauddetector_batch_predictions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_detectors__cq_id_key" ON "aws_frauddetector_detectors"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_entity_types__cq_id_key" ON "aws_frauddetector_entity_types"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_event_types__cq_id_key" ON "aws_frauddetector_event_types"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_external_models__cq_id_key" ON "aws_frauddetector_external_models"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_labels__cq_id_key" ON "aws_frauddetector_labels"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_model_versions__cq_id_key" ON "aws_frauddetector_model_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_models__cq_id_key" ON "aws_frauddetector_models"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_outcomes__cq_id_key" ON "aws_frauddetector_outcomes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_rules__cq_id_key" ON "aws_frauddetector_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_frauddetector_variables__cq_id_key" ON "aws_frauddetector_variables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_backups__cq_id_key" ON "aws_fsx_backups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_data_repository_associations__cq_id_key" ON "aws_fsx_data_repository_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_data_repository_tasks__cq_id_key" ON "aws_fsx_data_repository_tasks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_file_caches__cq_id_key" ON "aws_fsx_file_caches"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_file_systems__cq_id_key" ON "aws_fsx_file_systems"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_snapshots__cq_id_key" ON "aws_fsx_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_storage_virtual_machines__cq_id_key" ON "aws_fsx_storage_virtual_machines"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_fsx_volumes__cq_id_key" ON "aws_fsx_volumes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glacier_data_retrieval_policies__cq_id_key" ON "aws_glacier_data_retrieval_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glacier_vault_access_policies__cq_id_key" ON "aws_glacier_vault_access_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glacier_vault_lock_policies__cq_id_key" ON "aws_glacier_vault_lock_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glacier_vault_notifications__cq_id_key" ON "aws_glacier_vault_notifications"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glacier_vaults__cq_id_key" ON "aws_glacier_vaults"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_classifiers__cq_id_key" ON "aws_glue_classifiers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_crawlers__cq_id_key" ON "aws_glue_crawlers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_database_table_indexes__cq_id_key" ON "aws_glue_database_table_indexes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_database_tables__cq_id_key" ON "aws_glue_database_tables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_databases__cq_id_key" ON "aws_glue_databases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_datacatalog_encryption_settings__cq_id_key" ON "aws_glue_datacatalog_encryption_settings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_dev_endpoints__cq_id_key" ON "aws_glue_dev_endpoints"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_jobs__cq_id_key" ON "aws_glue_jobs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_ml_transforms__cq_id_key" ON "aws_glue_ml_transforms"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_registries__cq_id_key" ON "aws_glue_registries"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_registry_schemas__cq_id_key" ON "aws_glue_registry_schemas"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_security_configurations__cq_id_key" ON "aws_glue_security_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_triggers__cq_id_key" ON "aws_glue_triggers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_glue_workflows__cq_id_key" ON "aws_glue_workflows"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_guardduty_detector_filters__cq_id_key" ON "aws_guardduty_detector_filters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_guardduty_detector_findings__cq_id_key" ON "aws_guardduty_detector_findings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_guardduty_detector_intel_sets__cq_id_key" ON "aws_guardduty_detector_intel_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_guardduty_detector_ip_sets__cq_id_key" ON "aws_guardduty_detector_ip_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_guardduty_detector_publishing_destinations__cq_id_key" ON "aws_guardduty_detector_publishing_destinations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_guardduty_detectors__cq_id_key" ON "aws_guardduty_detectors"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_accounts__cq_id_key" ON "aws_iam_accounts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_credential_reports__cq_id_key" ON "aws_iam_credential_reports"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_group_attached_policies__cq_id_key" ON "aws_iam_group_attached_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_group_last_accessed_details__cq_id_key" ON "aws_iam_group_last_accessed_details"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_group_policies__cq_id_key" ON "aws_iam_group_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_groups__cq_id_key" ON "aws_iam_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_instance_profiles__cq_id_key" ON "aws_iam_instance_profiles"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_openid_connect_identity_providers__cq_id_key" ON "aws_iam_openid_connect_identity_providers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_password_policies__cq_id_key" ON "aws_iam_password_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_policies__cq_id_key" ON "aws_iam_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_policy_last_accessed_details__cq_id_key" ON "aws_iam_policy_last_accessed_details"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_role_attached_policies__cq_id_key" ON "aws_iam_role_attached_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_role_last_accessed_details__cq_id_key" ON "aws_iam_role_last_accessed_details"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_role_policies__cq_id_key" ON "aws_iam_role_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_roles__cq_id_key" ON "aws_iam_roles"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_saml_identity_providers__cq_id_key" ON "aws_iam_saml_identity_providers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_server_certificates__cq_id_key" ON "aws_iam_server_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_signing_certificates__cq_id_key" ON "aws_iam_signing_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_ssh_public_keys__cq_id_key" ON "aws_iam_ssh_public_keys"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_user_access_keys__cq_id_key" ON "aws_iam_user_access_keys"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_user_attached_policies__cq_id_key" ON "aws_iam_user_attached_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_user_groups__cq_id_key" ON "aws_iam_user_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_user_last_accessed_details__cq_id_key" ON "aws_iam_user_last_accessed_details"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_user_policies__cq_id_key" ON "aws_iam_user_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_users__cq_id_key" ON "aws_iam_users"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iam_virtual_mfa_devices__cq_id_key" ON "aws_iam_virtual_mfa_devices"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_inspector2_findings__cq_id_key" ON "aws_inspector2_findings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_inspector_findings__cq_id_key" ON "aws_inspector_findings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_billing_groups__cq_id_key" ON "aws_iot_billing_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_ca_certificates__cq_id_key" ON "aws_iot_ca_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_certificates__cq_id_key" ON "aws_iot_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_jobs__cq_id_key" ON "aws_iot_jobs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_policies__cq_id_key" ON "aws_iot_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_security_profiles__cq_id_key" ON "aws_iot_security_profiles"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_streams__cq_id_key" ON "aws_iot_streams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_thing_groups__cq_id_key" ON "aws_iot_thing_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_thing_types__cq_id_key" ON "aws_iot_thing_types"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_things__cq_id_key" ON "aws_iot_things"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_iot_topic_rules__cq_id_key" ON "aws_iot_topic_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kafka_cluster_operations__cq_id_key" ON "aws_kafka_cluster_operations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kafka_clusters__cq_id_key" ON "aws_kafka_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kafka_configurations__cq_id_key" ON "aws_kafka_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kafka_nodes__cq_id_key" ON "aws_kafka_nodes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kinesis_streams__cq_id_key" ON "aws_kinesis_streams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kms_aliases__cq_id_key" ON "aws_kms_aliases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kms_key_grants__cq_id_key" ON "aws_kms_key_grants"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kms_key_policies__cq_id_key" ON "aws_kms_key_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_kms_keys__cq_id_key" ON "aws_kms_keys"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_function_aliases__cq_id_key" ON "aws_lambda_function_aliases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_function_versions__cq_id_key" ON "aws_lambda_function_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_functions__cq_id_key" ON "aws_lambda_functions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_layer_versions__cq_id_key" ON "aws_lambda_layer_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_layers__cq_id_key" ON "aws_lambda_layers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_runtimes__cq_id_key" ON "aws_lambda_runtimes"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_alarms__cq_id_key" ON "aws_lightsail_alarms"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_buckets__cq_id_key" ON "aws_lightsail_buckets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_certificates__cq_id_key" ON "aws_lightsail_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_container_services__cq_id_key" ON "aws_lightsail_container_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_database_snapshots__cq_id_key" ON "aws_lightsail_database_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_databases__cq_id_key" ON "aws_lightsail_databases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_disk_snapshots__cq_id_key" ON "aws_lightsail_disk_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_disks__cq_id_key" ON "aws_lightsail_disks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_distributions__cq_id_key" ON "aws_lightsail_distributions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_instance_snapshots__cq_id_key" ON "aws_lightsail_instance_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_instances__cq_id_key" ON "aws_lightsail_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_load_balancer_tls_certificates__cq_id_key" ON "aws_lightsail_load_balancer_tls_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_load_balancers__cq_id_key" ON "aws_lightsail_load_balancers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lightsail_static_ips__cq_id_key" ON "aws_lightsail_static_ips"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_mq_broker_configurations__cq_id_key" ON "aws_mq_broker_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_mq_brokers__cq_id_key" ON "aws_mq_brokers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_mwaa_environments__cq_id_key" ON "aws_mwaa_environments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_neptune_cluster_snapshots__cq_id_key" ON "aws_neptune_cluster_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_neptune_clusters__cq_id_key" ON "aws_neptune_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_neptune_event_subscriptions__cq_id_key" ON "aws_neptune_event_subscriptions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_neptune_global_clusters__cq_id_key" ON "aws_neptune_global_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_neptune_instances__cq_id_key" ON "aws_neptune_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_neptune_subnet_groups__cq_id_key" ON "aws_neptune_subnet_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkfirewall_firewall_policies__cq_id_key" ON "aws_networkfirewall_firewall_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkfirewall_firewalls__cq_id_key" ON "aws_networkfirewall_firewalls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkfirewall_rule_groups__cq_id_key" ON "aws_networkfirewall_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkfirewall_tls_inspection_configurations__cq_id_key" ON "aws_networkfirewall_tls_inspection_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkmanager_global_networks__cq_id_key" ON "aws_networkmanager_global_networks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkmanager_links__cq_id_key" ON "aws_networkmanager_links"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkmanager_sites__cq_id_key" ON "aws_networkmanager_sites"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_networkmanager_transit_gateway_registrations__cq_id_key" ON "aws_networkmanager_transit_gateway_registrations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organization_resource_policies__cq_id_key" ON "aws_organization_resource_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations__cq_id_key" ON "aws_organizations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_account_parents__cq_id_key" ON "aws_organizations_account_parents"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_accounts__cq_id_key" ON "aws_organizations_accounts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_delegated_administrators__cq_id_key" ON "aws_organizations_delegated_administrators"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_delegated_services__cq_id_key" ON "aws_organizations_delegated_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_organizational_unit_parents__cq_id_key" ON "aws_organizations_organizational_unit_parents"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_organizational_units__cq_id_key" ON "aws_organizations_organizational_units"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_policies__cq_id_key" ON "aws_organizations_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_roots__cq_id_key" ON "aws_organizations_roots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_qldb_ledger_journal_kinesis_streams__cq_id_key" ON "aws_qldb_ledger_journal_kinesis_streams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_qldb_ledgers__cq_id_key" ON "aws_qldb_ledgers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_principals__cq_id_key" ON "aws_ram_principals"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_resource_share_associations__cq_id_key" ON "aws_ram_resource_share_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_resource_share_invitations__cq_id_key" ON "aws_ram_resource_share_invitations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_resource_share_permissions__cq_id_key" ON "aws_ram_resource_share_permissions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_resource_shares__cq_id_key" ON "aws_ram_resource_shares"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_resource_types__cq_id_key" ON "aws_ram_resource_types"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ram_resources__cq_id_key" ON "aws_ram_resources"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_certificates__cq_id_key" ON "aws_rds_certificates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_cluster_backtracks__cq_id_key" ON "aws_rds_cluster_backtracks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_cluster_snapshots__cq_id_key" ON "aws_rds_cluster_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_clusters__cq_id_key" ON "aws_rds_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_db_security_groups__cq_id_key" ON "aws_rds_db_security_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_db_snapshots__cq_id_key" ON "aws_rds_db_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_event_subscriptions__cq_id_key" ON "aws_rds_event_subscriptions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_instances__cq_id_key" ON "aws_rds_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_option_groups__cq_id_key" ON "aws_rds_option_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_reserved_instances__cq_id_key" ON "aws_rds_reserved_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_rds_subnet_groups__cq_id_key" ON "aws_rds_subnet_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_redshift_cluster_parameter_groups__cq_id_key" ON "aws_redshift_cluster_parameter_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_redshift_cluster_parameters__cq_id_key" ON "aws_redshift_cluster_parameters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_redshift_clusters__cq_id_key" ON "aws_redshift_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_redshift_event_subscriptions__cq_id_key" ON "aws_redshift_event_subscriptions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_redshift_snapshots__cq_id_key" ON "aws_redshift_snapshots"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_redshift_subnet_groups__cq_id_key" ON "aws_redshift_subnet_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_regions__cq_id_key" ON "aws_regions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_alarm_recommendations__cq_id_key" ON "aws_resiliencehub_alarm_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_app_assessments__cq_id_key" ON "aws_resiliencehub_app_assessments"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_app_component_compliances__cq_id_key" ON "aws_resiliencehub_app_component_compliances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_app_version_resource_mappings__cq_id_key" ON "aws_resiliencehub_app_version_resource_mappings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_app_version_resources__cq_id_key" ON "aws_resiliencehub_app_version_resources"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_app_versions__cq_id_key" ON "aws_resiliencehub_app_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_apps__cq_id_key" ON "aws_resiliencehub_apps"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_component_recommendations__cq_id_key" ON "aws_resiliencehub_component_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_recommendation_templates__cq_id_key" ON "aws_resiliencehub_recommendation_templates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_resiliency_policies__cq_id_key" ON "aws_resiliencehub_resiliency_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_sop_recommendations__cq_id_key" ON "aws_resiliencehub_sop_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_suggested_resiliency_policies__cq_id_key" ON "aws_resiliencehub_suggested_resiliency_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resiliencehub_test_recommendations__cq_id_key" ON "aws_resiliencehub_test_recommendations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_resourcegroups_resource_groups__cq_id_key" ON "aws_resourcegroups_resource_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_delegation_sets__cq_id_key" ON "aws_route53_delegation_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_domains__cq_id_key" ON "aws_route53_domains"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_health_checks__cq_id_key" ON "aws_route53_health_checks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_hosted_zone_query_logging_configs__cq_id_key" ON "aws_route53_hosted_zone_query_logging_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_hosted_zone_traffic_policy_instances__cq_id_key" ON "aws_route53_hosted_zone_traffic_policy_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_hosted_zones__cq_id_key" ON "aws_route53_hosted_zones"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_operations__cq_id_key" ON "aws_route53_operations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_traffic_policies__cq_id_key" ON "aws_route53_traffic_policies"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53_traffic_policy_versions__cq_id_key" ON "aws_route53_traffic_policy_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoverycontrolconfig_clusters__cq_id_key" ON "aws_route53recoverycontrolconfig_clusters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoverycontrolconfig_control_panels__cq_id_key" ON "aws_route53recoverycontrolconfig_control_panels"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoverycontrolconfig_routing_controls__cq_id_key" ON "aws_route53recoverycontrolconfig_routing_controls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoverycontrolconfig_safety_rules__cq_id_key" ON "aws_route53recoverycontrolconfig_safety_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoveryreadiness_cells__cq_id_key" ON "aws_route53recoveryreadiness_cells"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoveryreadiness_readiness_checks__cq_id_key" ON "aws_route53recoveryreadiness_readiness_checks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoveryreadiness_recovery_groups__cq_id_key" ON "aws_route53recoveryreadiness_recovery_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53recoveryreadiness_resource_sets__cq_id_key" ON "aws_route53recoveryreadiness_resource_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_firewall_configs__cq_id_key" ON "aws_route53resolver_firewall_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_firewall_domain_lists__cq_id_key" ON "aws_route53resolver_firewall_domain_lists"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_firewall_rule_group_associations__cq_id_key" ON "aws_route53resolver_firewall_rule_group_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_firewall_rule_groups__cq_id_key" ON "aws_route53resolver_firewall_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_resolver_endpoints__cq_id_key" ON "aws_route53resolver_resolver_endpoints"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_resolver_query_log_config_associ__cq_id_key" ON "aws_route53resolver_resolver_query_log_config_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_resolver_query_log_configs__cq_id_key" ON "aws_route53resolver_resolver_query_log_configs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_resolver_rule_associations__cq_id_key" ON "aws_route53resolver_resolver_rule_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_route53resolver_resolver_rules__cq_id_key" ON "aws_route53resolver_resolver_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_access_points__cq_id_key" ON "aws_s3_access_points"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_accounts__cq_id_key" ON "aws_s3_accounts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_bucket_encryption_rules__cq_id_key" ON "aws_s3_bucket_encryption_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_bucket_grants__cq_id_key" ON "aws_s3_bucket_grants"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_buckets__cq_id_key" ON "aws_s3_buckets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_multi_region_access_points__cq_id_key" ON "aws_s3_multi_region_access_points"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sagemaker_apps__cq_id_key" ON "aws_sagemaker_apps"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sagemaker_endpoint_configurations__cq_id_key" ON "aws_sagemaker_endpoint_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sagemaker_models__cq_id_key" ON "aws_sagemaker_models"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sagemaker_notebook_instances__cq_id_key" ON "aws_sagemaker_notebook_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sagemaker_training_jobs__cq_id_key" ON "aws_sagemaker_training_jobs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_savingsplans_plans__cq_id_key" ON "aws_savingsplans_plans"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_scheduler_schedule_groups__cq_id_key" ON "aws_scheduler_schedule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_scheduler_schedules__cq_id_key" ON "aws_scheduler_schedules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_secretsmanager_secret_versions__cq_id_key" ON "aws_secretsmanager_secret_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_secretsmanager_secrets__cq_id_key" ON "aws_secretsmanager_secrets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_securityhub_enabled_standards__cq_id_key" ON "aws_securityhub_enabled_standards"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_securityhub_findings__cq_id_key" ON "aws_securityhub_findings"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_securityhub_hubs__cq_id_key" ON "aws_securityhub_hubs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicecatalog_launch_paths__cq_id_key" ON "aws_servicecatalog_launch_paths"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicecatalog_portfolios__cq_id_key" ON "aws_servicecatalog_portfolios"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicecatalog_products__cq_id_key" ON "aws_servicecatalog_products"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicecatalog_provisioned_products__cq_id_key" ON "aws_servicecatalog_provisioned_products"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicecatalog_provisioning_artifacts__cq_id_key" ON "aws_servicecatalog_provisioning_artifacts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicecatalog_provisioning_parameters__cq_id_key" ON "aws_servicecatalog_provisioning_parameters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicediscovery_instances__cq_id_key" ON "aws_servicediscovery_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicediscovery_namespaces__cq_id_key" ON "aws_servicediscovery_namespaces"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_servicediscovery_services__cq_id_key" ON "aws_servicediscovery_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_active_receipt_rule_sets__cq_id_key" ON "aws_ses_active_receipt_rule_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_configuration_set_event_destinations__cq_id_key" ON "aws_ses_configuration_set_event_destinations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_configuration_sets__cq_id_key" ON "aws_ses_configuration_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_contact_lists__cq_id_key" ON "aws_ses_contact_lists"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_custom_verification_email_templates__cq_id_key" ON "aws_ses_custom_verification_email_templates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_identities__cq_id_key" ON "aws_ses_identities"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ses_templates__cq_id_key" ON "aws_ses_templates"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_shield_attacks__cq_id_key" ON "aws_shield_attacks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_shield_protection_groups__cq_id_key" ON "aws_shield_protection_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_shield_protections__cq_id_key" ON "aws_shield_protections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_shield_subscriptions__cq_id_key" ON "aws_shield_subscriptions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_signer_signing_profiles__cq_id_key" ON "aws_signer_signing_profiles"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sns_subscriptions__cq_id_key" ON "aws_sns_subscriptions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sns_topics__cq_id_key" ON "aws_sns_topics"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_sqs_queues__cq_id_key" ON "aws_sqs_queues"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_associations__cq_id_key" ON "aws_ssm_associations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_compliance_summary_items__cq_id_key" ON "aws_ssm_compliance_summary_items"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_document_versions__cq_id_key" ON "aws_ssm_document_versions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_documents__cq_id_key" ON "aws_ssm_documents"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_instance_compliance_items__cq_id_key" ON "aws_ssm_instance_compliance_items"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_instance_patches__cq_id_key" ON "aws_ssm_instance_patches"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_instances__cq_id_key" ON "aws_ssm_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_inventories__cq_id_key" ON "aws_ssm_inventories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_inventory_schemas__cq_id_key" ON "aws_ssm_inventory_schemas"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_parameters__cq_id_key" ON "aws_ssm_parameters"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_patch_baselines__cq_id_key" ON "aws_ssm_patch_baselines"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ssm_sessions__cq_id_key" ON "aws_ssm_sessions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_stepfunctions_activities__cq_id_key" ON "aws_stepfunctions_activities"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_stepfunctions_executions__cq_id_key" ON "aws_stepfunctions_executions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_stepfunctions_map_run_executions__cq_id_key" ON "aws_stepfunctions_map_run_executions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_stepfunctions_map_runs__cq_id_key" ON "aws_stepfunctions_map_runs"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_stepfunctions_state_machines__cq_id_key" ON "aws_stepfunctions_state_machines"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_support_cases__cq_id_key" ON "aws_support_cases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_support_services__cq_id_key" ON "aws_support_services"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_support_severity_levels__cq_id_key" ON "aws_support_severity_levels"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_support_trusted_advisor_check_results__cq_id_key" ON "aws_support_trusted_advisor_check_results"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_support_trusted_advisor_check_summaries__cq_id_key" ON "aws_support_trusted_advisor_check_summaries"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_support_trusted_advisor_checks__cq_id_key" ON "aws_support_trusted_advisor_checks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_timestream_databases__cq_id_key" ON "aws_timestream_databases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_timestream_tables__cq_id_key" ON "aws_timestream_tables"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_transfer_servers__cq_id_key" ON "aws_transfer_servers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_waf_rule_groups__cq_id_key" ON "aws_waf_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_waf_rules__cq_id_key" ON "aws_waf_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_waf_subscribed_rule_groups__cq_id_key" ON "aws_waf_subscribed_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_waf_web_acls__cq_id_key" ON "aws_waf_web_acls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafregional_rate_based_rules__cq_id_key" ON "aws_wafregional_rate_based_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafregional_rule_groups__cq_id_key" ON "aws_wafregional_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafregional_rules__cq_id_key" ON "aws_wafregional_rules"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafregional_web_acls__cq_id_key" ON "aws_wafregional_web_acls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafv2_ipsets__cq_id_key" ON "aws_wafv2_ipsets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafv2_managed_rule_groups__cq_id_key" ON "aws_wafv2_managed_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafv2_regex_pattern_sets__cq_id_key" ON "aws_wafv2_regex_pattern_sets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafv2_rule_groups__cq_id_key" ON "aws_wafv2_rule_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wafv2_web_acls__cq_id_key" ON "aws_wafv2_web_acls"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_lens_review_improvements__cq_id_key" ON "aws_wellarchitected_lens_review_improvements"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_lens_reviews__cq_id_key" ON "aws_wellarchitected_lens_reviews"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_lenses__cq_id_key" ON "aws_wellarchitected_lenses"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_share_invitations__cq_id_key" ON "aws_wellarchitected_share_invitations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_workload_milestones__cq_id_key" ON "aws_wellarchitected_workload_milestones"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_workload_shares__cq_id_key" ON "aws_wellarchitected_workload_shares"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_wellarchitected_workloads__cq_id_key" ON "aws_wellarchitected_workloads"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_workspaces_directories__cq_id_key" ON "aws_workspaces_directories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_workspaces_workspaces__cq_id_key" ON "aws_workspaces_workspaces"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_billing_action__cq_id_key" ON "github_billing_action"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_billing_package__cq_id_key" ON "github_billing_package"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_billing_storage__cq_id_key" ON "github_billing_storage"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_external_groups__cq_id_key" ON "github_external_groups"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_hook_deliveries__cq_id_key" ON "github_hook_deliveries"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_hooks__cq_id_key" ON "github_hooks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_installations__cq_id_key" ON "github_installations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_issues__cq_id_key" ON "github_issues"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_organization_dependabot_alerts__cq_id_key" ON "github_organization_dependabot_alerts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_organization_dependabot_secrets__cq_id_key" ON "github_organization_dependabot_secrets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_organization_members__cq_id_key" ON "github_organization_members"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_organizations__cq_id_key" ON "github_organizations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_release_assets__cq_id_key" ON "github_release_assets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_releases__cq_id_key" ON "github_releases"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories__cq_id_key" ON "github_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_branches__cq_id_key" ON "github_repository_branches"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_dependabot_alerts__cq_id_key" ON "github_repository_dependabot_alerts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_dependabot_secrets__cq_id_key" ON "github_repository_dependabot_secrets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_keys__cq_id_key" ON "github_repository_keys"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_team_members__cq_id_key" ON "github_team_members"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_team_repositories__cq_id_key" ON "github_team_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_teams__cq_id_key" ON "github_teams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_traffic_clones__cq_id_key" ON "github_traffic_clones"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_traffic_paths__cq_id_key" ON "github_traffic_paths"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_traffic_referrers__cq_id_key" ON "github_traffic_referrers"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_traffic_views__cq_id_key" ON "github_traffic_views"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_workflows__cq_id_key" ON "github_workflows"("_cq_id");

