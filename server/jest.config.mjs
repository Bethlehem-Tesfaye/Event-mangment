export default {
  testEnvironment: "node",
  transform: {},
  clearMocks: true,
  coverageDirectory: "coverage",

  transformIgnorePatterns: ["/node_modules/(?!@prisma/client)"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  testMatch: [
    "**/__tests__/**/*.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  ]
};
