package com.gu.repocop

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME

case class Repository(
                       name: String,
                       Private: Boolean,
                       description: String,
                       created_at: String,
                       updated_at: String,
                       pushed_at: String,
                       languages: List[String],
                       archived: Boolean,
                       topics: List[String],
                       default_branch: String,
                       owners: List[String]) {

  val dateOfLastChange = List(
    LocalDateTime.parse(created_at, ISO_DATE_TIME),
    LocalDateTime.parse(updated_at, ISO_DATE_TIME),
    LocalDateTime.parse(pushed_at, ISO_DATE_TIME)
  ).max

}
