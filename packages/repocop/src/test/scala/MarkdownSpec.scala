package com.gu.repocop

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

//NB: This test is used in a pre-commit hook. If it fails, you can regenerate the markdown using `runMain com.gu.repocop.markdown`
class MarkdownSpec extends AnyFlatSpec with Matchers {

  "The contents of the markdown page" should "exactly match what is produced by the function" in {
    import scala.io.Source

    val filename = "RepoRules.md"
    val source = Source.fromFile(filename)
    val fileContent: String = source.getLines().toList.mkString("\n")+"\n"
    source.close()

    MarkdownHelpers.createPage(Rules.RepoRule.values.toList) shouldEqual fileContent
  }

}
