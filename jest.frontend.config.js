export default {
    // name displayed during tests
    displayName: "frontend",
  
    // simulates browser environment in jest
    // e.g., using document.querySelector in your tests
    testEnvironment: "jest-environment-jsdom",
  
    // jest does not recognise jsx files by default, so we use babel to transform any jsx files
    transform: {
      "^.+\\.jsx?$": "babel-jest",
    },
  
    // tells jest how to handle css/scss imports in your tests
    moduleNameMapper: {
      "\\.(css|scss)$": "identity-obj-proxy",
    },
  
    // ignore all node_modules except styleMock (needed for css imports)
    transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],
  
    // only run these tests
    // "<rootDir>/client/src/pages/**/*.test.js"
    // set to only admin for local testing
    testMatch: [
        "<rootDir>/client/src/pages/*.test.js",
        "<rootDir>/client/src/context/*.test.js",
        "<rootDir>/client/src/hooks/*.test.js",
        "<rootDir>/client/src/components/Form/SearchInput.test.js"
    ],
  
    // jest code coverage
    collectCoverage: true,
    collectCoverageFrom: [
        "<rootDir>/client/src/pages/*.js",
        "<rootDir>/client/src/context/*.js",
        "<rootDir>/client/src/hooks/*.js",
        "<rootDir>/client/src/components/Form/SearchInput.js"
    ],
    coverageThreshold: {
      global: {
        lines: 100,
        functions: 100,
      },
    },
  };