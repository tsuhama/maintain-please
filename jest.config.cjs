/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/build/"],
  coverageReporters: ["json-summary", "text", "lcov"],
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/*.test.ts"],
  resolver: "ts-jest-resolver",
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: ["node_modules"],
  transform: {
    "^.+\.tsx?$": ["ts-jest", { useESM: true }],
  },
  reporters: ["default", "jest-junit"],
};
