/**
 * Task 3 Physics Optimization Verification Script
 * Verifies that the physics engine update order has been optimized correctly
 */

class Task3PhysicsVerification {
  constructor() {
    this.testResults = {
      updateOrderOptimized: false,
      groundStateContinuity: false,
      collisionResolutionTiming: false,
      loggingEnhanced: false,
      overallSuccess: false,
    };
    this.physicsLogs = [];
    this.originalConsoleLog = console.log;
  }

  /**
   * Setup log capture for physics updates
   */
  setupLogCapture() {
    const self = this;
    console.log = function (...args) {
      self.originalConsoleLog.apply(console, args);

      if (
        args[0] &&
        typeof args[0] === "string" &&
        args[0].includes("[PHYSICS]")
      ) {
        self.physicsLogs.push({
          timestamp: performance.now(),
          message: args[0],
          data: args[1] || null,
        });
      }
    };
  }

  /**
   * Restore original console.log
   */
  restoreConsole() {
    console.log = this.originalConsoleLog;
  }

  /**
   * Test 1: Verify physics update order is optimized
   */
  async testUpdateOrderOptimization(gameEngine) {
    console.log("[VERIFICATION] Testing physics update order optimization...");

    this.physicsLogs = [];

    // Trigger a physics update cycle
    if (gameEngine.player) {
      const initialPosition = { ...gameEngine.player.position };
      const initialVelocity = { ...gameEngine.player.velocity };

      // Simulate some movement
      gameEngine.player.velocity.y = 100; // Falling

      // Wait for a physics update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check for required log sequence
      const requiredSequence = [
        "Starting physics update",
        "Pre-update state",
        "Stage 1: Applying gravity and friction",
        "Stage 2: Updating position",
        "Stage 3: Collision detection and resolution",
        "Stage 4: Ground state update",
        "Stage 5: Physics update completed",
      ];

      let sequenceFound = true;
      let lastFoundIndex = -1;

      for (const expectedLog of requiredSequence) {
        const foundIndex = this.physicsLogs.findIndex(
          (log, index) =>
            index > lastFoundIndex && log.message.includes(expectedLog)
        );

        if (foundIndex === -1) {
          console.log(`[VERIFICATION] Missing expected log: ${expectedLog}`);
          sequenceFound = false;
          break;
        } else {
          lastFoundIndex = foundIndex;
        }
      }

      this.testResults.updateOrderOptimized = sequenceFound;
      console.log(
        `[VERIFICATION] Update order optimization: ${
          sequenceFound ? "PASSED" : "FAILED"
        }`
      );
    }

    return this.testResults.updateOrderOptimized;
  }

  /**
   * Test 2: Verify ground state continuity is maintained
   */
  async testGroundStateContinuity(gameEngine) {
    console.log("[VERIFICATION] Testing ground state continuity...");

    if (!gameEngine.player) {
      this.testResults.groundStateContinuity = false;
      return false;
    }

    // Check if lastGroundContact property exists and is being updated
    const hasLastGroundContact =
      gameEngine.player.hasOwnProperty("lastGroundContact");

    if (!hasLastGroundContact) {
      console.log("[VERIFICATION] Player missing lastGroundContact property");
      this.testResults.groundStateContinuity = false;
      return false;
    }

    // Monitor ground state changes
    const initialGroundContact = gameEngine.player.lastGroundContact;

    // Force player to ground
    gameEngine.player.position.y = 500;
    gameEngine.player.velocity.y = 0;
    gameEngine.player.isOnGround = true;

    // Wait for physics update
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check if ground contact timestamp was updated
    const groundContactUpdated =
      gameEngine.player.lastGroundContact > initialGroundContact;

    // Check logs for ground state preservation
    const groundStateLogs = this.physicsLogs.filter(
      (log) =>
        log.message.includes("Ground state") ||
        log.message.includes("ground state")
    );

    const hasGroundStateLogging = groundStateLogs.length > 0;

    this.testResults.groundStateContinuity =
      groundContactUpdated && hasGroundStateLogging;
    console.log(
      `[VERIFICATION] Ground state continuity: ${
        this.testResults.groundStateContinuity ? "PASSED" : "FAILED"
      }`
    );

    return this.testResults.groundStateContinuity;
  }

  /**
   * Test 3: Verify collision resolution timing
   */
  async testCollisionResolutionTiming(gameEngine) {
    console.log("[VERIFICATION] Testing collision resolution timing...");

    this.physicsLogs = [];

    if (gameEngine.player && gameEngine.currentStage) {
      // Position player for collision
      gameEngine.player.position.y = 500;
      gameEngine.player.velocity.y = 100;

      // Wait for collision to occur
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that collision detection happens after position update
      let positionUpdateIndex = -1;
      let collisionDetectionIndex = -1;
      let groundStateUpdateIndex = -1;

      this.physicsLogs.forEach((log, index) => {
        if (log.message.includes("Position updated")) {
          positionUpdateIndex = index;
        }
        if (log.message.includes("Collision detection")) {
          collisionDetectionIndex = index;
        }
        if (log.message.includes("Ground state update")) {
          groundStateUpdateIndex = index;
        }
      });

      const correctTiming =
        positionUpdateIndex < collisionDetectionIndex &&
        collisionDetectionIndex < groundStateUpdateIndex;

      this.testResults.collisionResolutionTiming = correctTiming;
      console.log(
        `[VERIFICATION] Collision resolution timing: ${
          correctTiming ? "PASSED" : "FAILED"
        }`
      );
    }

    return this.testResults.collisionResolutionTiming;
  }

