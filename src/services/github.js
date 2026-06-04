/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — GITHUB API CLIENT
   ═══════════════════════════════════════════════════════ */

import { GITHUB_API_BASE } from '../utils/constants';
import { decodeBase64 } from '../utils/helpers';

/**
 * Build standard headers for GitHub API requests.
 * @param {string} [token] - Optional GitHub personal access token
 * @returns {HeadersInit}
 */
function buildHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generic fetch wrapper with error handling for the GitHub API.
 * @param {string} url - Full API URL
 * @param {string} [token] - Optional auth token
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On network/API errors with descriptive messages
 */
async function githubFetch(url, token) {
  const response = await fetch(url, { headers: buildHeaders(token) });

  if (!response.ok) {
    const status = response.status;
    const errorBody = await response.text().catch(() => '');

    if (status === 404) {
      throw new Error('Repository not found. Check the owner/repo and try again.');
    }
    if (status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        const reset = response.headers.get('x-ratelimit-reset');
        const resetDate = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'soon';
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}. Add a GitHub token to increase your limit.`);
      }
      throw new Error('Access forbidden. The repository may be private — provide a token with repo scope.');
    }
    if (status === 401) {
      throw new Error('Authentication failed. Check your GitHub token.');
    }

    throw new Error(`GitHub API error ${status}: ${errorBody || response.statusText}`);
  }

  return response.json();
}

// ─── PUBLIC API ──────────────────────────────────────────

/**
 * Fetch core repository metadata.
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} [token] - Optional GitHub token
 * @returns {Promise<Object>} Repository metadata
 */
export async function fetchRepoData(owner, repo, token) {
  const data = await githubFetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
    token,
  );

  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    homepage: data.homepage,
    language: data.language,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    size: data.size,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    hasPages: data.has_pages,
    hasWiki: data.has_wiki,
    hasIssues: data.has_issues,
    license: data.license?.spdx_id || data.license?.name || null,
    topics: data.topics || [],
    visibility: data.visibility,
    isArchived: data.archived,
    isFork: data.fork,
    owner: {
      login: data.owner.login,
      avatar: data.owner.avatar_url,
      type: data.owner.type,
    },
    _raw: data,
  };
}

/**
 * Fetch and decode the repository README.
 * @param {string} owner
 * @param {string} repo
 * @param {string} [token]
 * @returns {Promise<string|null>} Decoded README content, or null if missing
 */
export async function fetchReadme(owner, repo, token) {
  try {
    const data = await githubFetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
      token,
    );

    if (!data.content) return null;

    return decodeBase64(data.content);
  } catch (error) {
    // README simply doesn't exist — not a fatal error
    if (error.message.includes('not found') || error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

/**
 * Fetch the full recursive file tree for the default branch.
 * @param {string} owner
 * @param {string} repo
 * @param {string} [token]
 * @returns {Promise<Object>} Tree object with truncated flag and item array
 */
export async function fetchContents(owner, repo, token) {
  // First, get the default branch SHA from the repo endpoint
  const repoInfo = await githubFetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
    token,
  );

  const defaultBranch = repoInfo.default_branch;

  // Get the branch ref to find the tree SHA
  const branchData = await githubFetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${defaultBranch}`,
    token,
  );

  const treeSha = branchData.commit.sha;

  // Fetch the full recursive tree
  const treeData = await githubFetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
    token,
  );

  return {
    sha: treeSha,
    truncated: treeData.truncated || false,
    tree: (treeData.tree || []).map((item) => ({
      path: item.path,
      type: item.type, // 'blob' or 'tree'
      size: item.size || 0,
      sha: item.sha,
    })),
  };
}

/**
 * Fetch language breakdown (bytes per language).
 * @param {string} owner
 * @param {string} repo
 * @param {string} [token]
 * @returns {Promise<Object>} Language → bytes mapping
 */
export async function fetchLanguages(owner, repo, token) {
  return githubFetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
    token,
  );
}

/**
 * Fetch contributor list.
 * @param {string} owner
 * @param {string} repo
 * @param {string} [token]
 * @returns {Promise<Array>} Array of contributor objects
 */
export async function fetchContributors(owner, repo, token) {
  try {
    const data = await githubFetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
      token,
    );

    return (data || []).map((c) => ({
      login: c.login,
      avatar: c.avatar_url,
      contributions: c.contributions,
      type: c.type,
    }));
  } catch (error) {
    // Some repos return 204 No Content for empty contributor lists
    if (error.message.includes('204') || error.message.includes('empty')) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch recent commits.
 * @param {string} owner
 * @param {string} repo
 * @param {string} [token]
 * @param {number} [count=30] - Number of commits to fetch
 * @returns {Promise<Array>} Array of simplified commit objects
 */
export async function fetchCommits(owner, repo, token, count = 30) {
  const data = await githubFetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${count}`,
    token,
  );

  return (data || []).map((c) => ({
    sha: c.sha,
    message: c.commit?.message || '',
    author: c.commit?.author?.name || c.author?.login || 'Unknown',
    date: c.commit?.author?.date || null,
    committer: c.commit?.committer?.name || null,
    avatar: c.author?.avatar_url || null,
  }));
}

/**
 * Fetch all repository data in parallel.
 * Returns a combined object with all data sources.
 * @param {string} owner
 * @param {string} repo
 * @param {string} [token]
 * @returns {Promise<Object>} Combined repository data
 */
export async function fetchAllRepoData(owner, repo, token) {
  const [repoData, readme, contents, languages, contributors, commits] =
    await Promise.allSettled([
      fetchRepoData(owner, repo, token),
      fetchReadme(owner, repo, token),
      fetchContents(owner, repo, token),
      fetchLanguages(owner, repo, token),
      fetchContributors(owner, repo, token),
      fetchCommits(owner, repo, token),
    ]);

  // Repo data is mandatory — if it failed, throw immediately
  if (repoData.status === 'rejected') {
    throw repoData.reason;
  }

  return {
    repo: repoData.value,
    readme: readme.status === 'fulfilled' ? readme.value : null,
    contents: contents.status === 'fulfilled' ? contents.value : { tree: [], truncated: false },
    languages: languages.status === 'fulfilled' ? languages.value : {},
    contributors: contributors.status === 'fulfilled' ? contributors.value : [],
    commits: commits.status === 'fulfilled' ? commits.value : [],
  };
}
