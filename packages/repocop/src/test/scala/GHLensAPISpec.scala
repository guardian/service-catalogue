package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import GHLensAPI.extractRepoListsFromText

class GHLensAPISpec extends AnyFlatSpec with Matchers {

  val today: String = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS).toString
  val pushedToday: String = s"${'"'}pushed_at${'"'}: ${'"'}${today}${'"'},"

  val repotext: String =
    """{
      |  "payload": [
      |    {
      |      "id": 1,
      |      "name": "repo1",
      |      "full_name": "org/repo1/",
      |      "private": false,
      |      "description": "A repo",
      |      "created_at": "2010-06-22T14:21:52.000Z",
      |      "updated_at": "2022-05-09T13:42:50.000Z", """.stripMargin + pushedToday +
      """
        |      "size": 92,
        |      "archived": false,
        |      "open_issues_count": 0,
        |      "is_template": false,
        |      "topics": [],
        |      "default_branch": "master",
        |      "owners": ["devx-operations"],
        |      "languages": []
        |    },
        |    {
        |      "id": 2,
        |      "name": "repo2",
        |      "full_name": "org/repo2",
        |      "private": false,
        |      "description": "Another Repo",
        |      "created_at": "2010-06-22T14:24:16.000Z",
        |      "updated_at": "2022-06-10T10:44:55.000Z",
        |      "pushed_at": "2022-05-30T16:16:07.000Z",
        |      "size": 4068,
        |      "archived": false,
        |      "open_issues_count": 1,
        |      "is_template": false,
        |      "topics": [
        |        "production"
        |      ],
        |      "default_branch": "main",
        |      "owners": [
        |        "developer-experience",
        |        "devx-operations",
        |        "devx-reliability",
        |        "devx-security"
        |      ],
        |      "languages": [
        |        "Scala",
        |        "Shell"
        |      ]
        |    }
        |  ],
        |  "lastModified": "2022-12-01T10:44:44.000Z"
        |}""".stripMargin
  val partialJson: String = repotext.take(100)
  "A typical API response" should "deserialise all the repos" in {
    extractRepoListsFromText(repotext).getOrElse(List()).length shouldBe 2
  }
  "A malformed API response" should "fail gracefully" in {
    extractRepoListsFromText(partialJson).isLeft shouldBe true
  }



}
