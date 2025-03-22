export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/helpers/*.test.js",
    "<rootDir>/middlewares/*.test.js",
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/models/*.test.js",
    "<rootDir>/config/*test.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/helpers/*.js",
    "<rootDir>/middlewares/*.js",
    "<rootDir>/controllers/*.js",
    "<rootDir>/models/*.js",
    "<rootDir>/config/*.js"
  ],
  
    coverageThreshold: {
      global: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },

    coverageDirectory: "coverage/backend",
  
    coverageReporters: ["json", "lcov", "text", "clover"],
};
