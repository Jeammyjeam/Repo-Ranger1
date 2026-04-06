/**
 * Web Vitals and Performance Metrics
 */

export interface WebVital {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  loadTime?: number; // Page load time
}

/**
 * Track Web Vitals using native APIs
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP
        console.debug(`LCP: ${(lastEntry as any).renderTime || (lastEntry as any).loadTime}ms`);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // PerformanceObserver might not be available
    }
  }

  // Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            console.debug(`CLS: ${clsValue}`);
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // PerformanceObserver might not be available
    }
  }

  // First Input Delay
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.debug(`FID: ${(entry as any).processingDuration}ms`);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // PerformanceObserver might not be available
    }
  }
}

/**
 * Report performance metrics
 */
export function reportMetrics(metrics: PerformanceMetrics): void {
  if (typeof window === 'undefined') return;

  // Send to analytics if available
  if ((window as any).gtag) {
    (window as any).gtag('event', 'performance', {
      fcp: metrics.fcp,
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      ttfb: metrics.ttfb,
      load_time: metrics.loadTime,
    });
  }
}

/**
 * Get performance rating
 */
export function getPerformanceRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals thresholds (in milliseconds)
 */
export const VITAL_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 600, poor: 1800 }, // Time to First Byte
};
