#!/usr/bin/env bash

set -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$(realpath "${DIR}/..")

createLambdaWithPrisma() {
  name=$1

  echo "Creating $name package"

  # Copy the Prisma schema file to the dist directory
  cp -r "$ROOT_DIR/packages/common/prisma" "$ROOT_DIR/packages/$name/dist"

  # Copy the generated Prisma client
  mkdir -p "$ROOT_DIR/packages/$name/dist/node_modules"
  cp -r "$ROOT_DIR/node_modules/@prisma" "$ROOT_DIR/packages/$name/dist/node_modules/@prisma"
  cp -r "$ROOT_DIR/node_modules/prisma" "$ROOT_DIR/packages/$name/dist/node_modules/prisma"
  cp -r "$ROOT_DIR/node_modules/.prisma" "$ROOT_DIR/packages/$name/dist/node_modules/.prisma"

  # Create a zip file of the dist directory
  (
    cd "$ROOT_DIR/packages/$name/dist"
    zip -qr "$name".zip .
  )
}

createZip() {
  echo "Creating $1 package"

  (
    cd "$ROOT_DIR/packages/$1/dist"
    zip -qr "$1".zip .
  )
}

createPrismaZip() {
  echo "Creating zip of Prisma files"
  (
    cd "$ROOT_DIR/packages/common"
    zip -qr prisma.zip ./prisma
  )
}

verify() {
 package_name=$1
  file_name=$2
  echo "packages/diagrams/output.svg"
  npm run generate -w "$package_name"


if git diff --no-patch --exit-code "$file_name"; then
    echo "Generated files in $package_name package are up to date."
else
    echo "$package_name package is out of date. Please regenerate the project and commit the changes."
fi
}


npm ci
npm test

# Run the following in parallel.
# Logs will be interleaved, but the `--print-label` flag will prefix each line with the name of the script being run.
# See https://github.com/mysticatea/npm-run-all.
npx npm-run-all --print-label --parallel typecheck lint synth build

verify best-practices "packages/best-practices/best-practices.md"
verify diagrams "packages/diagrams/output.svg"

createZip "interactive-monitor"
createZip "snyk-integrator"
createZip "dependency-graph-integrator"
createPrismaZip
createLambdaWithPrisma "repocop"
createLambdaWithPrisma "data-audit"
createLambdaWithPrisma "github-actions-usage"
createLambdaWithPrisma "obligatron"
createLambdaWithPrisma "refresh-materialized-view"

# Package the dashboard...
createZip "dashboard"
# ... then rename the file to match the plugin's ID
mv "$ROOT_DIR/packages/dashboard/dist/dashboard.zip" "$ROOT_DIR/packages/dashboard/dist/theguardian-servicecatalogue-app.zip"
