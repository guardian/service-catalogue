ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "3.2.1"

lazy val root = (project in file("."))
  .settings(
    name := "repocop",
    idePackagePrefix := Some("com.gu.repocop")
  )
val circeVersion = "0.14.3"

libraryDependencies ++= Seq(
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "com.lihaoyi" %% "requests" % "0.7.1",
  "org.scalatest" %% "scalatest" % "3.2.14" % Test
)

val jarName = "repocop.jar"
assembly / assemblyJarName := jarName
