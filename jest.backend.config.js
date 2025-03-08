export default {
    displayName: "backend",

    testEnvironment: "node",
  
    testMatch: [
        "<rootDir>/controllers/categoryController.test.js",
        "<rootDir>/models/categoryModel.test.js",
        "<rootDir>/config/db.test.js",
    ],

    collectCoverage: true,
    collectCoverageFrom: [
      "<rootDir>/controllers/categoryController.js",
        "<rootDir>/models/categoryModel.js",
        "<rootDir>/config/db.js",
    ],
    coverageThreshold: {
      global: {
        lines: 100,
        functions: 100,
      },
    },
  };