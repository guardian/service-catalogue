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

zip -j "$ROOT_DIR/packages/repocop/repocop.zip" packages/repocop/index.js packages/repocop/prisma/schema.prisma
