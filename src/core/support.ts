import {
  parseSemanticVersion,
  SemanticVersion,
  StableVersion,
  toStableVersion,
} from "./version";

export interface SupportPolicy {
  supports(version: StableVersion): boolean;
  getLatestVersion(): SemanticVersion;
}

export function createNMinusRangeSupportPolicy(
  latestReleaseVersion: string,
  majorRange: number,
  minorRange: number,
): SupportPolicy {
  return new NMinusRangeSupportPolicy(
    parseSemanticVersion(latestReleaseVersion),
    majorRange,
    minorRange,
  );
}

// N-{{range}} policy on minor and major
export class NMinusRangeSupportPolicy implements SupportPolicy {
  constructor(
    readonly latestVersion: SemanticVersion,
    readonly majorRange: number,
    readonly minorRange: number,
  ) {}

  getLatestVersion(): SemanticVersion {
    return this.latestVersion;
  }

  /**
   * example major: n-1, minor: n-2
   * latest version 3.2: 2.2=>true, 1.6=>false, 2.0=>true(as we don't evaluate the minor)
   * latest version 2.5: 2.0 =>false, 1.0=>true, 2.3=>true
   * @param version
   */
  supports(version: StableVersion): boolean {
    const latestStableVersion = toStableVersion(this.latestVersion);
    if (this.compare(version, latestStableVersion) >= 1) {
      throw Error(
        `Input version ${version} is greater than latest version ${latestStableVersion}`,
      );
    }
    if (this.compare(version, latestStableVersion) === 0) {
      return true;
    }
    // if same major, we have to check the minor version support
    if (latestStableVersion.major === version.major) {
      const supportedMinorVersion = latestStableVersion.minor - this.minorRange;
      return version.minor >= supportedMinorVersion;
    }
    // smaller major version, so we just check the major version support
    const supportedMajorVersion = latestStableVersion.major - this.majorRange;
    return version.major >= supportedMajorVersion;
  }

  // if a is larger than b, then 1
  // if b is larger than a, then -1
  // if a  b then 0
  private compare(a: StableVersion, b: StableVersion): number {
    if (a.major > b.major) {
      return 1;
    }
    if (a.major < b.major) {
      return -1;
    }
    // same major
    if (a.minor > b.minor) {
      return 1;
    }
    if (a.minor < b.minor) {
      return -1;
    }
    // same major and minor
    return 0;
  }
}
