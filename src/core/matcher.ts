import { Branch } from "../api/git";
import { StableVersion } from "./version";

export interface StableVersionMatcher {
  matches(branch: Branch): boolean;
  getVersion(name: Branch): StableVersion;
}

export function createPrefixStableVersionMatcher(
  prefix: string,
): StableVersionMatcher {
  return new PrefixStableVersionMatcher(prefix);
}

class PrefixStableVersionMatcher implements StableVersionMatcher {
  constructor(readonly prefix: string) {}

  matches(branch: Branch): boolean {
    return branch.name.startsWith(this.prefix);
  }
  getVersion(branch: Branch): StableVersion {
    if (!this.matches(branch)) {
      throw Error("does not match pattern");
    }
    const versionString = branch.name.replace(this.prefix, "");
    const majorVersionString = versionString.substring(
      0,
      versionString.indexOf("."),
    );
    const minorVersionString = versionString.substring(
      versionString.indexOf(".") + 1,
      versionString.length,
    );
    return {
      major: parseInt(majorVersionString),
      minor: parseInt(minorVersionString),
    };
  }
}
