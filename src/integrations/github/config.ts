/**
 * 🚀 GitHub Storage Configuration
 * Environment variables'dan GitHub API ayarlarını alır
 */

import type { GitHubStorageConfig } from '../../utils/githubStorageHelper';

// Environment variables'ları al
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';

/**
 * GitHub Storage config'inin hazır olup olmadığını kontrol et
 */
export const isGitHubStorageConfigured = (): boolean => {
  return !!(GITHUB_OWNER && GITHUB_REPO && GITHUB_TOKEN);
};

/**
 * GitHub Storage config'ini döndür
 */
export const getGitHubStorageConfig = (): GitHubStorageConfig | null => {
  if (!isGitHubStorageConfigured()) {
    console.warn('⚠️ GitHub Storage yapılandırılmamış. .env dosyasını kontrol edin.');
    return null;
  }

  return {
    owner: GITHUB_OWNER!,
    repo: GITHUB_REPO!,
    token: GITHUB_TOKEN!,
    branch: GITHUB_BRANCH
  };
};

/**
 * GitHub repository URL'ini döndür
 */
export const getGitHubRepoUrl = (): string | null => {
  if (!GITHUB_OWNER || !GITHUB_REPO) return null;
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
};

/**
 * GitHub Raw URL base'ini döndür
 */
export const getGitHubRawBaseUrl = (): string | null => {
  if (!GITHUB_OWNER || !GITHUB_REPO) return null;
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
};

/**
 * Environment variables status'unu döndür (debug için)
 */
export const getGitHubConfigStatus = () => {
  return {
    owner: !!GITHUB_OWNER,
    repo: !!GITHUB_REPO,
    token: !!GITHUB_TOKEN,
    branch: !!GITHUB_BRANCH,
    configured: isGitHubStorageConfigured(),
    repoUrl: getGitHubRepoUrl(),
    rawBaseUrl: getGitHubRawBaseUrl()
  };
}; 