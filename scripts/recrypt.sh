#!/usr/bin/env bash

# This script can update an SSM parameter that has been encrypted with a KMS
# key to an updated value encrypted with a different key. You may want to do
# this if your KMS key has been re-created by a Cloudformation stack update.
#
# Usage:
#  $ ./recrypt.sh old_kms_key new_kms_key ssm_path
# * old_kms_key: The KMS key id of the old key
# * new_kms_key: The KMS key id of the new key
# * ssm_path:    The SSM path to find the value that needs updating

set -e

OLD_KMS_KEY=$1
NEW_KMS_KEY=$2
SSM_PATH=$3

export AWS_REGION=${AWS_REGION:-eu-west-1}
export AWS_PROFILE=${AWS_PROFILE:-deployTools}

echo "Re-encrypting SSM param ${SSM_PATH}, using old key ${OLD_KMS_KEY}, new key ${NEW_KMS_KEY}"

GITHUB_APP_PRIVATE_KEY=$(aws ssm get-parameter --name ${SSM_PATH} | jq -r ".Parameter.Value")

DECRYPTED_KEY=$(aws kms decrypt --ciphertext-blob "${GITHUB_APP_PRIVATE_KEY}" \
    --key-id ${OLD_KMS_KEY} | jq -r ".Plaintext")

NEW_CYPHERTEXT=$(aws kms encrypt --key-id=${NEW_KMS_KEY} \
    --plaintext $(echo ${DECRYPTED_KEY}) | jq -r ".CiphertextBlob")

CHECK_DECRYPT_CYPHERTEXT=$(aws kms decrypt --ciphertext-blob "${NEW_CYPHERTEXT}" \
    --key-id ${NEW_KMS_KEY} | jq ".Plaintext" -r)

DECRYPTED_KEY_HASH=$(echo $DECRYPTED_KEY | md5)
CHECK_DECRYPT_CYPHERTEXT_HASH=$(echo $CHECK_DECRYPT_CYPHERTEXT | md5)

if [ "$DECRYPTED_KEY_HASH" == "$CHECK_DECRYPT_CYPHERTEXT_HASH" ]; then
    echo "Decrypted strings match!"
    read -p "Do you want to update SSM? " -n 1 -r
    echo    # (optional) move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        aws ssm put-parameter --name ${SSM_PATH} --value ${NEW_CYPHERTEXT} --overwrite
        echo "Successfully updated SSM param :)"
    else
        echo "Exiting."
        exit 0 
    fi
else
    echo "Decrypted strings do not match! Exiting."
    exit 1
fi







