package com.gu.repocop

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import scala.util.{Failure, Success, Try}

//This case class should always contain a subset of fields from packages/common/src/model/github.ts
case class Repository(
    name: String,
    created_at: LocalDateTime,
    updated_at: LocalDateTime,
    pushed_at: LocalDateTime,
    languages: List[String],
    archived: Boolean,
    topics: List[String],
    default_branch: String,
    owners: List[String]
) {

  val lastModified: LocalDateTime =
    List(created_at, updated_at, pushed_at).max
}
