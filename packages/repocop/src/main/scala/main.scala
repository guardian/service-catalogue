package com.gu.repocop

import com.gu.repocop.{MarkdownHelpers, Repository, Rules}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import com.gu.repocop.MarkdownHelpers.createPage

import java.io.*
@main
def main(): Unit = {

  /*
   * Filter out archived repos
   * Group repos by team
   * Apply rules
   * Send notifications as required
   */

}

@main
// To generate the human readable rule doc run:
// sbt "runMain com.gu.repocop.markdown"
def markdown():Unit = {
  val bw = new BufferedWriter(new FileWriter(new File("RepoRules.md")))
  bw.write(createPage(Rules.RepoRule.values.toList))
  println("Created rule markdown file")
  bw.close()
}