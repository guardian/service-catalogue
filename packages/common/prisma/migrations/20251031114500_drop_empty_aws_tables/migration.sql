begin transaction;
    delete from cloudquery_table_frequency where table_name = 'aws_accessanalyzer_analyzer_archive_rules';
    drop table if exists aws_accessanalyzer_analyzer_archive_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_acmpca_certificate_authorities';
    drop table if exists aws_acmpca_certificate_authorities;

    delete from cloudquery_table_frequency where table_name = 'aws_apigatewayv2_api_integration_responses';
    drop table if exists aws_apigatewayv2_api_integration_responses;

    delete from cloudquery_table_frequency where table_name = 'aws_apigatewayv2_api_models';
    drop table if exists aws_apigatewayv2_api_models;

    delete from cloudquery_table_frequency where table_name = 'aws_apigatewayv2_api_route_responses';
    drop table if exists aws_apigatewayv2_api_route_responses;

    delete from cloudquery_table_frequency where table_name = 'aws_appconfig_applications';
    drop table if exists aws_appconfig_applications;

    delete from cloudquery_table_frequency where table_name = 'aws_appconfig_configuration_profiles';
    drop table if exists aws_appconfig_configuration_profiles;

    delete from cloudquery_table_frequency where table_name = 'aws_appconfig_environments';
    drop table if exists aws_appconfig_environments;

    delete from cloudquery_table_frequency where table_name = 'aws_appconfig_hosted_configuration_versions';
    drop table if exists aws_appconfig_hosted_configuration_versions;

    delete from cloudquery_table_frequency where table_name = 'aws_applicationautoscaling_scheduled_actions';
    drop table if exists aws_applicationautoscaling_scheduled_actions;

    delete from cloudquery_table_frequency where table_name = 'aws_appmesh_meshes';
    drop table if exists aws_appmesh_meshes;

    delete from cloudquery_table_frequency where table_name = 'aws_appmesh_virtual_gateways';
    drop table if exists aws_appmesh_virtual_gateways;

    delete from cloudquery_table_frequency where table_name = 'aws_appmesh_virtual_nodes';
    drop table if exists aws_appmesh_virtual_nodes;

    delete from cloudquery_table_frequency where table_name = 'aws_appmesh_virtual_routers';
    drop table if exists aws_appmesh_virtual_routers;

    delete from cloudquery_table_frequency where table_name = 'aws_appmesh_virtual_services';
    drop table if exists aws_appmesh_virtual_services;

    delete from cloudquery_table_frequency where table_name = 'aws_apprunner_connections';
    drop table if exists aws_apprunner_connections;

    delete from cloudquery_table_frequency where table_name = 'aws_apprunner_custom_domains';
    drop table if exists aws_apprunner_custom_domains;

    delete from cloudquery_table_frequency where table_name = 'aws_apprunner_operations';
    drop table if exists aws_apprunner_operations;

    delete from cloudquery_table_frequency where table_name = 'aws_apprunner_services';
    drop table if exists aws_apprunner_services;

    delete from cloudquery_table_frequency where table_name = 'aws_apprunner_vpc_connectors';
    drop table if exists aws_apprunner_vpc_connectors;

    delete from cloudquery_table_frequency where table_name = 'aws_apprunner_vpc_ingress_connections';
    drop table if exists aws_apprunner_vpc_ingress_connections;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_app_blocks';
    drop table if exists aws_appstream_app_blocks;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_application_fleet_associations';
    drop table if exists aws_appstream_application_fleet_associations;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_applications';
    drop table if exists aws_appstream_applications;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_directory_configs';
    drop table if exists aws_appstream_directory_configs;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_fleets';
    drop table if exists aws_appstream_fleets;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_image_builders';
    drop table if exists aws_appstream_image_builders;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_stack_entitlements';
    drop table if exists aws_appstream_stack_entitlements;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_stacks';
    drop table if exists aws_appstream_stacks;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_stack_user_associations';
    drop table if exists aws_appstream_stack_user_associations;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_usage_report_subscriptions';
    drop table if exists aws_appstream_usage_report_subscriptions;

    delete from cloudquery_table_frequency where table_name = 'aws_appstream_users';
    drop table if exists aws_appstream_users;

    delete from cloudquery_table_frequency where table_name = 'aws_athena_work_group_prepared_statements';
    drop table if exists aws_athena_work_group_prepared_statements;

    delete from cloudquery_table_frequency where table_name = 'aws_auditmanager_assessments';
    drop table if exists aws_auditmanager_assessments;

    delete from cloudquery_table_frequency where table_name = 'aws_autoscaling_group_lifecycle_hooks';
    drop table if exists aws_autoscaling_group_lifecycle_hooks;

    delete from cloudquery_table_frequency where table_name = 'aws_autoscaling_plan_resources';
    drop table if exists aws_autoscaling_plan_resources;

    delete from cloudquery_table_frequency where table_name = 'aws_autoscaling_plans';
    drop table if exists aws_autoscaling_plans;

    delete from cloudquery_table_frequency where table_name = 'aws_autoscaling_warm_pools';
    drop table if exists aws_autoscaling_warm_pools;

    delete from cloudquery_table_frequency where table_name = 'aws_backupgateway_gateways';
    drop table if exists aws_backupgateway_gateways;

    delete from cloudquery_table_frequency where table_name = 'aws_batch_compute_environments';
    drop table if exists aws_batch_compute_environments;

    delete from cloudquery_table_frequency where table_name = 'aws_batch_job_definitions';
    drop table if exists aws_batch_job_definitions;

    delete from cloudquery_table_frequency where table_name = 'aws_batch_job_queues';
    drop table if exists aws_batch_job_queues;

    delete from cloudquery_table_frequency where table_name = 'aws_batch_jobs';
    drop table if exists aws_batch_jobs;

    delete from cloudquery_table_frequency where table_name = 'aws_budgets_actions';
    drop table if exists aws_budgets_actions;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudfront_functions';
    drop table if exists aws_cloudfront_functions;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudfront_key_value_stores';
    drop table if exists aws_cloudfront_key_value_stores;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudhsmv2_backups';
    drop table if exists aws_cloudhsmv2_backups;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudhsmv2_clusters';
    drop table if exists aws_cloudhsmv2_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudtrail_imports';
    drop table if exists aws_cloudtrail_imports;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudwatchlogs_log_group_data_protection_policies';
    drop table if exists aws_cloudwatchlogs_log_group_data_protection_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudwatch_metrics';
    drop table if exists aws_cloudwatch_metrics;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudwatch_metric_statistics';
    drop table if exists aws_cloudwatch_metric_statistics;

    delete from cloudquery_table_frequency where table_name = 'aws_cloudwatch_metric_streams';
    drop table if exists aws_cloudwatch_metric_streams;

    delete from cloudquery_table_frequency where table_name = 'aws_codeartifact_domains';
    drop table if exists aws_codeartifact_domains;

    delete from cloudquery_table_frequency where table_name = 'aws_codeartifact_repositories';
    drop table if exists aws_codeartifact_repositories;

    delete from cloudquery_table_frequency where table_name = 'aws_codedeploy_deployment_groups';
    drop table if exists aws_codedeploy_deployment_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_codedeploy_deployments';
    drop table if exists aws_codedeploy_deployments;

    delete from cloudquery_table_frequency where table_name = 'aws_codegurureviewer_repository_associations';
    drop table if exists aws_codegurureviewer_repository_associations;

    delete from cloudquery_table_frequency where table_name = 'aws_config_configuration_aggregators';
    drop table if exists aws_config_configuration_aggregators;

    delete from cloudquery_table_frequency where table_name = 'aws_config_conformance_pack_rule_compliances';
    drop table if exists aws_config_conformance_pack_rule_compliances;

    delete from cloudquery_table_frequency where table_name = 'aws_config_conformance_packs';
    drop table if exists aws_config_conformance_packs;

    delete from cloudquery_table_frequency where table_name = 'aws_config_remediation_configurations';
    drop table if exists aws_config_remediation_configurations;

    delete from cloudquery_table_frequency where table_name = 'aws_config_retention_configurations';
    drop table if exists aws_config_retention_configurations;

    delete from cloudquery_table_frequency where table_name = 'aws_costexplorer_cost_30d';
    drop table if exists aws_costexplorer_cost_30d;

    delete from cloudquery_table_frequency where table_name = 'aws_costexplorer_cost_forecast_30d';
    drop table if exists aws_costexplorer_cost_forecast_30d;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_azureblob_locations';
    drop table if exists aws_datasync_azureblob_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_fsxlustre_locations';
    drop table if exists aws_datasync_fsxlustre_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_fsxontap_locations';
    drop table if exists aws_datasync_fsxontap_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_fsxopenzfs_locations';
    drop table if exists aws_datasync_fsxopenzfs_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_fsxwindows_locations';
    drop table if exists aws_datasync_fsxwindows_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_hdfs_locations';
    drop table if exists aws_datasync_hdfs_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_nfs_locations';
    drop table if exists aws_datasync_nfs_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_objectstorage_locations';
    drop table if exists aws_datasync_objectstorage_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_datasync_smb_locations';
    drop table if exists aws_datasync_smb_locations;

    delete from cloudquery_table_frequency where table_name = 'aws_dax_clusters';
    drop table if exists aws_dax_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_directconnect_lags';
    drop table if exists aws_directconnect_lags;

    delete from cloudquery_table_frequency where table_name = 'aws_dms_certificates';
    drop table if exists aws_dms_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_dms_event_subscriptions';
    drop table if exists aws_dms_event_subscriptions;

    delete from cloudquery_table_frequency where table_name = 'aws_dms_replication_instances';
    drop table if exists aws_dms_replication_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_dms_replication_tasks';
    drop table if exists aws_dms_replication_tasks;

    delete from cloudquery_table_frequency where table_name = 'aws_docdb_clusters';
    drop table if exists aws_docdb_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_docdb_cluster_snapshots';
    drop table if exists aws_docdb_cluster_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_docdb_global_clusters';
    drop table if exists aws_docdb_global_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_docdb_instances';
    drop table if exists aws_docdb_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_docdb_pending_maintenance_actions';
    drop table if exists aws_docdb_pending_maintenance_actions;

    delete from cloudquery_table_frequency where table_name = 'aws_dynamodb_global_tables';
    drop table if exists aws_dynamodb_global_tables;

    delete from cloudquery_table_frequency where table_name = 'aws_dynamodb_table_replica_auto_scalings';
    drop table if exists aws_dynamodb_table_replica_auto_scalings;

    delete from cloudquery_table_frequency where table_name = 'aws_dynamodb_table_resource_policies';
    drop table if exists aws_dynamodb_table_resource_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_dynamodb_table_stream_resource_policies';
    drop table if exists aws_dynamodb_table_stream_resource_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_byoip_cidrs';
    drop table if exists aws_ec2_byoip_cidrs;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_capacity_reservations';
    drop table if exists aws_ec2_capacity_reservations;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_hosts';
    drop table if exists aws_ec2_hosts;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_ipam_address_history';
    drop table if exists aws_ec2_ipam_address_history;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_ipam_byoasns';
    drop table if exists aws_ec2_ipam_byoasns;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_ipam_pool_allocations';
    drop table if exists aws_ec2_ipam_pool_allocations;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_ipam_pool_cidrs';
    drop table if exists aws_ec2_ipam_pool_cidrs;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_ipam_pools';
    drop table if exists aws_ec2_ipam_pools;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_ipam_resource_cidrs';
    drop table if exists aws_ec2_ipam_resource_cidrs;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_spot_fleet_instances';
    drop table if exists aws_ec2_spot_fleet_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_spot_fleet_requests';
    drop table if exists aws_ec2_spot_fleet_requests;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_spot_instance_requests';
    drop table if exists aws_ec2_spot_instance_requests;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_traffic_mirror_filters';
    drop table if exists aws_ec2_traffic_mirror_filters;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_traffic_mirror_sessions';
    drop table if exists aws_ec2_traffic_mirror_sessions;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_traffic_mirror_targets';
    drop table if exists aws_ec2_traffic_mirror_targets;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_transit_gateway_multicast_domains';
    drop table if exists aws_ec2_transit_gateway_multicast_domains;

    delete from cloudquery_table_frequency where table_name = 'aws_ec2_transit_gateway_peering_attachments';
    drop table if exists aws_ec2_transit_gateway_peering_attachments;

    delete from cloudquery_table_frequency where table_name = 'aws_ecrpublic_repositories';
    drop table if exists aws_ecrpublic_repositories;

    delete from cloudquery_table_frequency where table_name = 'aws_ecrpublic_repository_images';
    drop table if exists aws_ecrpublic_repository_images;

    delete from cloudquery_table_frequency where table_name = 'aws_ecr_pull_through_cache_rules';
    drop table if exists aws_ecr_pull_through_cache_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_ecr_registry_policies';
    drop table if exists aws_ecr_registry_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_ecs_cluster_container_instances';
    drop table if exists aws_ecs_cluster_container_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_ecs_cluster_tasks';
    drop table if exists aws_ecs_cluster_tasks;

    delete from cloudquery_table_frequency where table_name = 'aws_ecs_cluster_task_sets';
    drop table if exists aws_ecs_cluster_task_sets;

    delete from cloudquery_table_frequency where table_name = 'aws_efs_access_points';
    drop table if exists aws_efs_access_points;

    delete from cloudquery_table_frequency where table_name = 'aws_eks_cluster_addons';
    drop table if exists aws_eks_cluster_addons;

    delete from cloudquery_table_frequency where table_name = 'aws_eks_cluster_node_groups';
    drop table if exists aws_eks_cluster_node_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_eks_cluster_oidc_identity_provider_configs';
    drop table if exists aws_eks_cluster_oidc_identity_provider_configs;

    delete from cloudquery_table_frequency where table_name = 'aws_eks_clusters';
    drop table if exists aws_eks_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_eks_fargate_profiles';
    drop table if exists aws_eks_fargate_profiles;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticache_events';
    drop table if exists aws_elasticache_events;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticache_global_replication_groups';
    drop table if exists aws_elasticache_global_replication_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticache_serverless_caches';
    drop table if exists aws_elasticache_serverless_caches;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticache_serverless_cache_snapshots';
    drop table if exists aws_elasticache_serverless_cache_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticache_user_groups';
    drop table if exists aws_elasticache_user_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticbeanstalk_configuration_options';
    drop table if exists aws_elasticbeanstalk_configuration_options;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticbeanstalk_configuration_settings';
    drop table if exists aws_elasticbeanstalk_configuration_settings;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticbeanstalk_environments';
    drop table if exists aws_elasticbeanstalk_environments;

    delete from cloudquery_table_frequency where table_name = 'aws_elasticsearch_vpc_endpoints';
    drop table if exists aws_elasticsearch_vpc_endpoints;

    delete from cloudquery_table_frequency where table_name = 'aws_emr_cluster_instance_groups';
    drop table if exists aws_emr_cluster_instance_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_emr_notebook_executions';
    drop table if exists aws_emr_notebook_executions;

    delete from cloudquery_table_frequency where table_name = 'aws_emr_studio_session_mappings';
    drop table if exists aws_emr_studio_session_mappings;

    delete from cloudquery_table_frequency where table_name = 'aws_eventbridge_endpoints';
    drop table if exists aws_eventbridge_endpoints;

    delete from cloudquery_table_frequency where table_name = 'aws_eventbridge_replays';
    drop table if exists aws_eventbridge_replays;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_batch_imports';
    drop table if exists aws_frauddetector_batch_imports;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_batch_predictions';
    drop table if exists aws_frauddetector_batch_predictions;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_detectors';
    drop table if exists aws_frauddetector_detectors;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_entity_types';
    drop table if exists aws_frauddetector_entity_types;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_event_types';
    drop table if exists aws_frauddetector_event_types;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_external_models';
    drop table if exists aws_frauddetector_external_models;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_labels';
    drop table if exists aws_frauddetector_labels;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_models';
    drop table if exists aws_frauddetector_models;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_model_versions';
    drop table if exists aws_frauddetector_model_versions;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_outcomes';
    drop table if exists aws_frauddetector_outcomes;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_rules';
    drop table if exists aws_frauddetector_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_frauddetector_variables';
    drop table if exists aws_frauddetector_variables;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_backups';
    drop table if exists aws_fsx_backups;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_data_repository_associations';
    drop table if exists aws_fsx_data_repository_associations;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_data_repository_tasks';
    drop table if exists aws_fsx_data_repository_tasks;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_file_caches';
    drop table if exists aws_fsx_file_caches;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_file_systems';
    drop table if exists aws_fsx_file_systems;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_snapshots';
    drop table if exists aws_fsx_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_storage_virtual_machines';
    drop table if exists aws_fsx_storage_virtual_machines;

    delete from cloudquery_table_frequency where table_name = 'aws_fsx_volumes';
    drop table if exists aws_fsx_volumes;

    delete from cloudquery_table_frequency where table_name = 'aws_glacier_vault_access_policies';
    drop table if exists aws_glacier_vault_access_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_glacier_vault_lock_policies';
    drop table if exists aws_glacier_vault_lock_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_globalaccelerator_custom_routing_accelerators';
    drop table if exists aws_globalaccelerator_custom_routing_accelerators;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_dev_endpoints';
    drop table if exists aws_glue_dev_endpoints;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_ml_transforms';
    drop table if exists aws_glue_ml_transforms;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_ml_transform_task_runs';
    drop table if exists aws_glue_ml_transform_task_runs;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_registries';
    drop table if exists aws_glue_registries;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_registry_schemas';
    drop table if exists aws_glue_registry_schemas;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_registry_schema_versions';
    drop table if exists aws_glue_registry_schema_versions;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_security_configurations';
    drop table if exists aws_glue_security_configurations;

    delete from cloudquery_table_frequency where table_name = 'aws_glue_workflows';
    drop table if exists aws_glue_workflows;

    delete from cloudquery_table_frequency where table_name = 'aws_guardduty_detector_intel_sets';
    drop table if exists aws_guardduty_detector_intel_sets;

    delete from cloudquery_table_frequency where table_name = 'aws_guardduty_detector_ip_sets';
    drop table if exists aws_guardduty_detector_ip_sets;

    delete from cloudquery_table_frequency where table_name = 'aws_healthlake_fhir_datastores';
    drop table if exists aws_healthlake_fhir_datastores;

    delete from cloudquery_table_frequency where table_name = 'aws_health_organization_affected_entities';
    drop table if exists aws_health_organization_affected_entities;

    delete from cloudquery_table_frequency where table_name = 'aws_health_organization_events';
    drop table if exists aws_health_organization_events;

    delete from cloudquery_table_frequency where table_name = 'aws_health_org_event_details';
    drop table if exists aws_health_org_event_details;

    delete from cloudquery_table_frequency where table_name = 'aws_iam_saml_identity_providers';
    drop table if exists aws_iam_saml_identity_providers;

    delete from cloudquery_table_frequency where table_name = 'aws_iam_signing_certificates';
    drop table if exists aws_iam_signing_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_billing_groups';
    drop table if exists aws_iot_billing_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_ca_certificates';
    drop table if exists aws_iot_ca_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_certificates';
    drop table if exists aws_iot_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_jobs';
    drop table if exists aws_iot_jobs;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_policies';
    drop table if exists aws_iot_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_security_profiles';
    drop table if exists aws_iot_security_profiles;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_streams';
    drop table if exists aws_iot_streams;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_thing_groups';
    drop table if exists aws_iot_thing_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_things';
    drop table if exists aws_iot_things;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_thing_types';
    drop table if exists aws_iot_thing_types;

    delete from cloudquery_table_frequency where table_name = 'aws_iot_topic_rules';
    drop table if exists aws_iot_topic_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_kafka_cluster_operations';
    drop table if exists aws_kafka_cluster_operations;

    delete from cloudquery_table_frequency where table_name = 'aws_kafka_cluster_policies';
    drop table if exists aws_kafka_cluster_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_kafka_clusters';
    drop table if exists aws_kafka_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_kafka_configurations';
    drop table if exists aws_kafka_configurations;

    delete from cloudquery_table_frequency where table_name = 'aws_kafka_nodes';
    drop table if exists aws_kafka_nodes;

    delete from cloudquery_table_frequency where table_name = 'aws_keyspaces_tables';
    drop table if exists aws_keyspaces_tables;

    delete from cloudquery_table_frequency where table_name = 'aws_lambda_layer_version_policies';
    drop table if exists aws_lambda_layer_version_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_lexv2_bot_aliases';
    drop table if exists aws_lexv2_bot_aliases;

    delete from cloudquery_table_frequency where table_name = 'aws_lexv2_bots';
    drop table if exists aws_lexv2_bots;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_alarms';
    drop table if exists aws_lightsail_alarms;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_bucket_access_keys';
    drop table if exists aws_lightsail_bucket_access_keys;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_buckets';
    drop table if exists aws_lightsail_buckets;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_certificates';
    drop table if exists aws_lightsail_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_container_service_deployments';
    drop table if exists aws_lightsail_container_service_deployments;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_container_service_images';
    drop table if exists aws_lightsail_container_service_images;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_container_services';
    drop table if exists aws_lightsail_container_services;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_database_events';
    drop table if exists aws_lightsail_database_events;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_database_log_events';
    drop table if exists aws_lightsail_database_log_events;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_database_parameters';
    drop table if exists aws_lightsail_database_parameters;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_databases';
    drop table if exists aws_lightsail_databases;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_database_snapshots';
    drop table if exists aws_lightsail_database_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_disks';
    drop table if exists aws_lightsail_disks;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_disk_snapshots';
    drop table if exists aws_lightsail_disk_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_distributions';
    drop table if exists aws_lightsail_distributions;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_instance_port_states';
    drop table if exists aws_lightsail_instance_port_states;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_instances';
    drop table if exists aws_lightsail_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_instance_snapshots';
    drop table if exists aws_lightsail_instance_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_load_balancers';
    drop table if exists aws_lightsail_load_balancers;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_load_balancer_tls_certificates';
    drop table if exists aws_lightsail_load_balancer_tls_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_lightsail_static_ips';
    drop table if exists aws_lightsail_static_ips;

    delete from cloudquery_table_frequency where table_name = 'aws_memorydb_reserved_nodes';
    drop table if exists aws_memorydb_reserved_nodes;

    delete from cloudquery_table_frequency where table_name = 'aws_mq_broker_configuration_revisions';
    drop table if exists aws_mq_broker_configuration_revisions;

    delete from cloudquery_table_frequency where table_name = 'aws_mq_broker_configurations';
    drop table if exists aws_mq_broker_configurations;

    delete from cloudquery_table_frequency where table_name = 'aws_mq_brokers';
    drop table if exists aws_mq_brokers;

    delete from cloudquery_table_frequency where table_name = 'aws_mq_broker_users';
    drop table if exists aws_mq_broker_users;

    delete from cloudquery_table_frequency where table_name = 'aws_mwaa_environments';
    drop table if exists aws_mwaa_environments;

    delete from cloudquery_table_frequency where table_name = 'aws_neptune_clusters';
    drop table if exists aws_neptune_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_neptune_global_clusters';
    drop table if exists aws_neptune_global_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_neptune_instances';
    drop table if exists aws_neptune_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_networkfirewall_firewall_policies';
    drop table if exists aws_networkfirewall_firewall_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_networkfirewall_firewalls';
    drop table if exists aws_networkfirewall_firewalls;

    delete from cloudquery_table_frequency where table_name = 'aws_networkfirewall_rule_groups';
    drop table if exists aws_networkfirewall_rule_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_networkfirewall_tls_inspection_configurations';
    drop table if exists aws_networkfirewall_tls_inspection_configurations;

    delete from cloudquery_table_frequency where table_name = 'aws_networkmanager_global_networks';
    drop table if exists aws_networkmanager_global_networks;

    delete from cloudquery_table_frequency where table_name = 'aws_networkmanager_links';
    drop table if exists aws_networkmanager_links;

    delete from cloudquery_table_frequency where table_name = 'aws_networkmanager_sites';
    drop table if exists aws_networkmanager_sites;

    delete from cloudquery_table_frequency where table_name = 'aws_networkmanager_transit_gateway_registrations';
    drop table if exists aws_networkmanager_transit_gateway_registrations;

    delete from cloudquery_table_frequency where table_name = 'aws_pinpoint_apps';
    drop table if exists aws_pinpoint_apps;

    delete from cloudquery_table_frequency where table_name = 'aws_qldb_ledger_journal_kinesis_streams';
    drop table if exists aws_qldb_ledger_journal_kinesis_streams;

    delete from cloudquery_table_frequency where table_name = 'aws_qldb_ledger_journal_s3_exports';
    drop table if exists aws_qldb_ledger_journal_s3_exports;

    delete from cloudquery_table_frequency where table_name = 'aws_qldb_ledgers';
    drop table if exists aws_qldb_ledgers;

    delete from cloudquery_table_frequency where table_name = 'aws_ram_resource_share_invitations';
    drop table if exists aws_ram_resource_share_invitations;

    delete from cloudquery_table_frequency where table_name = 'aws_rds_cluster_backtracks';
    drop table if exists aws_rds_cluster_backtracks;

    delete from cloudquery_table_frequency where table_name = 'aws_rds_db_proxy_endpoints';
    drop table if exists aws_rds_db_proxy_endpoints;

    delete from cloudquery_table_frequency where table_name = 'aws_rds_global_clusters';
    drop table if exists aws_rds_global_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_rds_instance_resource_metrics';
    drop table if exists aws_rds_instance_resource_metrics;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_cluster_parameter_groups';
    drop table if exists aws_redshift_cluster_parameter_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_cluster_parameters';
    drop table if exists aws_redshift_cluster_parameters;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_clusters';
    drop table if exists aws_redshift_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_data_shares';
    drop table if exists aws_redshift_data_shares;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_endpoint_accesses';
    drop table if exists aws_redshift_endpoint_accesses;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_endpoint_authorizations';
    drop table if exists aws_redshift_endpoint_authorizations;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_events';
    drop table if exists aws_redshift_events;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_event_subscriptions';
    drop table if exists aws_redshift_event_subscriptions;

    delete from cloudquery_table_frequency where table_name = 'aws_redshift_snapshots';
    drop table if exists aws_redshift_snapshots;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_alarm_recommendations';
    drop table if exists aws_resiliencehub_alarm_recommendations;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_app_assessments';
    drop table if exists aws_resiliencehub_app_assessments;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_app_component_compliances';
    drop table if exists aws_resiliencehub_app_component_compliances;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_apps';
    drop table if exists aws_resiliencehub_apps;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_app_version_resource_mappings';
    drop table if exists aws_resiliencehub_app_version_resource_mappings;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_app_version_resources';
    drop table if exists aws_resiliencehub_app_version_resources;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_app_versions';
    drop table if exists aws_resiliencehub_app_versions;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_component_recommendations';
    drop table if exists aws_resiliencehub_component_recommendations;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_recommendation_templates';
    drop table if exists aws_resiliencehub_recommendation_templates;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_resiliency_policies';
    drop table if exists aws_resiliencehub_resiliency_policies;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_sop_recommendations';
    drop table if exists aws_resiliencehub_sop_recommendations;

    delete from cloudquery_table_frequency where table_name = 'aws_resiliencehub_test_recommendations';
    drop table if exists aws_resiliencehub_test_recommendations;

    delete from cloudquery_table_frequency where table_name = 'aws_route53_hosted_zone_query_logging_configs';
    drop table if exists aws_route53_hosted_zone_query_logging_configs;

    delete from cloudquery_table_frequency where table_name = 'aws_route53_hosted_zone_traffic_policy_instances';
    drop table if exists aws_route53_hosted_zone_traffic_policy_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoverycontrolconfig_clusters';
    drop table if exists aws_route53recoverycontrolconfig_clusters;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoverycontrolconfig_control_panels';
    drop table if exists aws_route53recoverycontrolconfig_control_panels;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoverycontrolconfig_routing_controls';
    drop table if exists aws_route53recoverycontrolconfig_routing_controls;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoverycontrolconfig_safety_rules';
    drop table if exists aws_route53recoverycontrolconfig_safety_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoveryreadiness_cells';
    drop table if exists aws_route53recoveryreadiness_cells;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoveryreadiness_readiness_checks';
    drop table if exists aws_route53recoveryreadiness_readiness_checks;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoveryreadiness_recovery_groups';
    drop table if exists aws_route53recoveryreadiness_recovery_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_route53recoveryreadiness_resource_sets';
    drop table if exists aws_route53recoveryreadiness_resource_sets;

    delete from cloudquery_table_frequency where table_name = 'aws_route53resolver_firewall_rule_group_associations';
    drop table if exists aws_route53resolver_firewall_rule_group_associations;

    delete from cloudquery_table_frequency where table_name = 'aws_route53resolver_firewall_rule_groups';
    drop table if exists aws_route53resolver_firewall_rule_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_route53resolver_resolver_endpoints';
    drop table if exists aws_route53resolver_resolver_endpoints;

    delete from cloudquery_table_frequency where table_name = 'aws_route53resolver_resolver_query_log_config_associations';
    drop table if exists aws_route53resolver_resolver_query_log_config_associations;

    delete from cloudquery_table_frequency where table_name = 'aws_route53resolver_resolver_query_log_configs';
    drop table if exists aws_route53resolver_resolver_query_log_configs;

    delete from cloudquery_table_frequency where table_name = 'aws_s3_access_grant_instances';
    drop table if exists aws_s3_access_grant_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_s3_access_grants';
    drop table if exists aws_s3_access_grants;

    delete from cloudquery_table_frequency where table_name = 'aws_s3_bucket_object_grants';
    drop table if exists aws_s3_bucket_object_grants;

    delete from cloudquery_table_frequency where table_name = 'aws_s3_bucket_object_heads';
    drop table if exists aws_s3_bucket_object_heads;

    delete from cloudquery_table_frequency where table_name = 'aws_s3_bucket_objects';
    drop table if exists aws_s3_bucket_objects;

    delete from cloudquery_table_frequency where table_name = 'aws_s3_multi_region_access_points';
    drop table if exists aws_s3_multi_region_access_points;

    delete from cloudquery_table_frequency where table_name = 'aws_sagemaker_apps';
    drop table if exists aws_sagemaker_apps;

    delete from cloudquery_table_frequency where table_name = 'aws_sagemaker_notebook_instances';
    drop table if exists aws_sagemaker_notebook_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_savingsplans_plans';
    drop table if exists aws_savingsplans_plans;

    delete from cloudquery_table_frequency where table_name = 'aws_servicecatalog_launch_paths';
    drop table if exists aws_servicecatalog_launch_paths;

    delete from cloudquery_table_frequency where table_name = 'aws_servicecatalog_portfolios';
    drop table if exists aws_servicecatalog_portfolios;

    delete from cloudquery_table_frequency where table_name = 'aws_servicecatalog_products';
    drop table if exists aws_servicecatalog_products;

    delete from cloudquery_table_frequency where table_name = 'aws_servicecatalog_provisioned_products';
    drop table if exists aws_servicecatalog_provisioned_products;

    delete from cloudquery_table_frequency where table_name = 'aws_servicecatalog_provisioning_artifacts';
    drop table if exists aws_servicecatalog_provisioning_artifacts;

    delete from cloudquery_table_frequency where table_name = 'aws_servicecatalog_provisioning_parameters';
    drop table if exists aws_servicecatalog_provisioning_parameters;

    delete from cloudquery_table_frequency where table_name = 'aws_servicediscovery_instances';
    drop table if exists aws_servicediscovery_instances;

    delete from cloudquery_table_frequency where table_name = 'aws_ses_contact_lists';
    drop table if exists aws_ses_contact_lists;

    delete from cloudquery_table_frequency where table_name = 'aws_ses_custom_verification_email_templates';
    drop table if exists aws_ses_custom_verification_email_templates;

    delete from cloudquery_table_frequency where table_name = 'aws_shield_attacks';
    drop table if exists aws_shield_attacks;

    delete from cloudquery_table_frequency where table_name = 'aws_shield_protection_groups';
    drop table if exists aws_shield_protection_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_shield_protections';
    drop table if exists aws_shield_protections;

    delete from cloudquery_table_frequency where table_name = 'aws_shield_subscriptions';
    drop table if exists aws_shield_subscriptions;

    delete from cloudquery_table_frequency where table_name = 'aws_signer_signing_profiles';
    drop table if exists aws_signer_signing_profiles;

    delete from cloudquery_table_frequency where table_name = 'aws_ssmincidents_incident_findings';
    drop table if exists aws_ssmincidents_incident_findings;

    delete from cloudquery_table_frequency where table_name = 'aws_ssmincidents_incident_related_items';
    drop table if exists aws_ssmincidents_incident_related_items;

    delete from cloudquery_table_frequency where table_name = 'aws_ssmincidents_incidents';
    drop table if exists aws_ssmincidents_incidents;

    delete from cloudquery_table_frequency where table_name = 'aws_ssmincidents_incident_timeline_events';
    drop table if exists aws_ssmincidents_incident_timeline_events;

    delete from cloudquery_table_frequency where table_name = 'aws_ssmincidents_response_plans';
    drop table if exists aws_ssmincidents_response_plans;

    delete from cloudquery_table_frequency where table_name = 'aws_ssm_instance_patches';
    drop table if exists aws_ssm_instance_patches;

    delete from cloudquery_table_frequency where table_name = 'aws_ssm_sessions';
    drop table if exists aws_ssm_sessions;

    delete from cloudquery_table_frequency where table_name = 'aws_transfer_agreements';
    drop table if exists aws_transfer_agreements;

    delete from cloudquery_table_frequency where table_name = 'aws_transfer_certificates';
    drop table if exists aws_transfer_certificates;

    delete from cloudquery_table_frequency where table_name = 'aws_transfer_connectors';
    drop table if exists aws_transfer_connectors;

    delete from cloudquery_table_frequency where table_name = 'aws_transfer_workflows';
    drop table if exists aws_transfer_workflows;

    delete from cloudquery_table_frequency where table_name = 'aws_wafregional_rate_based_rules';
    drop table if exists aws_wafregional_rate_based_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_wafregional_rule_groups';
    drop table if exists aws_wafregional_rule_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_wafregional_rules';
    drop table if exists aws_wafregional_rules;

    delete from cloudquery_table_frequency where table_name = 'aws_wafregional_web_acls';
    drop table if exists aws_wafregional_web_acls;

    delete from cloudquery_table_frequency where table_name = 'aws_waf_rule_groups';
    drop table if exists aws_waf_rule_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_waf_subscribed_rule_groups';
    drop table if exists aws_waf_subscribed_rule_groups;

    delete from cloudquery_table_frequency where table_name = 'aws_waf_web_acls';
    drop table if exists aws_waf_web_acls;

    delete from cloudquery_table_frequency where table_name = 'aws_workspaces_connection_aliases';
    drop table if exists aws_workspaces_connection_aliases;

    delete from cloudquery_table_frequency where table_name = 'aws_workspaces_connection_alias_permissions';
    drop table if exists aws_workspaces_connection_alias_permissions;

    delete from cloudquery_table_frequency where table_name = 'aws_workspaces_directories';
    drop table if exists aws_workspaces_directories;

    delete from cloudquery_table_frequency where table_name = 'aws_workspaces_workspaces';
    drop table if exists aws_workspaces_workspaces;
commit;