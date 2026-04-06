'use client';

import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

export function PerformanceMonitor() {
  usePerformanceMonitoring();
  return null;
}
