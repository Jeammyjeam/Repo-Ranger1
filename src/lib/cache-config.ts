/**
 * Caching configuration for Repo Ranger
 * Defines cache strategies for different content types
 */

export const CACHE_STRATEGIES = {
  // Static content that rarely changes
  STATIC: {
    maxAge: 86400, // 24 hours
    sMaxAge: 86400,
    staleWhileRevalidate: 604800, // 7 days
  },

  // Search results and trending data (updated frequently)
  DYNAMIC: {
    maxAge: 300, // 5 minutes
    sMaxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
  },

  // User-specific data (personalized, shorter cache)
  USER_DATA: {
    maxAge: 60, // 1 minute
    sMaxAge: 300, // 5 minutes
    staleWhileRevalidate: 3600, // 1 hour
  },

  // Repository details (cache aggressively)
  REPOSITORY: {
    maxAge: 3600, // 1 hour
    sMaxAge: 86400, // 24 hours
    staleWhileRevalidate: 604800, // 7 days
  },

  // NO cache for sensitive operations
  NO_CACHE: {
    noCache: true,
    noStore: true,
  },
};

/**
 * Generate cache headers for response
 */
export function getCacheHeaders(
  strategy: keyof typeof CACHE_STRATEGIES
): Record<string, string> {
  const config = CACHE_STRATEGIES[strategy];

  if ('noCache' in config && config.noCache) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }

  const { maxAge, sMaxAge, staleWhileRevalidate } = config as any;
  return {
    'Cache-Control': `public, s-maxage=${sMaxAge}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'CDN-Cache-Control': `max-age=${sMaxAge}`,
  };
}

/**
 * ISR (Incremental Static Regeneration) configuration
 */
export const ISR_CONFIG = {
  // Repository pages - regenerate every 6 hours
  REPOSITORY_PAGE: { revalidate: 21600 },

  // Trending page - regenerate every hour
  TRENDING_PAGE: { revalidate: 3600 },

  // Search results - regenerate every 30 minutes
  SEARCH_PAGE: { revalidate: 1800 },

  // Collections - regenerate every 10 minutes
  COLLECTIONS_PAGE: { revalidate: 600 },

  // Homepage - regenerate every 1 hour
  HOME_PAGE: { revalidate: 3600 },
};

/**
 * Tag-based cache invalidation
 */
export const CACHE_TAGS = {
  REPOSITORIES: 'repositories',
  TRENDING: 'trending',
  SEARCH: 'search',
  COLLECTIONS: 'collections',
  USER: 'user',
  GITHUB_API: 'github-api',
};
