from rules import *
from pandas import DataFrame

#TODO test column name assertions

def test_repo_01():
    # new dataframe with full_name and default_branch columns
    branch_df = DataFrame([
        ['repo1', 'main'],
        ['repo2', 'master'],
        ['repo3', 'myBranch'],
    ], columns=['full_name', 'default_branch'])

    repository_01_df = repository_01(branch_df)
    # check only one cell in the repository_01 column is True
    repo1_follows_rule = repository_01_df.loc[repository_01_df['full_name'] == 'repo1', 'repository_01'].isin([True]).bool()
    true_count= (repository_01_df['repository_01']).sum()
    false_count = (~repository_01_df['repository_01']).sum()
    assert repo1_follows_rule is True
    assert true_count == 1
    assert false_count == 2

def test_repo_06():
    # rule is defined here https://github.com/guardian/recommendations/blob/main/best-practices.md
    # Only p_and_e2 should be flagged as it has no production topic and at least one owner is an internal team
    topics_df = DataFrame([
    ['interactive1', ['production']], #has a topic, owned externally
    ['interactive2', []], #no topic, owned externally
    ['p_and_e1', ['production', 'topic2']], #has a topic, owned internally
    ['p_and_e2', ['topic1', 'topic2']], #no topic, owned internally
    ], columns=['full_name', 'topics'])

    owner_df = DataFrame([ 
        ['interactive1', 'outside_team1'],
        ['interactive1', 'outside_team2'],
        ['interactive2', 'outside_team1'],
        ['p_and_e1', 'internal_team1'],
        ['p_and_e1', 'internal_team2'],
        ['p_and_e1', 'outside_team1'],
        ['p_and_e2', 'internal_team1'],
    ], columns=['repo_name', 'slug'])

    production_topics = ['production']
    oustide_teams = ['outside_team1', 'outside_team2']
    
    gh_df = repository_06(owner_df, topics_df, production_topics, oustide_teams)
    true_count= (gh_df['repository_06']).sum()
    false_count = (~gh_df['repository_06']).sum()

    p_and_e2_repo_follows_rule =gh_df.loc[gh_df['repo_name'] == 'p_and_e2', 'repository_06'].isin([True]).bool()
    assert p_and_e2_repo_follows_rule is False
    assert true_count == 3
    assert false_count == 1


