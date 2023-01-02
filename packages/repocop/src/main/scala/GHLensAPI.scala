package com.gu.repocop

import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.parser.parse
import io.circe.{Decoder, Encoder, Error, Json}
import requests.Response

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter.ISO_DATE_TIME
import scala.util.{Failure, Success, Try}

object GHLensAPI {

  def getRepos: Either[Throwable, List[Repository]] = {
    val result = Try(
      requests.get(
        "https://github-lens.gutools.co.uk/repos",
        connectTimeout = 3000,
        readTimeout = 3000
      )
    ).toEither

    result match {
      case Right(response) if response.is2xx =>
        responseToRepos(response.text())
      case Right(_) =>
        Left(new Exception("Non 2xx status code from github lens"))
      case Left(err) =>
        Left(err)
    }
  }

  def responseToRepos(
      requestText: String
  ): Either[Error, List[Repository]] = {
    given dtDecoder: Decoder[LocalDateTime] =
      Decoder.decodeLocalDateTimeWithFormatter(ISO_DATE_TIME)
    given decoder: Decoder[Repository] = deriveDecoder[Repository]

    for {
      json <- parse(requestText)
      repos <- json.hcursor.get[List[Repository]]("payload")
    } yield repos
  }
}
