export function parseGitHubURL(input: string): { owner: string; repo: string; isValid: true } | { isValid: false } {
    const trimmedInput = input.trim();
  
    // Pattern 1: Full URLs (e.g., https://github.com/owner/repo/...)
    const fullUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s]+)/;
    const fullMatch = trimmedInput.match(fullUrlPattern);
    if (fullMatch) {
      const owner = fullMatch[1];
      const repo = fullMatch[2].replace(/\.git$/, '').split('/')[0];
      if (owner && repo) {
        return { owner, repo, isValid: true };
      }
    }
  
    // Pattern 2: Short format (e.g., owner/repo)
    // Must not contain spaces to differentiate from a search query
    const shortFormatPattern = /^([^\/\s]+)\/([^\/\s]+)$/;
    const shortMatch = trimmedInput.match(shortFormatPattern);
    if (shortMatch && !trimmedInput.includes(' ')) {
      const owner = shortMatch[1];
      const repo = shortMatch[2].replace(/\.git$/, '').split('/')[0];
      if (owner && repo) {
        return { owner, repo, isValid: true };
      }
    }
  
    return { isValid: false };
}
