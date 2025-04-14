// backporting fix branch to all stable version branches by creating pull request against each of the stable version
import { GitControl } from "../api/git.js";
import { getStableVersionBranches } from "./maintenance.js";
import { StableVersionMatcher } from "../core/matcher.js";

export async function backportFixBranch(
  git: GitControl,
  matcher: StableVersionMatcher,
  fixBranchName: string,
) {
  const stableVersionBranches = await getStableVersionBranches(git, matcher);
  const fixBranch = await git.getBranch(fixBranchName);
  for (const it of stableVersionBranches) {
    console.info(
      `creating backport pull request from ${fixBranchName} against ${it.branch.name}.`,
    );
    const title = `backporting ${fixBranchName} to ${it.branch.name}`;
    const body = "this PR was generated by maintain-please...";
    const pr = await git.createPullRequest(
      title,
      body,
      fixBranch.name,
      it.branch.name,
    );
    console.info(
      `successfully created backport pull request ${pr.number} for stable version ${it.version}.`,
    );
  }
}
