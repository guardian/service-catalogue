package com.gu.repocop
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

case class Error(ruleName: String, errorMessage: String)

case class Report(repoName: String, errors: List[Error])

case class Rule(
    name: String,
    description: String,
    check: Repository => Option[Error]
)

def buildCheck(
    name: String,
    pred: Repository => Boolean,
    errorMessage: Repository => String
): Repository => Option[Error] = { (repo: Repository) =>
  {
    if (!pred(repo)) Some(Error(name, errorMessage(repo)))
    else None
  }
}

object Rules {
  val hasOwner = Rule(
    name = "hasOwner",
    check = buildCheck(
      "hasOwner",
      _.owners.nonEmpty,
      _ => "Requires a valid team set as an owner."
    ),
    description = formatMessage(
      """Repositories are required to have a team owner for smoother handover
      in case someone leaves or moves to another team. When somebody leaves
      the org, any individual access they had to a repository is maintained,
      so there is a security case for this rule as well as a maintainability
      one."""
    )
  )

  val hasValidTopic = Rule(
    name = "hasValidTopic",
    check = buildCheck(
      "hasValidTopic",
      _.topics.exists(isAllowedTopic),
      _ => "Valid production status topic required"
    ),
    description = formatMessage(
      """Currently, we mandate that production P+E repos need to be reliably
      integrated with Snyk. In order to work out which projects contain
      production code, we ask that all choose from a list of status
      tags"""
    )
  )

  val defaultBranchIsMain = Rule(
    name = "defaultBranchIsMain",
    check = buildCheck(
      "defaultBranchIsMain",
      _.default_branch == "main",
      _ => "Default branch should be main"
    ),
    description = formatMessage(
      """Github's default for the head branch is now main. Many workflow tools
      rely on this assumption, and it is considered to be a more inclusive
      choice of language."""
    )
  )

  def all: List[Rule] = List(
    hasOwner,
    hasValidTopic,
    defaultBranchIsMain
  )

  def checkForTeam(repos: List[Repository], teamSlug: String): List[Report] = {
    val teamRepos = repos.filter { r =>
      shouldCheck(r) & r.owners.contains(teamSlug)
    }

    teamRepos.map(repo => {
      Report(repo.name, checkRepo(all, repo))
    })
  }

  def checkRepo(rules: List[Rule], repo: Repository): List[Error] = {
    rules.flatMap(rule => rule.check(repo))
  }

  def shouldCheck(repo: Repository): Boolean = {
    val midnightYesterday =
      LocalDateTime.now().truncatedTo(ChronoUnit.DAYS).minusDays(1)
    repo.lastModified.isAfter(midnightYesterday) & !repo.archived
  }
}

private def isAllowedTopic(topic: String): Boolean = {
  topic match {
    case "production" | "hackday" | "testing" | "learning" | "prototype" |
        "documentation" =>
      true
    case _ => false
  }
}

private def formatMessage(msg: String): String =
  msg.stripMargin.replace("\n", "").replaceAll("""\s+""", " ")
