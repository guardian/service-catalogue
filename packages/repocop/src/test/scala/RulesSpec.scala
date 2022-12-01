package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import Rules.RepoRule.{hasOwner, hasValidTopic}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import scala.util.Try

class RulesSpec extends AnyFlatSpec with Matchers {
  val timestamp: String = "2022-05-09T13:42:50.000Z"
  val basicRepo = Repository(name = "name",
    `private` = false,
    description = "a short description",
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

}
