/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  coverageReporters: ["json-summary", "text", "lcov"],
  testMatch: ["**/test/**/*.ts"],
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};
