package com.gu.repocop

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import java.time.temporal.ChronoUnit
import scala.util.{Failure, Success, Try}

//This case class should always contain a subset of fields from packages/common/src/model/github.ts
case class Repository(
                       name: String,
                       created_at: String,
                       updated_at: String,
                       pushed_at: String,
                       languages: List[String],
                       archived: Boolean,
                       topics: List[String],
                       default_branch: String,
                       owners: List[String]) {

  private val dateOfLastChange: Try[LocalDateTime] = Try(List(
    LocalDateTime.parse(created_at, ISO_DATE_TIME),
    LocalDateTime.parse(updated_at, ISO_DATE_TIME),
    LocalDateTime.parse(pushed_at, ISO_DATE_TIME)
  ).max)

  private val midnightYesterday: LocalDateTime = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS).minusDays(1)

  val rerunRepocop: Boolean=  dateOfLastChange match
    case Failure(e) => //if we can't fetch the dates, rerun anyway unless repo has been archived
      println(s"Failed to parse timestamps for $name")
      !archived
    case Success(latestUpdate) => latestUpdate.isAfter(midnightYesterday) & !archived

}
