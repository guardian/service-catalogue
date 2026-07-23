#!/usr/bin/env bash

# This script packages Prisma migrations into a zip file.

set -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$(realpath "${DIR}/..")

echo "Creating zip of Prisma files"

TEMP_DIR=$(mktemp -d)

# Copy prisma schema
cp -r "$ROOT_DIR/packages/common/prisma" "$TEMP_DIR/prisma"

# Create a minimal package.json and install prisma deps
cat > "$TEMP_DIR/package.json" <<EOF
{
  "dependencies": {
    "prisma": "$(node -e "console.log(require('${ROOT_DIR}/node_modules/prisma/package.json').version)")",
    "@prisma/client": "$(node -e "console.log(require('${ROOT_DIR}/node_modules/@prisma/client/package.json').version)")"
  }
}
EOF

(
  cd "$TEMP_DIR"
  npm install --omit=dev --quiet
)

# Zip everything
(
  cd "$TEMP_DIR"
  zip -qr "$ROOT_DIR/packages/common/prisma.zip" .
)

rm -rf "$TEMP_DIR"