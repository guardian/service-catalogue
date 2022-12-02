package com.gu.repocop

import com.gu.repocop.Evaluation._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

class EvaluationSpec extends AnyFlatSpec with Matchers {

  val today: String = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS).toString
  val pushedAt: String = s"${'"'}pushed_at${'"'}: ${'"'}${today}${'"'},"

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
      |      "updated_at": "2022-05-09T13:42:50.000Z", """.stripMargin + pushedAt +
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
  it should "return the same error no matter where we are in the code, given we failed at the same point" in {
    def step1Failure(s: String) = extractRepoListsFromText(s)
    def step1And2Failure(s: String) = evaluateFromResponse(s)
    step1Failure(partialJson).isLeft & step1And2Failure(partialJson).isLeft shouldBe true
    step1Failure(partialJson) shouldEqual step1And2Failure(partialJson)

    val notJson = "beep boop"
    step1Failure(notJson).isLeft & step1And2Failure(notJson).isLeft shouldBe true
    step1Failure(notJson) shouldEqual step1And2Failure(notJson)
  }


}
