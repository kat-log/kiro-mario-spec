/**
 * Performance Optimizer for Mario Style Platformer
 * Monitors and optimizes game performance with input processing optimization
 */

class PerformanceOptimizer {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;

    // Enhanced metrics including input processing
    this.metrics = {
      frameTime: [],
      renderTime: [],
      updateTime: [],
      inputProcessingTime: [],
      memoryUsage: [],
      fps: 0,
      averageFrameTime: 0,
      worstFrameTime: 0,
      frameDrops: 0,
      inputLatency: [],
      diagnosticOverhead: [],
    };

    this.settings = {
      targetFPS: 60,
      maxFrameTime: 16.67, // ~60 FPS
      warningThreshold: 20, // 50 FPS
      criticalThreshold: 33.33, // 30 FPS
      sampleSize: 100,
      optimizationEnabled: true,
      // Production environment detection
      isProduction: this.detectProductionEnvironment(),
      // Input processing optimization settings
      inputOptimization: {
        enabled: true,
        maxInputEventsPerFrame: 10,
        inputThrottleThreshold: 16.67, // 1 frame at 60fps
        diagnosticAutoDisable: true,
      },
    };

    this.optimizations = {
      cullingEnabled: true,
      objectPoolingEnabled: true,
      reducedEffects: false,
      lowQualityMode: false,
      inputThrottling: false,
      diagnosticsDisabled: this.settings.isProduction,
    };

    // Performance tracking
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastOptimizationCheck = 0;
    this.optimizationInterval = 1000; // Check every second

    // Input processing tracking
    this.inputProcessingStart = 0;
    this.inputEventQueue = [];
    this.lastInputOptimization = 0;

    // Memory leak prevention
    this.memoryLeakDetection = {
      enabled: true,
      lastGCTime: 0,
      gcInterval: 30000, // 30 seconds
      memoryGrowthThreshold: 50 * 1024 * 1024, // 50MB
      maxRetainedObjects: 1000,
    };

    // Resource cleanup tracking
    this.resourceCleanup = {
      eventListeners: new Set(),
      intervals: new Set(),
      timeouts: new Set(),
      objectPools: new Map(),
    };

    // Auto-disable diagnostics in production
    if (
      this.settings.isProduction &&
      this.settings.inputOptimization.diagnosticAutoDisable
    ) {
      this.disableProductionDiagnostics();
    }

