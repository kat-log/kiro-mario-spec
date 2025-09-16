/**
 * Jump Reliability Test Suite
 * Comprehensive testing for enhanced jump functionality
 */

class JumpReliabilityTestSuite {
  constructor() {
    this.testResults = [];
    this.game = null;
    this.player = null;
    this.startTime = null;
  }

  /**
   * Initialize test environment
   */
  async initialize() {
    console.log("[TEST SUITE] Initializing jump reliability test suite...");

    // Create a minimal game environment for testing
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;

    this.game = new Game(canvas);
    this.player = this.game.player;

    if (!this.player) {
      throw new Error("Failed to initialize player");
    }

    console.log("[TEST SUITE] Test environment initialized successfully");
    return true;
  }

  /**
   * Run all jump reliability tests
   */
  async runAllTests() {
    this.startTime = performance.now();
    console.log(
      "[TEST SUITE] Starting comprehensive jump reliability tests..."
    );

    const testSuites = [
      () => this.testBasicJumpFunctionality(),
      () => this.testJumpValidationLogic(),
      () => this.testGroundDetectionReliability(),
      () => this.testJumpInputProcessing(),
      () => this.testEdgeCaseHandling(),
      () => this.testPerformanceImpact(),
      () => this.testLoggingFunctionality(),
    ];

    for (const testSuite of testSuites) {
      try {
        await testSuite();
      } catch (error) {
        console.error("[TEST SUITE] Test suite failed:", error);
        this.addTestResult("Test Suite Execution", false, error.message);
      }
    }

    this.generateTestReport();
    return this.testResults;
  }

  /**
   * Test basic jump functionality
   */
  async testBasicJumpFunctionality() {
    console.log("[TEST] Testing basic jump functionality...");

    // Test 1: Normal jump execution
    this.resetPlayerToGround();
    const jumpResult = this.player.jump();
    this.addTestResult(
      "Basic Jump Execution",
      jumpResult === true,
      jumpResult ? "Jump executed successfully" : "Jump failed to execute"
    );

    // Test 2: Velocity change verification
    this.resetPlayerToGround();
    const initialVelocity = this.player.velocity.y;
    this.player.jump();
    const velocityChanged = this.player.velocity.y < initialVelocity;
    this.addTestResult(
      "Jump Velocity Change",
      velocityChanged,
      velocityChanged ? "Velocity changed correctly" : "Velocity did not change"
    );

    // Test 3: State change verification
    this.resetPlayerToGround();
    this.player.jump();
    const stateChanged = this.player.state === "jumping";
    this.addTestResult(
      "Jump State Change",
      stateChanged,
      stateChanged
        ? "State changed to jumping"
        : "State did not change correctly"
    );

    // Test 4: Ground state change
    this.resetPlayerToGround();
    this.player.jump();
    const groundStateChanged = !this.player.isOnGround;
    this.addTestResult(
      "Ground State Change",
      groundStateChanged,
      groundStateChanged
        ? "Ground state changed correctly"
        : "Ground state did not change"
    );
  }

  /**
   * Test jump validation logic
   */
  async testJumpValidationLogic() {
    console.log("[TEST] Testing jump validation logic...");

    // Test 1: Validation when on ground
    this.resetPlayerToGround();
    const validation1 = this.player.validateJumpConditions();
    this.addTestResult(
      "Validation - On Ground",
      validation1.canJump === true,
      `Validation result: ${validation1.reason}`
    );

    // Test 2: Validation when not on ground
    this.player.isOnGround = false;
    const validation2 = this.player.validateJumpConditions();
    this.addTestResult(
      "Validation - Not On Ground",
      validation2.canJump === false,
      `Validation result: ${validation2.reason}`
    );

    // Test 3: Validation when blocking
    this.resetPlayerToGround();
    this.player.isBlocking = true;
    const validation3 = this.player.validateJumpConditions();
    this.addTestResult(
      "Validation - While Blocking",
      validation3.canJump === false,
      `Validation result: ${validation3.reason}`
    );

    // Test 4: Validation with zero jump power
    this.resetPlayerToGround();
    this.player.jumpPower = 0;
    const validation4 = this.player.validateJumpConditions();
    this.addTestResult(
      "Validation - Zero Jump Power",
      validation4.canJump === false,
      `Validation result: ${validation4.reason}`
    );

    // Reset jump power
    this.player.jumpPower = 400;
  }

