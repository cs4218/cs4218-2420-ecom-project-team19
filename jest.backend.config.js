export default {
    // Name for test suite
    displayName: "backend",
  
    // Backend should use Node.js environment
    testEnvironment: "node",
  
    // Look for test files inside `controllers`, `models`, `middlewares`, `routes`, `helpers`
    testMatch: ["<rootDir>/{controllers,models,middlewares,routes,helpers}/**/*.test.js"],
  
    // Collect coverage from all backend logic files
    collectCoverage: true,
    collectCoverageFrom: [
      "controllers/**/*.js",
      "models/**/*.js",
      "middlewares/**/*.js",
      "routes/**/*.js",
      "helpers/**/*.js",
      "!**/node_modules/**",   // Exclude node_modules
      "!**/config/**"          // Exclude config files
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
  
    // Ensure Jest doesn't process unnecessary files
    transformIgnorePatterns: ["/node_modules/"],
  
    // Setup file for initializing global mocks
    // setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  };
  