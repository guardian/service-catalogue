package com.gu.repocop

import com.gu.repocop.Repository
import com.gu.repocop.MarkdownHelpers.createPage
import com.gu.repocop.Rules.evaluateRulesForAllRepos

import io.circe.*
import io.circe.parser.*
import io.circe.generic.semiauto.*

import java.io.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME

@main
def main(): Unit = {

  implicit val decoder: Decoder[Repository] = deriveDecoder[Repository]
  implicit val encoder: Encoder[Repository] = deriveEncoder[Repository]
  val request = requests.get("https://github-lens.gutools.co.uk/repos")
  if (request.is2xx) {
    val repos = request.text().drop(11).dropRight(43) //yes i know it's hacky i'll fix it later

    decode[List[Repository]](repos) match
      case Right(repos) => {
        val opsRepos:List[Repository] = repos.filter{r => r.rerunRepocop & r.owners.contains("devx-operations")}
        evaluateRulesForAllRepos(opsRepos).foreach(println)
      }
      case Left(e) => println(s"Failed to parse repositories: ${e.getMessage}")

  }
  else {
    println(s"Could not retrieve content from API - ${request.statusCode} : ${request.statusMessage}")
  }

}

@main
//Use runMain markdown to generate the human readable rule doc
def markdown():Unit = {
  val bw = new BufferedWriter(new FileWriter(new File("RepoRules.md")))
  bw.write(createPage(Rules.RepoRule.values.toList))
  println("Created rule markdown file")
  bw.close()
}