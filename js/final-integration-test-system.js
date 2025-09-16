/**
 * Final Integration Test System
 * Comprehensive end-to-end testing of all jump fixes
 */

class FinalIntegrationTestSystem {
  constructor() {
    this.testResults = {
      endToEndTests: [],
      scenarioTests: [],
      usabilityTests: [],
      performanceTests: [],
      comparisonTests: [],
    };

    this.testScenarios = [
      "basic-jump",
      "edge-jump",
      "rapid-jump",
      "multi-key-jump",
      "focus-recovery-jump",
      "browser-compatibility-jump",
      "performance-stress-jump",
    ];

    this.performanceBaseline = null;
    this.startTime = null;
    this.isRunning = false;
  }

  async runCompleteIntegrationTest() {
    console.log("🚀 Starting Final Integration Test Suite");
    this.startTime = performance.now();
    this.isRunning = true;

    try {
      // 1. End-to-end testing with all fixes integrated
      await this.runEndToEndTests();

      // 2. Various jump scenario verification
      await this.runScenarioTests();

      // 3. Usability testing and quality assurance
      await this.runUsabilityTests();

      // 4. Performance measurement and comparison
      await this.runPerformanceTests();

      // Generate comprehensive report
      const report = this.generateFinalReport();
      this.displayResults(report);

      return report;
    } catch (error) {
      console.error("❌ Integration test failed:", error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async runEndToEndTests() {
    console.log("📋 Running End-to-End Tests...");

    const tests = [
      {
        name: "Complete Jump Flow",
        test: () => this.testCompleteJumpFlow(),
      },
      {
        name: "Input to Action Pipeline",
        test: () => this.testInputToActionPipeline(),
      },
      {
        name: "Physics Integration",
        test: () => this.testPhysicsIntegration(),
      },
      {
        name: "State Management",
        test: () => this.testStateManagement(),
      },
      {
        name: "Error Recovery",
        test: () => this.testErrorRecovery(),
      },
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.endToEndTests.push({
          name: test.name,
          passed: result.success,
          details: result.details,
          timestamp: Date.now(),
        });
        console.log(`✅ ${test.name}: ${result.success ? "PASSED" : "FAILED"}`);
      } catch (error) {
        this.testResults.endToEndTests.push({
          name: test.name,
          passed: false,
          error: error.message,
          timestamp: Date.now(),
        });
        console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      }
    }
  }

  async runScenarioTests() {
    console.log("🎮 Running Scenario Tests...");

    for (const scenario of this.testScenarios) {
      try {
        const result = await this.testScenario(scenario);
        this.testResults.scenarioTests.push({
          scenario,
          passed: result.success,
          details: result.details,
          timestamp: Date.now(),
        });
        console.log(
          `✅ Scenario ${scenario}: ${result.success ? "PASSED" : "FAILED"}`
        );
      } catch (error) {
        this.testResults.scenarioTests.push({
          scenario,
          passed: false,
          error: error.message,
          timestamp: Date.now(),
        });
        console.log(`❌ Scenario ${scenario}: FAILED - ${error.message}`);
      }
    }
  }

  async runUsabilityTests() {
    console.log("👤 Running Usability Tests...");

    const usabilityTests = [
      {
        name: "Response Time",
        test: () => this.testResponseTime(),
      },
      {
        name: "Input Reliability",
        test: () => this.testInputReliability(),
      },
      {
        name: "User Experience Flow",
        test: () => this.testUserExperienceFlow(),
      },
      {
        name: "Accessibility",
        test: () => this.testAccessibility(),
      },
      {
        name: "Error Feedback",
        test: () => this.testErrorFeedback(),
      },
    ];

    for (const test of usabilityTests) {
      try {
        const result = await test.test();
        this.testResults.usabilityTests.push({
          name: test.name,
          passed: result.success,
          details: result.details,
          timestamp: Date.now(),
        });
        console.log(
          `✅ Usability ${test.name}: ${result.success ? "PASSED" : "FAILED"}`
        );
      } catch (error) {
        this.testResults.usabilityTests.push({
          name: test.name,
          passed: false,
          error: error.message,
          timestamp: Date.now(),
        });
        console.log(`❌ Usability ${test.name}: FAILED - ${error.message}`);
      }
    }
  }

  async runPerformanceTests() {
    console.log("⚡ Running Performance Tests...");

    const performanceTests = [
      {
        name: "Input Latency",
        test: () => this.measureInputLatency(),
      },
      {
        name: "Memory Usage",
        test: () => this.measureMemoryUsage(),
      },
      {
        name: "Frame Rate Impact",
        test: () => this.measureFrameRateImpact(),
      },
      {
        name: "CPU Usage",
        test: () => this.measureCPUUsage(),
      },
      {
        name: "Diagnostic Overhead",
        test: () => this.measureDiagnosticOverhead(),
      },
    ];

    for (const test of performanceTests) {
      try {
        const result = await test.test();
        this.testResults.performanceTests.push({
          name: test.name,
          passed: result.success,
          metrics: result.metrics,
          details: result.details,
          timestamp: Date.now(),
        });
        console.log(
          `✅ Performance ${test.name}: ${result.success ? "PASSED" : "FAILED"}`
        );
      } catch (error) {
        this.testResults.performanceTests.push({
          name: test.name,
          passed: false,
          error: error.message,
          timestamp: Date.now(),
        });
        console.log(`❌ Performance ${test.name}: FAILED - ${error.message}`);
      }
    }
  }

  // End-to-End Test Implementations
  async testCompleteJumpFlow() {
    const testSteps = [];
    let success = true;

    try {
      // Step 1: Simulate key press
      testSteps.push("Simulating space key press");
      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      await this.wait(50);

      // Step 2: Verify input detection
      testSteps.push("Verifying input detection");
      const inputDetected =
        window.gameEngine?.inputManager?.actions?.jump === true;
      if (!inputDetected) {
        success = false;
        testSteps.push("❌ Input not detected");
      }

      // Step 3: Verify player state
      testSteps.push("Verifying player state");
      const player = window.gameEngine?.player;
      if (!player) {
        success = false;
        testSteps.push("❌ Player not found");
      }

      // Step 4: Verify jump execution
      testSteps.push("Verifying jump execution");
      const jumpExecuted = player?.velocity?.y < 0;
      if (!jumpExecuted) {
        success = false;
        testSteps.push("❌ Jump not executed");
      }

      return {
        success,
        details: {
          steps: testSteps,
          playerState: player
            ? {
                position: { ...player.position },
                velocity: { ...player.velocity },
                isOnGround: player.isOnGround,
              }
            : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        details: {
          steps: testSteps,
          error: error.message,
        },
      };
    }
  }

  async testInputToActionPipeline() {
    const pipeline = [];
    let success = true;

    try {
      // Test input manager
      pipeline.push("Testing InputManager");
      const inputManager = window.gameEngine?.inputManager;
      if (!inputManager) {
        success = false;
        pipeline.push("❌ InputManager not found");
      }

      // Test action mapping
      pipeline.push("Testing action mapping");
      const hasJumpAction = inputManager?.keyBindings?.has(" ");
      if (!hasJumpAction) {
        success = false;
        pipeline.push("❌ Jump action not mapped");
      }

      // Test player input handling
      pipeline.push("Testing player input handling");
      const player = window.gameEngine?.player;
      const hasHandleInput = typeof player?.handleInput === "function";
      if (!hasHandleInput) {
        success = false;
        pipeline.push("❌ Player handleInput not found");
      }

      return {
        success,
        details: {
          pipeline,
          inputManager: !!inputManager,
          actionMapping: hasJumpAction,
          playerHandler: hasHandleInput,
        },
      };
    } catch (error) {
      return {
        success: false,
        details: {
          pipeline,
          error: error.message,
        },
      };
    }
  }

  async testPhysicsIntegration() {
    const checks = [];
    let success = true;

    try {
      // Test physics engine
      checks.push("Testing PhysicsEngine");
      const physicsEngine = window.gameEngine?.physicsEngine;
      if (!physicsEngine) {
        success = false;
        checks.push("❌ PhysicsEngine not found");
      }

      // Test enhanced collision resolution
      checks.push("Testing enhanced collision resolution");
      const hasEnhancedCollision =
        typeof physicsEngine?.resolveCollisionEnhanced === "function";
      if (!hasEnhancedCollision) {
        success = false;
        checks.push("❌ Enhanced collision resolution not found");
      }

      // Test ground detection
      checks.push("Testing ground detection");
      const player = window.gameEngine?.player;
      const hasEnhancedGroundCheck =
        typeof player?.enhancedGroundCheck === "function";
      if (!hasEnhancedGroundCheck) {
        success = false;
        checks.push("❌ Enhanced ground check not found");
      }

      return {
        success,
        details: {
          checks,
          physicsEngine: !!physicsEngine,
          enhancedCollision: hasEnhancedCollision,
          enhancedGroundCheck: hasEnhancedGroundCheck,
        },
      };
    } catch (error) {
      return {
        success: false,
        details: {
          checks,
          error: error.message,
        },
      };
    }
  }

  async testStateManagement() {
    const states = [];
    let success = true;

    try {
      const player = window.gameEngine?.player;
      if (!player) {
        return {
          success: false,
          details: { error: "Player not found" },
        };
      }

      // Test initial state
      states.push(`Initial isOnGround: ${player.isOnGround}`);

      // Test state transitions
      const originalState = player.isOnGround;

      // Simulate jump
      if (player.jump) {
        player.jump();
        states.push(`After jump isOnGround: ${player.isOnGround}`);

        // Should be false after jump
        if (player.isOnGround === true) {
          success = false;
          states.push("❌ State not updated after jump");
        }
      }

      return {
        success,
        details: {
          states,
          originalState,
          currentState: player.isOnGround,
        },
      };
    } catch (error) {
      return {
        success: false,
        details: {
          states,
          error: error.message,
        },
      };
    }
  }

  async testErrorRecovery() {
    const recovery = [];
    let success = true;

    try {
      // Test focus recovery
      recovery.push("Testing focus recovery");
      const focusManager = window.focusManager;
      if (focusManager && typeof focusManager.ensureFocus === "function") {
        focusManager.ensureFocus();
        recovery.push("✅ Focus recovery available");
      } else {
        recovery.push("⚠️ Focus recovery not available");
      }

      // Test diagnostic system
      recovery.push("Testing diagnostic system");
      const diagnosticSystem = window.jumpDiagnosticSystem;
      if (diagnosticSystem) {
        recovery.push("✅ Diagnostic system available");
      } else {
        recovery.push("⚠️ Diagnostic system not available");
      }

      // Test fallback input system
      recovery.push("Testing fallback input system");
      const fallbackSystem = window.fallbackInputSystem;
      if (fallbackSystem) {
        recovery.push("✅ Fallback input system available");
      } else {
        recovery.push("⚠️ Fallback input system not available");
      }

      return {
        success,
        details: {
          recovery,
          focusManager: !!focusManager,
          diagnosticSystem: !!diagnosticSystem,
          fallbackSystem: !!fallbackSystem,
        },
      };
    } catch (error) {
      return {
        success: false,
        details: {
          recovery,
          error: error.message,
        },
      };
    }
  }

  // Scenario Test Implementations
  async testScenario(scenario) {
    switch (scenario) {
      case "basic-jump":
        return await this.testBasicJump();
      case "edge-jump":
        return await this.testEdgeJump();
      case "rapid-jump":
        return await this.testRapidJump();
      case "multi-key-jump":
        return await this.testMultiKeyJump();
      case "focus-recovery-jump":
        return await this.testFocusRecoveryJump();
      case "browser-compatibility-jump":
        return await this.testBrowserCompatibilityJump();
      case "performance-stress-jump":
        return await this.testPerformanceStressJump();
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }

  async testBasicJump() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    const initialY = player.position.y;
    const initialVelocity = player.velocity.y;

    // Ensure player is on ground
    player.isOnGround = true;
    player.velocity.y = 0;

    // Simulate space key press
    const keyEvent = new KeyboardEvent("keydown", { code: "Space", key: " " });
    document.dispatchEvent(keyEvent);

    await this.wait(100);

    const jumped = player.velocity.y < 0;
    const leftGround = !player.isOnGround;

    return {
      success: jumped && leftGround,
      details: {
        initialY,
        initialVelocity,
        finalVelocity: player.velocity.y,
        jumped,
        leftGround,
      },
    };
  }

  async testEdgeJump() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    // Test jump at platform edge
    const results = [];

    // Test 1: Jump just before leaving platform
    player.isOnGround = true;
    player.lastGroundContact = performance.now();

    const keyEvent = new KeyboardEvent("keydown", { code: "Space", key: " " });
    document.dispatchEvent(keyEvent);

    await this.wait(50);

    const edgeJumpWorked = player.velocity.y < 0;
    results.push({ test: "edge-jump", success: edgeJumpWorked });

    // Test 2: Jump shortly after leaving platform (coyote time)
    player.isOnGround = false;
    player.lastGroundContact = performance.now() - 50; // 50ms ago
    player.velocity.y = 0;

    document.dispatchEvent(keyEvent);
    await this.wait(50);

    const coyoteJumpWorked = player.velocity.y < 0;
    results.push({ test: "coyote-jump", success: coyoteJumpWorked });

    const allPassed = results.every((r) => r.success);

    return {
      success: allPassed,
      details: { results },
    };
  }

  async testRapidJump() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    const jumpAttempts = [];
    const jumpCount = 10;

    for (let i = 0; i < jumpCount; i++) {
      // Reset player state
      player.isOnGround = true;
      player.velocity.y = 0;

      const startTime = performance.now();

      // Simulate rapid key press
      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      await this.wait(10); // Very short wait

      const endTime = performance.now();
      const jumped = player.velocity.y < 0;

      jumpAttempts.push({
        attempt: i + 1,
        jumped,
        responseTime: endTime - startTime,
      });
    }

    const successfulJumps = jumpAttempts.filter((a) => a.jumped).length;
    const successRate = successfulJumps / jumpCount;
    const avgResponseTime =
      jumpAttempts.reduce((sum, a) => sum + a.responseTime, 0) / jumpCount;

    return {
      success: successRate >= 0.8, // 80% success rate required
      details: {
        jumpAttempts,
        successfulJumps,
        successRate,
        avgResponseTime,
      },
    };
  }

  async testMultiKeyJump() {
    const jumpKeys = [
      { code: "Space", key: " " },
      { code: "ArrowUp", key: "ArrowUp" },
      { code: "KeyW", key: "w" },
      { code: "Enter", key: "Enter" },
    ];

    const results = [];
    const player = window.gameEngine?.player;

    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    for (const keyInfo of jumpKeys) {
      // Reset player state
      player.isOnGround = true;
      player.velocity.y = 0;

      const keyEvent = new KeyboardEvent("keydown", keyInfo);
      document.dispatchEvent(keyEvent);

      await this.wait(50);

      const jumped = player.velocity.y < 0;
      results.push({
        key: keyInfo.code,
        jumped,
      });
    }

    const allKeysWork = results.every((r) => r.jumped);

    return {
      success: allKeysWork,
      details: { results },
    };
  }

  async testFocusRecoveryJump() {
    const canvas = document.querySelector("canvas");
    const player = window.gameEngine?.player;

    if (!canvas || !player) {
      return {
        success: false,
        details: { error: "Canvas or player not found" },
      };
    }

    // Simulate focus loss
    canvas.blur();
    await this.wait(100);

    // Try to jump without focus
    player.isOnGround = true;
    player.velocity.y = 0;

    const keyEvent = new KeyboardEvent("keydown", { code: "Space", key: " " });
    document.dispatchEvent(keyEvent);

    await this.wait(100);

    const jumpedWithoutFocus = player.velocity.y < 0;

    // Test focus recovery
    if (window.focusManager) {
      window.focusManager.ensureFocus();
      await this.wait(100);
    }

    // Try to jump with focus restored
    player.isOnGround = true;
    player.velocity.y = 0;

    document.dispatchEvent(keyEvent);
    await this.wait(100);

    const jumpedWithFocus = player.velocity.y < 0;

    return {
      success: jumpedWithFocus, // Should work with focus
      details: {
        jumpedWithoutFocus,
        jumpedWithFocus,
        focusManagerAvailable: !!window.focusManager,
      },
    };
  }

  async testBrowserCompatibilityJump() {
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
    };

    const compatibilityTests = [];
    const player = window.gameEngine?.player;

    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    // Test different event properties
    const eventVariations = [
      { code: "Space", key: " ", keyCode: 32 },
      { code: "Space", key: " " }, // Without keyCode
      { key: " " }, // Only key property
      { keyCode: 32 }, // Only keyCode (legacy)
    ];

    for (const eventProps of eventVariations) {
      player.isOnGround = true;
      player.velocity.y = 0;

      const keyEvent = new KeyboardEvent("keydown", eventProps);
      document.dispatchEvent(keyEvent);

      await this.wait(50);

      const jumped = player.velocity.y < 0;
      compatibilityTests.push({
        eventProps,
        jumped,
      });
    }

    const compatibilityScore =
      compatibilityTests.filter((t) => t.jumped).length /
      compatibilityTests.length;

    return {
      success: compatibilityScore >= 0.5, // At least 50% compatibility
      details: {
        browserInfo,
        compatibilityTests,
        compatibilityScore,
      },
    };
  }

