import { Version } from "release-please/build/src/version";

export interface SemanticVersion {
  readonly patch: number;
  readonly minor: number;
  readonly major: number;
}

export interface StableVersion {
  readonly minor: number;
  readonly major: number;
}

export function toStableVersion(version: SemanticVersion): StableVersion {
  return {
    minor: version.minor,
    major: version.major,
  };
}

export function parseSemanticVersion(versionValue: string): SemanticVersion {
  const version = Version.parse(versionValue);
  return {
    major: version.major,
    minor: version.minor,
    patch: version.patch,
  };
}
