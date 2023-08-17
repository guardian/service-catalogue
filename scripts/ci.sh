#!/usr/bin/env bash

set -e

npm ci
npm run typecheck
npm run lint
npm run test
npm run synth
npm run build
