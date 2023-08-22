#!/usr/bin/env bash

set -e

esbuild index.ts --bundle --outdir=dist --platform=node --target=node16
cp prisma/schema.prisma dist/
cp node_modules/prisma/libquery_engine-rhel-openssl-1.0.x.so.node dist/
zip -FSr prisma.zip dist