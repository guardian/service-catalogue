#!/usr/bin/env bash

set -e

# Set up text colours
red='\033[0;31m'
clear='\033[0m'
yellow='\033[1;33m'
cyan='\033[0;36m'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$(realpath "${DIR}/..")
STEP_COUNT=0

step(){
  ((STEP_COUNT++))
  echo -e "${cyan}Step ${STEP_COUNT}${clear}: $1"
}

check_node_version() {
  step "Checking node version"
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
  step "Setting up node environment"
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
  step "Installing dependencies"
  npm install --silent
}

check_credentials() {
  step "Checking AWS credentials"
  PROFILE=$1
  STATUS=$(aws sts get-caller-identity --profile "$PROFILE" 2>&1 || true)
  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "${red}Credentials for the ${yellow}$PROFILE${red} profile have expired${clear}. Please fetch new credentials and rerun the script."
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") ]]; then
    echo -e "${red}Credentials for the ${yellow}$PROFILE${red} profile are missing${clear}. Please fetch new credentials and rerun the script."
    exit 1
  else
    echo "AWS credentials for $PROFILE are valid"
  fi
}

setup_environment() {
  PROFILE=$1
  REGION=$2
  step "Setting up Service Catalogue environment"

  local_env_file_dir=$HOME/.gu/service_catalogue

  local_env_file=$local_env_file_dir/.env.local

  size_threshold=1

  SNYK_TOKEN=$(aws secretsmanager get-secret-value --secret-id /CODE/deploy/service-catalogue/snyk-credentials  --profile "$PROFILE" --region "$REGION" | jq -r '.SecretString' | jq -r '."api-key"' | tr -d "'")

  GALAXIES_BUCKET=$(aws ssm get-parameter --name /INFRA/deploy/services-api/galaxies-bucket-name --profile "$PROFILE" --region "$REGION" | jq '.Parameter.Value' | tr -d '"')

  ANGHAMMARAD_SNS_ARN=$(aws ssm get-parameter --name /account/services/anghammarad.topic.arn --profile "$PROFILE" --region "$REGION" | jq '.Parameter.Value' | tr -d '"')

  INTERACTIVE_MONITOR_TOPIC_ARN=$(aws sns list-topics --profile "$PROFILE" --region "$REGION" --output text --query 'Topics[*]' | grep interactive-monitor-CODE)

  CLOUDQUERY_API_KEY=$(
    aws secretsmanager get-secret-value \
    --secret-id /CODE/deploy/service-catalogue/cloudquery-api-key \
    --profile "$PROFILE" --region "$REGION" | jq '.SecretString | fromjson["api-key"]'
  )

  github_info_url="https://github.com/settings/tokens?type=beta"

  token_text="# Required permissions are Metadata: Read and Administration: Read. See $github_info_url
GITHUB_ACCESS_TOKEN=
"

  JSON_STRING=$(aws secretsmanager get-secret-value --secret-id /CODE/deploy/service-catalogue/github-credentials  --profile "$PROFILE" --region "$REGION" --output text | awk '{print $4}')
echo "$JSON_STRING" | jq -rc '."app-id"' | xargs echo -n > "$local_env_file_dir"/app-id #keys need to be quoted otherwise the hyphen is interpreted as a minus sign
echo "$JSON_STRING" | jq  -rc '."installation-id"' | xargs echo -n > "$local_env_file_dir"/installation-id
  GITHUB_PRIVATE_KEY_PATH=$local_env_file_dir/private-key.pem

echo "$JSON_STRING" | jq -r '."private-key"' | base64 --decode > "$GITHUB_PRIVATE_KEY_PATH"

  
  env_var_text="SNYK_TOKEN=${SNYK_TOKEN}
GALAXIES_BUCKET=${GALAXIES_BUCKET}
ANGHAMMARAD_SNS_ARN=${ANGHAMMARAD_SNS_ARN}
INTERACTIVE_MONITOR_TOPIC_ARN=${INTERACTIVE_MONITOR_TOPIC_ARN}
GITHUB_PRIVATE_KEY_PATH=${GITHUB_PRIVATE_KEY_PATH}
CLOUDQUERY_API_KEY=${CLOUDQUERY_API_KEY}
"

  # Check if .env.local file exists in ~/.gu/service_catalogue/
  echo "Checking for .env.local file in $local_env_file_dir"
  if [ -e "$local_env_file" ]
  then
    echo "Found .env.local file in $local_env_file_dir"
    # Get file size in bytes
    file_size=$(wc -c < "$local_env_file")

    # Check if file is empty - don't want to overwrite any existing tokens
    if [ "$file_size" -gt "$size_threshold" ]
    then
      echo "File is not empty. Appending required environment variables only"
      echo "$env_var_text" >> "$local_env_file"
    else
      echo "File is empty, adding Github and Snyk token names"
      echo "$token_text" >> "$local_env_file"
      echo "Appending required environment variables"
      echo "$env_var_text" >> "$local_env_file"
    fi
  else
    echo "No .env.local file found - creating it in $local_env_file_dir"
    mkdir -p "$HOME"/.gu/service_catalogue
    touch -a "$local_env_file_dir"/.env.local
    echo "Adding Github token name and required environment variables"
    echo "$token_text" >> "$local_env_file"
    echo "$env_var_text" >> "$local_env_file"
  fi

source "$local_env_file"

  # Check if GitHub token is set
  if [ -z "$GITHUB_ACCESS_TOKEN" ]
  then
    echo -e "${yellow}Please create or retrieve a GitHub token${clear}.
Visit ${cyan}$github_info_url${clear}, and add it to ${cyan}$local_env_file${clear}"
  fi

}

setup_hook() {
  HOOK_NAME=$1
  step "Setting up $HOOK_NAME hook"
  cp "$ROOT_DIR/.hooks/$HOOK_NAME" "$ROOT_DIR/.git/hooks/$HOOK_NAME"
  chmod +x "$ROOT_DIR/.git/hooks/$HOOK_NAME"
}

setup_hook pre-commit
check_node_version
install_dependencies
check_credentials deployTools
setup_environment deployTools eu-west-1

echo -e "\n${cyan}Setup complete${clear} ✅"
