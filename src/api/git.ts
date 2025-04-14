// Instance per repository
import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/types";

export interface GitControl {
  getBranches(): Promise<Branch[]>;
  getBranch(branchName: string): Promise<Branch>;
  getTag(tagName: string): Promise<Tag>;
  createBranchFromTag(tag: Tag, newBranchName: string): Promise<Branch>;
  existsBranch(branchName: string): Promise<boolean>;
  deleteBranch(branch: Branch): Promise<void>;
  createPullRequest(
    title: string,
    body: string,
    sourceBranchName: string,
    targetBranchName: string,
  ): Promise<PullRequest>;
}

export function createGitHubControl(
  repository: string,
  owner: string,
  defaultBranch: string,
  token: string,
): GitControl {
  return new GitHubControl(new Octokit({ auth: token }), {
    repo: repository,
    owner: owner,
    defaultBranch: defaultBranch,
  });
}

export interface Repository {
  readonly owner: string;
  readonly repo: string;
  readonly defaultBranch: string;
}

export interface Commit {
  sha: string;
  message: string;
  files?: string[];
  pullRequest?: PullRequest;
}

export interface Branch {
  readonly name: string;
  readonly sha: string;
  readonly url: string;
}

export interface Tag {
  name: string;
  sha: string;
}

export interface PullRequest {
  readonly url: string;
  readonly title: string;
  readonly number: number;
}

export class GitHubControl implements GitControl {
  constructor(
    readonly octokit: Octokit,
    readonly repository: Repository,
  ) {}

  async getBranch(branchName: string): Promise<Branch> {
    const {
      data: {
        object: { sha, url },
      },
    } = await this.octokit.git.getRef({
      repo: this.repository.repo,
      owner: this.repository.owner,
      ref: `heads/${branchName}`,
    });
    return {
      name: branchName,
      url: url,
      sha: sha,
    };
  }

  async existsBranch(branchName: string): Promise<boolean> {
    return this.octokit.git
      .getRef({
        repo: this.repository.repo,
        owner: this.repository.owner,
        ref: `heads/${branchName}`,
      })
      .then(() => true)
      .catch((err: RequestError) => {
        if (err.status === 404) {
          return false;
        } else {
          throw err;
        }
      });
  }

  async getTag(tagName: string): Promise<Tag> {
    const {
      data: {
        object: { sha },
      },
    } = await this.octokit.git.getRef({
      repo: this.repository.repo,
      owner: this.repository.owner,
      ref: `tags/${tagName}`,
    });
    return {
      name: tagName,
      sha: sha,
    };
  }

  async createBranchFromTag(tag: Tag, newBranchName: string): Promise<Branch> {
    const {
      data: {
        object: { sha, url },
      },
    } = await this.octokit.git.createRef({
      owner: this.repository.owner,
      repo: this.repository.repo,
      ref: `refs/heads/${newBranchName}`,
      sha: tag.sha,
    });
    return {
      name: newBranchName,
      url: url,
      sha: sha,
    };
  }

  async createPullRequest(
    title: string,
    body: string,
    sourceBranchName: string,
    targetBranchName: string,
  ): Promise<PullRequest> {
    const response: { data: { url: string; title: string; number: number } } =
      await this.octokit.request({
        method: "POST",
        url: "/repos/{owner}/{repo}/pulls",
        owner: this.repository.owner,
        repo: this.repository.repo,
        title: title,
        body: body,
        head: sourceBranchName,
        base: targetBranchName,
      });
    return {
      url: response.data.url,
      title: response.data.title,
      number: response.data.number,
    };
  }

  async deleteBranch(branch: Branch): Promise<void> {
    await this.octokit.git.deleteRef({
      owner: this.repository.owner,
      repo: this.repository.repo,
      ref: branch.sha,
    });
  }

  async getBranches(): Promise<Branch[]> {
    const branches: { name: string; commit: { url: string; sha: string } }[] =
      [];
    const response = await this.octokit.request(
      "/repos/{owner}/{repo}/branches",
      {
        owner: this.repository.owner,
        repo: this.repository.repo,
      },
    );
    branches.push(...response.data);
    return branches.map((value) => ({
      name: value.name,
      url: value.commit.url,
      sha: value.commit.sha,
    }));
  }
}
