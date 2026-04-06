
'use server';

import { cache } from 'react';
import type { Repository, Readme, Contributor, Commit, Release, CompareResult, GithubUser } from './types';
import { parseGitHubURL } from './url-parser';

const GITHUB_API_URL = 'https://api.github.com';

async function fetchGitHubAPI<T>(path: string, tags: string[]): Promise<T> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    'X-GitHub-Api-Version': '2022-11-28',
    Accept: 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(`${GITHUB_API_URL}${path}`, { 
    headers,
    next: {
        tags,
        revalidate: 3600 // Revalidate every hour
    }
  });

  if (!res.ok) {
    let errorMessage = `GitHub API error ${res.status}: ${res.statusText}.`;

    if (res.status === 401) {
        errorMessage = 'GitHub API Error (401): Bad credentials. The GITHUB_TOKEN in your .env file is invalid or has expired. Please check it and refer to the README.md for instructions.';
    } else if (res.status === 403) {
        errorMessage = 'GitHub API Error (403): Rate limit exceeded. If you have not set a GITHUB_TOKEN, you may have hit the public rate limit. Please add a personal access token to your .env file as described in README.md.';
    } else if (res.status === 404) {
        errorMessage = `GitHub API Error (404): Not Found. The requested resource at '${path}' could not be found.`;
    } else {
        try {
            const errorBody = await res.json();
            if (errorBody && errorBody.message) {
                errorMessage = `GitHub API Error (${res.status}): ${errorBody.message}`;
            }
        } catch (e) {
            // Response was not JSON, use the initial error message
        }
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function searchRepositories(query: string, sort: 'updated' | 'stars' | 'forks' = 'stars', direction: 'desc' | 'asc' = 'desc', language?: string): Promise<Repository[]> {
    if (!query && !language) return [];

    const inputParts = query.split(/[\s,]+/).filter(p => p.trim() !== '');

    // Check if ALL parts of the query are valid repo identifiers
    const identifiers = inputParts.map(part => {
        const parsed = parseGitHubURL(part);
        return parsed.isValid ? { owner: parsed.owner, repo: parsed.repo } : null;
    });

    const isBulkFetch = identifiers.length > 0 && identifiers.every(id => id !== null);

    if (isBulkFetch) {
        try {
            const repoPromises = (identifiers as {owner: string, repo: string}[]).map(({ owner, repo }) => 
                getRepositoryDetails(owner, repo).catch(e => {
                    console.warn(`Failed to fetch repository: ${owner}/${repo}`, e.message);
                    return null;
                })
            );
            const results = (await Promise.all(repoPromises)).filter((repo): repo is Repository => repo !== null);
            
            // Apply sorting to the fetched results
            results.sort((a, b) => {
                let valA, valB;
                switch (sort) {
                    case 'stars':
                        valA = a.stargazers_count;
                        valB = b.stargazers_count;
                        break;
                    case 'forks':
                        valA = a.forks_count;
                        valB = b.forks_count;
                        break;
                    case 'updated':
                        valA = new Date(a.updated_at).getTime();
                        valB = new Date(b.updated_at).getTime();
                        break;
                    default:
                        return 0;
                }

                if (direction === 'desc') {
                    return valB - valA;
                } else {
                    return valA - valB;
                }
            });

            return results;
        } catch (error) {
            console.error("Error fetching repositories by identifier:", error);
            return [];
        }
    }
    
    // Fallback to general keyword search
    let searchQuery = query;
    if (language) {
      searchQuery = `${searchQuery} language:${language}`.trim();
    }
    
    const data = await fetchGitHubAPI<{ items: Repository[] }>(`/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sort}&direction=${direction}&per_page=30`, ['search', `search:${query}:${sort}:${direction}:${language}`]);
    return data.items;
};

export const getRepositoryDetails = cache(async (owner: string, repo: string): Promise<Repository> => {
      return fetchGitHubAPI<Repository>(`/repos/${owner}/${repo}`, ['repo', `repo:${owner}/${repo}`]);
});

export const getRepositoryReadme = cache(async (owner: string, repo: string): Promise<Readme> => {
    return fetchGitHubAPI<Readme>(`/repos/${owner}/${repo}/readme`, ['readme', `readme:${owner}/${repo}`]);
});

// --- REPO DETAILS ---

export const getRepositoryContributors = cache(async (owner: string, repo: string): Promise<Contributor[]> => {
    return fetchGitHubAPI<Contributor[]>(`/repos/${owner}/${repo}/contributors?per_page=12`, ['contributors', `contributors:${owner}/${repo}`]);
  });

export const getRepositoryCommits = cache(async (owner: string, repo: string): Promise<Commit[]> => {
    return fetchGitHubAPI<Commit[]>(`/repos/${owner}/${repo}/commits?per_page=5`, ['commits', `commits:${owner}/${repo}`]);
  });

export const getBranchHead = cache(async (owner: string, repo: string, branch: string): Promise<Commit> => {
    const commits = await fetchGitHubAPI<Commit[]>(`/repos/${owner}/${repo}/commits?sha=${branch}&per_page=1`, ['branch-head', `branch-head:${owner}/${repo}:${branch}`]);
    if (commits.length === 0) {
        throw new Error(`No commits found for branch ${branch} in ${owner}/${repo}`);
    }
    return commits[0];
});

export const getUserRepositories = cache(async (owner: string): Promise<Repository[]> => {
    return fetchGitHubAPI<Repository[]>(`/users/${owner}/repos?type=owner&sort=pushed&per_page=100`, ['user-repos', `user-repos:${owner}`]);
  });

export const getLatestRelease = cache(async (owner: string, repo: string): Promise<Release> => {
    return fetchGitHubAPI<Release>(`/repos/${owner}/${repo}/releases/latest`, ['release', `release:${owner}/${repo}`]);
});

export const getRepositoryReleases = cache(async (owner: string, repo: string): Promise<Release[]> => {
    return fetchGitHubAPI<Release[]>(`/repos/${owner}/${repo}/releases?per_page=20`, ['releases', `releases:${owner}/${repo}`]);
});

export const compareCommits = cache(async (owner: string, repo: string, base: string, head: string): Promise<CompareResult> => {
    return fetchGitHubAPI<CompareResult>(`/repos/${owner}/${repo}/compare/${base}...${head}`, ['compare', `compare:${owner}/${repo}:${base}:${head}`]);
});

export const getUserProfile = cache(async (owner: string): Promise<GithubUser> => {
    return fetchGitHubAPI<GithubUser>(`/users/${owner}`, ['user-profile', `user-profile:${owner}`]);
});

