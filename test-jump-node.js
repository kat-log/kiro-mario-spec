#!/usr/bin/env node

/**
 * Node.js test for enhanced jump functionality
 * This test can be run independently without a browser environment
 */

console.log("Testing enhanced jump functionality...");

// Mock the required classes for testing
class MockAudioManager {
  playSound(soundName, options = {}) {
    console.log(`[AUDIO] Playing sound: ${soundName}`, options);
  }
}

// Simplified Player class with enhanced jump functionality for testing
class TestPlayer {
  constructor(x = 100, y = 300, audioManager = null) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.size = { width: 32, height: 32 };
    this.audioManager = audioManager;

    this.health = 3;
    this.powerLevel = 1;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.coins = 0;
    this.score = 0;
    this.facing = "right";

    this.state = "idle";
    this.isOnGround = false;

    this.moveSpeed = 200;
    this.jumpPower = 400;
    this.dashSpeed = 350;
    this.dashDuration = 200;
    this.dashCooldown = 500;

    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.isBlocking = false;

    this.activePowerUps = new Map();
    this.speedBoost = 1.0;
    this.jumpBoost = 1.0;
    this.strengthBoost = 1.0;

    this.color = "#FF0000";
    this.invincibleFlashTimer = 0;

    // Callback for jump success
    this.onJumpSuccess = null;
  }

  /**
   * Enhanced jump method with detailed logging and validation
   */
  jump() {
    const timestamp = performance.now();

    // Detailed pre-jump validation with logging
    const jumpValidation = this.validateJumpConditions();

    console.log(`[JUMP] Jump attempt at ${timestamp.toFixed(2)}ms`, {
      canJump: jumpValidation.canJump,
      isOnGround: this.isOnGround,
      isBlocking: this.isBlocking,
      playerState: this.state,
      position: { ...this.position },
      velocity: { ...this.velocity },
      jumpPower: this.jumpPower,
      jumpBoost: this.jumpBoost,
      validation: jumpValidation,
    });

    // Early return with detailed reason if jump is not possible
    if (!jumpValidation.canJump) {
      console.warn(`[JUMP] Jump blocked: ${jumpValidation.reason}`, {
        isOnGround: this.isOnGround,
        isBlocking: this.isBlocking,
        state: this.state,
        groundCheckDetails: jumpValidation.groundCheckDetails,
      });
      return false;
    }

    // Store pre-jump state for verification
    const preJumpState = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      isOnGround: this.isOnGround,
    };

    // Execute jump
    const effectiveJumpPower = this.jumpPower * this.jumpBoost;
    this.velocity.y = -effectiveJumpPower;
    this.isOnGround = false;
    this.state = "jumping";

    // Post-jump verification
    const postJumpState = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      isOnGround: this.isOnGround,
    };

    console.log(`[JUMP] Jump executed successfully`, {
      preJumpState,
      postJumpState,
      effectiveJumpPower,
      velocityChange: this.velocity.y - preJumpState.velocity.y,
      executionTime: performance.now() - timestamp,
    });

    // Play jump sound effect
    if (this.audioManager) {
      this.audioManager.playSound("jump", { preventOverlap: true });
    }

    // Trigger jump success callback if available
    if (this.onJumpSuccess) {
      this.onJumpSuccess({
        timestamp,
        preJumpState,
        postJumpState,
        effectiveJumpPower,
      });
    }

    return true;
  }

  /**
   * Validate jump conditions with detailed analysis
   */
  validateJumpConditions() {
    const validation = {
      canJump: false,
      reason: "",
      groundCheckDetails: {},
      blockingFactors: [],
    };

    // Check ground state with enhanced validation
    const groundCheck = this.performEnhancedGroundCheck();
    validation.groundCheckDetails = groundCheck;

    if (!this.isOnGround) {
      validation.blockingFactors.push("not_on_ground");
      validation.reason = `Player is not on ground (isOnGround: ${this.isOnGround})`;
    }

    if (this.isBlocking) {
      validation.blockingFactors.push("is_blocking");
      validation.reason +=
        (validation.reason ? " and " : "") + "Player is blocking";
    }

    // Additional state checks
    if (this.state === "dashing") {
      validation.blockingFactors.push("is_dashing");
      validation.reason +=
        (validation.reason ? " and " : "") + "Player is dashing";
    }

    // Check if player has sufficient jump power
    const effectiveJumpPower = this.jumpPower * this.jumpBoost;
    if (effectiveJumpPower <= 0) {
      validation.blockingFactors.push("no_jump_power");
      validation.reason +=
        (validation.reason ? " and " : "") + "No jump power available";
    }

    // Determine if jump is possible
    validation.canJump = validation.blockingFactors.length === 0;

    if (validation.canJump) {
      validation.reason = "Jump conditions satisfied";
    }

    return validation;
  }

  /**
   * Perform enhanced ground detection check
   */
  performEnhancedGroundCheck() {
    const groundCheck = {
      isOnGround: this.isOnGround,
      verticalVelocity: this.velocity.y,
      position: { ...this.position },
      groundCheckMethod: "physics_engine_collision",
      additionalChecks: {},
    };

    // Additional ground validation checks
    groundCheck.additionalChecks.velocityCheck = {
      isMovingDown: this.velocity.y > 0,
      isStationary: Math.abs(this.velocity.y) < 0.1,
      velocityValue: this.velocity.y,
    };

    // Position-based ground check (fallback validation)
    groundCheck.additionalChecks.positionCheck = {
      nearBottomBound: false,
      estimatedGroundY: null,
    };

    return groundCheck;
  }

  /**
   * Handle input with enhanced logging
   */
  handleInput(inputState) {
    if (!inputState) return;

    // Handle jump input with enhanced logging
    if (inputState.jump) {
      const jumpInputTimestamp = performance.now();
      console.log(
        `[INPUT] Jump input detected at ${jumpInputTimestamp.toFixed(2)}ms`,
        {
          inputState: { ...inputState },
          playerState: {
            isOnGround: this.isOnGround,
            isBlocking: this.isBlocking,
            state: this.state,
            position: { ...this.position },
            velocity: { ...this.velocity },
          },
        }
      );

      const jumpResult = this.jump();

      console.log(`[INPUT] Jump input processed`, {
        jumpExecuted: jumpResult,
        processingTime: performance.now() - jumpInputTimestamp,
        resultingState: {
          state: this.state,
          velocity: { ...this.velocity },
          isOnGround: this.isOnGround,
        },
      });
    }
  }

  /**
   * Reset player to ground state for testing
   */
  resetToGround() {
    this.isOnGround = true;
    this.isBlocking = false;
    this.isDashing = false;
    this.state = "idle";
    this.velocity.y = 0;
    this.position.y = 300;
  }
}

