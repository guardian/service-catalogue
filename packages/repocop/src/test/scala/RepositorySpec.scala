package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.temporal.ChronoUnit
import java.time.{LocalDate, LocalDateTime}

class RepositorySpec extends AnyFlatSpec with Matchers{

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
    owners= List("team1"))

  "A repository that has had any kind of change since yesterday" should "require an update to be sent" in {

    val updatedYesterday = updatedToday.copy(created_at = beforeTheCutoff, updated_at = yesterday, pushed_at = beforeTheCutoff)
    val createdYesterday = updatedToday.copy(created_at = yesterday, updated_at = yesterday, pushed_at = yesterday)
    val pushedYesterday = updatedToday.copy(created_at = beforeTheCutoff, updated_at = beforeTheCutoff, pushed_at = yesterday)

    updatedToday.updateRequired shouldBe true
    updatedYesterday.updateRequired shouldBe true
    createdYesterday.updateRequired shouldBe true
    pushedYesterday.updateRequired shouldBe true
  }

  "A repository that has not changed since yesterday" should "not require any updates to be sent" in{
    val oldRepo = updatedToday.copy(created_at = beforeTheCutoff, updated_at = beforeTheCutoff, pushed_at = beforeTheCutoff)

    oldRepo.updateRequired shouldBe false
  }

  "A repository with any unparseable date" should "update anyway" in {
    val unclearDate = updatedToday.copy(created_at = beforeTheCutoff, updated_at = beforeTheCutoff, pushed_at = "asdfghjkl")
    val allUnclearDates = unclearDate.copy(created_at = "qwertyuiop", updated_at = "zxcvbnm")
    unclearDate.updateRequired shouldBe true
    allUnclearDates.updateRequired shouldBe true
  }



}
