// Sentry Error Tracking Configuration
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(app) {
  // Only initialize Sentry in production
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
      
      // Profiling
      profilesSampleRate: 1.0, // Set profiling sampling rate
      integrations: [
        new ProfilingIntegration(),
      ],
      
      // Release tracking
      release: process.env.RAILWAY_GIT_COMMIT_SHA || 'development',
      
      // Additional context
      beforeSend(event, hint) {
        // Filter out certain errors if needed
        if (event.exception) {
          console.log('📊 Sending error to Sentry:', event.exception);
        }
        return event;
      },
    });

    // Request handler - must be the first middleware
    app.use(Sentry.Handlers.requestHandler());
    
    // TracingHandler - creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
    
    console.log('✅ Sentry initialized successfully');
  } else {
    console.log('ℹ️  Sentry not initialized (missing SENTRY_DSN or not in production)');
  }
}

export function initSentryErrorHandler(app) {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Error handler - must be registered after all controllers
    app.use(Sentry.Handlers.errorHandler());
    
    // Optional fallthrough error handler
    app.use((err, req, res, next) => {
      console.error('❌ Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong' 
          : err.message
      });
    });
  }
}

// Helper to manually capture exceptions
export function captureException(error, context = {}) {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context
    });
  }
  console.error('❌ Exception:', error, context);
}

// Helper to capture messages
export function captureMessage(message, level = 'info') {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
  console.log(`📝 ${level.toUpperCase()}:`, message);
}

export { Sentry };