  /**
   * Test ground detection reliability
   */
  async testGroundDetectionReliability() {
    console.log("[TEST] Testing ground detection reliability...");

    // Test 1: Enhanced ground check
    this.resetPlayerToGround();
    const groundCheck = this.player.performEnhancedGroundCheck();
    this.addTestResult(
      "Enhanced Ground Check",
      groundCheck.isOnGround === true,
      `Ground check details: ${JSON.stringify(groundCheck)}`
    );

    // Test 2: Ground check with velocity
    this.resetPlayerToGround();
    this.player.velocity.y = 50; // Downward velocity
    const groundCheckWithVelocity = this.player.performEnhancedGroundCheck();
    this.addTestResult(
      "Ground Check With Velocity",
      groundCheckWithVelocity.additionalChecks.velocityCheck.isMovingDown ===
        true,
      `Velocity check: ${JSON.stringify(
        groundCheckWithVelocity.additionalChecks.velocityCheck
      )}`
    );

    // Test 3: Ground state validation in game loop
    if (this.game.validatePlayerGroundState) {
      this.resetPlayerToGround();
      const stateValidation = this.game.validatePlayerGroundState();
      this.addTestResult(
        "Game Loop Ground Validation",
        stateValidation.issues.length === 0,
        `Validation issues: ${stateValidation.issues.join(", ") || "None"}`
      );
    }
  }

  /**
   * Test jump input processing
   */
  async testJumpInputProcessing() {
    console.log("[TEST] Testing jump input processing...");

    // Test 1: Input handling with jump command
    this.resetPlayerToGround();
    const inputState = { jump: true, moveLeft: false, moveRight: false };

    // Capture console output
    const originalLog = console.log;
    let logMessages = [];
    console.log = (...args) => {
      logMessages.push(args.join(" "));
      originalLog.apply(console, args);
    };

    this.player.handleInput(inputState);

    // Restore console.log
    console.log = originalLog;

    const inputLogged = logMessages.some((msg) =>
      msg.includes("[INPUT] Jump input detected")
    );
    this.addTestResult(
      "Jump Input Logging",
      inputLogged,
      inputLogged
        ? "Jump input was logged correctly"
        : "Jump input logging failed"
    );

    // Test 2: Input processing timing
    this.resetPlayerToGround();
    const startTime = performance.now();
    this.player.handleInput({ jump: true });
    const processingTime = performance.now() - startTime;

    this.addTestResult(
      "Input Processing Performance",
      processingTime < 5, // Should process in less than 5ms
      `Processing time: ${processingTime.toFixed(2)}ms`
    );
  }

  /**
   * Test edge case handling
   */
  async testEdgeCaseHandling() {
    console.log("[TEST] Testing edge case handling...");

    const edgeCases = [
      {
        name: "Jump while dashing",
        setup: () => {
          this.resetPlayerToGround();
          this.player.isDashing = true;
          this.player.state = "dashing";
        },
        expectedResult: false,
      },
      {
        name: "Jump with negative jump power",
        setup: () => {
          this.resetPlayerToGround();
          this.player.jumpPower = -100;
        },
        expectedResult: false,
      },
      {
        name: "Jump with jump boost",
        setup: () => {
          this.resetPlayerToGround();
          this.player.jumpBoost = 1.5;
        },
        expectedResult: true,
      },
      {
        name: "Rapid consecutive jumps",
        setup: () => {
          this.resetPlayerToGround();
        },
        test: () => {
          const results = [];
          for (let i = 0; i < 5; i++) {
            this.resetPlayerToGround();
            results.push(this.player.jump());
          }
          return results.filter((r) => r).length >= 4; // At least 4 should succeed
        },
      },
    ];

    for (const edgeCase of edgeCases) {
      edgeCase.setup();

      let result;
      if (edgeCase.test) {
        result = edgeCase.test();
      } else {
        result = this.player.jump();
        result = result === edgeCase.expectedResult;
      }

      this.addTestResult(
        `Edge Case: ${edgeCase.name}`,
        result,
        result ? "Handled correctly" : "Failed to handle correctly"
      );
    }
  }

