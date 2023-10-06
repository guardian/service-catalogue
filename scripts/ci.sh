#!/usr/bin/env bash

set -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$(realpath "${DIR}/..")

env_check() {
  clear="\033[0m"
  red='\033[0;31m'
  yellow="\033[1;33m"

  ENV_FILE="${ROOT_DIR}/.env"
  echo "${ENV_FILE}"

  if [ -w "${ENV_FILE}" ]; then
      echo -e "${red='\033[0;31m'}Error: .env file is writeable ❌"
      echo -e "Please run ${yellow}'chmod -w .env'${red} to make it read-only${clear}"
      exit 1
  else echo '.env file not writeable ✅'
  fi
}

env_check

npm ci
npm run typecheck
npm run lint
npm run test
npm run synth
npm run build

createRepocopZip() {
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
    zip -r repocop.zip .
  )
}

createRepocopZip
