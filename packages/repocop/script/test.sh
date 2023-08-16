#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
REPOCOP_DIR="$(realpath "${DIR}/..")"

python3 -m venv "$REPOCOP_DIR/.venv"
source "$REPOCOP_DIR/.venv/bin/activate"
pip3 install -r "$REPOCOP_DIR/requirements.txt"
pytest
deactivate