  /**
   * Test performance impact of enhancements
   */
  async testPerformanceImpact() {
    console.log("[TEST] Testing performance impact...");

    // Test 1: Jump execution performance
    this.resetPlayerToGround();
    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      this.resetPlayerToGround();
      this.player.jump();
    }

    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / iterations;

    this.addTestResult(
      "Jump Performance",
      averageTime < 1, // Should average less than 1ms per jump
      `Average execution time: ${averageTime.toFixed(3)}ms per jump`
    );

    // Test 2: Validation performance
    const validationStartTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      this.resetPlayerToGround();
      this.player.validateJumpConditions();
    }

    const validationTime = performance.now() - validationStartTime;
    const averageValidationTime = validationTime / iterations;

    this.addTestResult(
      "Validation Performance",
      averageValidationTime < 0.5, // Should average less than 0.5ms per validation
      `Average validation time: ${averageValidationTime.toFixed(
        3
      )}ms per validation`
    );
  }

  /**
   * Test logging functionality
   */
  async testLoggingFunctionality() {
    console.log("[TEST] Testing logging functionality...");

    // Capture console output
    const originalLog = console.log;
    const originalWarn = console.warn;
    let logMessages = [];
    let warnMessages = [];

    console.log = (...args) => {
      logMessages.push(args.join(" "));
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      warnMessages.push(args.join(" "));
      originalWarn.apply(console, args);
    };

    // Test successful jump logging
    this.resetPlayerToGround();
    this.player.jump();

    // Test failed jump logging
    this.player.isOnGround = false;
    this.player.jump();

    // Restore console functions
    console.log = originalLog;
    console.warn = originalWarn;

    const successLogFound = logMessages.some((msg) =>
      msg.includes("[JUMP] Jump executed successfully")
    );
    const failureLogFound = warnMessages.some((msg) =>
      msg.includes("[JUMP] Jump blocked")
    );

    this.addTestResult(
      "Success Jump Logging",
      successLogFound,
      successLogFound
        ? "Success logging works correctly"
        : "Success logging failed"
    );

    this.addTestResult(
      "Failed Jump Logging",
      failureLogFound,
      failureLogFound
        ? "Failure logging works correctly"
        : "Failure logging failed"
    );
  }

  /**
   * Helper method to reset player to ground state
   */
  resetPlayerToGround() {
    this.player.isOnGround = true;
    this.player.isBlocking = false;
    this.player.isDashing = false;
    this.player.state = "idle";
    this.player.velocity.y = 0;
    this.player.position.y = 300;
    this.player.jumpPower = 400;
    this.player.jumpBoost = 1.0;
  }

  /**
   * Add test result to collection
   */
  addTestResult(testName, passed, details) {
    this.testResults.push({
      name: testName,
      passed: passed,
      details: details,
      timestamp: performance.now(),
    });

    const status = passed ? "PASS" : "FAIL";
    console.log(`[TEST RESULT] ${testName}: ${status} - ${details}`);
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log("\n" + "=".repeat(60));
    console.log("JUMP RELIABILITY TEST REPORT");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Total Execution Time: ${totalTime.toFixed(2)}ms`);
    console.log("=".repeat(60));

    if (failedTests > 0) {
      console.log("\nFAILED TESTS:");
      this.testResults
        .filter((r) => !r.passed)
        .forEach((result) => {
          console.log(`- ${result.name}: ${result.details}`);
        });
    }

    console.log("\nDETAILED RESULTS:");
    this.testResults.forEach((result) => {
      const status = result.passed ? "✓" : "✗";
      console.log(`${status} ${result.name}: ${result.details}`);
    });

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      executionTime: totalTime,
      results: this.testResults,
    };
  }
}

// Export for use in test environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = JumpReliabilityTestSuite;
}
