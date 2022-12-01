package com.gu.repocop

object Rules {

  def singleLineStrippedString(s: String): String = s.stripMargin.replace("\n", "")

  enum RepoRule(statement: Repository => Boolean, val violationMessage: String, val ruleJustification: String = ""):
    def evaluate(r: Repository): Boolean = statement(r)

    case hasOwner extends RepoRule(
      statement = _.owners.nonEmpty,
      violationMessage = "Requires a valid team set as an owner",
      ruleJustification = singleLineStrippedString(
        """Repositories are generally required to have a team owner for smoother handover in case someone leaves or
          | moves to another team. When somebody leaves the org, any individual access they had to a repository is
          |maintained, so there is a security case for this rule as well as a maintainability one."""
      )
    )

    case hasValidTopic extends RepoRule(
      statement = repoContainsProductionStatus,
      violationMessage = "Valid production status topic required",
      ruleJustification = singleLineStrippedString(
        """Currently, we mandate that production P+E repos need to be reliably integrated with Snyk. In order to work
          | out which projects contain production code, we ask that all choose from a list of status tags"""
      )
    )

    case defaultIsMain extends RepoRule(
      statement = _.default_branch == "main",
      violationMessage = "Default branch should be main",
      ruleJustification = singleLineStrippedString(
        """Github's default for the head branch is now main. Many workflow tools rely on this assumption, and it is
          | considered to be a more inclusive choice of language."""
      )
    )
  end RepoRule

  private def repoContainsProductionStatus(r: Repository): Boolean = r.topics.exists(isAllowedTopic)

  private def isAllowedTopic(topic: String): Boolean = {
    topic match {
      case "production" | "hackday" | "testing" | "learning" | "prototype" | "documentation" => true
      case _ => false
    }
  }


}
