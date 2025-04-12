import { Branch } from "../../src/api/git";
import { createPrefixStableVersionMatcher } from "../../src";

describe("maintenance", () => {
  describe("prefix based stable version matcher", () => {
    const matcher = createPrefixStableVersionMatcher("stable-");
    test("should throw error if version is requested on mismatch", () => {
      const branch: Partial<Branch> = { name: "1.0" };
      expect(matcher.matches(branch as Branch)).toBe(false);
      expect(() => matcher.getVersion(branch as Branch)).toThrow();
    });
    test("should get stable version if requested on match", () => {
      const branch: Partial<Branch> = { name: "stable-2.3" };
      expect(matcher.matches(branch as Branch)).toBe(true);
      expect(matcher.getVersion(branch as Branch)).toStrictEqual({
        major: 2,
        minor: 3,
      });
    });
  });
});
