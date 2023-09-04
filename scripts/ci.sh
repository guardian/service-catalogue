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

createRepocopZip() {
  # Copy the Prisma schema file to the dist directory
  cp -r "$ROOT_DIR/packages/repocop/prisma" "$ROOT_DIR/packages/repocop/dist"

  # Create a zip file of the dist directory
  (
    cd "$ROOT_DIR/packages/repocop/dist"
    zip -r repocop.zip .
  )
}

createRepocopZip
