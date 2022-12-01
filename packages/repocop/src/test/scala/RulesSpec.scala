package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import Rules.RepoRule._
import Rules.{evaluateRulesForRepo, evaluateRulesForAllRepos}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
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
    owners= List("team1")
  )

  "The ruleset" should "be able to tell whether or not a repository has a valid owner" in {
    val ownedRepo: Repository = basicRepo
    val unownedRepo: Repository = ownedRepo.copy(owners=List.empty)
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

  it should "flag whether a repository has its default branch set to main or not" in {
    val defaultMainRepo = basicRepo
    val defaultMasterRepo= basicRepo.copy(default_branch = "master")
    defaultBranchIsMain.evaluate(defaultMainRepo) shouldBe true
    defaultBranchIsMain.evaluate(defaultMasterRepo) shouldBe false
  }

  "Evaluating all of the rules in a repo" should "produce all required flags with the relevant results" in {
    Rules.evaluateRulesForRepo(basicRepo) shouldEqual Map("hasOwner" -> true, "hasValidTopic" -> false, "defaultBranchIsMain" -> true)
  }

  "Evaluating the rules of a list of repos" should "return the name along with the rule map" in {
    evaluateRulesForAllRepos(List(basicRepo)).head.name shouldEqual "name"
  }

}