    console.log(
      `Performance Optimizer initialized (Production: ${this.settings.isProduction})`
    );
  }

  /**
   * Detect if running in production environment
   */
  detectProductionEnvironment() {
    // Check various indicators of production environment
    const indicators = [
      // Domain-based detection
      location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1" &&
        !location.hostname.includes("dev") &&
        !location.hostname.includes("test"),

      // Protocol-based detection
      location.protocol === "https:",

      // Environment variables (if available)
      typeof process !== "undefined" && process.env?.NODE_ENV === "production",

      // URL parameters
      !location.search.includes("debug") && !location.search.includes("dev"),

      // Console availability (production builds often disable console)
      typeof console.debug === "undefined" ||
        console.debug.toString().includes("[native code]"),
    ];

    // Consider production if majority of indicators are true
    const productionScore = indicators.filter(Boolean).length;
    const isProduction = productionScore >= 2;

    console.log(
      `Environment detection: ${
        isProduction ? "Production" : "Development"
      } (score: ${productionScore}/${indicators.length})`
    );
    return isProduction;
  }

  /**
   * Disable diagnostic features in production environment
   */
  disableProductionDiagnostics() {
    console.log("🚀 Production mode detected - disabling diagnostic features");

    // Disable diagnostic systems
    if (window.InputDiagnosticSystem) {
      const diagnosticInstances = document.querySelectorAll(
        "[data-diagnostic-system]"
      );
      diagnosticInstances.forEach((instance) => {
        if (instance.diagnosticSystem) {
          instance.diagnosticSystem.isRecording = false;
          instance.diagnosticSystem.diagnosticMode = false;
        }
      });
    }

    // Disable enhanced input manager diagnostics
    if (window.EnhancedInputManager) {
      document.addEventListener("DOMContentLoaded", () => {
        const inputManagers = document.querySelectorAll("[data-input-manager]");
        inputManagers.forEach((manager) => {
          if (manager.inputManager && manager.inputManager.disableDiagnostics) {
            manager.inputManager.disableDiagnostics();
          }
        });
      });
    }

    // Override console methods in production (optional)
    if (this.settings.inputOptimization.diagnosticAutoDisable) {
      const noop = () => {};
      console.debug = noop;
      console.trace = noop;
      // Keep console.log, console.warn, console.error for important messages
    }

    this.optimizations.diagnosticsDisabled = true;
  }

  /**
   * Start performance monitoring with input processing tracking
   */
  startMonitoring() {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.metrics.frameTime = [];
    this.metrics.inputProcessingTime = [];
    this.metrics.inputLatency = [];

    // Start memory leak detection
    this.startMemoryLeakDetection();

    console.log("Performance monitoring started with input optimization");
  }

  /**
   * Update performance metrics with input processing tracking
   */
  update(deltaTime) {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;

    // Record frame time
    this.recordFrameTime(frameTime);

    // Update FPS calculation
    this.updateFPS(deltaTime);

    // Process input event queue with performance tracking
    this.processInputEventQueue();

    // Check for performance issues and memory leaks
    if (currentTime - this.lastOptimizationCheck > this.optimizationInterval) {
      this.checkPerformance();
      this.checkMemoryLeaks();
      this.optimizeInputProcessing();
      this.lastOptimizationCheck = currentTime;
    }

    this.lastFrameTime = currentTime;
    this.frameCount++;
  }

  /**
   * Start measuring input processing time
   */
  startInputProcessingMeasurement() {
    if (!this.optimizations.diagnosticsDisabled) {
      this.inputProcessingStart = performance.now();
    }
  }

  /**
   * End measuring input processing time
   */
  endInputProcessingMeasurement() {
    if (
      !this.optimizations.diagnosticsDisabled &&
      this.inputProcessingStart > 0
    ) {
      const processingTime = performance.now() - this.inputProcessingStart;
      this.metrics.inputProcessingTime.push(processingTime);

      // Keep only recent samples
      if (this.metrics.inputProcessingTime.length > this.settings.sampleSize) {
        this.metrics.inputProcessingTime.shift();
      }

      this.inputProcessingStart = 0;
    }
  }

  /**
   * Record input latency measurement
   */
  recordInputLatency(latency) {
    if (!this.optimizations.diagnosticsDisabled) {
      this.metrics.inputLatency.push(latency);

      // Keep only recent samples
      if (this.metrics.inputLatency.length > this.settings.sampleSize) {
        this.metrics.inputLatency.shift();
      }
    }
  }

  /**
   * Process input event queue with throttling
   */
  processInputEventQueue() {
    if (this.inputEventQueue.length === 0) return;

    const maxEventsPerFrame = this.optimizations.inputThrottling
      ? Math.max(1, this.settings.inputOptimization.maxInputEventsPerFrame / 2)
      : this.settings.inputOptimization.maxInputEventsPerFrame;

    let processedEvents = 0;
    while (
      this.inputEventQueue.length > 0 &&
      processedEvents < maxEventsPerFrame
    ) {
      const event = this.inputEventQueue.shift();
      this.processQueuedInputEvent(event);
      processedEvents++;
    }

    // Log if events are being throttled
    if (
      this.inputEventQueue.length > 0 &&
      !this.optimizations.diagnosticsDisabled
    ) {
      console.warn(
        `Input throttling active: ${this.inputEventQueue.length} events queued`
      );
    }
  }

  /**
   * Process a queued input event
   */
  processQueuedInputEvent(event) {
    // This would be implemented based on the specific event type
    // For now, just measure the processing time
    this.startInputProcessingMeasurement();

    // Simulate event processing
    try {
      if (event.handler) {
        event.handler(event.data);
      }
    } catch (error) {
      console.error("Error processing queued input event:", error);
    }

    this.endInputProcessingMeasurement();
  }

  /**
   * Optimize input processing based on performance metrics
   */
  optimizeInputProcessing() {
    if (!this.settings.inputOptimization.enabled) return;

    const avgInputTime =
      this.metrics.inputProcessingTime.length > 0
        ? this.metrics.inputProcessingTime.reduce((a, b) => a + b, 0) /
          this.metrics.inputProcessingTime.length
        : 0;

    const avgLatency =
      this.metrics.inputLatency.length > 0
        ? this.metrics.inputLatency.reduce((a, b) => a + b, 0) /
          this.metrics.inputLatency.length
        : 0;

    // Enable input throttling if processing time is too high
    if (avgInputTime > this.settings.inputOptimization.inputThrottleThreshold) {
      if (!this.optimizations.inputThrottling) {
        this.optimizations.inputThrottling = true;
        console.warn(
          `Input throttling enabled due to high processing time: ${avgInputTime.toFixed(
            2
          )}ms`
        );
      }
    } else if (
      avgInputTime <
      this.settings.inputOptimization.inputThrottleThreshold * 0.5
    ) {
      if (this.optimizations.inputThrottling) {
        this.optimizations.inputThrottling = false;
        console.log("Input throttling disabled - performance improved");
      }
    }

    // Disable diagnostics if latency is too high
    if (avgLatency > 100 && !this.optimizations.diagnosticsDisabled) {
      console.warn(
        `High input latency detected (${avgLatency.toFixed(
          1
        )}ms) - disabling diagnostics`
      );
      this.disableRuntimeDiagnostics();
    }
  }

  /**
   * Record frame time for analysis
   */
  recordFrameTime(frameTime) {
    this.metrics.frameTime.push(frameTime);

    // Keep only recent samples
    if (this.metrics.frameTime.length > this.settings.sampleSize) {
      this.metrics.frameTime.shift();
    }

    // Update metrics
    this.calculateMetrics();
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics() {
    const frameTimes = this.metrics.frameTime;
    if (frameTimes.length === 0) return;

    // Average frame time
    this.metrics.averageFrameTime =
      frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;

    // Worst frame time
    this.metrics.worstFrameTime = Math.max(...frameTimes);

    // Frame drops (frames that took longer than target)
    this.metrics.frameDrops = frameTimes.filter(
      (time) => time > this.settings.maxFrameTime
    ).length;

    // Memory usage (if available)
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: performance.now(),
      });

      // Keep only recent memory samples
      if (this.metrics.memoryUsage.length > 50) {
        this.metrics.memoryUsage.shift();
      }
    }
  }

  /**
   * Update FPS calculation
   */
  updateFPS(deltaTime) {
    if (deltaTime > 0) {
      this.metrics.fps = 1000 / deltaTime;
    }
  }

  /**
   * Check performance and apply optimizations if needed
   */
  checkPerformance() {
    if (!this.settings.optimizationEnabled) return;

    const avgFrameTime = this.metrics.averageFrameTime;
    const worstFrameTime = this.metrics.worstFrameTime;
    const frameDropRate =
      this.metrics.frameDrops / this.metrics.frameTime.length;

    // Determine performance level
    let performanceLevel = "good";

    if (avgFrameTime > this.settings.criticalThreshold || frameDropRate > 0.3) {
      performanceLevel = "critical";
    } else if (
      avgFrameTime > this.settings.warningThreshold ||
      frameDropRate > 0.1
    ) {
      performanceLevel = "warning";
    }

    // Apply optimizations based on performance level
    this.applyOptimizations(performanceLevel);

    // Log performance status
    this.logPerformanceStatus(performanceLevel);
  }

  /**
   * Apply performance optimizations
   */
  applyOptimizations(performanceLevel) {
    switch (performanceLevel) {
      case "critical":
        this.enableLowQualityMode();
        this.enableReducedEffects();
        this.enableAggressiveCulling();
        break;

      case "warning":
        this.enableReducedEffects();
        this.enableObjectPooling();
        break;

      case "good":
        // Gradually restore quality if performance improves
        if (this.optimizations.lowQualityMode) {
          this.disableLowQualityMode();
        }
        break;
    }
  }

  /**
   * Enable low quality mode
   */
  enableLowQualityMode() {
    if (this.optimizations.lowQualityMode) return;

    this.optimizations.lowQualityMode = true;

    // Reduce canvas resolution
    const canvas = this.gameEngine.canvas;
    if (canvas) {
      canvas.style.imageRendering = "pixelated";
    }

    console.log("Low quality mode enabled");
  }

  /**
   * Disable low quality mode
   */
  disableLowQualityMode() {
    if (!this.optimizations.lowQualityMode) return;

    this.optimizations.lowQualityMode = false;

    // Restore canvas quality
    const canvas = this.gameEngine.canvas;
    if (canvas) {
      canvas.style.imageRendering = "auto";
    }

    console.log("Low quality mode disabled");
  }

  /**
   * Enable reduced effects
   */
  enableReducedEffects() {
    if (this.optimizations.reducedEffects) return;

    this.optimizations.reducedEffects = true;

    // Disable particle effects, reduce animations, etc.
    // This would be implemented based on specific game effects

    console.log("Reduced effects enabled");
  }

  /**
   * Enable aggressive culling
   */
  enableAggressiveCulling() {
    if (!this.optimizations.cullingEnabled) return;

    // Increase culling distance, reduce off-screen object updates
    // This would be implemented in the rendering system

    console.log("Aggressive culling enabled");
  }

  /**
   * Enable object pooling optimizations
   */
  enableObjectPooling() {
    if (this.optimizations.objectPoolingEnabled) return;

    this.optimizations.objectPoolingEnabled = true;

    // Enable object pooling for items, particles, etc.
    // This would be implemented in the respective systems

    console.log("Object pooling enabled");
  }

  /**
   * Log performance status
   */
  logPerformanceStatus(performanceLevel) {
    const fps = this.metrics.fps.toFixed(1);
    const avgFrameTime = this.metrics.averageFrameTime.toFixed(2);
    const frameDropRate = (
      (this.metrics.frameDrops / this.metrics.frameTime.length) *
      100
    ).toFixed(1);

    const status = `Performance: ${performanceLevel.toUpperCase()} | FPS: ${fps} | Avg Frame: ${avgFrameTime}ms | Drops: ${frameDropRate}%`;

    switch (performanceLevel) {
      case "critical":
        console.warn(status);
        break;
      case "warning":
        console.warn(status);
        break;
      default:
        console.log(status);
    }
  }

  /**
   * Get current performance metrics with input processing data
   */
  getMetrics() {
    const inputProcessingStats = this.calculateInputProcessingStats();

    return {
      ...this.metrics,
      performanceLevel: this.getCurrentPerformanceLevel(),
      optimizations: { ...this.optimizations },
      inputProcessing: inputProcessingStats,
      memoryHealth: this.getMemoryHealth(),
      resourceUsage: this.getResourceUsage(),
    };
  }

  /**
   * Calculate input processing statistics
   */
  calculateInputProcessingStats() {
    const processingTimes = this.metrics.inputProcessingTime;
    const latencies = this.metrics.inputLatency;

    return {
      averageProcessingTime:
        processingTimes.length > 0
          ? (
              processingTimes.reduce((a, b) => a + b, 0) /
              processingTimes.length
            ).toFixed(2)
          : 0,
      maxProcessingTime:
        processingTimes.length > 0
          ? Math.max(...processingTimes).toFixed(2)
          : 0,
      averageLatency:
        latencies.length > 0
          ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)
          : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies).toFixed(2) : 0,
      queuedEvents: this.inputEventQueue.length,
      throttlingActive: this.optimizations.inputThrottling,
      diagnosticsDisabled: this.optimizations.diagnosticsDisabled,
    };
  }

  /**
   * Get memory health status
   */
  getMemoryHealth() {
    if (!performance.memory) {
      return { available: false };
    }

    const memory = performance.memory;
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    let status = "good";
    if (usagePercent > 80) status = "critical";
    else if (usagePercent > 60) status = "warning";

    return {
      available: true,
      used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + "MB",
      total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(1) + "MB",
      limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1) + "MB",
      usagePercent: usagePercent.toFixed(1) + "%",
      status,
    };
  }

  /**
   * Get resource usage statistics
   */
  getResourceUsage() {
    return {
      eventListeners: this.resourceCleanup.eventListeners.size,
      intervals: this.resourceCleanup.intervals.size,
      timeouts: this.resourceCleanup.timeouts.size,
      objectPools: this.resourceCleanup.objectPools.size,
      totalResources:
        this.resourceCleanup.eventListeners.size +
        this.resourceCleanup.intervals.size +
        this.resourceCleanup.timeouts.size +
        this.resourceCleanup.objectPools.size,
    };
  }

  /**
   * Get current performance level
   */
  getCurrentPerformanceLevel() {
    const avgFrameTime = this.metrics.averageFrameTime;
    const frameDropRate =
      this.metrics.frameDrops / Math.max(this.metrics.frameTime.length, 1);

    if (avgFrameTime > this.settings.criticalThreshold || frameDropRate > 0.3) {
      return "critical";
    } else if (
      avgFrameTime > this.settings.warningThreshold ||
      frameDropRate > 0.1
    ) {
      return "warning";
    }
    return "good";
  }

  /**
   * Render enhanced performance overlay with input processing metrics
   */
  renderOverlay(ctx) {
    if (!ctx || this.optimizations.diagnosticsDisabled) return;

    const x = 10;
    const y = ctx.canvas.height - 160; // Increased height for more metrics

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(x - 5, y - 15, 250, 150);

    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";

    const fps = this.metrics.fps.toFixed(1);
    const avgFrameTime = this.metrics.averageFrameTime.toFixed(2);
    const worstFrameTime = this.metrics.worstFrameTime.toFixed(2);
    const frameDropRate = (
      (this.metrics.frameDrops / Math.max(this.metrics.frameTime.length, 1)) *
      100
    ).toFixed(1);

    // Basic performance metrics
    ctx.fillText(`FPS: ${fps}`, x, y);
    ctx.fillText(`Avg Frame: ${avgFrameTime}ms`, x, y + 12);
    ctx.fillText(`Worst Frame: ${worstFrameTime}ms`, x, y + 24);
    ctx.fillText(`Frame Drops: ${frameDropRate}%`, x, y + 36);

    // Input processing metrics
    const inputStats = this.calculateInputProcessingStats();
    if (inputStats.averageProcessingTime > 0) {
      ctx.fillStyle = "#AAFFAA";
      ctx.fillText(
        `Input Proc: ${inputStats.averageProcessingTime}ms`,
        x,
        y + 48
      );
      ctx.fillText(`Input Latency: ${inputStats.averageLatency}ms`, x, y + 60);

      if (inputStats.queuedEvents > 0) {
        ctx.fillStyle = "#FFAAAA";
        ctx.fillText(`Queued: ${inputStats.queuedEvents}`, x, y + 72);
      }
    }

    // Performance level indicator
    const level = this.getCurrentPerformanceLevel();
    const levelColor =
      level === "critical"
        ? "#FF0000"
        : level === "warning"
        ? "#FFAA00"
        : "#00FF00";
    ctx.fillStyle = levelColor;
    ctx.fillText(`Status: ${level.toUpperCase()}`, x, y + 84);

    // Memory usage (if available)
    const memoryHealth = this.getMemoryHealth();
    if (memoryHealth.available) {
      const memoryColor =
        memoryHealth.status === "critical"
          ? "#FF0000"
          : memoryHealth.status === "warning"
          ? "#FFAA00"
          : "#FFFFFF";
      ctx.fillStyle = memoryColor;
      ctx.fillText(
        `Memory: ${memoryHealth.used} (${memoryHealth.usagePercent})`,
        x,
        y + 96
      );
    }

    // Active optimizations
    const activeOpts = Object.entries(this.optimizations)
      .filter(([key, value]) => value && key !== "diagnosticsDisabled")
      .map(([key]) =>
        key
          .replace("Enabled", "")
          .replace(/([A-Z])/g, " $1")
          .trim()
      );

    if (activeOpts.length > 0) {
      ctx.fillStyle = "#FFAA00";
      const optsText = activeOpts.join(", ");
      if (optsText.length > 30) {
        ctx.fillText(`Opts: ${optsText.substring(0, 27)}...`, x, y + 108);
      } else {
        ctx.fillText(`Opts: ${optsText}`, x, y + 108);
      }
    }

    // Production mode indicator
    if (this.settings.isProduction) {
      ctx.fillStyle = "#00AAFF";
      ctx.fillText("PROD MODE", x, y + 120);
    }

    // Resource usage
    const resourceUsage = this.getResourceUsage();
    if (resourceUsage.totalResources > 0) {
      ctx.fillStyle = "#AAAAFF";
      ctx.fillText(`Resources: ${resourceUsage.totalResources}`, x, y + 132);
    }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      recommendations: this.generateRecommendations(),
      settings: { ...this.settings },
      optimizations: { ...this.optimizations },
    };

    console.log("Performance Report Generated:", report);
    return report;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const level = this.getCurrentPerformanceLevel();
    const avgFrameTime = this.metrics.averageFrameTime;
    const frameDropRate =
      this.metrics.frameDrops / Math.max(this.metrics.frameTime.length, 1);

    if (level === "critical") {
      recommendations.push(
        "Consider reducing game complexity or visual effects"
      );
      recommendations.push("Enable all performance optimizations");
      recommendations.push("Check for memory leaks or inefficient algorithms");
    } else if (level === "warning") {
      recommendations.push("Monitor performance closely");
      recommendations.push("Consider enabling selective optimizations");
    } else {
      recommendations.push("Performance is good");
      if (this.optimizations.lowQualityMode) {
        recommendations.push("Consider gradually restoring visual quality");
      }
    }

    if (frameDropRate > 0.2) {
      recommendations.push(
        "High frame drop rate detected - check for blocking operations"
      );
    }

    if (performance.memory && this.metrics.memoryUsage.length > 0) {
      const latest =
        this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const memoryUsagePercent = (latest.used / latest.limit) * 100;

      if (memoryUsagePercent > 80) {
        recommendations.push(
          "High memory usage detected - check for memory leaks"
        );
      }
    }

    return recommendations;
  }

  /**
   * Start memory leak detection
   */
  startMemoryLeakDetection() {
    if (!this.memoryLeakDetection.enabled || this.settings.isProduction) return;

    this.memoryLeakDetection.lastGCTime = performance.now();

    // Monitor memory usage periodically
    setInterval(() => {
      this.checkMemoryLeaks();
    }, this.memoryLeakDetection.gcInterval);

    console.log("Memory leak detection started");
  }

  /**
   * Check for memory leaks
   */
  checkMemoryLeaks() {
    if (!performance.memory) return;

    const currentMemory = performance.memory.usedJSHeapSize;
    const memoryGrowth =
      this.metrics.memoryUsage.length > 0
        ? currentMemory - this.metrics.memoryUsage[0].used
        : 0;

    // Detect excessive memory growth
    if (memoryGrowth > this.memoryLeakDetection.memoryGrowthThreshold) {
      console.warn(
        `Potential memory leak detected: ${(memoryGrowth / 1024 / 1024).toFixed(
          1
        )}MB growth`
      );
      this.performMemoryCleanup();
    }

    // Suggest garbage collection if available
    if (window.gc && typeof window.gc === "function") {
      const timeSinceLastGC =
        performance.now() - this.memoryLeakDetection.lastGCTime;
      if (timeSinceLastGC > this.memoryLeakDetection.gcInterval) {
        try {
          window.gc();
          this.memoryLeakDetection.lastGCTime = performance.now();
          console.log("Manual garbage collection triggered");
        } catch (error) {
          // Ignore errors if GC is not available
        }
      }
    }
  }

  /**
   * Perform memory cleanup
   */
  performMemoryCleanup() {
    console.log("Performing memory cleanup...");

    // Clean up old metrics data
    const maxSamples = Math.floor(this.settings.sampleSize / 2);

    if (this.metrics.frameTime.length > maxSamples) {
      this.metrics.frameTime = this.metrics.frameTime.slice(-maxSamples);
    }

    if (this.metrics.inputProcessingTime.length > maxSamples) {
      this.metrics.inputProcessingTime = this.metrics.inputProcessingTime.slice(
        -maxSamples
      );
    }

    if (this.metrics.inputLatency.length > maxSamples) {
      this.metrics.inputLatency = this.metrics.inputLatency.slice(-maxSamples);
    }

    if (this.metrics.memoryUsage.length > 25) {
      this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-25);
    }

    // Clean up input event queue
    if (this.inputEventQueue.length > 50) {
      this.inputEventQueue = this.inputEventQueue.slice(-25);
      console.warn("Input event queue cleaned up due to memory pressure");
    }

    // Clean up diagnostic data if available
    this.cleanupDiagnosticData();

    console.log("Memory cleanup completed");
  }

  /**
   * Clean up diagnostic data
   */
  cleanupDiagnosticData() {
    // Clean up InputDiagnosticSystem data
    if (window.InputDiagnosticSystem) {
      document
        .querySelectorAll("[data-diagnostic-system]")
        .forEach((element) => {
          if (element.diagnosticSystem) {
            const system = element.diagnosticSystem;

            // Limit event history
            if (system.eventHistory && system.eventHistory.length > 100) {
              system.eventHistory = system.eventHistory.slice(-50);
            }

            // Limit diagnostic data
            if (
              system.inputDiagnostics &&
              system.inputDiagnostics.length > 100
            ) {
              system.inputDiagnostics = system.inputDiagnostics.slice(-50);
            }

            // Clear performance metrics
            if (system.performanceMetrics) {
              Object.keys(system.performanceMetrics).forEach((key) => {
                if (
                  Array.isArray(system.performanceMetrics[key]) &&
                  system.performanceMetrics[key].length > 50
                ) {
                  system.performanceMetrics[key] =
                    system.performanceMetrics[key].slice(-25);
                }
              });
            }
          }
        });
    }

    // Clean up EnhancedInputManager data
    if (window.EnhancedInputManager) {
      document.querySelectorAll("[data-input-manager]").forEach((element) => {
        if (element.inputManager) {
          const manager = element.inputManager;

          // Limit event history
          if (manager.eventHistory && manager.eventHistory.length > 100) {
            manager.eventHistory = manager.eventHistory.slice(-50);
          }

          // Limit input diagnostics
          if (
            manager.inputDiagnostics &&
            manager.inputDiagnostics.length > 100
          ) {
            manager.inputDiagnostics = manager.inputDiagnostics.slice(-50);
          }
        }
      });
    }
  }

  /**
   * Register resource for cleanup tracking
   */
  registerResource(type, resource) {
    switch (type) {
      case "eventListener":
        this.resourceCleanup.eventListeners.add(resource);
        break;
      case "interval":
        this.resourceCleanup.intervals.add(resource);
        break;
      case "timeout":
        this.resourceCleanup.timeouts.add(resource);
        break;
      case "objectPool":
        this.resourceCleanup.objectPools.set(resource.name, resource);
        break;
    }
  }

  /**
   * Cleanup all registered resources
   */
  cleanupAllResources() {
    console.log("Cleaning up all registered resources...");

    // Clear intervals
    this.resourceCleanup.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.resourceCleanup.intervals.clear();

    // Clear timeouts
    this.resourceCleanup.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.resourceCleanup.timeouts.clear();

    // Remove event listeners
    this.resourceCleanup.eventListeners.forEach((listener) => {
      if (listener.element && listener.event && listener.handler) {
        listener.element.removeEventListener(listener.event, listener.handler);
      }
    });
    this.resourceCleanup.eventListeners.clear();

    // Clear object pools
    this.resourceCleanup.objectPools.forEach((pool) => {
      if (pool.clear) {
        pool.clear();
      }
    });
    this.resourceCleanup.objectPools.clear();

    console.log("Resource cleanup completed");
  }

  /**
   * Disable runtime diagnostics for performance
   */
  disableRuntimeDiagnostics() {
    this.optimizations.diagnosticsDisabled = true;

    // Disable diagnostic systems
    if (window.InputDiagnosticSystem) {
      document
        .querySelectorAll("[data-diagnostic-system]")
        .forEach((element) => {
          if (element.diagnosticSystem) {
            element.diagnosticSystem.isRecording = false;
            element.diagnosticSystem.diagnosticMode = false;
          }
        });
    }

    // Disable enhanced input manager diagnostics
    if (window.EnhancedInputManager) {
      document.querySelectorAll("[data-input-manager]").forEach((element) => {
        if (element.inputManager && element.inputManager.disableDiagnostics) {
          element.inputManager.disableDiagnostics();
        }
      });
    }

    console.log("Runtime diagnostics disabled for performance optimization");
  }

  /**
   * Reset performance metrics with enhanced cleanup
   */
  reset() {
    // Perform cleanup before reset
    this.performMemoryCleanup();

    this.metrics = {
      frameTime: [],
      renderTime: [],
      updateTime: [],
      inputProcessingTime: [],
      memoryUsage: [],
      fps: 0,
      averageFrameTime: 0,
      worstFrameTime: 0,
      frameDrops: 0,
      inputLatency: [],
      diagnosticOverhead: [],
    };

    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.inputEventQueue = [];

    console.log("Performance metrics reset with memory cleanup");
  }

  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };

    // Re-evaluate production mode if environment settings changed
    if (newSettings.hasOwnProperty("isProduction")) {
      if (
        newSettings.isProduction &&
        this.settings.inputOptimization.diagnosticAutoDisable
      ) {
        this.disableProductionDiagnostics();
      }
    }

    console.log("Performance settings updated:", this.settings);
  }

  /**
   * Generate enhanced performance recommendations including input processing
   */
  generateEnhancedRecommendations() {
    const recommendations = this.generateRecommendations();
    const inputStats = this.calculateInputProcessingStats();
    const memoryHealth = this.getMemoryHealth();

    // Input processing recommendations
    if (parseFloat(inputStats.averageProcessingTime) > 5) {
      recommendations.push(
        "Consider optimizing input processing - high processing time detected"
      );
    }

    if (parseFloat(inputStats.averageLatency) > 50) {
      recommendations.push(
        "High input latency detected - consider input throttling or diagnostic disabling"
      );
    }

    if (inputStats.queuedEvents > 10) {
      recommendations.push(
        "Input event queue is backing up - enable input throttling"
      );
    }

    // Memory recommendations
    if (memoryHealth.available && memoryHealth.status === "critical") {
      recommendations.push(
        "Critical memory usage - perform immediate cleanup and enable aggressive optimizations"
      );
    } else if (memoryHealth.available && memoryHealth.status === "warning") {
      recommendations.push(
        "High memory usage - consider enabling memory cleanup optimizations"
      );
    }

    // Production mode recommendations
    if (!this.settings.isProduction && this.optimizations.diagnosticsDisabled) {
      recommendations.push(
        "Diagnostics disabled in development mode - consider re-enabling for debugging"
      );
    }

    if (this.settings.isProduction && !this.optimizations.diagnosticsDisabled) {
      recommendations.push(
        "Production mode detected but diagnostics still enabled - consider disabling for better performance"
      );
    }

    return recommendations;
  }

  /**
   * Destroy and cleanup all resources
   */
  destroy() {
    console.log("Destroying PerformanceOptimizer...");

    // Cleanup all registered resources
    this.cleanupAllResources();

    // Clear all metrics arrays
    Object.keys(this.metrics).forEach((key) => {
      if (Array.isArray(this.metrics[key])) {
        this.metrics[key] = [];
      }
    });

    // Clear input event queue
    this.inputEventQueue = [];

    // Disable memory leak detection
    this.memoryLeakDetection.enabled = false;

    console.log("PerformanceOptimizer destroyed and cleaned up");
  }
}

