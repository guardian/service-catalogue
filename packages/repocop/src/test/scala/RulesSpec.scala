package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import Rules._
import RepoRule.*

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import java.time.temporal.ChronoUnit
import scala.util.Try

class RulesSpec extends AnyFlatSpec with Matchers {
  val timestamp: String = "2022-05-09T13:42:50.000Z"
  val basicRepo = Repository(
    name = "name",
    created_at = timestamp,
    updated_at = timestamp,
    pushed_at = timestamp,
    languages = List("Scala, TypeScript"),
    archived = false,
    topics = List("topic1", "topic2"),
    default_branch = "main",
    owners = List("team1")
  )
  val today: String = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS).toString
  val todayRepo: Repository = basicRepo.copy(updated_at = today)

  "The ruleset" should "be able to tell whether or not a repository has a valid owner" in {
    val ownedRepo: Repository = basicRepo
    val unownedRepo: Repository = ownedRepo.copy(owners = List.empty)
    val manyOwnersRepo: Repository = ownedRepo.copy(owners = List("team1", "team2"))

    hasOwner.evaluate(ownedRepo) shouldBe true
    hasOwner.evaluate(manyOwnersRepo) shouldBe true
    hasOwner.evaluate(unownedRepo) shouldBe false
  }

  it should "flag if a repository does not contain a valid production status tag" in {
    val noTopicRepo = basicRepo.copy(topics = List.empty)
    val noValidTopicRepo = basicRepo
    val validTopicRepo = basicRepo.copy(topics = List("production", "topic1"))
    val multipleValidTopicRepo = basicRepo.copy(topics = List("production", "hackday"))

    hasValidTopic.evaluate(noTopicRepo) shouldBe false
    hasValidTopic.evaluate(noValidTopicRepo) shouldBe false
    hasValidTopic.evaluate(validTopicRepo) shouldBe true
    hasValidTopic.evaluate(multipleValidTopicRepo) shouldBe true
  }

  it should "flag if a repository that does not have main as the default branch" in {
    val nonMainRepo = basicRepo.copy(default_branch = "master")
    val mainRepo = basicRepo.copy(default_branch = "main")

    defaultBranchIsMain.evaluate(nonMainRepo) shouldBe false
    defaultBranchIsMain.evaluate(mainRepo) shouldBe true
  }

  "Evaluating all of the rules in a repo" should "produce all required flags with the relevant results" in {
    Rules.evaluateRulesForRepo(basicRepo) shouldEqual Map("hasOwner" -> true, "hasValidTopic" -> false, "defaultBranchIsMain" -> true)
  }

  "Evaluating the rules of a list of repos" should "return the name along with the rule map" in {
    evaluateRulesForRepos(List(basicRepo)).head.name shouldEqual "name"
  }

//  "Rule evaluation" should "only happen if a repository was changed in the last day" in {
//    val repos: List[Repository] = List(basicRepo.copy(updated_at = today), basicRepo.copy(name = "name2"))
//    val actual = evaluateReposForTeam(repos, "team1")
//    actual.length shouldBe 1
//  }
//
//  it should "only take place if the repo is owned by the specified team" in {
//    val devx = List("devx-operations")
//    val devxAndOthers = List("devx-operations", "some-other-team")
//
//    val actual = evaluateReposForTeam(
//      repos = List(
//        todayRepo.copy(owners = devx),
//        todayRepo.copy(owners = devxAndOthers),
//        todayRepo
//      ),
//      teamSlug = "devx-operations")
//    actual.length shouldBe 2
//  }

}
