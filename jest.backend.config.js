export default {
    displayName: "backend",

    testEnvironment: "node",
  
    testMatch: ["<rootDir>/controllers/*.test.js"],

    collectCoverage: true,
    collectCoverageFrom: ["controllers/**"],
    coverageThreshold: {
      global: {
        lines: 100,
        functions: 100,
      },
    },
  };