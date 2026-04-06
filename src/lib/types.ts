export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
    node_id: string;
  } | null;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  topics?: string[];
  archived: boolean;
  subscribers_count: number;
  size: number;
  created_at: string;
}

export interface DetailedRepository extends Repository {
  readme: string | null;
}

export interface Readme {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string; // Base64 encoded
  encoding: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  icon?: string;
  color?: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  userId: string;
  type: "github";
  addedAt: string;
  itemData: Repository;
}

export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

export interface Release {
  tag_name: string;
  name: string;
  published_at: string;
}

export interface CompareResult {
  url: string;
  html_url: string;
  permalink_url: string;
  diff_url: string;
  patch_url: string;
  base_commit: Commit;
  merge_base_commit: Commit;
  status: "diverged" | "ahead" | "behind" | "identical";
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Commit[];
  files: any[];
}

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  type: "User" | "Organization";
}

export interface CustomModel {
  id: string;
  userId: string;
  name: string;
  description: string;
  repositories: string[]; // Array of owner/repo strings
  createdAt: Date;
  updatedAt: Date;
}
