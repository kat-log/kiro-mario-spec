/**
 * Performance Monitor System
 * Measures and optimizes diagnostic feature overhead
 * Automatically disables features in production
 * Monitors memory usage and provides cleanup
 */

class PerformanceMonitor {
  constructor() {
    this.isProduction = this.detectProductionEnvironment();
    this.diagnosticsEnabled = !this.isProduction;
    this.performanceMetrics = {
      frameTime: [],
      memoryUsage: [],
      diagnosticOverhead: [],
      lastCleanup: Date.now(),
    };

    this.thresholds = {
      maxFrameTime: 16.67, // 60 FPS target
      maxMemoryMB: 100,
      maxDiagnosticOverhead: 2, // 2ms max overhead
      cleanupInterval: 30000, // 30 seconds
    };

    this.optimizationSettings = {
      enableFrameTimeMonitoring: true,
      enableMemoryMonitoring: true,
      enableDiagnosticProfiling: true,
      autoCleanup: true,
      adaptiveThrottling: true,
    };

    this.startMonitoring();
  }

  /**
   * Detect if running in production environment
   */
  detectProductionEnvironment() {
    // Check various indicators of production environment
    const indicators = [
      // Domain-based detection
      window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1" &&
        !window.location.hostname.includes("dev") &&
        !window.location.hostname.includes("test"),

      // Protocol-based detection
      window.location.protocol === "https:",

      // Build flag detection (if available)
      typeof BUILD_ENV !== "undefined" && BUILD_ENV === "production",

      // Debug flag absence
      !window.location.search.includes("debug=true"),

      // Console availability (production often disables)
      typeof console.debug === "undefined",
    ];

    // Consider production if majority of indicators are true
    const productionScore = indicators.filter(Boolean).length;
    return productionScore >= 2;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (!this.diagnosticsEnabled) {
      console.log(
        "[PERFORMANCE] Production environment detected - diagnostics disabled"
      );
      return;
    }

    // Frame time monitoring
    if (this.optimizationSettings.enableFrameTimeMonitoring) {
      this.startFrameTimeMonitoring();
    }

    // Memory monitoring
    if (this.optimizationSettings.enableMemoryMonitoring) {
      this.startMemoryMonitoring();
    }

    // Auto cleanup
    if (this.optimizationSettings.autoCleanup) {
      this.startAutoCleanup();
    }

    console.log("[PERFORMANCE] Performance monitoring started");
  }

  /**
   * Start frame time monitoring
   */
  startFrameTimeMonitoring() {
    let lastFrameTime = performance.now();

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;

      this.recordFrameTime(frameTime);
      lastFrameTime = currentTime;

      if (this.diagnosticsEnabled) {
        requestAnimationFrame(measureFrame);
      }
    };

    requestAnimationFrame(measureFrame);
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    const measureMemory = () => {
      if (performance.memory) {
        const memoryInfo = {
          used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
          total: performance.memory.totalJSHeapSize / 1024 / 1024, // MB
          limit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // MB
        };

        this.recordMemoryUsage(memoryInfo);
      }

      if (this.diagnosticsEnabled) {
        setTimeout(measureMemory, 1000); // Check every second
      }
    };

    measureMemory();
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup() {
    const cleanup = () => {
      this.performCleanup();

      if (this.diagnosticsEnabled) {
        setTimeout(cleanup, this.thresholds.cleanupInterval);
      }
    };

    setTimeout(cleanup, this.thresholds.cleanupInterval);
  }

  /**
   * Record frame time and detect performance issues
   */
  recordFrameTime(frameTime) {
    this.performanceMetrics.frameTime.push({
      time: frameTime,
      timestamp: Date.now(),
    });

    // Keep only recent measurements
    if (this.performanceMetrics.frameTime.length > 100) {
      this.performanceMetrics.frameTime.shift();
    }

    // Check for performance issues
    if (frameTime > this.thresholds.maxFrameTime) {
      this.handlePerformanceIssue("frame_time", frameTime);
    }
  }

