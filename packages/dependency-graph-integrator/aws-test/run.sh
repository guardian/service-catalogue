#!/usr/bin/env bash
set -e

STAGE=$1

export AWS_REGION='eu-west-1'
export AWS_PROFILE='deployTools'


if [[ "$STAGE" != "CODE" && "$STAGE" != "PROD" ]]; then
  echo "Usage: $0 <Stage>"
  echo "Stage must be 'CODE' or 'PROD'"
  exit 1
fi

FUNCTION_NAME=$(aws lambda list-functions \
  --query "Functions[].FunctionName" \
  --output text | tr '\t' '\n' | while read -r fn; do
    tags=$(aws lambda list-tags --resource "$(aws lambda get-function --function-name "$fn" --query 'Configuration.FunctionArn' --output text)" --output json)
    app=$(echo "$tags" | jq -r '.Tags.App // empty')
    stage=$(echo "$tags" | jq -r '.Tags.Stage // empty')
    if [[ "$app" == "dependency-graph-integrator" && "$stage" == "$STAGE" ]]; then
      echo "$fn"
      break
    fi
done)

if [[ -z "$FUNCTION_NAME" ]]; then
  echo "Could not find a lambda with App=dependency-graph-integrator and Stage=$STAGE"
  exit 1
fi

echo "Invoking lambda: $FUNCTION_NAME"

# SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# aws lambda invoke \
#   --function-name "$FUNCTION_NAME" \
#   --payload "file://${SCRIPT_DIR}/testEvent.json" \
#   --cli-binary-format raw-in-base64-out \
#   /dev/stdout
