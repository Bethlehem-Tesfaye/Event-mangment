export default {
  testEnvironment: "node",
  transform: {},
  clearMocks: true,
  coverageDirectory: "coverage",

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  transformIgnorePatterns: ["node_modules/(?!(@prisma/client))"],

  testMatch: [
    "**/__tests__/**/*.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  ]
};
