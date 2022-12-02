package com.gu.repocop

import com.gu.repocop.Evaluation.evaluateFromResponse
import com.gu.repocop.MarkdownHelpers.createPage

import java.io.*

@main
def main(): Unit = {
  val request = requests.get("https://github-lens.gutools.co.uk/repos")
  if (request.is2xx) println(evaluateFromResponse(request.text()))
  else println(s"Could not retrieve content from API - ${request.statusCode} : ${request.statusMessage}")
}

@main
//Use runMain markdown to generate the human readable rule doc
def markdown(): Unit = {
  val bw = new BufferedWriter(new FileWriter(new File("RepoRules.md")))
  bw.write(createPage(Rules.RepoRule.values.toList))
  println("Created rule markdown file")
  bw.close()
}
