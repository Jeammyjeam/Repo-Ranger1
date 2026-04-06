'use client';

import { useContext, useCallback } from 'react';
import { FirebaseContext } from '@/firebase/provider';
import { Analytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';

export function useAnalytics() {
  const context = useContext(FirebaseContext);

  if (!context) {
    throw new Error('useAnalytics must be used within a FirebaseProvider');
  }

  const analytics = context.analytics;

  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  }, [analytics]);

  const setUser = useCallback((userId: string, properties?: Record<string, any>) => {
    if (analytics) {
      setUserId(analytics, userId);
      if (properties) {
        setUserProperties(analytics, properties);
      }
    }
  }, [analytics]);

  const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
    trackEvent('search', { search_term: query, ...filters });
  }, [trackEvent]);

  const trackRepoView = useCallback((repoId: number, repoName: string) => {
    trackEvent('view_repo', { repo_id: repoId, repo_name: repoName });
  }, [trackEvent]);

  const trackCollectionAction = useCallback((action: string, collectionId: string, collectionName: string) => {
    trackEvent('collection_action', {
      action,
      collection_id: collectionId,
      collection_name: collectionName
    });
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, details?: Record<string, any>) => {
    trackEvent('user_action', { action, ...details });
  }, [trackEvent]);

  return {
    analytics,
    trackEvent,
    setUser,
    trackSearch,
    trackRepoView,
    trackCollectionAction,
    trackUserAction,
  };
}