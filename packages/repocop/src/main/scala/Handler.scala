package com.gu.repocop

class Handler {
  def handler: Either[Throwable, List[EvaluatedRepo]] = GHLensAPI.getRepos.map(Rules.evaluateReposForTeam(_, "devx-operations"))
}