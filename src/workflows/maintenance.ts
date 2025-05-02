import { Branch, GitControl } from "../api/git.js";
import { StableVersion, toStableVersion } from "../core/version.js";
import { SupportPolicy } from "../core/support.js";
import { StableVersionMatcher } from "../core/matcher.js";

// should be executed on creation of LATEST release and NOT on backport releases
export async function maintainStableVersionBranches(
  git: GitControl,
  supportPolicy: SupportPolicy,
  staleVersionMatcher: StableVersionMatcher,
) {
  const releasedVersion = supportPolicy.getLatestVersion();
  console.info(
    `running stable version maintenance for latest release ${releasedVersion}`,
  );
  const stableVersion = toStableVersion(releasedVersion);
  const stableVersionBranchName = `stable-${stableVersion.major}.${stableVersion.minor}`;
  const stableVersionBranchExists = await git.existsBranch(
    stableVersionBranchName,
  );
  if (stableVersionBranchExists) {
    console.info(
      `stable version branch ${stableVersionBranchName} already exists.`,
    );
  } else {
    const releaseTag = await git.getTag(
      `v${releasedVersion.major}.${releasedVersion.minor}.${releasedVersion.patch}`,
    );
    // create stable-version branch for newly released version
    console.info(
      `creating stable version branch for release tag ${releaseTag.name} with sha ${releaseTag.sha}`,
    );
    const stableVersionBranch = await git.createBranchFromTag(
      releaseTag,
      stableVersionBranchName,
    );
    console.info(
      `successfully created stable version branch ${stableVersionBranch.name} with sha ${stableVersionBranch.sha}`,
    );
  }

  // delete all stable-version branches based on support policy config
  const stableVersionBranches = await getStableVersionBranches(
    git,
    staleVersionMatcher,
  );
  stableVersionBranches
    .filter((it) => !supportPolicy.supports(it?.version))
    .forEach((it) => {
      console.info(
        `deleting branch ${it?.branch.name} with sha ${it?.branch.sha} for unsupported stable version ${it?.version.major}.${it?.version.minor}.`,
      );
      git.deleteBranch(it?.branch);
    });
  console.info("stable version maintenance completed.");
}

export async function getStableVersionBranches(
  git: GitControl,
  matcher: StableVersionMatcher,
): Promise<StableVersionBranch[]> {
  const branches = await git.getBranches();
  return branches
    .map((it) => toStaleVersionBranch(matcher, it))
    .filter((it) => it !== null);
}

export interface StableVersionBranch {
  readonly branch: Branch;
  readonly version: StableVersion;
}

function toStaleVersionBranch(
  matcher: StableVersionMatcher,
  branch: Branch,
): StableVersionBranch | null {
  if (matcher.matches(branch)) {
    return {
      branch: branch,
      version: matcher.getVersion(branch),
    };
  } else {
    return null;
  }
}
