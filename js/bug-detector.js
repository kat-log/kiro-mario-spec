/**
 * Bug Detection and Auto-Fix System for Mario Style Platformer
 * Detects common issues and applies automatic fixes where possible
 */

class BugDetector {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.detectedBugs = [];
    this.appliedFixes = [];
    this.monitoringEnabled = true;
    this.autoFixEnabled = true;

    // Error tracking
    this.errorLog = [];
    this.warningLog = [];

    // Performance tracking
    this.performanceIssues = [];

    console.log("Bug Detector initialized");
    this.setupErrorHandling();
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    // Capture JavaScript errors
    window.addEventListener("error", (event) => {
      this.logError({
        type: "javascript",
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.logError({
        type: "promise",
        message: event.reason?.message || "Unhandled promise rejection",
        reason: event.reason,
        timestamp: new Date().toISOString(),
      });
    });

    // Override console methods to capture warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.logWarning({
        message: args.join(" "),
        timestamp: new Date().toISOString(),
      });
      originalWarn.apply(console, args);
    };
  }

  /**
   * Log error for analysis
   */
  logError(error) {
    this.errorLog.push(error);

    // Keep only recent errors
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Analyze error for known issues
    this.analyzeError(error);
  }

  /**
   * Log warning for analysis
   */
  logWarning(warning) {
    this.warningLog.push(warning);

    // Keep only recent warnings
    if (this.warningLog.length > 50) {
      this.warningLog.shift();
    }
  }

  /**
   * Analyze error for known patterns
   */
  analyzeError(error) {
    // Check for common game-related errors
    if (error.message.includes("Canvas")) {
      this.detectCanvasIssues();
    }

    if (error.message.includes("Audio") || error.message.includes("sound")) {
      this.detectAudioIssues();
    }

    if (error.message.includes("undefined") || error.message.includes("null")) {
      this.detectNullReferenceIssues();
    }

    if (
      error.message.includes("performance") ||
      error.message.includes("slow")
    ) {
      this.detectPerformanceIssues();
    }
  }

  /**
   * Run comprehensive bug detection
   */
  async runBugDetection() {
    console.log("Running comprehensive bug detection...");

    this.detectedBugs = [];

    // Check different categories of bugs
    await this.detectGameLogicBugs();
    await this.detectRenderingBugs();
    await this.detectPhysicsBugs();
    await this.detectInputBugs();
    await this.detectAudioBugs();
    await this.detectPerformanceBugs();
    await this.detectMemoryLeaks();
    await this.detectCompatibilityBugs();

    // Generate bug report
    return this.generateBugReport();
  }

  /**
   * Detect game logic bugs
   */
  async detectGameLogicBugs() {
    const bugs = [];
    const engine = this.gameEngine;

    // Check game state consistency
    if (engine.gameState) {
      if (engine.gameState.timeRemaining < 0) {
        bugs.push({
          category: "game-logic",
          severity: "medium",
          issue: "Negative time remaining",
          description: "Game timer has gone below zero",
          autoFixable: true,
          fix: () => {
            engine.gameState.timeRemaining = 0;
            console.log("Auto-fixed: Reset negative time to zero");
          },
        });
      }

      if (engine.gameState.mode === "playing" && !engine.gameState.isRunning) {
        bugs.push({
          category: "game-logic",
          severity: "high",
          issue: "Inconsistent game state",
          description: "Game mode is playing but engine is not running",
          autoFixable: true,
          fix: () => {
            engine.gameState.isRunning = true;
            console.log("Auto-fixed: Synchronized game state");
          },
        });
      }
    }

    // Check player state
    if (engine.player) {
      if (engine.player.health < 0) {
        bugs.push({
          category: "game-logic",
          severity: "medium",
          issue: "Negative player health",
          description: "Player health has gone below zero",
          autoFixable: true,
          fix: () => {
            engine.player.health = 0;
            console.log("Auto-fixed: Reset negative health to zero");
          },
        });
      }

      if (isNaN(engine.player.position.x) || isNaN(engine.player.position.y)) {
        bugs.push({
          category: "game-logic",
          severity: "critical",
          issue: "Invalid player position",
          description: "Player position contains NaN values",
          autoFixable: true,
          fix: () => {
            engine.player.position.x = engine.player.position.x || 100;
            engine.player.position.y = engine.player.position.y || 100;
            console.log("Auto-fixed: Reset invalid player position");
          },
        });
      }

      if (
        Math.abs(engine.player.velocity.x) > 1000 ||
        Math.abs(engine.player.velocity.y) > 1000
      ) {
        bugs.push({
          category: "game-logic",
          severity: "medium",
          issue: "Excessive player velocity",
          description: "Player velocity is unreasonably high",
          autoFixable: true,
          fix: () => {
            engine.player.velocity.x = Math.max(
              -500,
              Math.min(500, engine.player.velocity.x)
            );
            engine.player.velocity.y = Math.max(
              -500,
              Math.min(500, engine.player.velocity.y)
            );
            console.log("Auto-fixed: Clamped excessive player velocity");
          },
        });
      }
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect rendering bugs
   */
  async detectRenderingBugs() {
    const bugs = [];
    const engine = this.gameEngine;

    // Check canvas state
    if (!engine.canvas || !engine.ctx) {
      bugs.push({
        category: "rendering",
        severity: "critical",
        issue: "Missing canvas or context",
        description: "Canvas or 2D context is not available",
        autoFixable: false,
      });
    }

    // Check for rendering performance issues
    if (engine.performanceOptimizer) {
      const metrics = engine.performanceOptimizer.getMetrics();
      if (metrics.averageFrameTime > 33) {
        // Below 30 FPS
        bugs.push({
          category: "rendering",
          severity: "medium",
          issue: "Poor rendering performance",
          description: `Average frame time is ${metrics.averageFrameTime.toFixed(
            2
          )}ms`,
          autoFixable: true,
          fix: () => {
            if (engine.performanceOptimizer) {
              engine.performanceOptimizer.enableReducedEffects();
              console.log(
                "Auto-fixed: Enabled reduced effects for better performance"
              );
            }
          },
        });
      }
    }

    // Check camera bounds
    if (engine.camera && engine.currentStage) {
      const cameraPos = engine.camera.getPosition();
      const stageBounds = engine.currentStage.getBounds();

      if (
        cameraPos.x < stageBounds.left - 100 ||
        cameraPos.x > stageBounds.right + 100
      ) {
        bugs.push({
          category: "rendering",
          severity: "low",
          issue: "Camera out of bounds",
          description: "Camera position is outside reasonable stage bounds",
          autoFixable: true,
          fix: () => {
            const clampedX = Math.max(
              stageBounds.left,
              Math.min(stageBounds.right - engine.canvas.width, cameraPos.x)
            );
            engine.camera.setPosition(clampedX, cameraPos.y);
            console.log("Auto-fixed: Clamped camera position to stage bounds");
          },
        });
      }
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect physics bugs
   */
  async detectPhysicsBugs() {
    const bugs = [];
    const engine = this.gameEngine;

    if (engine.physicsEngine && engine.player) {
      // Check for physics constant sanity
      const constants = engine.physicsEngine.getConstants();

      if (constants.gravity <= 0) {
        bugs.push({
          category: "physics",
          severity: "high",
          issue: "Invalid gravity value",
          description: "Gravity should be positive",
          autoFixable: true,
          fix: () => {
            engine.physicsEngine.updateConstants({ gravity: 980 });
            console.log("Auto-fixed: Reset gravity to default value");
          },
        });
      }

      if (constants.friction < 0 || constants.friction > 1) {
        bugs.push({
          category: "physics",
          severity: "medium",
          issue: "Invalid friction value",
          description: "Friction should be between 0 and 1",
          autoFixable: true,
          fix: () => {
            const clampedFriction = Math.max(
              0,
              Math.min(1, constants.friction)
            );
            engine.physicsEngine.updateConstants({ friction: clampedFriction });
            console.log("Auto-fixed: Clamped friction to valid range");
          },
        });
      }

      // Check for stuck player
      if (
        engine.player.velocity.x === 0 &&
        engine.player.velocity.y === 0 &&
        engine.gameState.mode === "playing" &&
        !engine.gameState.isPaused
      ) {
        // Check if player has been stuck for a while
        if (!this.playerStuckTimer) {
          this.playerStuckTimer = performance.now();
        } else if (performance.now() - this.playerStuckTimer > 5000) {
          // 5 seconds
          bugs.push({
            category: "physics",
            severity: "medium",
            issue: "Player appears stuck",
            description: "Player has not moved for an extended period",
            autoFixable: true,
            fix: () => {
              engine.player.position.y -= 10; // Lift player slightly
              this.playerStuckTimer = null;
              console.log("Auto-fixed: Lifted stuck player");
            },
          });
        }
      } else {
        this.playerStuckTimer = null;
      }
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect input bugs
   */
  async detectInputBugs() {
    const bugs = [];
    const engine = this.gameEngine;

    if (engine.inputManager) {
      try {
        const inputState = engine.inputManager.getPlayerInput();

        // Check if all inputs are stuck (possible input system failure)
        const allInputsActive = Object.values(inputState).every(
          (value) => value === true
        );
        if (allInputsActive) {
          bugs.push({
            category: "input",
            severity: "high",
            issue: "All inputs stuck active",
            description:
              "All input states are true, indicating possible input system failure",
            autoFixable: false,
          });
        }

        // Check for missing input bindings
        const requiredInputs = [
          "moveLeft",
          "moveRight",
          "jump",
          "dash",
          "block",
        ];
        for (const input of requiredInputs) {
          if (!(input in inputState)) {
            bugs.push({
              category: "input",
              severity: "medium",
              issue: `Missing input binding: ${input}`,
              description: `Required input ${input} is not bound`,
              autoFixable: false,
            });
          }
        }
      } catch (error) {
        bugs.push({
          category: "input",
          severity: "critical",
          issue: "Input system error",
          description: `Error getting input state: ${error.message}`,
          autoFixable: false,
        });
      }
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect audio bugs
   */
  async detectAudioBugs() {
    const bugs = [];
    const engine = this.gameEngine;

    if (engine.audioManager) {
      // Check critical sounds
      const criticalSounds = ["jump", "coin"];
      for (const sound of criticalSounds) {
        try {
          if (!engine.audioManager.isLoaded(sound)) {
            bugs.push({
              category: "audio",
              severity: "low",
              issue: `Sound not loaded: ${sound}`,
              description: `Critical sound ${sound} is not loaded`,
              autoFixable: false,
            });
          }
        } catch (error) {
          bugs.push({
            category: "audio",
            severity: "medium",
            issue: "Audio system error",
            description: `Error checking sound ${sound}: ${error.message}`,
            autoFixable: false,
          });
        }
      }
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect performance bugs
   */
  async detectPerformanceBugs() {
    const bugs = [];

    // Check for memory usage (if available)
    if (performance.memory) {
      const memoryUsage =
        performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;

      if (memoryUsage > 0.8) {
        bugs.push({
          category: "performance",
          severity: "high",
          issue: "High memory usage",
          description: `Memory usage is ${(memoryUsage * 100).toFixed(1)}%`,
          autoFixable: false,
        });
      }
    }

    // Check for excessive DOM elements
    const elementCount = document.querySelectorAll("*").length;
    if (elementCount > 1000) {
      bugs.push({
        category: "performance",
        severity: "medium",
        issue: "Excessive DOM elements",
        description: `${elementCount} DOM elements detected`,
        autoFixable: false,
      });
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect memory leaks
   */
  async detectMemoryLeaks() {
    const bugs = [];

    // Check for growing arrays/objects
    const engine = this.gameEngine;

    if (engine.itemManager) {
      const itemCount = engine.itemManager.getActiveItemCount();
      if (itemCount > 100) {
        bugs.push({
          category: "memory",
          severity: "medium",
          issue: "Excessive active items",
          description: `${itemCount} active items may indicate a cleanup issue`,
          autoFixable: true,
          fix: () => {
            // This would need to be implemented in the item manager
            console.log(
              "Auto-fix needed: Implement item cleanup in ItemManager"
            );
          },
        });
      }
    }

    // Check error log size
    if (this.errorLog.length > 50) {
      bugs.push({
        category: "memory",
        severity: "low",
        issue: "Large error log",
        description: `Error log has ${this.errorLog.length} entries`,
        autoFixable: true,
        fix: () => {
          this.errorLog = this.errorLog.slice(-25); // Keep only recent 25 errors
          console.log("Auto-fixed: Trimmed error log");
        },
      });
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect compatibility bugs
   */
  async detectCompatibilityBugs() {
    const bugs = [];

    // Check for browser-specific issues
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      // Safari-specific audio issues
      bugs.push({
        category: "compatibility",
        severity: "low",
        issue: "Safari audio limitations",
        description: "Safari may have audio autoplay restrictions",
        autoFixable: false,
      });
    }

    if (userAgent.includes("Firefox")) {
      // Firefox-specific canvas issues
      bugs.push({
        category: "compatibility",
        severity: "low",
        issue: "Firefox canvas performance",
        description:
          "Firefox may have different canvas performance characteristics",
        autoFixable: false,
      });
    }

    this.detectedBugs.push(...bugs);
  }

  /**
   * Detect canvas-specific issues
   */
  detectCanvasIssues() {
    const engine = this.gameEngine;

    if (!engine.canvas || !engine.ctx) {
      this.detectedBugs.push({
        category: "canvas",
        severity: "critical",
        issue: "Canvas not available",
        description: "Canvas or context is missing",
        autoFixable: false,
      });
    }
  }

  /**
   * Detect audio-specific issues
   */
  detectAudioIssues() {
    // Audio issues are handled in detectAudioBugs
  }

  /**
   * Detect null reference issues
   */
  detectNullReferenceIssues() {
    const engine = this.gameEngine;

    // Check critical references
    const criticalRefs = [
      "inputManager",
      "physicsEngine",
      "player",
      "currentStage",
    ];

    for (const ref of criticalRefs) {
      if (!engine[ref]) {
        this.detectedBugs.push({
          category: "null-reference",
          severity: "critical",
          issue: `Missing ${ref}`,
          description: `Critical component ${ref} is null or undefined`,
          autoFixable: false,
        });
      }
    }
  }

  /**
   * Detect performance-specific issues
   */
  detectPerformanceIssues() {
    // Performance issues are handled in detectPerformanceBugs
  }

  /**
   * Run continuous monitoring
   */
  startContinuousMonitoring() {
    if (!this.monitoringEnabled) return;

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      const quickCheck = await this.runQuickBugCheck();
      if (quickCheck.criticalIssues > 0) {
        console.warn("継続監視で重大な問題を検出:", quickCheck);
        if (this.autoFixEnabled) {
          await this.applyAutoFixes();
        }
      }
    }, 30000);

    console.log("継続的なバグ監視を開始しました");
  }

  /**
   * Stop continuous monitoring
   */
  stopContinuousMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("継続的なバグ監視を停止しました");
    }
  }

  /**
   * Run quick bug check (lighter version)
   */
  async runQuickBugCheck() {
    const issues = [];
    const engine = this.gameEngine;

    // Quick checks for critical issues
    if (!engine.canvas || !engine.ctx) {
      issues.push({ severity: "critical", issue: "Canvas not available" });
    }

    if (
      engine.player &&
      (isNaN(engine.player.position.x) || isNaN(engine.player.position.y))
    ) {
      issues.push({ severity: "critical", issue: "Invalid player position" });
    }

    if (engine.gameState && engine.gameState.timeRemaining < 0) {
      issues.push({ severity: "medium", issue: "Negative time remaining" });
    }

    const criticalIssues = issues.filter(
      (issue) => issue.severity === "critical"
    ).length;
    const totalIssues = issues.length;

    return {
      timestamp: new Date().toISOString(),
      totalIssues,
      criticalIssues,
      issues,
    };
  }

  /**
   * Apply automatic fixes
   */
  async applyAutoFixes() {
    if (!this.autoFixEnabled) {
      console.log("Auto-fix is disabled");
      return;
    }

    const fixableBugs = this.detectedBugs.filter((bug) => bug.autoFixable);

    console.log(`Applying ${fixableBugs.length} automatic fixes...`);

    for (const bug of fixableBugs) {
      try {
        if (bug.fix) {
          bug.fix();
          this.appliedFixes.push({
            bug: bug,
            timestamp: new Date().toISOString(),
            success: true,
          });
        }
      } catch (error) {
        console.error(`Failed to apply fix for ${bug.issue}:`, error);
        this.appliedFixes.push({
          bug: bug,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        });
      }
    }

    console.log(
      `Applied ${
        this.appliedFixes.filter((f) => f.success).length
      } fixes successfully`
    );
  }

  /**
   * Generate comprehensive bug report
   */
  generateBugReport() {
    const criticalBugs = this.detectedBugs.filter(
      (bug) => bug.severity === "critical"
    );
    const highBugs = this.detectedBugs.filter((bug) => bug.severity === "high");
    const mediumBugs = this.detectedBugs.filter(
      (bug) => bug.severity === "medium"
    );
    const lowBugs = this.detectedBugs.filter((bug) => bug.severity === "low");

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBugs: this.detectedBugs.length,
        critical: criticalBugs.length,
        high: highBugs.length,
        medium: mediumBugs.length,
        low: lowBugs.length,
        autoFixable: this.detectedBugs.filter((bug) => bug.autoFixable).length,
      },
      bugs: this.detectedBugs,
      appliedFixes: this.appliedFixes,
      errorLog: this.errorLog.slice(-10), // Recent errors
      warningLog: this.warningLog.slice(-10), // Recent warnings
    };

    this.logBugReport(report);
    return report;
  }

  /**
   * Log bug report to console
   */
  logBugReport(report) {
    console.log("\n" + "=".repeat(60));
    console.log("🐛 BUG DETECTION REPORT");
    console.log("=".repeat(60));
    console.log(`📊 Total Bugs: ${report.summary.totalBugs}`);
    console.log(`🔴 Critical: ${report.summary.critical}`);
    console.log(`🟠 High: ${report.summary.high}`);
    console.log(`🟡 Medium: ${report.summary.medium}`);
    console.log(`🟢 Low: ${report.summary.low}`);
    console.log(`🔧 Auto-fixable: ${report.summary.autoFixable}`);
    console.log("=".repeat(60));

    // Critical bugs
    if (report.summary.critical > 0) {
      console.log("🔴 CRITICAL BUGS:");
      report.bugs
        .filter((bug) => bug.severity === "critical")
        .forEach((bug) => {
          console.log(`   • ${bug.issue}: ${bug.description}`);
        });
      console.log("=".repeat(60));
    }

    // High priority bugs
    if (report.summary.high > 0) {
      console.log("🟠 HIGH PRIORITY BUGS:");
      report.bugs
        .filter((bug) => bug.severity === "high")
        .forEach((bug) => {
          console.log(`   • ${bug.issue}: ${bug.description}`);
        });
      console.log("=".repeat(60));
    }

    // Applied fixes
    if (report.appliedFixes.length > 0) {
      console.log("🔧 APPLIED FIXES:");
      report.appliedFixes.forEach((fix) => {
        const status = fix.success ? "✅" : "❌";
        console.log(`   ${status} ${fix.bug.issue}`);
      });
      console.log("=".repeat(60));
    }

    return report;
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoring(enabled) {
    this.monitoringEnabled = enabled;
    console.log(`Bug monitoring ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Enable/disable auto-fix
   */
  setAutoFix(enabled) {
    this.autoFixEnabled = enabled;
    console.log(`Auto-fix ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Get bug statistics
   */
  getStatistics() {
    return {
      totalErrors: this.errorLog.length,
      totalWarnings: this.warningLog.length,
      totalBugs: this.detectedBugs.length,
      appliedFixes: this.appliedFixes.length,
      monitoringEnabled: this.monitoringEnabled,
      autoFixEnabled: this.autoFixEnabled,
    };
  }
}

// Export for use in main game
window.BugDetector = BugDetector;
