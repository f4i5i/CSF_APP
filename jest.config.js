module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.{js,jsx,ts,tsx}',
    '!src/reportWebVitals.js',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/mocks/**',
    '!src/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(axios|@tanstack/react-query|msw)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  roots: ['<rootDir>/src'],
  verbose: true,
};
