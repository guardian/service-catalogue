#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR="${DIR}/.."

npm ci
npm run typecheck
npm run lint
npm run test
npm run synth
npm run build

get_abs_filename() {
  # $1 : relative filename
  echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

# Create zip files for guardian/actions-riff-raff@v1 GHA
for file in $(find $ROOT_DIR/packages/*/dist/handler.js)
do
  filename=$(get_abs_filename $file)
  directory=$(dirname "$filename")
  app_directory=$(dirname "$directory")
  app_name=$(basename "$app_directory")

  zip -FSjr "${directory}/${app_name}.zip" "$filename"
done
