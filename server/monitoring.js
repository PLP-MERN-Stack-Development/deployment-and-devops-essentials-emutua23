// Monitoring and Health Check Module
import os from 'os';

export class MonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: 0,
      errors: 0,
      socketConnections: 0,
      messagesProcessed: 0
    };
  }

  // Health check endpoint data
  getHealthStatus(users, io) {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime / 1000),
        formatted: this.formatUptime(uptime)
      },
      users: {
        total: users.size,
        connected: io ? io.sockets.sockets.size : 0
      },
      system: {
        platform: os.platform(),
        nodeVersion: process.version,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          unit: 'MB'
        },
        cpu: {
          cores: os.cpus().length,
          loadAverage: os.loadavg()
        }
      },
      metrics: {
        ...this.metrics,
        errorRate: this.metrics.requests > 0 
          ? ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
          : '0%'
      }
    };
  }

  // Detailed metrics endpoint
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      ...this.metrics,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  // Performance monitoring data
  getPerformanceMetrics() {
    const memUsage = process.memoryUsage();
    
    return {
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      metrics: this.metrics
    };
  }

  // Format uptime in human-readable format
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Increment metrics
  incrementRequests() {
    this.metrics.requests++;
  }

  incrementErrors() {
    this.metrics.errors++;
  }

  incrementSocketConnections() {
    this.metrics.socketConnections++;
  }

  incrementMessages() {
    this.metrics.messagesProcessed++;
  }

  // Reset metrics (for testing or scheduled resets)
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      socketConnections: 0,
      messagesProcessed: 0
    };
  }
}

// Middleware for request tracking
export function requestTrackingMiddleware(monitoringService) {
  return (req, res, next) => {
    monitoringService.incrementRequests();
    
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (res.statusCode >= 400) {
        monitoringService.incrementErrors();
      }
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
      }
    });
    
    next();
  };
}

// Error tracking helper
export function trackError(error, context = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context
  };
  
  console.error('❌ Error tracked:', errorData);
  
  // This will be sent to Sentry in production
  return errorData;
}
