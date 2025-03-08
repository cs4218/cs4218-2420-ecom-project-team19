export default {
    // test suite name
    displayName: "frontend",

    // Frontend should use JSDOM to simulate a browser environment
    testEnvironment: "jest-environment-jsdom",

    // Look for test files inside the `client/src` directory
    //testMatch: ["<rootDir>/client/src/**/*.test.{js,jsx,ts,tsx}"],
    testMatch: [
        "<rootDir>/client/src/pages/user/Profile.test.js"
    ],

    // Transform JS and JSX files using Babel
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },

    // Mock static assets (CSS, SCSS, images) to avoid unnecessary processing
    moduleNameMapper: {
      "\\.(css|scss)$": "identity-obj-proxy",
    },

    // Ignore transformation of unnecessary node_modules except certain packages
    transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

    // Collect coverage only from relevant frontend files
    collectCoverage: true,
    //{collectCoverageFrom: [
    //  "client/src/**/*.{js,jsx,ts,tsx}",
    //  "!client/src/index.js",  // Ignore entry point
    //  "!client/src/reportWebVitals.js",  // Ignore unused analytics file
    //  "!client/src/setupTests.js",  // Ignore test setup
    //],
    collectCoverageFrom: [
        "<rootDir>/client/src/pages/user/Profile.js"
    ],

    // Set code coverage thresholds
    coverageThreshold: {
      global: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },

    // Setup file for frontend test utilities
    setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
};