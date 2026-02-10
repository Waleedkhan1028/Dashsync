/**
 * Analytics Service
 * Tracks user events across the application for analytics and monitoring
 */

type AnalyticsEvent =
  // Authentication events
  | { name: 'user_signup'; properties: { method: string } }
  | { name: 'user_login'; properties: { method: string } }
  | { name: 'user_logout'; properties: {} }
  // Workspace events
  | { name: 'workspace_created'; properties: { workspaceId: string } }
  | { name: 'workspace_updated'; properties: { workspaceId: string } }
  | { name: 'workspace_deleted'; properties: { workspaceId: string } }
  // Project events
  | { name: 'project_created'; properties: { projectId: string; workspaceId: string } }
  | { name: 'project_updated'; properties: { projectId: string } }
  | { name: 'project_deleted'; properties: { projectId: string } }
  | { name: 'project_viewed'; properties: { projectId: string } }
  // Task events
  | { name: 'task_created'; properties: { taskId: string; projectId: string } }
  | { name: 'task_updated'; properties: { taskId: string; projectId: string } }
  | { name: 'task_deleted'; properties: { taskId: string; projectId: string } }
  | { name: 'task_status_changed'; properties: { taskId: string; projectId: string; oldStatus: string; newStatus: string } }
  // Search events
  | { name: 'project_search'; properties: { query: string; workspaceId: string } }
  | { name: 'task_search'; properties: { query: string; projectId: string } };

class Analytics {
  private enabled: boolean;

  constructor() {
    // Enable in production and development for now (to test features)
    this.enabled = true;
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled) {
      // Log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics:', event.name, event.properties);
      }
      return;
    }

    try {
      // Custom analytics endpoint (optional)
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: event.name,
            properties: event.properties,
            timestamp: new Date().toISOString(),
          }),
        }).catch(err => console.error('Analytics error:', err));
      }

      // Store in our database for dashboard
      this.storeEvent(event);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Store event in database for analytics dashboard
   */
  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    // Only store in database, not in development console mode
    if (typeof window === 'undefined') return;

    try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        await fetch('/api/analytics/events', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                event_name: event.name,
                properties: event.properties,
            }),
        });
    } catch (err) {
      // Silent fail - don't disrupt user experience
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to store analytics event:', err);
      }
    }
  }

  /**
   * Track a page view
   */
  pageView(path: string): void {
    if (!this.enabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Page View:', path);
      }
      return;
    }
    // GA removed, just internal logging if needed or simple return
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Identify User:', userId, traits);
      }
      return;
    }
    // GA removed
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.track(event);
export const trackPageView = (path: string) => analytics.pageView(path);
export const identifyUser = (userId: string, traits?: Record<string, any>) => analytics.identify(userId, traits);
