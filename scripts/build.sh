#!/usr/bin/env bash

set -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$(realpath "${DIR}/..")

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

createLambdaWithPrisma() {
  name=$1

  echo "Creating $name package"

  # Copy the Prisma schema file to the dist directory
  cp -r "$ROOT_DIR/packages/common/prisma" "$ROOT_DIR/packages/$name/dist"

  # Copy the generated Prisma client
  mkdir -p "$ROOT_DIR/packages/$name/dist/node_modules"
  cp -r "$ROOT_DIR/node_modules/@prisma" "$ROOT_DIR/packages/$name/dist/node_modules/@prisma"
  cp -r "$ROOT_DIR/node_modules/prisma" "$ROOT_DIR/packages/$name/dist/node_modules/prisma"

  # Create a zip file of the dist directory
  (
    cd "$ROOT_DIR/packages/$name/dist"
    zip -qr "$name.zip" .
    checkLambdaArtifactSize "$name.zip"
  )
}

createZip() {
  echo "Creating $1 package"

  (
    cd "$ROOT_DIR/packages/$1/dist"
    zip -qr "$1.zip" .
    checkLambdaArtifactSize "$1.zip"
  )
}

# This is used by the ECS prisma-migrate task and will be removed when the task is deprecated
createPrismaZip() {
  echo "Creating zip of Prisma files"
  (
    cd "$ROOT_DIR/packages/common"
    zip -qr prisma.zip ./prisma
  )
}

createPrismaLambdaZip() {
  echo "Creating prisma-lambda.zip (Lambda runtime artifact)"

  out_zip="$ROOT_DIR/lambda-runtime/prisma-migrate/prisma-lambda.zip"
  stage_dir="$ROOT_DIR/.tmp/prisma-lambda"

  configured_target=$(npm pkg get config.prismaCliBinaryTarget --prefix "$ROOT_DIR/lambda-runtime/prisma-migrate" | tr -d '"')
  prisma_target="${PRISMA_MIGRATE_BINARY_TARGET:-$configured_target}"

  if [ -z "$prisma_target" ] || [ "$prisma_target" = "undefined" ]; then
    echo "Missing prisma target. Set config.prismaCliBinaryTarget in lambda-runtime/prisma-migrate/package.json or PRISMA_MIGRATE_BINARY_TARGET."
    exit 1
  fi

  cleanup() {
    rm -rf "$stage_dir"
    rmdir "$ROOT_DIR/.tmp" 2>/dev/null || true
  }
  trap cleanup RETURN

  rm -rf "$stage_dir" "$out_zip"
  mkdir -p "$stage_dir/dist"

  PRISMA_CLI_BINARY_TARGETS="$prisma_target" npm --prefix "$ROOT_DIR/lambda-runtime/prisma-migrate" ci --workspaces=false
  npm --prefix "$ROOT_DIR/lambda-runtime/prisma-migrate" run build --workspaces=false

  cp "$ROOT_DIR/lambda-runtime/prisma-migrate/dist/prisma-migrate.js" "$stage_dir/dist/prisma-migrate.js"
  cp "$ROOT_DIR/lambda-runtime/prisma-migrate/dist/prisma.lambda.config.js" "$stage_dir/dist/prisma.lambda.config.js"
  cp -R "$ROOT_DIR/packages/common/prisma" "$stage_dir/prisma"
  cp "$ROOT_DIR/lambda-runtime/prisma-migrate/package.json" "$stage_dir/package.json"
  cp "$ROOT_DIR/lambda-runtime/prisma-migrate/package-lock.json" "$stage_dir/package-lock.json"

  (
    cd "$stage_dir"
    PRISMA_CLI_BINARY_TARGETS="$prisma_target" npm ci --omit=dev --no-audit --no-fund
    zip -qr "$out_zip" .
  )

  checkLambdaArtifactSize "$out_zip"
}
verify() {
  package_name=$1
  file_name=$2
  npm run generate -w "$package_name"

  if git diff --no-patch --exit-code "$file_name"; then
    echo "Generated files in $package_name package are up to date."
  else
    echo "$package_name package is out of date. Please regenerate the project and commit the changes."
  fi
}

npm ci
npm run build

verify best-practices "packages/best-practices/best-practices.md"

createZip "interactive-monitor"
createZip "dependency-graph-integrator"
createPrismaZip
createLambdaWithPrisma "repocop"
createLambdaWithPrisma "data-audit"
createLambdaWithPrisma "github-actions-usage"
createLambdaWithPrisma "obligatron"
createLambdaWithPrisma "refresh-materialized-view"
createLambdaWithPrisma "cloudbuster"
createLambdaWithPrisma "cloudquery-usage"
createPrismaLambdaZip

