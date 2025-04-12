// backporting fix branch to all stable version branches by creating pull request against each of the stable version
import { GitControl } from "../api/git";
import { getStableVersionBranches } from "./maintenance";
import { StableVersionMatcher } from "../core/matcher";

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
    const pr = await git.createPullRequest(fixBranch, it.branch);
    console.info(
      `successfully created backport pull request ${pr.number} for stable version ${it.version}.`,
    );
  }
}
