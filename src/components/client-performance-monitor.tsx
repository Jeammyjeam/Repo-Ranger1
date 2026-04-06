'use client';

import dynamic from 'next/dynamic';

const PerformanceMonitor = dynamic(() => import('@/components/performance-monitor').then(mod => mod.PerformanceMonitor), {
  ssr: false,
  loading: () => null,
});

export function ClientPerformanceMonitor() {
  return <PerformanceMonitor />;
}