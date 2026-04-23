module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  clearMocks: true,
};

