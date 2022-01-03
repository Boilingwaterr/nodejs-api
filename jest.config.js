module.exports = {
  roots: ['<rootDir>/src'],

  preset: 'ts-jest',

  testEnvironment: 'node',

  clearMocks: true,

  resetMocks: true,

  resetModules: true,

  restoreMocks: true,

  collectCoverage: true,

  verbose: true,

  collectCoverageFrom: ['src/controllers/user.controller.ts'],

  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@controllers(.*)$': '<rootDir>/src/controllers$1',
    '^@middlewares(.*)$': '<rootDir>/src/middlewares$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@models(.*)$': '<rootDir>/src/models$1',
    '^@routes(.*)$': '<rootDir>/src/routes$1'
  }
};
