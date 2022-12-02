package com.gu.repocop

import Rules.evaluateRulesForAllRepos

import io.circe.{Decoder, Encoder, Error, Json}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.parser.parse

object Evaluation {

  def evaluateFromResponse(requestText: String): Either[Error, List[EvaluatedRepo]] = {
    val parsingResult: Either[Error, List[Repository]] = extractRepoListsFromText(requestText)

    parsingResult.map { repoList =>
      val opsRepos: List[Repository] = repoList.filter { r => r.rerunRepocop & r.owners.contains("devx-operations") }
      evaluateRulesForAllRepos(opsRepos)
    }
  }

  def extractRepoListsFromText(requestText: String): Either[Error, List[Repository]] = {
    implicit val decoder: Decoder[Repository] = deriveDecoder[Repository]
    implicit val encoder: Encoder[Repository] = deriveEncoder[Repository]

    val parsed: Either[Error, Json] = parse(requestText)
    val payload: Either[Error, Json] = parsed.map(_.hcursor.get[Json]("payload")).joinRight

    val parsingResult: Either[Error, List[Repository]] =
      (for {
        json <- payload;
      } yield json.as[List[Repository]]).joinRight
    parsingResult
  }
}
