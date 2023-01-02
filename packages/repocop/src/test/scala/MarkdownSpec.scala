package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.io.Source

//NB: This test is used in a pre-commit hook. If it fails, you can regenerate
//the markdown using `runMain com.gu.repocop.markdown`.
class MarkdownSpec extends AnyFlatSpec with Matchers {

  "The contents of the markdown page" should "exactly match what is produced by the function" in {
    val fileContent = Source.fromFile("RepoRules.md").mkString
    MarkdownHelpers.createPage(Rules.all) shouldEqual fileContent
  }
}
