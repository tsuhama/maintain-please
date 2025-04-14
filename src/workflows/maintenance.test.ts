import { Branch, GitControl, Tag } from "../api/git.js";
import { SupportPolicy } from "../core/support.js";
import { StableVersionMatcher } from "../core/matcher.js";
import { parseSemanticVersion } from "../core/version.js";
import {
  maintainStableVersionBranches,
  StableVersionBranch,
} from "./maintenance.js";
import { error } from "@actions/core";

describe("maintenance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("maintainStableVersionBranches", () => {
    const defaultGitMock: Partial<GitControl> = {
      existsBranch: jest.fn((branchName) => Promise.resolve(true)),
      getBranches: jest.fn(() => Promise.resolve([])),
      createBranchFromTag: jest.fn((_, branchName) =>
        Promise.resolve({ name: branchName, sha: "", url: "" }),
      ),
    };
    const defaultSupportPolicyMock: Partial<SupportPolicy> = {
      getLatestVersion: jest.fn(() => parseSemanticVersion("1.0.0")),
      supports: jest.fn((_) => false),
    };
    const defaultMatcherMock: Partial<StableVersionMatcher> = {
      matches: jest.fn((_) => false),
    };
    test("should not create stable version branch if already exists", async () => {
      const git: Partial<GitControl> = {
        ...defaultGitMock,
        existsBranch: jest.fn((_) => Promise.resolve(true)),
      };
      await maintainStableVersionBranches(
        git as GitControl,
        defaultSupportPolicyMock as SupportPolicy,
        defaultMatcherMock as StableVersionMatcher,
      );
      expect(git.createBranchFromTag).not.toHaveBeenCalled();
    });
    test("should create new stable version branch from tag if not exists yet", async () => {
      const tag: Partial<Tag> = {};
      const git: Partial<GitControl> = {
        ...defaultGitMock,
        existsBranch: jest.fn((_) => Promise.resolve(false)),
        getTag: jest.fn((_) => Promise.resolve(tag as Tag)),
      };
      await maintainStableVersionBranches(
        git as GitControl,
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
      const git: Partial<GitControl> = {
        ...defaultGitMock,
        getBranches: jest.fn(() =>
          Promise.resolve([supported.branch, unsupported.branch, unmatched]),
        ),
        deleteBranch: jest.fn(() => Promise.resolve()),
      };
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
        git as GitControl,
        policy as SupportPolicy,
        matcher as StableVersionMatcher,
      );
      expect(git.deleteBranch).toHaveBeenCalledTimes(1);
      expect(git.deleteBranch).toHaveBeenCalledWith(unsupported.branch);
    });
  });
});
