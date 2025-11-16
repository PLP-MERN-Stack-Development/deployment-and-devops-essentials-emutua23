// Sentry Client-Side Error Tracking
import * as Sentry from "@sentry/react";

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      // Performance Monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Before send hook
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.user) {
          delete event.user.ip_address;
        }
        return event;
      },
    });
    
    console.log('✅ Sentry initialized on client');
  } else {
    console.log('ℹ️  Sentry not initialized on client');
  }
}

// Error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Helper to track custom events
export function trackEvent(eventName, data = {}) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(eventName, {
      level: 'info',
      extra: data
    });
  }
}

// Helper to set user context
export function setUser(user) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      username: user.username,
      id: user.id
    });
  }
}

// Helper to capture exceptions
export function captureException(error, context = {}) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    });
  }
  console.error('❌ Error:', error, context);
}
