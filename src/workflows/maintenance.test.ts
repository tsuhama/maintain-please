import { Branch, Tag } from "../api/git.js";
import { SupportPolicy } from "../core/support.js";
import { StableVersionMatcher } from "../core/matcher.js";
import { parseSemanticVersion } from "../core/version.js";
import {
  maintainStableVersionBranches,
  StableVersionBranch,
} from "./maintenance.js";
import { error } from "@actions/core";
import { jest } from "@jest/globals";

describe("maintenance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("maintainStableVersionBranches", () => {
    const git = {
      existsBranch: jest.fn().mockReturnValue(Promise.resolve(true)),
      getBranches: jest.fn().mockReturnValue(Promise.resolve([])),
      createBranchFromTag: jest
        .fn()
        .mockReturnValue(Promise.resolve({ name: "name", sha: "", url: "" })),
      getTag: jest.fn(),
      deleteBranch: jest.fn(),
    };
    const defaultSupportPolicyMock: Partial<SupportPolicy> = {
      getLatestVersion: jest.fn(() => parseSemanticVersion("1.0.0")),
      supports: jest.fn((_) => false),
    };
    const defaultMatcherMock: Partial<StableVersionMatcher> = {
      matches: jest.fn((_) => false),
    };
    test("should not create stable version branch if already exists", async () => {
      git.existsBranch.mockReturnValueOnce(Promise.resolve(true)),
        await maintainStableVersionBranches(
          git as any,
          defaultSupportPolicyMock as SupportPolicy,
          defaultMatcherMock as StableVersionMatcher,
        );
      expect(git.createBranchFromTag).not.toHaveBeenCalled();
    });
    test("should create new stable version branch from tag if not exists yet", async () => {
      const tag: Partial<Tag> = {};
      git.existsBranch.mockReturnValueOnce(Promise.resolve(false));
      git.getTag.mockReturnValueOnce(Promise.resolve(tag as Tag));
      await maintainStableVersionBranches(
        git as any,
        defaultSupportPolicyMock as SupportPolicy,
        defaultMatcherMock as StableVersionMatcher,
      );
      expect(git.createBranchFromTag).toHaveBeenCalledWith(tag, "stable-1.0");
    });
    test("should delete unsupported and matched stable version branches", async () => {
      const latestVersion = parseSemanticVersion("4.2.3");
      const supported: StableVersionBranch = {
        version: { major: 3, minor: 8 },
        branch: { name: "stable-3.8", sha: "", url: "" },
      };
      const unsupported: StableVersionBranch = {
        version: { major: 2, minor: 5 },
        branch: { name: "stable-2.5", sha: "", url: "" },
      };
      const unmatched: Branch = {
        name: "feature-1",
        sha: "",
        url: "",
      };
      const policy: Partial<SupportPolicy> = {
        getLatestVersion: jest.fn(() => latestVersion),
        supports: jest.fn((version) => version === supported.version),
      };
      git.getBranches.mockReturnValueOnce(
        Promise.resolve([supported.branch, unsupported.branch, unmatched]),
      );
      const matcher: Partial<StableVersionMatcher> = {
        matches: (branch) => branch !== unmatched,
        getVersion: (branch) => {
          switch (branch) {
            case supported.branch:
              return supported.version;
            case unsupported.branch:
              return unsupported.version;
            default:
              throw error("unexpected");
          }
        },
      };
      await maintainStableVersionBranches(
        git as any,
        policy as SupportPolicy,
        matcher as StableVersionMatcher,
      );
      expect(git.deleteBranch).toHaveBeenCalledTimes(1);
      expect(git.deleteBranch).toHaveBeenCalledWith(unsupported.branch);
    });
  });
});
