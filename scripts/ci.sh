#!/usr/bin/env bash

set -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$(realpath "${DIR}/..")

npm ci
npm run typecheck
npm run lint
npm run test
npm run synth
npm run build

createRepocopZip() {
  echo "Creating repocop package"
  # Copy the Prisma schema file to the dist directory
  cp -r "$ROOT_DIR/packages/repocop/prisma" "$ROOT_DIR/packages/repocop/dist"

  # Copy the generated Prisma client
  mkdir -p "$ROOT_DIR/packages/repocop/dist/node_modules"
  cp -r "$ROOT_DIR/node_modules/@prisma" "$ROOT_DIR/packages/repocop/dist/node_modules/@prisma"
  cp -r "$ROOT_DIR/node_modules/prisma" "$ROOT_DIR/packages/repocop/dist/node_modules/prisma"
  cp -r "$ROOT_DIR/node_modules/.prisma" "$ROOT_DIR/packages/repocop/dist/node_modules/.prisma"

  # Create a zip file of the dist directory
  (
    cd "$ROOT_DIR/packages/repocop/dist"
    zip -qr repocop.zip .
  )
}

createBranchProtectorZip() {
  echo "Creating branch-protector package"
  (
    cd "$ROOT_DIR/packages/branch-protector/dist"
    zip -qr branch-protector.zip .
  )
}

createRepocopZip
createBranchProtectorZip