// Test Suite
class JumpTestSuite {
  constructor() {
    this.testResults = [];
    this.audioManager = new MockAudioManager();
  }

  runTests() {
    console.log("\n" + "=".repeat(50));
    console.log("ENHANCED JUMP FUNCTIONALITY TEST SUITE");
    console.log("=".repeat(50));

    this.testBasicJumpFunctionality();
    this.testJumpValidation();
    this.testGroundDetection();
    this.testEdgeCases();
    this.testLogging();

    this.generateReport();
  }

  testBasicJumpFunctionality() {
    console.log("\n[TEST SUITE] Testing basic jump functionality...");

    const player = new TestPlayer(100, 300, this.audioManager);

    // Test 1: Normal jump
    player.resetToGround();
    const jumpResult = player.jump();
    this.addResult("Basic Jump Execution", jumpResult === true);

    // Test 2: Velocity change
    player.resetToGround();
    const initialVelocity = player.velocity.y;
    player.jump();
    this.addResult("Jump Velocity Change", player.velocity.y < initialVelocity);

    // Test 3: State change
    player.resetToGround();
    player.jump();
    this.addResult("Jump State Change", player.state === "jumping");

    // Test 4: Ground state change
    player.resetToGround();
    player.jump();
    this.addResult("Ground State Change", !player.isOnGround);
  }

