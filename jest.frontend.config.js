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
    testMatch: ["<rootDir>/client/src/(pages|context|hooks|components)/**/*.test.js"],

    // jest code coverage
    collectCoverage: true,
    collectCoverageFrom: ["<rootDir>/client/src/(pages|context|hooks|components)/**/*.js"],
    coverageThreshold: {
      global: {
        lines: 100,
        functions: 100,
      },
    },
};
