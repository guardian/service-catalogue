-- Add readerrevanalysts to guardian_non_p_and_e_github_teams
BEGIN TRANSACTION;

INSERT INTO guardian_non_p_and_e_github_teams (team_name)
VALUES ('readerrevanalysts')
ON CONFLICT (team_name) DO NOTHING;

BEGIN TRANSACTION;
