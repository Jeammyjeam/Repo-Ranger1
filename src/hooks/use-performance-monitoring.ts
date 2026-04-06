import { useEffect } from 'react';
import { useAnalytics } from '@/firebase/analytics';
import { trackWebVitals } from '@/lib/performance-metrics';

/**
 * Hook to initialize performance monitoring
 */
export function usePerformanceMonitoring(): void {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Web Vitals
    trackWebVitals();

    // Track page load performance
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      trackEvent('page_performance', {
        page_load_time: pageLoadTime,
        connect_time: connectTime,
        render_time: renderTime,
        time_to_interactive: perfData.domInteractive - perfData.navigationStart,
      });
    });

    // Track long tasks if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            trackEvent('long_task', {
              duration: (entry as any).duration,
              start_time: entry.startTime,
            });
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API might not be available
      }
    }

    // Track memory usage if available
    if ((performance as any).memory) {
      const memInterval = setInterval(() => {
        const { usedJSHeapSize, jsHeapSizeLimit } = (performance as any).memory;
        if (usedJSHeapSize > jsHeapSizeLimit * 0.9) {
          trackEvent('high_memory_usage', {
            used_heap: usedJSHeapSize,
            total_heap: jsHeapSizeLimit,
          });
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(memInterval);
    }
  }, [trackEvent]);
}