  async testPerformanceStressJump() {
    const stressTestDuration = 1000; // 1 second
    const startTime = performance.now();
    let jumpCount = 0;
    let successfulJumps = 0;
    const player = window.gameEngine?.player;

    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    while (performance.now() - startTime < stressTestDuration) {
      player.isOnGround = true;
      player.velocity.y = 0;

      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      jumpCount++;

      if (player.velocity.y < 0) {
        successfulJumps++;
      }

      await this.wait(10); // Small delay to prevent browser freeze
    }

    const endTime = performance.now();
    const actualDuration = endTime - startTime;
    const jumpsPerSecond = jumpCount / (actualDuration / 1000);
    const successRate = successfulJumps / jumpCount;

    return {
      success: successRate >= 0.7 && jumpsPerSecond >= 50, // 70% success rate and 50 jumps/sec
      details: {
        jumpCount,
        successfulJumps,
        successRate,
        jumpsPerSecond,
        actualDuration,
      },
    };
  }

  // Usability Test Implementations
  async testResponseTime() {
    const responseTimes = [];
    const testCount = 10;
    const player = window.gameEngine?.player;

    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    for (let i = 0; i < testCount; i++) {
      player.isOnGround = true;
      player.velocity.y = 0;

      const startTime = performance.now();

      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      // Wait for jump to execute
      await this.wait(1);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const jumped = player.velocity.y < 0;

      if (jumped) {
        responseTimes.push(responseTime);
      }

      await this.wait(50); // Reset delay
    }

    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const acceptable = avgResponseTime < 50 && maxResponseTime < 100; // 50ms avg, 100ms max

    return {
      success: acceptable,
      details: {
        responseTimes,
        avgResponseTime,
        maxResponseTime,
        testCount: responseTimes.length,
      },
    };
  }

