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
        "<rootDir>/client/src/pages/CartPage.test.js",
        "<rootDir>/client/src/pages/Categories.test.js",
        "<rootDir>/client/src/pages/CategoryProduct.test.js",
        "<rootDir>/client/src/pages/HomePage.test.js",
        "<rootDir>/client/src/pages/ProductDetails.test.js",
        "<rootDir>/client/src/pages/Search.test.js",
        "<rootDir>/client/src/context/cart.test.js",
        "<rootDir>/client/src/context/search.test.js",
        "<rootDir>/client/src/hooks/*.test.js",
        "<rootDir>/client/src/components/Form/SearchInput.test.js"
    ],
  
    // jest code coverage
    collectCoverage: true,
    collectCoverageFrom: [
        "<rootDir>/client/src/pages/CartPage.js",
        "<rootDir>/client/src/pages/Categories.js",
        "<rootDir>/client/src/pages/CategoryProduct.js",
        "<rootDir>/client/src/pages/HomePage.js",
        "<rootDir>/client/src/pages/ProductDetails.js",
        "<rootDir>/client/src/pages/Search.js",
        "<rootDir>/client/src/context/cart.js",
        "<rootDir>/client/src/context/search.js",
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