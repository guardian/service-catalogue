const generateProject = name => {
  return {
    displayName: name,
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: [`<rootDir>/packages/${name}/**/*.test.ts`],
    // setupFilesAfterEnv: [`./jest.setup.${name}.js`],
  }
}

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  projects: ['cdk', 'api', 'repo-fetcher', 'teams-fetcher'].map(generateProject)
};

