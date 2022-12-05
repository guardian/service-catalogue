package com.gu.repocop

import com.gu.repocop.MarkdownHelpers.createPage

import java.io.*
import scala.concurrent.{ Future, ExecutionContext }
import ExecutionContext.Implicits.global

@main
def main(): Unit = {
  val repos: Either[Throwable, List[Repository]] = GHLensAPI.getRepos
  repos.map(Rules.evaluateReposForTeam(_, "devx-operations")).map(_.foreach(println))
}

@main
//Use runMain markdown to generate the human readable rule doc
def markdown(): Unit = {
  val bw = new BufferedWriter(new FileWriter(new File("RepoRules.md")))
  bw.write(createPage(Rules.RepoRule.values.toList))
  println("Created rule markdown file")
  bw.close()
}
