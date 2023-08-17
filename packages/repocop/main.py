import boto3
from database_interactions import connect_to_db, select
import datetime as dt
from rules import repository_01
import sqlalchemy as sa

def handler(event=None, context=None):
    session = boto3.Session(region_name='eu-west-1')
    conn = connect_to_db(session)
    engine = sa.create_engine('postgresql://', creator=lambda: conn)
    print("Connected to CloudQuery DB")
    default_branch_df = select('github_repositories',['full_name', 'default_branch'], engine)
    repository_01_df = repository_01(default_branch_df)
    repository_01_df['timestamp'] = dt.datetime.now().replace(microsecond=0)
    repository_01_df.to_sql('repocop_github_repository_rules', engine, if_exists='replace', index=False)
    print("Successfully updated repocop_github_repository_rules table")

if __name__ == "__main__":
    handler()
