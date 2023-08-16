from pandas import DataFrame

#default_branch_df needs to be a dataframe with the following columns:
# - full_name (string)
# - default_branch (string)
def repository_01(default_branch_df: DataFrame) -> DataFrame:
    """Repository 01: Default branch should be main"""
    #make sure that the required columns exist
    assert 'full_name' in default_branch_df.columns, 'full_name column is missing'
    assert 'default_branch' in default_branch_df.columns, 'default_branch column is missing'

    default_branch_df['repository_01'] = default_branch_df['default_branch'] == 'main'
    return default_branch_df[['full_name', 'repository_01']]

#owner_df requires columns 'repo_name', 'slug'
#topics_df requires columns 'full_name', 'topics'
def repository_06(owner_df, topics_df, production_topics, non_pe_teams)-> DataFrame:
    """Repository 06: Repository is owned by a team outside of P&E or has a production topic"""
    #make sure that the required columns exist
    assert 'repo_name' in owner_df.columns, 'repo_name column is missing from owner_df'
    assert 'slug' in owner_df.columns, 'slug column is missing from owner_df'
    assert 'full_name' in topics_df.columns, 'full_name column is missing from topics_df'
    assert 'topics' in topics_df.columns, 'topics column is missing from topics_df'
    aggregated_name_and_owners = owner_df.groupby(['repo_name'])['slug'].apply(set).reset_index(name='slugs')
    merged_df = aggregated_name_and_owners.merge(topics_df, how='left', left_on='repo_name', right_on='full_name')[['repo_name', 'slugs', 'topics']]
    merged_df['has_production_topic'] = merged_df.dropna().apply(lambda row: any(item in production_topics for item in row['topics']), axis=1)
    merged_df['outside_p_and_e'] = merged_df.apply(lambda row: all(item in non_pe_teams for item in row['slugs']), axis=1)
    merged_df['repository_06'] = merged_df.apply(lambda row: (row['outside_p_and_e']) or row['has_production_topic'], axis=1)
    return merged_df[['repo_name','repository_06']]