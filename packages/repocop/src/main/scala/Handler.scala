package com.gu.repocop

class Handler {
  def handler: String = {
    val result: Either[Throwable, List[EvaluatedRepo]] = GHLensAPI.getRepos.map(Rules.evaluateReposForTeam(_, "devx-operations"))
    result match
      case Left(e) => e.getMessage
      case Right(repos) => s"evaluated ${repos.length.toString} repos"
  }
}