import fetch from 'node-fetch';

interface GitHubApiResponse {
  message?: string;
  name?: string;
  full_name?: string;
  private?: boolean;
  [key: string]: any;
}

const GITHUB_CONFIG = {
  API_BASE_URL: 'https://api.github.com',
  USER_AGENT: 'github-repo-validator/1.0.0',
  ACCEPT_HEADER: 'application/vnd.github.v3+json',
  MIN_PATH_SEGMENTS: 2,
  NOT_FOUND_MESSAGE: 'Not Found',
} as const;

/**
 * Custom error class for GitHub URL validation errors
 */
class GitHubValidationError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'GitHubValidationError';
  }
}
export async function validateGitHubRepositoryUrl(repositoryUrl: string): Promise<boolean> {
  try {
    const { owner, repositoryName } = parseGitHubUrl(repositoryUrl);
    const repositoryExists = await checkRepositoryExists(owner, repositoryName);
    
    return repositoryExists;
  } catch (error) {
    if (error instanceof GitHubValidationError) {
      console.error(`GitHub validation error: ${error.message}`, error.originalError);
    } else {
      console.error('Unexpected error during GitHub URL validation:', error);
    }
    return false;
  }
}

function parseGitHubUrl(gitHubUrl: string): { owner: string; repositoryName: string } {
  try {
    const parsedUrl = new URL(gitHubUrl);
    
    if (parsedUrl.hostname !== 'github.com') {
      throw new GitHubValidationError('URL must be a GitHub repository URL');
    }
    
    const pathSegments = parsedUrl.pathname
      .split('/')
      .filter(segment => segment.length > 0);
    
    if (pathSegments.length < GITHUB_CONFIG.MIN_PATH_SEGMENTS) {
      throw new GitHubValidationError('URL must contain both owner and repository name');
    }
    
    const owner = pathSegments[0];
    const repositoryName = pathSegments[1].replace(/\.git$/, '');
    
    if (!owner || !repositoryName) {
      throw new GitHubValidationError('Invalid owner or repository name in URL');
    }
    
    return { owner, repositoryName };
  } catch (error) {
    if (error instanceof GitHubValidationError) {
      throw error;
    }
    throw new GitHubValidationError('Failed to parse GitHub URL', error as Error);
  }
}

async function checkRepositoryExists(owner: string, repositoryName: string): Promise<boolean> {
  try {
    const apiUrl = `${GITHUB_CONFIG.API_BASE_URL}/repos/${owner}/${repositoryName}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': GITHUB_CONFIG.ACCEPT_HEADER,
        'User-Agent': GITHUB_CONFIG.USER_AGENT,
      },
    });
    
    if (!response.ok && response.status !== 404) {
      throw new GitHubValidationError(
        `GitHub API request failed with status ${response.status}: ${response.statusText}`
      );
    }
    
    const apiResponse: GitHubApiResponse = await response.json();
    
    // Repository exists if there's no "Not Found" message
    return !apiResponse.message || apiResponse.message !== GITHUB_CONFIG.NOT_FOUND_MESSAGE;
  } catch (error) {
    if (error instanceof GitHubValidationError) {
      throw error;
    }
    throw new GitHubValidationError('Failed to check repository existence', error as Error);
  }
}