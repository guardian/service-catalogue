#!/usr/bin/env bash

set -e

PACKAGE_NAME=best-practices
FILE_NAME="packages/best-practices/best-practices.md"

npm run generate -w "$PACKAGE_NAME"

if git diff --no-patch --exit-code "$FILE_NAME"; then
  echo "Generated files in $PACKAGE_NAME package are up to date."
else
  echo "$PACKAGE_NAME package is out of date. Please regenerate the project and commit the changes."
  exit 1
fi
