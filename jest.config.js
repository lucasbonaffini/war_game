module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/services/**/*.js',
      'src/models/**/*.js',
      'src/routes/**/*.js',
      '!src/**/*.test.js',
      '!src/**/index.js',
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    }
  };
  