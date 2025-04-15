const VERSION_REGEX =
  /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(-(?<preRelease>[^+]+))?(\+(?<build>.*))?/;

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
  const match = versionValue.match(VERSION_REGEX);
  if (!match?.groups) {
    throw Error(`unable to parse version string: ${versionValue}`);
  }
  const major = Number(match.groups.major);
  const minor = Number(match.groups.minor);
  const patch = Number(match.groups.patch);
  return {
    major: major,
    minor: minor,
    patch: patch,
  };
}
