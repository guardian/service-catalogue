#!/usr/bin/env bash

set -e  

PROFILE=deployTools
REGION=eu-west-1
 
 local_env_file_dir=$HOME/.gu/service_catalogue

  JSON_STRING=$(aws secretsmanager get-secret-value --secret-id /CODE/deploy/service-catalogue/github-ent-credentials  --profile "$PROFILE" --region "$REGION" --output text | awk '{print $4}')
  # xargs with -0 to stop it stripping the quotes from the data. They need to be JSON strings in the files!
echo "$JSON_STRING" | jq -rc '."app-id"' | xargs -0 echo -n > "$local_env_file_dir"/app-id #keys need to be quoted otherwise the hyphen is interpreted as a minus sign
echo "$JSON_STRING" | jq  -rc '."installation-id"' | xargs -0 echo -n > "$local_env_file_dir"/installation-id
  GITHUB_PRIVATE_KEY_PATH=$local_env_file_dir/private-key.pem

echo "$JSON_STRING" | jq -r '."private-key"' | base64 --decode > "$GITHUB_PRIVATE_KEY_PATH"
