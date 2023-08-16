#!/usr/bin/env bash

set -e


DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
REPOCOP_DIR="$(realpath "${DIR}/..")"
APP_NAME="repocop"

python3 -m venv "$REPOCOP_DIR/.venv"
source "$REPOCOP_DIR/.venv/bin/activate"
pip3 install -r "$REPOCOP_DIR/requirements.txt"

( #Steps to package the python venv
  MAJOR_PYTHON_VERSION="3.11"
  PACKAGE_DIR="${REPOCOP_DIR}/.venv/lib/python${MAJOR_PYTHON_VERSION}/site-packages"
  ZIP_FILE="${APP_NAME}.zip"

  cp "${REPOCOP_DIR}/"*.py "${PACKAGE_DIR}"
  cd "${PACKAGE_DIR}"
  zip -FSr "${REPOCOP_DIR}/${ZIP_FILE}" .
)