  /**
   * Test 4: Verify enhanced logging is present
   */
  testEnhancedLogging() {
    console.log("[VERIFICATION] Testing enhanced logging...");

    const requiredLogTypes = [
      "Starting physics update",
      "Pre-update state",
      "Gravity applied",
      "Friction applied",
      "Position updated",
      "Processing collision",
      "Ground state update",
      "Physics update summary",
    ];

    const foundLogTypes = requiredLogTypes.filter((logType) =>
      this.physicsLogs.some((log) => log.message.includes(logType))
    );

    const loggingComplete =
      foundLogTypes.length >= requiredLogTypes.length * 0.8; // 80% threshold

    this.testResults.loggingEnhanced = loggingComplete;
    console.log(
      `[VERIFICATION] Enhanced logging: ${
        loggingComplete ? "PASSED" : "FAILED"
      }`
    );
    console.log(
      `[VERIFICATION] Found ${foundLogTypes.length}/${requiredLogTypes.length} required log types`
    );

    return this.testResults.loggingEnhanced;
  }

  /**
   * Run all verification tests
   */
  async runAllTests(gameEngine) {
    console.log(
      "[VERIFICATION] Starting Task 3 Physics Optimization Verification"
    );
    console.log("=".repeat(60));

    this.setupLogCapture();

    try {
      // Run all tests
      await this.testUpdateOrderOptimization(gameEngine);
      await this.testGroundStateContinuity(gameEngine);
      await this.testCollisionResolutionTiming(gameEngine);
      this.testEnhancedLogging();

      // Calculate overall success
      const passedTests = Object.values(this.testResults).filter(
        (result) => result === true
      ).length;
      const totalTests = Object.keys(this.testResults).length - 1; // Exclude overallSuccess

      this.testResults.overallSuccess = passedTests >= totalTests * 0.75; // 75% pass rate

      console.log("=".repeat(60));
      console.log("[VERIFICATION] Task 3 Verification Results:");
      console.log(
        `Update Order Optimized: ${
          this.testResults.updateOrderOptimized ? "✅ PASS" : "❌ FAIL"
        }`
      );
      console.log(
        `Ground State Continuity: ${
          this.testResults.groundStateContinuity ? "✅ PASS" : "❌ FAIL"
        }`
      );
      console.log(
        `Collision Resolution Timing: ${
          this.testResults.collisionResolutionTiming ? "✅ PASS" : "❌ FAIL"
        }`
      );
      console.log(
        `Enhanced Logging: ${
          this.testResults.loggingEnhanced ? "✅ PASS" : "❌ FAIL"
        }`
      );
      console.log("=".repeat(60));
      console.log(
        `Overall Result: ${
          this.testResults.overallSuccess
            ? "✅ TASK 3 COMPLETED SUCCESSFULLY"
            : "❌ TASK 3 NEEDS ATTENTION"
        }`
      );
      console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    } catch (error) {
      console.error("[VERIFICATION] Error during verification:", error);
      this.testResults.overallSuccess = false;
    } finally {
      this.restoreConsole();
    }

    return this.testResults;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const report = {
      taskId: "Task 3: Physics Update Order Optimization",
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: {
        totalTests: Object.keys(this.testResults).length - 1,
        passedTests: Object.values(this.testResults).filter(
          (result) => result === true
        ).length,
        failedTests: Object.values(this.testResults).filter(
          (result) => result === false
        ).length,
      },
      recommendations: [],
    };

    // Add recommendations based on failed tests
    if (!this.testResults.updateOrderOptimized) {
      report.recommendations.push(
        "Review physics update sequence - ensure proper stage ordering"
      );
    }

    if (!this.testResults.groundStateContinuity) {
      report.recommendations.push(
        "Check ground state preservation and lastGroundContact updates"
      );
    }

    if (!this.testResults.collisionResolutionTiming) {
      report.recommendations.push(
        "Verify collision detection occurs after position updates"
      );
    }

    if (!this.testResults.loggingEnhanced) {
      report.recommendations.push("Add missing physics update stage logging");
    }

    return report;
  }
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = Task3PhysicsVerification;
}

// Make available globally for browser testing
if (typeof window !== "undefined") {
  window.Task3PhysicsVerification = Task3PhysicsVerification;
}

console.log("Task 3 Physics Optimization Verification Script Loaded");
