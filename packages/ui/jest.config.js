const rnPreset = require('react-native/jest-preset');

/** @type {import('jest').Config} */
module.exports = {
  ...rnPreset,
  rootDir: '.',
  watchman: false,
  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    ...rnPreset.transform,
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  moduleNameMapper: {
    ...rnPreset.moduleNameMapper,
    '^@betterat/ui$': '<rootDir>/src',
    '^@betterat/ui/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [...(rnPreset.testPathIgnorePatterns ?? []), '/dist/'],
};
