import {
  createPrefixStableVersionMatcher,
  StableVersionMatcher,
} from "../core/matcher.js";
import { backportFixBranch } from "./backport.js";
import { jest } from "@jest/globals";

describe("backport", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const git = {
    createPullRequest: jest
      .fn()
      .mockReturnValue(Promise.resolve({ title: "title", url: "", number: 1 })),
    getBranch: jest
      .fn()
      .mockReturnValue(Promise.resolve({ name: "name", sha: "", url: "" })),
    getBranches: jest.fn(),
  };
  describe("backport fix branch", () => {
    const matcher = createPrefixStableVersionMatcher("stable-");
    test("should not create any pr, if there is no stable version branch", async () => {
      git.getBranches.mockReturnValueOnce(Promise.resolve([]));
      await backportFixBranch(
        git as any,
        matcher as StableVersionMatcher,
        "bugfix-test",
      );
      expect(git.createPullRequest).not.toHaveBeenCalled();
    });
    test("should create pr for each stable version present", async () => {
      git.getBranches.mockReturnValue(
        Promise.resolve([
          { name: "stable-1.0", sha: "", url: "" },
          { name: "stable-2.1", sha: "", url: "" },
        ]),
      );
      await backportFixBranch(
        git as any,
        matcher as StableVersionMatcher,
        "bugfix-test",
      );
      expect(git.createPullRequest).toBeCalledTimes(2);
    });
  });
});
