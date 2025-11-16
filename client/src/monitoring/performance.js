// Client-side Performance Monitoring

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      cumulativeLayoutShift: 0
    };
    
    this.init();
  }

  init() {
    // Wait for page to load
    if (document.readyState === 'complete') {
      this.captureMetrics();
    } else {
      window.addEventListener('load', () => this.captureMetrics());
    }

    // Observe layout shifts
    this.observeLayoutShifts();
    
    // Observe long tasks
    this.observeLongTasks();
  }

  captureMetrics() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    }

    paint.forEach(entry => {
      if (entry.name === 'first-contentful-paint') {
        this.metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Send to backend for logging
    this.reportMetrics();
  }

  observeLayoutShifts() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('Layout shift observer not supported:', e);
    }
  }

  observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let tbtValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Tasks longer than 50ms contribute to TBT
          if (entry.duration > 50) {
            tbtValue += entry.duration - 50;
          }
        }
        this.metrics.totalBlockingTime = tbtValue;
      });

      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.warn('Long task observer not supported:', e);
    }
  }

  reportMetrics() {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Performance Metrics:', this.metrics);
    }

    // Send to backend
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    if (serverUrl) {
      fetch(`${serverUrl}/api/performance/client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(err => console.warn('Failed to send metrics:', err));
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// Network performance tracking
export function trackNetworkPerformance(socket) {
  let pingStart = null;
  let latencies = [];

  const measureLatency = () => {
    pingStart = Date.now();
    socket.emit('ping');
  };

  socket.on('pong', () => {
    if (pingStart) {
      const latency = Date.now() - pingStart;
      latencies.push(latency);
      
      // Keep only last 10 measurements
      if (latencies.length > 10) {
        latencies.shift();
      }
      
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      
      if (import.meta.env.DEV) {
        console.log(`📡 Socket Latency: ${latency}ms (avg: ${avgLatency.toFixed(0)}ms)`);
      }
    }
  });

  // Measure every 30 seconds
  setInterval(measureLatency, 30000);
  measureLatency(); // Initial measurement
}

// Component render time tracking
export function trackComponentRender(componentName) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Slower than 60fps
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  };
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  const monitor = new PerformanceMonitor();
  
  // Make it available globally for debugging
  if (import.meta.env.DEV) {
    window.performanceMonitor = monitor;
  }
  
  return monitor;
}
