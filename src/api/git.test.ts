import dotenv from "dotenv";
import { createGitHubControl } from "./git.js";

describe("github", () => {
  dotenv.config();
  const git = createGitHubControl(
    "release-workflow-test-project",
    "tsuhama",
    "main",
    process.env.TEST_REPOSITORY_TOKEN!!,
  );
  describe("get all branches", () => {
    test("contains at least default branch", async () => {
      const branches = await git.getBranches();
      expect(branches.map((it) => it.name)).toContain("main");
    });
    test("contains at least default branch", async () => {
      const branches = await git.getBranches();
      expect(
        branches.filter((it) => it.name.startsWith("stable-")).length,
      ).toBeGreaterThan(0);
    });
  });
  describe("branch exists", () => {
    test("should return true for main", async () => {
      const result = await git.existsBranch("main");
      expect(result).toBe(true);
    });
    test("should return false for non existing branch", async () => {
      const result = await git.existsBranch(
        "branch-name-which-will-never-exist",
      );
      expect(result).toBe(false);
    });
  });
  describe("get branch", () => {
    test("should return branch for main", async () => {
      const response = await git.getBranch("main");
      expect(response.name).toBe("main");
    });
  });
  describe("get tag", () => {
    test("should return release tag", async () => {
      const response = await git.getTag("0.0.1");
      expect(response.name).toBe("0.0.1");
      expect(response.sha).toBe("fb9bf76756a4776d0c6f4a86d6cdab86d305aecb");
    });
  });
});
