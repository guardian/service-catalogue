package com.gu.repocop

import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.parser.parse
import io.circe.{Decoder, Encoder, Error, Json}
import requests.Response

import scala.util.{Failure, Success, Try}

object GHLensAPI {

  def getRepos: Either[Throwable, List[Repository]] = request.map { response =>
    if (response.is2xx) {
      extractRepoListsFromText(response.text())
    } else {
      val msg = "Non 2xx status code from github lens"
      println(msg)
      Left(new Exception(msg))
    }
  }.joinRight

  def extractRepoListsFromText(
      requestText: String
  ): Either[Error, List[Repository]] = {
    implicit val decoder: Decoder[Repository] = deriveDecoder[Repository]
    implicit val encoder: Encoder[Repository] = deriveEncoder[Repository]

    val parsed: Either[Error, Json] = parse(requestText)
    val payload: Either[Error, Json] =
      parsed.map(_.hcursor.get[Json]("payload")).joinRight

    val parsingResult: Either[Error, List[Repository]] =
      (for {
        json <- payload
      } yield json.as[List[Repository]]).joinRight
    parsingResult
  }

  private def request: Either[Throwable, Response] = Try(
    requests.get(
      "https://github-lens.gutools.co.uk/repos",
      connectTimeout = 3000,
      readTimeout = 3000
    )
  ).toEither
}
