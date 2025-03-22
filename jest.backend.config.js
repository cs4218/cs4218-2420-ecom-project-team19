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
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/helpers/*.js",
    "<rootDir>/middlewares/*.js",
    "<rootDir>/controllers/*.js",
    "<rootDir>/models/*.js",
  ],
  
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 60,
        functions: 90,
        lines: 80,
      },
    },
};