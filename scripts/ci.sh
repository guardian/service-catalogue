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

verifyMarkdown() {
  npm run generate -w best-practices

  if [[ $(git status -z) == *"packages/best-practices/best-practices.md"* ]]; then
    echo "Best practices markdown file is out of date. Please regenerate the project and commit the changes."
    exit 1
  fi
}

checkPrismaSchema() {
  npm -w cli start migrate -- --stage DEV
  git diff --exit-code packages/common/prisma/schema.prisma
}

npm ci
npm run typecheck & npm run lint
npm run test
npm run synth & npm run build

checkPrismaSchema

verifyMarkdown & \
  createZip "interactive-monitor" & \
  createLambdaWithPrisma "repocop" & \
  createLambdaWithPrisma "data-audit"
