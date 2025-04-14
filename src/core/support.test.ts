import { createNMinusRangeSupportPolicy } from "../../src/core/support.js";

describe("support policy", () => {
  describe("n minus support policy", () => {
    const policy = createNMinusRangeSupportPolicy("4.6.0", 2, 3);
    test("should throw error if input version is greater than latest version", () => {
      expect(() => policy.supports({ major: 4, minor: 7 })).toThrow();
    });
    test("should return true if input version is equal to latest version", () => {
      expect(policy.supports({ major: 4, minor: 6 })).toBe(true);
    });
    test("should return true if supported major version", () => {
      expect(policy.supports({ major: 2, minor: 0 })).toBe(true);
    });
    test("should return false if unsupported major version", () => {
      expect(policy.supports({ major: 1, minor: 8 })).toBe(false);
    });
    test("should return true if supported minor version", () => {
      expect(policy.supports({ major: 4, minor: 3 })).toBe(true);
    });
    test("should return false if unsupported minor version", () => {
      expect(policy.supports({ major: 4, minor: 2 })).toBe(false);
    });
  });
});
