import dotenv from "dotenv";
import { createGitHubControl } from "../../src";

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
});
