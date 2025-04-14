import { StableVersionMatcher } from "../../src/core/matcher.js";
import { GitControl } from "../../src/api/git.js";
import { backportFixBranch } from "../../src/workflows/backport.js";
import * as maintenance from "../../src/workflows/maintenance.js";

jest.mock("../../src/workflows/maintenance");

describe("backport", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("backport fix branch", () => {
    const git: Partial<GitControl> = {
      createPullRequest: jest.fn((title, body, source, target) =>
        Promise.resolve({ title: title, url: "", number: 1 }),
      ),
      getBranch: jest.fn((name) =>
        Promise.resolve({ name: name, sha: "", url: "" }),
      ),
    };
    const matcher: Partial<StableVersionMatcher> = {};
    const getStableVersionBranchesSpy = jest.spyOn(
      maintenance,
      "getStableVersionBranches",
    );
    test("should not create any pr, if there is no stable version branch", async () => {
      getStableVersionBranchesSpy.mockImplementation(() => Promise.resolve([]));
      await backportFixBranch(
        git as GitControl,
        matcher as StableVersionMatcher,
        "bugfix-test",
      );
      expect(git.createPullRequest).not.toHaveBeenCalled();
    });
    test("should create pr for each stable version present", async () => {
      getStableVersionBranchesSpy.mockImplementation(() =>
        Promise.resolve([
          {
            branch: { name: "stable-1.0", sha: "", url: "" },
            version: { major: 1, minor: 0 },
          },
          {
            branch: { name: "stable-2.1", sha: "", url: "" },
            version: { major: 2, minor: 1 },
          },
        ]),
      );
      await backportFixBranch(
        git as GitControl,
        matcher as StableVersionMatcher,
        "bugfix-test",
      );
      expect(git.createPullRequest).toBeCalledTimes(2);
    });
  });
});
