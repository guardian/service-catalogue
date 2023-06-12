#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..

STAGE=DEV
APP=github-lens
STACK=deploy

setup_git_hook() {
  echo "Setting up repocop pre-commit hook"
  cp "${ROOT_DIR}/scripts/pre-commit" "${ROOT_DIR}/.git/hooks/pre-commit"

chmod +x "${ROOT_DIR}/.git/hooks/pre-commit"
}

check_node_version() {
  runningNodeVersion=$(node -v)
  requiredNodeVersion=$(cat "$ROOT_DIR/.nvmrc")

  # remove leading v
  runningNodeVersionNumber=${runningNodeVersion//[v]/}

  if [ "$runningNodeVersionNumber" != "$requiredNodeVersion" ]; then
    echo -e "Using wrong version of Node. Required ${requiredNodeVersion}. Running ${runningNodeVersion}."
    setup_node_env
  fi
}

setup_node_env() {
  echo "Attempting to switch node versions for you..."
  if command -v fnm &> /dev/null
  then
      fnm use
  else
    if command -v nvm &> /dev/null
    then
      echo "You are using 'nvm', 'fnm' is preferred (it's quicker)!"
      nvm use
    else
      echo "Please install fnm: 'brew install fnm'"
      exit 1
    fi
  fi
}

install_dependencies() {
  npm install
}

setup_git_hook
check_node_version
install_dependencies
