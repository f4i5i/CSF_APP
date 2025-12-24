const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  jest: {
    configure: (jestConfig) => {
      return {
        ...jestConfig,
        moduleNameMapper: {
          ...jestConfig.moduleNameMapper,
          '^@/(.*)$': '<rootDir>/src/$1',
        },
        setupFiles: ['<rootDir>/src/jest.polyfills.js'],
        setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
        testEnvironment: 'jsdom',
        testEnvironmentOptions: {
          customExportConditions: [''],
        },
        // Override transformIgnorePatterns to include ESM packages
        transformIgnorePatterns: [
          '/node_modules/(?!(axios|@tanstack/react-query|msw|@mswjs|until-async)/)',
        ],
        collectCoverageFrom: [
          'src/**/*.{js,jsx,ts,tsx}',
          '!src/**/*.d.ts',
          '!src/index.{js,jsx,ts,tsx}',
          '!src/reportWebVitals.js',
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
      };
    },
  },
};
