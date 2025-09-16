/**
 * Task 7 Verification: Enhanced Debug Display System
 * Tests the implementation of the enhanced debug display functionality
 */

class Task7DebugDisplayVerification {
  constructor() {
    this.testResults = [];
    this.gameEngine = null;
    this.debugDisplaySystem = null;
  }

  /**
   * Run all verification tests
   */
  async runAllTests() {
    console.log("=== Task 7: Enhanced Debug Display System Verification ===");

    try {
      // Initialize game engine for testing
      await this.initializeGameEngine();

      // Run individual tests
      this.testDebugDisplaySystemCreation();
      this.testToggleFunctionality();
      this.testDisplayModes();
      this.testDataCollection();
      this.testRenderingMethods();
      this.testF1KeyIntegration();
      this.testF2KeyIntegration();
      this.testPlayerIntegration();
      this.testPhysicsIntegration();

      // Generate report
      this.generateReport();
    } catch (error) {
      console.error("Verification failed:", error);
      this.addTestResult(
        "Overall Test",
        false,
        `Verification failed: ${error.message}`
      );
    }

    return this.testResults;
  }

  /**
   * Initialize game engine for testing
   */
  async initializeGameEngine() {
    try {
      // Create a test canvas
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      document.body.appendChild(canvas);

      // Initialize game engine
      this.gameEngine = new GameEngine(canvas);
      await this.gameEngine.init();

      // Get debug display system reference
      this.debugDisplaySystem = this.gameEngine.debugDisplaySystem;

      this.addTestResult(
        "Game Engine Initialization",
        true,
        "Game engine initialized successfully"
      );
    } catch (error) {
      this.addTestResult(
        "Game Engine Initialization",
        false,
        `Failed to initialize: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Test debug display system creation
   */
  testDebugDisplaySystemCreation() {
    const testName = "Debug Display System Creation";

    try {
      // Check if debug display system exists
      const exists =
        this.debugDisplaySystem !== null &&
        this.debugDisplaySystem !== undefined;

      if (!exists) {
        this.addTestResult(testName, false, "Debug display system not created");
        return;
      }

      // Check if it's an instance of DebugDisplaySystem
      const isCorrectType =
        this.debugDisplaySystem instanceof DebugDisplaySystem;

      if (!isCorrectType) {
        this.addTestResult(
          testName,
          false,
          "Debug display system is not correct type"
        );
        return;
      }

      // Check essential properties
      const hasEssentialProperties =
        typeof this.debugDisplaySystem.isVisible === "boolean" &&
        typeof this.debugDisplaySystem.displayMode === "string" &&
        typeof this.debugDisplaySystem.config === "object";

      if (!hasEssentialProperties) {
        this.addTestResult(
          testName,
          false,
          "Debug display system missing essential properties"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Debug display system created with correct properties"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test toggle functionality
   */
  testToggleFunctionality() {
    const testName = "Toggle Functionality";

    try {
      if (!this.debugDisplaySystem) {
        this.addTestResult(
          testName,
          false,
          "Debug display system not available"
        );
        return;
      }

      // Test initial state
      const initialState = this.debugDisplaySystem.isVisible;

      // Test toggle
      const newState = this.debugDisplaySystem.toggle();

      // Verify state changed
      const stateChanged = newState !== initialState;
      const propertyUpdated = this.debugDisplaySystem.isVisible === newState;

      if (!stateChanged) {
        this.addTestResult(testName, false, "Toggle did not change state");
        return;
      }

      if (!propertyUpdated) {
        this.addTestResult(
          testName,
          false,
          "isVisible property not updated correctly"
        );
        return;
      }

      // Test toggle back
      const finalState = this.debugDisplaySystem.toggle();
      const backToOriginal = finalState === initialState;

      if (!backToOriginal) {
        this.addTestResult(
          testName,
          false,
          "Toggle back did not restore original state"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Toggle functionality works correctly"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test display modes
   */
  testDisplayModes() {
    const testName = "Display Modes";

    try {
      if (!this.debugDisplaySystem) {
        this.addTestResult(
          testName,
          false,
          "Debug display system not available"
        );
        return;
      }

      const expectedModes = ["full", "minimal", "physics", "input"];
      const initialMode = this.debugDisplaySystem.displayMode;

      // Test cycling through all modes
      const encounteredModes = [initialMode];

      for (let i = 0; i < expectedModes.length; i++) {
        const newMode = this.debugDisplaySystem.cycleDisplayMode();
        encounteredModes.push(newMode);
      }

      // Check if all expected modes were encountered
      const allModesFound = expectedModes.every((mode) =>
        encounteredModes.includes(mode)
      );

      if (!allModesFound) {
        this.addTestResult(
          testName,
          false,
          `Not all expected modes found. Expected: ${expectedModes.join(
            ", "
          )}, Found: ${[...new Set(encounteredModes)].join(", ")}`
        );
        return;
      }

      // Check if cycling returns to original mode
      const finalMode = this.debugDisplaySystem.displayMode;
      const cycledBack = finalMode === initialMode;

      if (!cycledBack) {
        this.addTestResult(
          testName,
          false,
          "Cycling did not return to original mode"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Display modes cycle correctly through all expected modes"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test data collection
   */
  testDataCollection() {
    const testName = "Data Collection";

    try {
      if (!this.debugDisplaySystem) {
        this.addTestResult(
          testName,
          false,
          "Debug display system not available"
        );
        return;
      }

      // Enable debug display for data collection
      this.debugDisplaySystem.setVisible(true);

      // Test update method
      const updateMethod = typeof this.debugDisplaySystem.update === "function";

      if (!updateMethod) {
        this.addTestResult(testName, false, "Update method not available");
        return;
      }

      // Call update to collect data
      this.debugDisplaySystem.update(16.67); // Simulate 60fps frame

      // Check if data structures exist
      const hasFrameData = Array.isArray(this.debugDisplaySystem.frameData);
      const hasPhysicsData =
        typeof this.debugDisplaySystem.physicsData === "object";
      const hasInputData =
        typeof this.debugDisplaySystem.inputData === "object";

      if (!hasFrameData || !hasPhysicsData || !hasInputData) {
        this.addTestResult(
          testName,
          false,
          "Data collection structures not properly initialized"
        );
        return;
      }

      // Test data recording methods
      const hasRecordJumpAttempt =
        typeof this.debugDisplaySystem.recordJumpAttempt === "function";
      const hasRecordCollisionEvent =
        typeof this.debugDisplaySystem.recordCollisionEvent === "function";

      if (!hasRecordJumpAttempt || !hasRecordCollisionEvent) {
        this.addTestResult(
          testName,
          false,
          "Data recording methods not available"
        );
        return;
      }

      // Test recording functionality
      this.debugDisplaySystem.recordJumpAttempt({
        inputDetected: true,
        jumpExecuted: true,
        reason: "Test jump",
      });

      this.debugDisplaySystem.recordCollisionEvent({
        entityA: { position: { x: 0, y: 0 }, size: { width: 32, height: 32 } },
        entityB: {
          position: { x: 0, y: 32 },
          size: { width: 100, height: 20 },
        },
        resolution: { resolved: true, direction: "bottom" },
      });

      // Check if data was recorded
      const jumpAttempts = this.debugDisplaySystem.physicsData.jumpAttempts;
      const collisionEvents =
        this.debugDisplaySystem.physicsData.collisionEvents;

      const jumpRecorded = jumpAttempts.length > 0;
      const collisionRecorded = collisionEvents.length > 0;

      if (!jumpRecorded || !collisionRecorded) {
        this.addTestResult(
          testName,
          false,
          "Data recording not working properly"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Data collection and recording working correctly"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test rendering methods
   */
  testRenderingMethods() {
    const testName = "Rendering Methods";

    try {
      if (!this.debugDisplaySystem) {
        this.addTestResult(
          testName,
          false,
          "Debug display system not available"
        );
        return;
      }

      // Check if render method exists
      const hasRenderMethod =
        typeof this.debugDisplaySystem.render === "function";

      if (!hasRenderMethod) {
        this.addTestResult(testName, false, "Render method not available");
        return;
      }

      // Create a test canvas context
      const testCanvas = document.createElement("canvas");
      testCanvas.width = 800;
      testCanvas.height = 600;
      const ctx = testCanvas.getContext("2d");

      // Test rendering in different modes
      const modes = ["full", "minimal", "physics", "input"];
      let renderingErrors = [];

      for (const mode of modes) {
        try {
          this.debugDisplaySystem.displayMode = mode;
          this.debugDisplaySystem.setVisible(true);
          this.debugDisplaySystem.render(ctx);
        } catch (error) {
          renderingErrors.push(`${mode}: ${error.message}`);
        }
      }

      if (renderingErrors.length > 0) {
        this.addTestResult(
          testName,
          false,
          `Rendering errors: ${renderingErrors.join(", ")}`
        );
        return;
      }

      // Test rendering when invisible
      this.debugDisplaySystem.setVisible(false);
      try {
        this.debugDisplaySystem.render(ctx);
      } catch (error) {
        this.addTestResult(
          testName,
          false,
          `Error rendering when invisible: ${error.message}`
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Rendering methods work correctly for all display modes"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test F1 key integration
   */
  testF1KeyIntegration() {
    const testName = "F1 Key Integration";

    try {
      if (!this.gameEngine || !this.debugDisplaySystem) {
        this.addTestResult(
          testName,
          false,
          "Game engine or debug display system not available"
        );
        return;
      }

      // Start the game to enable input handling
      this.gameEngine.start();
      this.gameEngine.startGame();

      // Get initial state
      const initialState = this.debugDisplaySystem.isVisible;

      // Simulate F1 key press
      const f1Event = new KeyboardEvent("keydown", {
        code: "F1",
        key: "F1",
        bubbles: true,
      });

      document.dispatchEvent(f1Event);

      // Update input manager to process the event
      this.gameEngine.inputManager.update();

      // Check if debug input was handled
      const f1Pressed = this.gameEngine.inputManager.isKeyPressed("F1");

      if (!f1Pressed) {
        this.addTestResult(
          testName,
          false,
          "F1 key press not detected by input manager"
        );
        return;
      }

      // Simulate the debug input handling
      this.gameEngine.handleDebugInput();

      // Check if state changed
      const newState = this.debugDisplaySystem.isVisible;
      const stateChanged = newState !== initialState;

      if (!stateChanged) {
        this.addTestResult(
          testName,
          false,
          "F1 key press did not toggle debug display"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "F1 key integration working correctly"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test F2 key integration
   */
  testF2KeyIntegration() {
    const testName = "F2 Key Integration";

    try {
      if (!this.gameEngine || !this.debugDisplaySystem) {
        this.addTestResult(
          testName,
          false,
          "Game engine or debug display system not available"
        );
        return;
      }

      // Enable debug display first
      this.debugDisplaySystem.setVisible(true);

      // Get initial mode
      const initialMode = this.debugDisplaySystem.displayMode;

      // Simulate F2 key press
      const f2Event = new KeyboardEvent("keydown", {
        code: "F2",
        key: "F2",
        bubbles: true,
      });

      document.dispatchEvent(f2Event);

      // Update input manager to process the event
      this.gameEngine.inputManager.update();

      // Check if debug input was handled
      const f2Pressed = this.gameEngine.inputManager.isKeyPressed("F2");

      if (!f2Pressed) {
        this.addTestResult(
          testName,
          false,
          "F2 key press not detected by input manager"
        );
        return;
      }

      // Simulate the debug input handling
      this.gameEngine.handleDebugInput();

      // Check if mode changed
      const newMode = this.debugDisplaySystem.displayMode;
      const modeChanged = newMode !== initialMode;

      if (!modeChanged) {
        this.addTestResult(
          testName,
          false,
          "F2 key press did not cycle display mode"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "F2 key integration working correctly"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test player integration
   */
  testPlayerIntegration() {
    const testName = "Player Integration";

    try {
      if (!this.gameEngine || !this.gameEngine.player) {
        this.addTestResult(
          testName,
          false,
          "Game engine or player not available"
        );
        return;
      }

      const player = this.gameEngine.player;

      // Check if player has reference to game engine
      const hasGameEngineRef = player.gameEngine === this.gameEngine;

      if (!hasGameEngineRef) {
        this.addTestResult(
          testName,
          false,
          "Player does not have reference to game engine"
        );
        return;
      }

      // Test jump attempt recording
      const initialJumpAttempts =
        this.debugDisplaySystem.physicsData.jumpAttempts.length;

      // Simulate a jump attempt
      player.isOnGround = true;
      const jumpResult = player.jump();

      // Check if jump attempt was recorded
      const newJumpAttempts =
        this.debugDisplaySystem.physicsData.jumpAttempts.length;
      const jumpRecorded = newJumpAttempts > initialJumpAttempts;

      if (!jumpRecorded) {
        this.addTestResult(
          testName,
          false,
          "Jump attempt not recorded in debug display system"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Player integration working correctly"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Test physics integration
   */
  testPhysicsIntegration() {
    const testName = "Physics Integration";

    try {
      if (!this.gameEngine || !this.gameEngine.physicsEngine) {
        this.addTestResult(
          testName,
          false,
          "Game engine or physics engine not available"
        );
        return;
      }

      // Check if global game engine reference exists
      const hasGlobalRef = window.gameEngine === this.gameEngine;

      if (!hasGlobalRef) {
        this.addTestResult(
          testName,
          false,
          "Global game engine reference not set"
        );
        return;
      }

      // Test collision event recording
      const initialCollisionEvents =
        this.debugDisplaySystem.physicsData.collisionEvents.length;

      // Create test entities
      const entityA = {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 50 },
        size: { width: 32, height: 32 },
      };

      const entityB = {
        position: { x: 100, y: 132 },
        size: { width: 100, height: 20 },
      };

      // Simulate collision resolution
      const resolution = this.gameEngine.physicsEngine.resolveCollision(
        entityA,
        entityB
      );

      // Check if collision event was recorded
      const newCollisionEvents =
        this.debugDisplaySystem.physicsData.collisionEvents.length;
      const collisionRecorded = newCollisionEvents > initialCollisionEvents;

      if (!collisionRecorded) {
        this.addTestResult(
          testName,
          false,
          "Collision event not recorded in debug display system"
        );
        return;
      }

      this.addTestResult(
        testName,
        true,
        "Physics integration working correctly"
      );
    } catch (error) {
      this.addTestResult(testName, false, `Error: ${error.message}`);
    }
  }

  /**
   * Add a test result
   */
  addTestResult(testName, passed, details) {
    this.testResults.push({
      test: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString(),
    });

    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} - ${testName}: ${details}`);
  }

  /**
   * Generate verification report
   */
  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      (result) => result.passed
    ).length;
    const failedTests = totalTests - passedTests;
    const successRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log("\n=== TASK 7 VERIFICATION REPORT ===");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);

    if (failedTests > 0) {
      console.log("\n=== FAILED TESTS ===");
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`❌ ${result.test}: ${result.details}`);
        });
    }

    console.log("\n=== TASK 7 REQUIREMENTS VERIFICATION ===");

    // Check specific requirements
    const requirements = [
      {
        requirement: "プレイヤーの地面判定状態をリアルタイム表示",
        verified: this.testResults.some(
          (r) => r.test === "Data Collection" && r.passed
        ),
      },
      {
        requirement: "ジャンプ条件の詳細情報を画面上に表示",
        verified: this.testResults.some(
          (r) => r.test === "Rendering Methods" && r.passed
        ),
      },
      {
        requirement: "物理エンジンの更新状況を可視化",
        verified: this.testResults.some(
          (r) => r.test === "Physics Integration" && r.passed
        ),
      },
      {
        requirement: "F1 キーでデバッグ情報の表示/非表示を切り替え",
        verified: this.testResults.some(
          (r) => r.test === "F1 Key Integration" && r.passed
        ),
      },
    ];

    requirements.forEach((req) => {
      const status = req.verified ? "✅ VERIFIED" : "❌ NOT VERIFIED";
      console.log(`${status} - ${req.requirement}`);
    });

    const allRequirementsMet = requirements.every((req) => req.verified);

    console.log(`\n=== OVERALL RESULT ===`);
    if (allRequirementsMet && failedTests === 0) {
      console.log("🎉 TASK 7 IMPLEMENTATION SUCCESSFUL");
      console.log("All requirements have been implemented and verified.");
    } else {
      console.log("⚠️  TASK 7 IMPLEMENTATION NEEDS ATTENTION");
      console.log(
        "Some requirements may not be fully implemented or verified."
      );
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      allRequirementsMet,
      requirements,
      testResults: this.testResults,
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Task7DebugDisplayVerification;
}

// Auto-run if loaded directly in browser
if (typeof window !== "undefined") {
  window.Task7DebugDisplayVerification = Task7DebugDisplayVerification;

  // Auto-run verification when page loads
  window.addEventListener("load", () => {
    console.log(
      "Task 7 Debug Display Verification loaded. Run verification with:"
    );
    console.log("const verification = new Task7DebugDisplayVerification();");
    console.log("verification.runAllTests();");
  });
}
