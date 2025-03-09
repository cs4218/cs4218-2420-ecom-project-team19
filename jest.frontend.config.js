export default {
    displayName: "frontend",

    testEnvironment: "jest-environment-jsdom",

    testMatch: [
        "<rootDir>/client/src/components/Footer.test.js",
        "<rootDir>/client/src/components/Header.test.js",
        "<rootDir>/client/src/components/Layout.test.js",
        "<rootDir>/client/src/components/Spinner.test.js",
        "<rootDir>/client/src/pages/About.test.js",
        "<rootDir>/client/src/pages/Pagenotfound.test.js",
        "<rootDir>/client/src/pages/user/Orders.test.js",
        "<rootDir>/client/src/pages/user/Profile.test.js",
    ],

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
        "<rootDir>/client/src/components/Footer.js",
        "<rootDir>/client/src/components/Header.js",
        "<rootDir>/client/src/components/Layout.js",
        "<rootDir>/client/src/components/Spinner.js",
        "<rootDir>/client/src/pages/About.js",
        "<rootDir>/client/src/pages/Pagenotfound.js",
        "<rootDir>/client/src/pages/user/Orders.js",
        "<rootDir>/client/src/pages/user/Profile.js",
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
