package com.gu.repocop

import com.gu.repocop.{MarkdownHelpers, Repository, Rules}
import java.time.temporal.ChronoUnit


import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import com.gu.repocop.MarkdownHelpers.createPage

import java.io.*
import Rules.RepoRule._

@main
def main(): Unit = {

  val todayTimestamp = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS)
  val today = todayTimestamp.toString
  val yesterday = todayTimestamp.minusDays(1).toString
  val beforeTheCutoff = todayTimestamp.minusWeeks(2).toString

  val updatedToday = Repository(
    name = "name",
    `private` = false,
    description = "a short description",
    created_at = beforeTheCutoff,
    updated_at = today,
    pushed_at = beforeTheCutoff,
    languages = List("Scala, TypeScript"),
    archived = false,
    topics = List("topic1", "topic2"),
    default_branch = "main",
    owners = List("team1"))

    println("Repo has owner? " + hasOwner.evaluate(updatedToday))


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