  async testInputReliability() {
    const reliabilityTests = [];
    const testCount = 50;
    const player = window.gameEngine?.player;

    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    for (let i = 0; i < testCount; i++) {
      player.isOnGround = true;
      player.velocity.y = 0;

      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      await this.wait(50);

      const jumped = player.velocity.y < 0;
      reliabilityTests.push({ test: i + 1, jumped });
    }

    const successfulTests = reliabilityTests.filter((t) => t.jumped).length;
    const reliabilityScore = successfulTests / testCount;

    return {
      success: reliabilityScore >= 0.95, // 95% reliability required
      details: {
        reliabilityTests: reliabilityTests.slice(-10), // Last 10 tests
        successfulTests,
        reliabilityScore,
        totalTests: testCount,
      },
    };
  }

  async testUserExperienceFlow() {
    const flowTests = [];
    let success = true;

    // Test 1: Immediate feedback
    flowTests.push("Testing immediate feedback");
    const player = window.gameEngine?.player;
    if (player) {
      player.isOnGround = true;
      player.velocity.y = 0;

      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      // Check for immediate response
      const immediateResponse = player.velocity.y < 0;
      if (!immediateResponse) {
        success = false;
        flowTests.push("❌ No immediate feedback");
      } else {
        flowTests.push("✅ Immediate feedback working");
      }
    }

    // Test 2: Visual feedback
    flowTests.push("Testing visual feedback");
    const canvas = document.querySelector("canvas");
    if (canvas) {
      flowTests.push("✅ Canvas available for visual feedback");
    } else {
      flowTests.push("⚠️ No canvas for visual feedback");
    }

    // Test 3: Debug information availability
    flowTests.push("Testing debug information");
    const debugSystem = window.debugDisplaySystem;
    if (debugSystem) {
      flowTests.push("✅ Debug system available");
    } else {
      flowTests.push("⚠️ Debug system not available");
    }

    return {
      success,
      details: {
        flowTests,
        playerAvailable: !!player,
        canvasAvailable: !!canvas,
        debugAvailable: !!debugSystem,
      },
    };
  }

