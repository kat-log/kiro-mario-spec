/**
 * Performance Optimizer for Mario Style Platformer
 * Monitors and optimizes game performance
 */

class PerformanceOptimizer {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.metrics = {
      frameTime: [],
      renderTime: [],
      updateTime: [],
      memoryUsage: [],
      fps: 0,
      averageFrameTime: 0,
      worstFrameTime: 0,
      frameDrops: 0,
    };

    this.settings = {
      targetFPS: 60,
      maxFrameTime: 16.67, // ~60 FPS
      warningThreshold: 20, // 50 FPS
      criticalThreshold: 33.33, // 30 FPS
      sampleSize: 100,
      optimizationEnabled: true,
    };

    this.optimizations = {
      cullingEnabled: true,
      objectPoolingEnabled: true,
      reducedEffects: false,
      lowQualityMode: false,
    };

    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastOptimizationCheck = 0;
    this.optimizationInterval = 1000; // Check every second

    console.log("Performance Optimizer initialized");
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.metrics.frameTime = [];

    console.log("Performance monitoring started");
  }

  /**
   * Update performance metrics
   */
  update(deltaTime) {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;

    // Record frame time
    this.recordFrameTime(frameTime);

    // Update FPS calculation
    this.updateFPS(deltaTime);

    // Check for performance issues
    if (currentTime - this.lastOptimizationCheck > this.optimizationInterval) {
      this.checkPerformance();
      this.lastOptimizationCheck = currentTime;
    }

    this.lastFrameTime = currentTime;
    this.frameCount++;
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
   * Get current performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      performanceLevel: this.getCurrentPerformanceLevel(),
      optimizations: { ...this.optimizations },
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
   * Render performance overlay
   */
  renderOverlay(ctx) {
    if (!ctx) return;

    const x = 10;
    const y = ctx.canvas.height - 120;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x - 5, y - 15, 200, 110);

    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";

    const fps = this.metrics.fps.toFixed(1);
    const avgFrameTime = this.metrics.averageFrameTime.toFixed(2);
    const worstFrameTime = this.metrics.worstFrameTime.toFixed(2);
    const frameDropRate = (
      (this.metrics.frameDrops / Math.max(this.metrics.frameTime.length, 1)) *
      100
    ).toFixed(1);

    ctx.fillText(`FPS: ${fps}`, x, y);
    ctx.fillText(`Avg Frame: ${avgFrameTime}ms`, x, y + 15);
    ctx.fillText(`Worst Frame: ${worstFrameTime}ms`, x, y + 30);
    ctx.fillText(`Frame Drops: ${frameDropRate}%`, x, y + 45);

    // Performance level indicator
    const level = this.getCurrentPerformanceLevel();
    const levelColor =
      level === "critical"
        ? "#FF0000"
        : level === "warning"
        ? "#FFAA00"
        : "#00FF00";
    ctx.fillStyle = levelColor;
    ctx.fillText(`Status: ${level.toUpperCase()}`, x, y + 60);

    // Memory usage (if available)
    if (performance.memory && this.metrics.memoryUsage.length > 0) {
      const latest =
        this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const memoryMB = (latest.used / 1024 / 1024).toFixed(1);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`Memory: ${memoryMB}MB`, x, y + 75);
    }

    // Active optimizations
    const activeOpts = Object.entries(this.optimizations)
      .filter(([key, value]) => value)
      .map(([key]) => key.replace("Enabled", ""));

    if (activeOpts.length > 0) {
      ctx.fillStyle = "#FFAA00";
      ctx.fillText(`Opts: ${activeOpts.join(", ")}`, x, y + 90);
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
   * Reset performance metrics
   */
  reset() {
    this.metrics = {
      frameTime: [],
      renderTime: [],
      updateTime: [],
      memoryUsage: [],
      fps: 0,
      averageFrameTime: 0,
      worstFrameTime: 0,
      frameDrops: 0,
    };

    this.frameCount = 0;
    this.lastFrameTime = performance.now();

    console.log("Performance metrics reset");
  }

  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    console.log("Performance settings updated:", this.settings);
  }
}

// Export for use in main game
window.PerformanceOptimizer = PerformanceOptimizer;
