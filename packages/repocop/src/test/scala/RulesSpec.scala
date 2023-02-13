package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import Rules._

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import java.time.temporal.ChronoUnit
import scala.util.Try

class RulesSpec extends AnyFlatSpec with Matchers {
  val today = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS)
  val timestamp = LocalDateTime.parse("2022-05-09T13:42:50")

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

  val todayRepo: Repository = basicRepo.copy(updated_at = today)

  "The ruleset" should "be able to tell whether or not a repository has a valid owner" in {
    val ownedRepo: Repository = basicRepo
    val unownedRepo: Repository = ownedRepo.copy(owners = List.empty)
    val manyOwnersRepo: Repository =
      ownedRepo.copy(owners = List("team1", "team2"))

    Rules.hasOwner.check(ownedRepo) shouldBe empty
    Rules.hasOwner.check(manyOwnersRepo) shouldBe empty
    Rules.hasOwner.check(unownedRepo) shouldBe defined
  }

  it should "flag if a repository does not contain a valid production status tag" in {
    val noTopicRepo = basicRepo.copy(topics = List.empty)
    val noValidTopicRepo = basicRepo
    val validTopicRepo = basicRepo.copy(topics = List("production", "topic1"))
    val multipleValidTopicRepo =
      basicRepo.copy(topics = List("production", "hackday"))

    Rules.hasValidTopic.check(noTopicRepo) shouldBe defined
    Rules.hasValidTopic.check(noValidTopicRepo) shouldBe defined
    Rules.hasValidTopic.check(validTopicRepo) shouldBe empty
    Rules.hasValidTopic.check(multipleValidTopicRepo) shouldBe empty
  }

  it should "flag if a repository that does not have main as the default branch" in {
    val nonMainRepo = basicRepo.copy(default_branch = "master")
    val mainRepo = basicRepo.copy(default_branch = "main")

    Rules.defaultBranchIsMain.check(nonMainRepo) shouldBe defined
    Rules.defaultBranchIsMain.check(mainRepo) shouldBe empty
  }

  "Rule evaluation" should "only happen if a repository was changed in the last day" in {
    val repos: List[Repository] =
      List(basicRepo.copy(updated_at = today), basicRepo.copy(name = "name2"))

    repos.count(shouldCheck) shouldBe 1
  }

  it should "only take place if the repo is owned by the specified team" in {
    val devx = List("devx-operations")
    val devxAndOthers = List("devx-operations", "some-other-team")

    val actual = Rules.checkForTeam(
      repos = List(
        todayRepo.copy(owners = devx),
        todayRepo.copy(owners = devxAndOthers),
        todayRepo
      ),
      teamSlug = "devx-operations"
    )
    actual.length shouldBe 2
  }
}