  testJumpValidation() {
    console.log("\n[TEST SUITE] Testing jump validation...");

    const player = new TestPlayer(100, 300, this.audioManager);

    // Test 1: Valid conditions
    player.resetToGround();
    const validation1 = player.validateJumpConditions();
    this.addResult(
      "Validation - Valid Conditions",
      validation1.canJump === true
    );

    // Test 2: Not on ground
    player.isOnGround = false;
    const validation2 = player.validateJumpConditions();
    this.addResult("Validation - Not On Ground", validation2.canJump === false);

    // Test 3: While blocking
    player.resetToGround();
    player.isBlocking = true;
    const validation3 = player.validateJumpConditions();
    this.addResult(
      "Validation - While Blocking",
      validation3.canJump === false
    );

    // Test 4: Zero jump power
    player.resetToGround();
    player.jumpPower = 0;
    const validation4 = player.validateJumpConditions();
    this.addResult(
      "Validation - Zero Jump Power",
      validation4.canJump === false
    );
  }

  testGroundDetection() {
    console.log("\n[TEST SUITE] Testing ground detection...");

    const player = new TestPlayer(100, 300, this.audioManager);

    // Test 1: Ground check when on ground
    player.resetToGround();
    const groundCheck1 = player.performEnhancedGroundCheck();
    this.addResult(
      "Ground Check - On Ground",
      groundCheck1.isOnGround === true
    );

    // Test 2: Ground check when in air
    player.isOnGround = false;
    player.velocity.y = -100; // Moving up
    const groundCheck2 = player.performEnhancedGroundCheck();
    this.addResult("Ground Check - In Air", groundCheck2.isOnGround === false);

    // Test 3: Velocity check
    player.velocity.y = 50; // Moving down
    const groundCheck3 = player.performEnhancedGroundCheck();
    this.addResult(
      "Velocity Check - Moving Down",
      groundCheck3.additionalChecks.velocityCheck.isMovingDown === true
    );
  }

  testEdgeCases() {
    console.log("\n[TEST SUITE] Testing edge cases...");

    const player = new TestPlayer(100, 300, this.audioManager);

    // Test 1: Jump while dashing
    player.resetToGround();
    player.isDashing = true;
    player.state = "dashing";
    const dashJump = player.jump();
    this.addResult("Edge Case - Jump While Dashing", dashJump === false);

    // Test 2: Jump with boost
    player.resetToGround();
    player.jumpBoost = 1.5;
    const boostJump = player.jump();
    this.addResult("Edge Case - Jump With Boost", boostJump === true);

    // Test 3: Negative jump power
    player.resetToGround();
    player.jumpPower = -100;
    const negativeJump = player.jump();
    this.addResult("Edge Case - Negative Jump Power", negativeJump === false);
  }

  testLogging() {
    console.log("\n[TEST SUITE] Testing logging functionality...");

    const player = new TestPlayer(100, 300, this.audioManager);

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
    player.resetToGround();
    player.jump();

    // Test failed jump logging
    player.isOnGround = false;
    player.jump();

    // Restore console
    console.log = originalLog;
    console.warn = originalWarn;

    const successLog = logMessages.some((msg) =>
      msg.includes("[JUMP] Jump executed successfully")
    );
    const failureLog = warnMessages.some((msg) =>
      msg.includes("[JUMP] Jump blocked")
    );

    this.addResult("Logging - Success Messages", successLog);
    this.addResult("Logging - Failure Messages", failureLog);
  }

  addResult(testName, passed) {
    this.testResults.push({ name: testName, passed });
    const status = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`  ${status} ${testName}`);
  }

  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log("\n" + "=".repeat(50));
    console.log("TEST RESULTS SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);

    if (failedTests > 0) {
      console.log("\nFailed Tests:");
      this.testResults
        .filter((r) => !r.passed)
        .forEach((result) => console.log(`  - ${result.name}`));
    }

    console.log("=".repeat(50));

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
    };
  }
}

// Run the tests
const testSuite = new JumpTestSuite();
testSuite.runTests();

console.log("\nEnhanced jump functionality test completed!");
