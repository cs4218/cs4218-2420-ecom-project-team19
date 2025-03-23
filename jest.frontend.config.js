export default {
  displayName: "frontend",

  testEnvironment: "jest-environment-jsdom",

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  // "<rootDir>/client/src/pages/**/*.test.js"
  // set to only admin for local testing
  testMatch: [
    "<rootDir>/client/src/components/Form/*.test.js",
    "<rootDir>/client/src/components/Route/Private.test.js",
    "<rootDir>/client/src/components/*.test.js",
    "<rootDir>/client/src/context/*.test.js",
    "<rootDir>/client/src/hooks/*.test.js", 
    "<rootDir>/client/src/pages/**/*.test.js",
    "<rootDir>/client/src/pages/*.test.js",
    "<rootDir>/client/src/pages/integrationTests/*.test.js",
    "<rootDir>/client/src/pages/integration-tests/*.test.js"
  ],

  // jest code coverage
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/client/src/components/Form/*.js",
    "<rootDir>/client/src/components/Routes/Private.js",
    "<rootDir>/client/src/components/*.js",
    "<rootDir>/client/src/context/*.js",
    "<rootDir>/client/src/hooks/*.js", 
    "<rootDir>/client/src/pages/**/*.js",
    "<rootDir>/client/src/pages/*.js"],

  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  },

  coverageDirectory: "coverage/frontend",

  coverageReporters: ["json", "lcov", "text", "clover"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};