  /**
   * Record memory usage and detect memory issues
   */
  recordMemoryUsage(memoryInfo) {
    this.performanceMetrics.memoryUsage.push({
      ...memoryInfo,
      timestamp: Date.now(),
    });

    // Keep only recent measurements
    if (this.performanceMetrics.memoryUsage.length > 60) {
      // 1 minute of data
      this.performanceMetrics.memoryUsage.shift();
    }

    // Check for memory issues
    if (memoryInfo.used > this.thresholds.maxMemoryMB) {
      this.handlePerformanceIssue("memory", memoryInfo.used);
    }
  }

  /**
   * Measure diagnostic overhead
   */
  measureDiagnosticOverhead(diagnosticFunction, context = "unknown") {
    if (
      !this.diagnosticsEnabled ||
      !this.optimizationSettings.enableDiagnosticProfiling
    ) {
      return diagnosticFunction();
    }

    const startTime = performance.now();
    const result = diagnosticFunction();
    const endTime = performance.now();
    const overhead = endTime - startTime;

    this.performanceMetrics.diagnosticOverhead.push({
      context,
      overhead,
      timestamp: Date.now(),
    });

    // Keep only recent measurements
    if (this.performanceMetrics.diagnosticOverhead.length > 200) {
      this.performanceMetrics.diagnosticOverhead.shift();
    }

    // Check for excessive overhead
    if (overhead > this.thresholds.maxDiagnosticOverhead) {
      this.handlePerformanceIssue("diagnostic_overhead", overhead, context);
    }

    return result;
  }

  /**
   * Handle performance issues
   */
  handlePerformanceIssue(type, value, context = null) {
    const issue = {
      type,
      value,
      context,
      timestamp: Date.now(),
      severity: this.calculateSeverity(type, value),
    };

    console.warn(`[PERFORMANCE] Issue detected:`, issue);

    // Apply adaptive optimizations
    if (this.optimizationSettings.adaptiveThrottling) {
      this.applyAdaptiveOptimizations(issue);
    }
  }

  /**
   * Calculate issue severity
   */
  calculateSeverity(type, value) {
    switch (type) {
      case "frame_time":
        if (value > 33.33) return "critical"; // < 30 FPS
        if (value > 20) return "high"; // < 50 FPS
        return "medium";

      case "memory":
        if (value > 200) return "critical";
        if (value > 150) return "high";
        return "medium";

      case "diagnostic_overhead":
        if (value > 5) return "critical";
        if (value > 3) return "high";
        return "medium";

      default:
        return "medium";
    }
  }

  /**
   * Apply adaptive optimizations based on performance issues
   */
  applyAdaptiveOptimizations(issue) {
    switch (issue.type) {
      case "frame_time":
        // Reduce diagnostic frequency
        this.reduceDiagnosticFrequency();
        break;

      case "memory":
        // Force cleanup
        this.performCleanup();
        break;

      case "diagnostic_overhead":
        // Disable specific diagnostic features
        this.optimizeDiagnosticFeature(issue.context);
        break;
    }
  }

  /**
   * Reduce diagnostic frequency to improve performance
   */
  reduceDiagnosticFrequency() {
    // Increase cleanup interval
    this.thresholds.cleanupInterval = Math.min(
      this.thresholds.cleanupInterval * 1.5,
      60000
    );

    // Reduce data retention
    this.performanceMetrics.frameTime =
      this.performanceMetrics.frameTime.slice(-50);
    this.performanceMetrics.memoryUsage =
      this.performanceMetrics.memoryUsage.slice(-30);

    console.log(
      "[PERFORMANCE] Reduced diagnostic frequency due to performance issues"
    );
  }

  /**
   * Optimize specific diagnostic feature
   */
  optimizeDiagnosticFeature(context) {
    // Disable specific high-overhead features
    if (context && context.includes("jump-diagnostic")) {
      window.jumpDiagnosticSystem?.setThrottling(true);
    }

    if (context && context.includes("debug-display")) {
      window.debugDisplaySystem?.reduceUpdateFrequency();
    }

    console.log(`[PERFORMANCE] Optimized diagnostic feature: ${context}`);
  }

