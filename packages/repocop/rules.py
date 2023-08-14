from pandas import DataFrame

#owner_df requires columns 'repo_name', 'slug'
#topics_df requires columns 'full_name', 'topics'
def github_06(owner_df, topics_df, production_topics, non_pe_teams)-> DataFrame:
    aggregated_name_and_owners = owner_df.groupby(['repo_name'])['slug'].apply(set).reset_index(name='slugs')
    merged_df = aggregated_name_and_owners.merge(topics_df, how='left', left_on='repo_name', right_on='full_name')[['repo_name', 'slugs', 'topics']]
    merged_df['has_production_topic'] = merged_df.dropna().apply(lambda row: any(item in production_topics for item in row['topics']), axis=1)
    merged_df['outside_p_and_e'] = merged_df.apply(lambda row: all(item in non_pe_teams for item in row['slugs']), axis=1)
    merged_df['github_06'] = merged_df.apply(lambda row: (row['outside_p_and_e']) or row['has_production_topic'], axis=1)
    return merged_df[['repo_name','github_06']]