  async testAccessibility() {
    const accessibilityTests = [];
    let success = true;

    // Test keyboard navigation
    accessibilityTests.push("Testing keyboard accessibility");
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const isFocusable =
        canvas.tabIndex >= 0 || canvas.hasAttribute("tabindex");
      if (isFocusable) {
        accessibilityTests.push("✅ Canvas is focusable");
      } else {
        success = false;
        accessibilityTests.push("❌ Canvas not focusable");
      }
    }

    // Test alternative input methods
    accessibilityTests.push("Testing alternative inputs");
    const alternativeKeys = ["ArrowUp", "KeyW", "Enter"];
    const player = window.gameEngine?.player;

    if (player) {
      for (const keyCode of alternativeKeys) {
        player.isOnGround = true;
        player.velocity.y = 0;

        const keyEvent = new KeyboardEvent("keydown", { code: keyCode });
        document.dispatchEvent(keyEvent);

        await this.wait(50);

        const worked = player.velocity.y < 0;
        if (worked) {
          accessibilityTests.push(`✅ ${keyCode} works`);
        } else {
          accessibilityTests.push(`⚠️ ${keyCode} doesn't work`);
        }
      }
    }

    return {
      success,
      details: {
        accessibilityTests,
        canvasAccessible:
          canvas && (canvas.tabIndex >= 0 || canvas.hasAttribute("tabindex")),
        alternativeInputsAvailable: alternativeKeys.length > 0,
      },
    };
  }

  async testErrorFeedback() {
    const feedbackTests = [];
    let success = true;

    // Test console logging
    feedbackTests.push("Testing console feedback");
    const originalConsoleLog = console.log;
    let logCalled = false;

    console.log = (...args) => {
      logCalled = true;
      originalConsoleLog(...args);
    };

    const player = window.gameEngine?.player;
    if (player) {
      // Try to jump when not on ground
      player.isOnGround = false;
      player.velocity.y = 0;

      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      await this.wait(100);

      if (logCalled) {
        feedbackTests.push("✅ Console feedback working");
      } else {
        feedbackTests.push("⚠️ No console feedback");
      }
    }

    console.log = originalConsoleLog;

    // Test diagnostic system feedback
    feedbackTests.push("Testing diagnostic feedback");
    const diagnosticSystem = window.jumpDiagnosticSystem;
    if (
      diagnosticSystem &&
      typeof diagnosticSystem.recordJumpAttempt === "function"
    ) {
      feedbackTests.push("✅ Diagnostic feedback available");
    } else {
      feedbackTests.push("⚠️ Diagnostic feedback not available");
    }

    return {
      success,
      details: {
        feedbackTests,
        consoleFeedback: logCalled,
        diagnosticFeedback: !!diagnosticSystem,
      },
    };
  }

  // Performance Test Implementations
  async measureInputLatency() {
    const latencyMeasurements = [];
    const testCount = 20;
    const player = window.gameEngine?.player;

    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    for (let i = 0; i < testCount; i++) {
      player.isOnGround = true;
      player.velocity.y = 0;

      const startTime = performance.now();

      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);

      // Measure time until velocity changes
      let endTime = startTime;
      while (player.velocity.y >= 0 && performance.now() - startTime < 100) {
        await this.wait(1);
        endTime = performance.now();
      }

      if (player.velocity.y < 0) {
        latencyMeasurements.push(endTime - startTime);
      }

      await this.wait(50);
    }

    const avgLatency =
      latencyMeasurements.reduce((sum, lat) => sum + lat, 0) /
      latencyMeasurements.length;
    const maxLatency = Math.max(...latencyMeasurements);
    const acceptable = avgLatency < 20 && maxLatency < 50; // 20ms avg, 50ms max

    return {
      success: acceptable,
      metrics: {
        avgLatency,
        maxLatency,
        measurements: latencyMeasurements.length,
      },
      details: {
        latencyMeasurements: latencyMeasurements.slice(-5), // Last 5 measurements
        acceptable,
      },
    };
  }

  async measureMemoryUsage() {
    const memoryBefore = performance.memory
      ? performance.memory.usedJSHeapSize
      : 0;

    // Run intensive jump testing
    const player = window.gameEngine?.player;
    if (player) {
      for (let i = 0; i < 100; i++) {
        player.isOnGround = true;
        player.velocity.y = 0;

        const keyEvent = new KeyboardEvent("keydown", {
          code: "Space",
          key: " ",
        });
        document.dispatchEvent(keyEvent);

        await this.wait(10);
      }
    }

    const memoryAfter = performance.memory
      ? performance.memory.usedJSHeapSize
      : 0;
    const memoryIncrease = memoryAfter - memoryBefore;
    const acceptable = memoryIncrease < 1024 * 1024; // Less than 1MB increase

    return {
      success: acceptable,
      metrics: {
        memoryBefore,
        memoryAfter,
        memoryIncrease,
      },
      details: {
        acceptable,
        memoryAvailable: !!performance.memory,
      },
    };
  }

  async measureFrameRateImpact() {
    let frameCount = 0;
    const testDuration = 1000; // 1 second
    const startTime = performance.now();

    // Measure baseline FPS
    const measureFrames = () => {
      frameCount++;
      if (performance.now() - startTime < testDuration) {
        requestAnimationFrame(measureFrames);
      }
    };

    requestAnimationFrame(measureFrames);

    // Run jump tests during measurement
    const player = window.gameEngine?.player;
    if (player) {
      const jumpInterval = setInterval(() => {
        player.isOnGround = true;
        player.velocity.y = 0;

        const keyEvent = new KeyboardEvent("keydown", {
          code: "Space",
          key: " ",
        });
        document.dispatchEvent(keyEvent);
      }, 50);

      await this.wait(testDuration);
      clearInterval(jumpInterval);
    } else {
      await this.wait(testDuration);
    }

    const actualDuration = performance.now() - startTime;
    const fps = frameCount / (actualDuration / 1000);
    const acceptable = fps >= 30; // At least 30 FPS

    return {
      success: acceptable,
      metrics: {
        fps,
        frameCount,
        actualDuration,
      },
      details: {
        acceptable,
        targetFPS: 30,
      },
    };
  }

  async measureCPUUsage() {
    // Simplified CPU usage measurement
    const startTime = performance.now();
    let operationCount = 0;

    // Run CPU-intensive operations
    const endTime = startTime + 100; // 100ms test
    while (performance.now() < endTime) {
      // Simulate jump processing
      const player = window.gameEngine?.player;
      if (player) {
        player.isOnGround = true;
        const keyEvent = new KeyboardEvent("keydown", {
          code: "Space",
          key: " ",
        });
        document.dispatchEvent(keyEvent);
      }
      operationCount++;
    }

    const actualDuration = performance.now() - startTime;
    const operationsPerSecond = operationCount / (actualDuration / 1000);
    const acceptable = operationsPerSecond >= 1000; // At least 1000 ops/sec

    return {
      success: acceptable,
      metrics: {
        operationsPerSecond,
        operationCount,
        actualDuration,
      },
      details: {
        acceptable,
        targetOpsPerSec: 1000,
      },
    };
  }

  async measureDiagnosticOverhead() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, details: { error: "Player not found" } };
    }

    // Measure without diagnostics
    const diagnosticSystem = window.jumpDiagnosticSystem;
    const originalRecordMethod = diagnosticSystem?.recordJumpAttempt;

    if (diagnosticSystem) {
      diagnosticSystem.recordJumpAttempt = () => {}; // Disable
    }

    const startTimeWithoutDiag = performance.now();
    for (let i = 0; i < 100; i++) {
      player.isOnGround = true;
      player.velocity.y = 0;
      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);
      await this.wait(1);
    }
    const timeWithoutDiag = performance.now() - startTimeWithoutDiag;

    // Restore and measure with diagnostics
    if (diagnosticSystem && originalRecordMethod) {
      diagnosticSystem.recordJumpAttempt = originalRecordMethod;
    }

    const startTimeWithDiag = performance.now();
    for (let i = 0; i < 100; i++) {
      player.isOnGround = true;
      player.velocity.y = 0;
      const keyEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
      });
      document.dispatchEvent(keyEvent);
      await this.wait(1);
    }
    const timeWithDiag = performance.now() - startTimeWithDiag;

    const overhead = timeWithDiag - timeWithoutDiag;
    const overheadPercentage = (overhead / timeWithoutDiag) * 100;
    const acceptable = overheadPercentage < 20; // Less than 20% overhead

    return {
      success: acceptable,
      metrics: {
        timeWithoutDiag,
        timeWithDiag,
        overhead,
        overheadPercentage,
      },
      details: {
        acceptable,
        diagnosticSystemAvailable: !!diagnosticSystem,
      },
    };
  }

  generateFinalReport() {
    const totalTime = performance.now() - this.startTime;

    const endToEndPassed = this.testResults.endToEndTests.filter(
      (t) => t.passed
    ).length;
    const endToEndTotal = this.testResults.endToEndTests.length;

    const scenarioPassed = this.testResults.scenarioTests.filter(
      (t) => t.passed
    ).length;
    const scenarioTotal = this.testResults.scenarioTests.length;

    const usabilityPassed = this.testResults.usabilityTests.filter(
      (t) => t.passed
    ).length;
    const usabilityTotal = this.testResults.usabilityTests.length;

    const performancePassed = this.testResults.performanceTests.filter(
      (t) => t.passed
    ).length;
    const performanceTotal = this.testResults.performanceTests.length;

    const overallPassed =
      endToEndPassed + scenarioPassed + usabilityPassed + performancePassed;
    const overallTotal =
      endToEndTotal + scenarioTotal + usabilityTotal + performanceTotal;
    const overallScore =
      overallTotal > 0 ? (overallPassed / overallTotal) * 100 : 0;

    return {
      summary: {
        totalTime: Math.round(totalTime),
        overallScore: Math.round(overallScore),
        overallPassed,
        overallTotal,
        status: overallScore >= 80 ? "PASSED" : "FAILED",
      },
      categories: {
        endToEnd: {
          passed: endToEndPassed,
          total: endToEndTotal,
          score:
            endToEndTotal > 0
              ? Math.round((endToEndPassed / endToEndTotal) * 100)
              : 0,
        },
        scenarios: {
          passed: scenarioPassed,
          total: scenarioTotal,
          score:
            scenarioTotal > 0
              ? Math.round((scenarioPassed / scenarioTotal) * 100)
              : 0,
        },
        usability: {
          passed: usabilityPassed,
          total: usabilityTotal,
          score:
            usabilityTotal > 0
              ? Math.round((usabilityPassed / usabilityTotal) * 100)
              : 0,
        },
        performance: {
          passed: performancePassed,
          total: performanceTotal,
          score:
            performanceTotal > 0
              ? Math.round((performancePassed / performanceTotal) * 100)
              : 0,
        },
      },
      details: this.testResults,
      recommendations: this.generateRecommendations(),
    };
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze failed tests and generate recommendations
    const failedEndToEnd = this.testResults.endToEndTests.filter(
      (t) => !t.passed
    );
    if (failedEndToEnd.length > 0) {
      recommendations.push({
        category: "End-to-End",
        issue: `${failedEndToEnd.length} end-to-end tests failed`,
        recommendation: "Review core jump functionality and input pipeline",
      });
    }

    const failedScenarios = this.testResults.scenarioTests.filter(
      (t) => !t.passed
    );
    if (failedScenarios.length > 0) {
      recommendations.push({
        category: "Scenarios",
        issue: `${failedScenarios.length} scenario tests failed`,
        recommendation: "Check edge cases and special jump conditions",
      });
    }

    const failedUsability = this.testResults.usabilityTests.filter(
      (t) => !t.passed
    );
    if (failedUsability.length > 0) {
      recommendations.push({
        category: "Usability",
        issue: `${failedUsability.length} usability tests failed`,
        recommendation: "Improve user experience and accessibility features",
      });
    }

    const failedPerformance = this.testResults.performanceTests.filter(
      (t) => !t.passed
    );
    if (failedPerformance.length > 0) {
      recommendations.push({
        category: "Performance",
        issue: `${failedPerformance.length} performance tests failed`,
        recommendation: "Optimize jump processing and reduce overhead",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: "Overall",
        issue: "All tests passed",
        recommendation:
          "Jump functionality is working correctly. Consider monitoring in production.",
      });
    }

    return recommendations;
  }

  displayResults(report) {
    console.log("\n🎯 FINAL INTEGRATION TEST RESULTS");
    console.log("=====================================");
    console.log(
      `Overall Score: ${report.summary.overallScore}% (${report.summary.overallPassed}/${report.summary.overallTotal})`
    );
    console.log(`Status: ${report.summary.status}`);
    console.log(`Total Time: ${report.summary.totalTime}ms`);

    console.log("\n📊 Category Breakdown:");
    console.log(
      `End-to-End: ${report.categories.endToEnd.score}% (${report.categories.endToEnd.passed}/${report.categories.endToEnd.total})`
    );
    console.log(
      `Scenarios: ${report.categories.scenarios.score}% (${report.categories.scenarios.passed}/${report.categories.scenarios.total})`
    );
    console.log(
      `Usability: ${report.categories.usability.score}% (${report.categories.usability.passed}/${report.categories.usability.total})`
    );
    console.log(
      `Performance: ${report.categories.performance.score}% (${report.categories.performance.passed}/${report.categories.performance.total})`
    );

    console.log("\n💡 Recommendations:");
    report.recommendations.forEach((rec) => {
      console.log(`${rec.category}: ${rec.recommendation}`);
    });

    console.log("\n✅ Integration test complete!");
  }

  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FinalIntegrationTestSystem;
}

// Make available globally
window.FinalIntegrationTestSystem = FinalIntegrationTestSystem;