  /**
   * Perform cleanup to free memory and improve performance
   */
  performCleanup() {
    const beforeCleanup = this.getMemoryUsage();

    // Clean up performance metrics
    const now = Date.now();
    const maxAge = 60000; // 1 minute

    this.performanceMetrics.frameTime =
      this.performanceMetrics.frameTime.filter(
        (entry) => now - entry.timestamp < maxAge
      );

    this.performanceMetrics.memoryUsage =
      this.performanceMetrics.memoryUsage.filter(
        (entry) => now - entry.timestamp < maxAge
      );

    this.performanceMetrics.diagnosticOverhead =
      this.performanceMetrics.diagnosticOverhead.filter(
        (entry) => now - entry.timestamp < maxAge
      );

    // Clean up diagnostic systems
    if (window.jumpDiagnosticSystem) {
      window.jumpDiagnosticSystem.cleanup();
    }

    if (window.debugDisplaySystem) {
      window.debugDisplaySystem.cleanup();
    }

    if (window.enhancedAutomatedTestSystem) {
      window.enhancedAutomatedTestSystem.cleanup();
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    const afterCleanup = this.getMemoryUsage();
    this.performanceMetrics.lastCleanup = now;

    console.log(
      `[PERFORMANCE] Cleanup completed. Memory: ${beforeCleanup}MB -> ${afterCleanup}MB`
    );
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    if (performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const frameTimeData = this.performanceMetrics.frameTime;
    const memoryData = this.performanceMetrics.memoryUsage;
    const overheadData = this.performanceMetrics.diagnosticOverhead;

    return {
      environment: {
        isProduction: this.isProduction,
        diagnosticsEnabled: this.diagnosticsEnabled,
      },
      frameRate: {
        average:
          frameTimeData.length > 0
            ? 1000 /
              (frameTimeData.reduce((sum, entry) => sum + entry.time, 0) /
                frameTimeData.length)
            : 0,
        min:
          frameTimeData.length > 0
            ? 1000 / Math.max(...frameTimeData.map((entry) => entry.time))
            : 0,
        issues: frameTimeData.filter(
          (entry) => entry.time > this.thresholds.maxFrameTime
        ).length,
      },
      memory: {
        current: this.getMemoryUsage(),
        peak:
          memoryData.length > 0
            ? Math.max(...memoryData.map((entry) => entry.used))
            : 0,
        issues: memoryData.filter(
          (entry) => entry.used > this.thresholds.maxMemoryMB
        ).length,
      },
      diagnosticOverhead: {
        average:
          overheadData.length > 0
            ? overheadData.reduce((sum, entry) => sum + entry.overhead, 0) /
              overheadData.length
            : 0,
        max:
          overheadData.length > 0
            ? Math.max(...overheadData.map((entry) => entry.overhead))
            : 0,
        issues: overheadData.filter(
          (entry) => entry.overhead > this.thresholds.maxDiagnosticOverhead
        ).length,
      },
      lastCleanup: new Date(this.performanceMetrics.lastCleanup).toISOString(),
      optimizations: this.optimizationSettings,
    };
  }

  /**
   * Enable or disable diagnostics
   */
  setDiagnosticsEnabled(enabled) {
    this.diagnosticsEnabled = enabled && !this.isProduction;

    if (!this.diagnosticsEnabled) {
      this.performCleanup();
      console.log("[PERFORMANCE] Diagnostics disabled");
    } else {
      this.startMonitoring();
      console.log("[PERFORMANCE] Diagnostics enabled");
    }
  }

  /**
   * Update optimization settings
   */
  updateOptimizationSettings(settings) {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings };
    console.log(
      "[PERFORMANCE] Optimization settings updated:",
      this.optimizationSettings
    );
  }

  /**
   * Check if diagnostics should be enabled for a specific feature
   */
  shouldEnableDiagnostics(feature = "general") {
    if (!this.diagnosticsEnabled) return false;

    // Check if specific feature has been throttled due to performance issues
    const recentOverhead = this.performanceMetrics.diagnosticOverhead
      .filter((entry) => entry.context && entry.context.includes(feature))
      .slice(-10);

    if (recentOverhead.length > 5) {
      const avgOverhead =
        recentOverhead.reduce((sum, entry) => sum + entry.overhead, 0) /
        recentOverhead.length;
      if (avgOverhead > this.thresholds.maxDiagnosticOverhead) {
        return false;
      }
    }

    return true;
  }
}

// Create global performance monitor instance
window.performanceMonitor = new PerformanceMonitor();

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = PerformanceMonitor;
}
