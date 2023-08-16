#!/usr/bin/env bash

set -e

MAJOR_PYTHON_VERSION="3.11"

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
REPOCOP_DIR="$(realpath "${DIR}/..")"

VENV_DIR="${REPOCOP_DIR}/.venv"

APP_NAME="repocop"
ZIP_FILE="${APP_NAME}.zip"

python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

# Install dependencies into "target" directory, copy our code there too, then zip the whole thing.
pip3 install -r "$REPOCOP_DIR/requirements.txt" -t target
cp "${REPOCOP_DIR}/"*.py target
( cd target && zip -FSr "${REPOCOP_DIR}/${ZIP_FILE}" . )