// Enhanced integration with input systems
if (typeof window !== "undefined") {
  // Auto-integrate with InputDiagnosticSystem if available
  document.addEventListener("DOMContentLoaded", () => {
    if (window.InputDiagnosticSystem && window.PerformanceOptimizer) {
      // Enhance InputDiagnosticSystem with performance tracking
      const originalRecordInputEvent =
        window.InputDiagnosticSystem.prototype.recordInputEvent;

      window.InputDiagnosticSystem.prototype.recordInputEvent = function (
        eventType,
        data
      ) {
        // Start performance measurement
        if (window.gamePerformanceOptimizer) {
          window.gamePerformanceOptimizer.startInputProcessingMeasurement();
        }

        // Call original method
        const result = originalRecordInputEvent.call(this, eventType, data);

        // End performance measurement
        if (window.gamePerformanceOptimizer) {
          window.gamePerformanceOptimizer.endInputProcessingMeasurement();

          // Record latency if this is a jump result
          if (eventType === "jump-result" && data.timestamp) {
            const latency = performance.now() - data.timestamp;
            window.gamePerformanceOptimizer.recordInputLatency(latency);
          }
        }

        return result;
      };
    }

    // Auto-integrate with EnhancedInputManager if available
    if (window.EnhancedInputManager && window.PerformanceOptimizer) {
      const originalHandleKeyDown =
        window.EnhancedInputManager.prototype.handleKeyDownEnhanced;

      window.EnhancedInputManager.prototype.handleKeyDownEnhanced = function (
        event
      ) {
        // Start performance measurement
        if (window.gamePerformanceOptimizer) {
          window.gamePerformanceOptimizer.startInputProcessingMeasurement();
        }

        // Call original method
        const result = originalHandleKeyDown.call(this, event);

        // End performance measurement
        if (window.gamePerformanceOptimizer) {
          window.gamePerformanceOptimizer.endInputProcessingMeasurement();
        }

        return result;
      };
    }
  });
}

// Export for use in main game
window.PerformanceOptimizer = PerformanceOptimizer;
