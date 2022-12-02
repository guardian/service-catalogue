ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "3.2.1"

lazy val root = (project in file("."))
  .settings(
    name := "repocop",
    idePackagePrefix := Some("com.gu.repocop")
  )
libraryDependencies ++= Seq(
  "org.scalatest" %% "scalatest" % "3.2.14" % Test
)

val jarName = "repocop.jar"
assembly / assemblyJarName := jarName