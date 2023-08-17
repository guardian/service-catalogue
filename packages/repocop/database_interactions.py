import boto3
import json
import pandas as pd
import psycopg2 as ps
import os

def _get_secret_arn(secret_client) -> str:
    paginator = secret_client.get_paginator('list_secrets')

    response_iterator = paginator.paginate(
        Filters=[
            {
                'Key': 'tag-value',
                'Values': [
                    'cloud-query' #App
                ]
            }
        ]
    )
    secret_arn = list(response_iterator)[0]["SecretList"][0]['ARN']
    return secret_arn


def connect_to_db(session: boto3.Session):
    """Gets the credentials for the database from AWS Secrets Manager"""
    secret_client = session.client('secretsmanager', 'eu-west-1')

    if "SECRET_ARN" in os.environ:
        print('AWS Lambda environment detected')
        secret_arn = os.environ.get('SECRET_ARN')
    else:
        print("Local environment detected: fetching secret ARN")
        secret_arn = _get_secret_arn(secret_client)

    secret = secret_client.get_secret_value(
        SecretId=secret_arn
    )["SecretString"]

    secret_json = json.loads(secret)
    conn = ps.connect(
    host=secret_json['host'],
    port=secret_json['port'],
    dbname='',
    user=secret_json['username'],
    password=secret_json['password'])

    return conn

def select(table_name:str, columns: list[str], db_engine) -> pd.DataFrame:
    return pd.read_sql_table(table_name, con=db_engine, columns=columns)