package com.gu.repocop

import com.gu.repocop.MarkdownHelpers.createPage

import java.io.*
import scala.concurrent.{Future, ExecutionContext}
import ExecutionContext.Implicits.global

@main
def main(): String = {
  val result: Either[Throwable, List[EvaluatedRepo]] =
    GHLensAPI.getRepos.map(Rules.evaluateReposForTeam(_, "devx-operations"))
  val output = result match
    case Left(e)      => e.getMessage
    case Right(repos) => s"evaluated ${repos.length.toString} repos"
  println(output)
  output
}

@main
def markdown(): Unit = {
  val bw = new BufferedWriter(new FileWriter(new File("RepoRules.md")))
  bw.write(createPage(Rules.RepoRule.values.toList))
  println("Created rule markdown file")
  bw.close()
}
