#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
REPOCOP_DIR="$(realpath "${DIR}/..")"

VENV_DIR="${REPOCOP_DIR}/.venv"

python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip3 install -r "$REPOCOP_DIR/requirements-dev.txt"
python3 -m pytest
