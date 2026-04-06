export function parseGitHubURL(input: string): { owner: string; repo: string; isValid: true } | { isValid: false } {
    const trimmedInput = input.trim();
  
    // Pattern 1: SSH URLs (e.g., git@github.com:owner/repo.git)
    const sshPattern = /git@github\.com:([^\/\s]+)\/([^\/\s]+?)(?:\.git)?$/;
    const sshMatch = trimmedInput.match(sshPattern);
    if (sshMatch) {
      const owner = sshMatch[1];
      const repo = sshMatch[2].replace(/\.git$/, '');
      if (owner && repo) {
        return { owner, repo, isValid: true };
      }
    }
  
    // Pattern 2: Full URLs (e.g., https://github.com/owner/repo/... or with trailing slash)
    const fullUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s?#]+)/;
    const fullMatch = trimmedInput.match(fullUrlPattern);
    if (fullMatch) {
      const owner = fullMatch[1];
      const repo = fullMatch[2].replace(/\.git$/, '').split('/')[0];
      if (owner && repo && !owner.includes('?') && !owner.includes('#')) {
        return { owner, repo, isValid: true };
      }
    }
  
    // Pattern 3: Short format (e.g., owner/repo)
    // Must not contain spaces to differentiate from a search query
    const shortFormatPattern = /^([^\/\s]+)\/([^\/\s]+)$/;
    const shortMatch = trimmedInput.match(shortFormatPattern);
    if (shortMatch && !trimmedInput.includes(' ')) {
      const owner = shortMatch[1];
      const repo = shortMatch[2].replace(/\.git$/, '').split('/')[0];
      if (owner && repo && !owner.includes('.') && owner !== 'git') {
        return { owner, repo, isValid: true };
      }
    }
  
    return { isValid: false };
}
