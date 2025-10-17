module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/db/connection.js', // Exclude database connection file
    '!src/db/init.js', // Exclude database init file
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000, // 30 seconds timeout for tests
  verbose: true,
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Facebook AI Manager Test Results',
      outputPath: './test-results/test-report.html',
      includeFailureMsg: true
    }]
  ]
};