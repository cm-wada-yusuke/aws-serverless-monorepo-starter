'use strict';

module.exports = {
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testEnvironment: 'node', // for cross origin
  testSequencer: '<rootDir>/tests/e2e/jest.sequencer.js',
  globalSetup: '<rootDir>/tests/e2e/setup.ts'
};
