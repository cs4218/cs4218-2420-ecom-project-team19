export default {
    displayName: "frontend",

    // Use JSDOM to simulate a browser environment
    testEnvironment: "jest-environment-jsdom",

    // test theses files only
    testMatch: [
        "<rootDir>/controllers/categoryController.test.js"
    ],

    // use Babel
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },

    moduleNameMapper: {
      "\\.(css|scss)$": "identity-obj-proxy",
    },

    transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

    // Collect coverage only from relevant frontend files
    collectCoverage: true,
    collectCoverageFrom: [
        "<rootDir>/controllers/categoryController.js"
    ],

    coverageThreshold: {
      global: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
};