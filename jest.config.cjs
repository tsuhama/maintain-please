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
  transformIgnorePatterns: ["node_modules"],
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};
