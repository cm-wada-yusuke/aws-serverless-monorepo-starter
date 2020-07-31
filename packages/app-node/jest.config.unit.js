'use strict';

module.exports = {
  "roots": [
    "<rootDir>/tests/unit",
  ],
  testMatch: ['**/*.test.ts'],
  "transform": {
    "^.+\\.tsx?$": "ts-jest",
  },
};
