'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

/**
 * A client component that safely renders a relative time string (e.g., "5 minutes ago")
 * to prevent React hydration errors. It renders a placeholder on the server and on
 * the initial client render, then updates to the correct time on the client.
 */
export function TimeAgo({ dateString }: { dateString: string | null | undefined }) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  useEffect(() => {
    if (dateString) {
      setTimeAgo(formatDistanceToNow(new Date(dateString), { addSuffix: true }));
    }
  }, [dateString]);

  if (!timeAgo) {
    // Render a placeholder to prevent layout shift.
    // This is rendered on the server and on the initial client render.
    return <span className="inline-block h-4 w-24 animate-pulse rounded-md bg-muted" />;
  }

  // This is rendered only on the client after hydration.
  return <>{timeAgo}</>;
}
