#!/usr/bin/env bash

# This script creates a lambda artifact as a zip file. It can optionally include the Prisma client.

set -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$(realpath "${DIR}/..")

 PACKAGE_NAME=${1:-}
 INCLUDE_PRISMA=${2:-}

 if [ -z "$PACKAGE_NAME" ]; then
   echo "Usage: ./scripts/create-lambda-artifact.sh <package-name> [--include-prisma]"
   exit 1
 fi

checkLambdaArtifactSize() {
  aws_lambda_max_size_in_bytes=262144000
  file_path=$1
  actual_size_in_bytes=$(unzip -Zt $file_path | awk '{print $3}')

  percent_used=$(echo "scale=2; ($actual_size_in_bytes / $aws_lambda_max_size_in_bytes) * 100" | bc)
  percent_used_int=$(printf "%.0f" "$percent_used")
  echo "Checking uncompressed size of AWS Lambda artifact $file_path"

  if [ "$actual_size_in_bytes" -le "$aws_lambda_max_size_in_bytes" ]; then
    echo "  PASSED: Uncompressed, $file_path is $actual_size_in_bytes bytes (max allowed: $aws_lambda_max_size_in_bytes bytes), ${percent_used_int}% of the maximum allowed size for AWS Lambda."
  else
    echo "  ❌ FAILED: Uncompressed, $file_path is $actual_size_in_bytes bytes (max allowed: $aws_lambda_max_size_in_bytes bytes), ${percent_used_int}% of the maximum allowed size for AWS Lambda."
    exit 1
  fi
}

createLambda() {
  echo "Creating $PACKAGE_NAME package"

  (
    cd "$ROOT_DIR/packages/$PACKAGE_NAME/dist"
    zip -qr "$PACKAGE_NAME.zip" .
    checkLambdaArtifactSize "$PACKAGE_NAME.zip"
  )
}

createLambdaWithPrisma() {
  echo "Creating $PACKAGE_NAME package"

  # Copy the Prisma schema file to the dist directory
  cp -r "$ROOT_DIR/packages/common/prisma" "$ROOT_DIR/packages/$PACKAGE_NAME/dist"

  # Copy the generated Prisma client
  mkdir -p "$ROOT_DIR/packages/$PACKAGE_NAME/dist/node_modules"
  cp -r "$ROOT_DIR/node_modules/@prisma" "$ROOT_DIR/packages/$PACKAGE_NAME/dist/node_modules/@prisma"
  cp -r "$ROOT_DIR/node_modules/prisma" "$ROOT_DIR/packages/$PACKAGE_NAME/dist/node_modules/prisma"

  # Create a zip file of the dist directory
  (
    cd "$ROOT_DIR/packages/$PACKAGE_NAME/dist"
    zip -qr "$PACKAGE_NAME.zip" .
    checkLambdaArtifactSize "$PACKAGE_NAME.zip"
  )
}

if [ "$INCLUDE_PRISMA" = "--include-prisma" ]; then
  createLambdaWithPrisma
else
  createLambda
fi