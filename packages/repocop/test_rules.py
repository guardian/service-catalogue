from rules import github_06
from pandas import DataFrame

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

def test_gh_06():
    # rule is defined here https://github.com/guardian/recommendations/blob/main/best-practices.md
    # Only p_and_e2 should be flagged as it has no production topic and at least one owner is an internal team
    gh_df = github_06(owner_df, topics_df, production_topics, oustide_teams)

    true_count = gh_df.value_counts('github_06')[0]
    false_count = gh_df.value_counts('github_06')[1]

    p_and_e2_repo_follows_rule =gh_df.loc[gh_df['repo_name'] == 'p_and_e2', 'github_06'].isin([True]).bool()
    assert p_and_e2_repo_follows_rule is False
    assert true_count == 3
    assert false_count == 1


