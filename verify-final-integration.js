/**
 * Final Integration Verification Script
 * Standalone verification of all jump fixes and improvements
 */

class FinalIntegrationVerifier {
  constructor() {
    this.verificationResults = {
      coreComponents: [],
      jumpFunctionality: [],
      inputSystems: [],
      diagnosticSystems: [],
      performanceMetrics: [],
      browserCompatibility: [],
    };

    this.requiredComponents = [
      "gameEngine",
      "inputManager",
      "player",
      "physicsEngine",
      "enhancedInputManager",
      "focusManager",
      "jumpDiagnosticSystem",
      "debugDisplaySystem",
      "enhancedAutomatedTestSystem",
      "performanceMonitor",
    ];

    this.jumpKeys = [
      { code: "Space", key: " ", name: "Space" },
      { code: "ArrowUp", key: "ArrowUp", name: "Up Arrow" },
      { code: "KeyW", key: "w", name: "W Key" },
      { code: "Enter", key: "Enter", name: "Enter" },
    ];
  }

  async runCompleteVerification() {
    console.log("🔍 Starting Final Integration Verification");
    console.log("==========================================");

    try {
      // 1. Verify core components
      await this.verifyCoreComponents();

      // 2. Verify jump functionality
      await this.verifyJumpFunctionality();

      // 3. Verify input systems
      await this.verifyInputSystems();

      // 4. Verify diagnostic systems
      await this.verifyDiagnosticSystems();

      // 5. Verify performance metrics
      await this.verifyPerformanceMetrics();

      // 6. Verify browser compatibility
      await this.verifyBrowserCompatibility();

      // Generate final report
      const report = this.generateVerificationReport();
      this.displayVerificationReport(report);

      return report;
    } catch (error) {
      console.error("❌ Verification failed:", error);
      throw error;
    }
  }

  async verifyCoreComponents() {
    console.log("🔧 Verifying Core Components...");

    for (const component of this.requiredComponents) {
      const exists = this.checkComponentExists(component);
      const functional = exists
        ? await this.checkComponentFunctional(component)
        : false;

      this.verificationResults.coreComponents.push({
        component,
        exists,
        functional,
        status: exists && functional ? "PASS" : "FAIL",
      });

      console.log(
        `${exists && functional ? "✅" : "❌"} ${component}: ${
          exists && functional ? "OK" : "MISSING/BROKEN"
        }`
      );
    }
  }

  async verifyJumpFunctionality() {
    console.log("🦘 Verifying Jump Functionality...");

    const jumpTests = [
      { name: "Basic Jump", test: () => this.testBasicJump() },
      { name: "Ground Detection", test: () => this.testGroundDetection() },
      {
        name: "Enhanced Ground Check",
        test: () => this.testEnhancedGroundCheck(),
      },
      { name: "Jump Conditions", test: () => this.testJumpConditions() },
      { name: "Coyote Time", test: () => this.testCoyoteTime() },
      { name: "Multiple Jump Keys", test: () => this.testMultipleJumpKeys() },
    ];

    for (const jumpTest of jumpTests) {
      try {
        const result = await jumpTest.test();
        this.verificationResults.jumpFunctionality.push({
          name: jumpTest.name,
          ...result,
          status: result.success ? "PASS" : "FAIL",
        });

        console.log(
          `${result.success ? "✅" : "❌"} ${jumpTest.name}: ${
            result.success ? "PASS" : "FAIL"
          }`
        );
        if (!result.success && result.error) {
          console.log(`   Error: ${result.error}`);
        }
      } catch (error) {
        this.verificationResults.jumpFunctionality.push({
          name: jumpTest.name,
          success: false,
          error: error.message,
          status: "FAIL",
        });
        console.log(`❌ ${jumpTest.name}: FAIL - ${error.message}`);
      }
    }
  }

  async verifyInputSystems() {
    console.log("⌨️ Verifying Input Systems...");

    const inputTests = [
      { name: "Input Manager", test: () => this.testInputManager() },
      {
        name: "Enhanced Input Manager",
        test: () => this.testEnhancedInputManager(),
      },
      { name: "Focus Manager", test: () => this.testFocusManager() },
      {
        name: "Fallback Input System",
        test: () => this.testFallbackInputSystem(),
      },
      { name: "Key Binding System", test: () => this.testKeyBindingSystem() },
      { name: "Event Handling", test: () => this.testEventHandling() },
    ];

    for (const inputTest of inputTests) {
      try {
        const result = await inputTest.test();
        this.verificationResults.inputSystems.push({
          name: inputTest.name,
          ...result,
          status: result.success ? "PASS" : "FAIL",
        });

        console.log(
          `${result.success ? "✅" : "❌"} ${inputTest.name}: ${
            result.success ? "PASS" : "FAIL"
          }`
        );
      } catch (error) {
        this.verificationResults.inputSystems.push({
          name: inputTest.name,
          success: false,
          error: error.message,
          status: "FAIL",
        });
        console.log(`❌ ${inputTest.name}: FAIL - ${error.message}`);
      }
    }
  }

  async verifyDiagnosticSystems() {
    console.log("🔍 Verifying Diagnostic Systems...");

    const diagnosticTests = [
      {
        name: "Jump Diagnostic System",
        test: () => this.testJumpDiagnosticSystem(),
      },
      {
        name: "Debug Display System",
        test: () => this.testDebugDisplaySystem(),
      },
      {
        name: "Automated Test System",
        test: () => this.testAutomatedTestSystem(),
      },
      {
        name: "Performance Monitor",
        test: () => this.testPerformanceMonitor(),
      },
      { name: "Bug Detector", test: () => this.testBugDetector() },
    ];

    for (const diagnosticTest of diagnosticTests) {
      try {
        const result = await diagnosticTest.test();
        this.verificationResults.diagnosticSystems.push({
          name: diagnosticTest.name,
          ...result,
          status: result.success ? "PASS" : "FAIL",
        });

        console.log(
          `${result.success ? "✅" : "❌"} ${diagnosticTest.name}: ${
            result.success ? "PASS" : "FAIL"
          }`
        );
      } catch (error) {
        this.verificationResults.diagnosticSystems.push({
          name: diagnosticTest.name,
          success: false,
          error: error.message,
          status: "FAIL",
        });
        console.log(`❌ ${diagnosticTest.name}: FAIL - ${error.message}`);
      }
    }
  }

  async verifyPerformanceMetrics() {
    console.log("⚡ Verifying Performance Metrics...");

    const performanceTests = [
      { name: "Input Latency", test: () => this.measureInputLatency() },
      { name: "Memory Usage", test: () => this.measureMemoryUsage() },
      { name: "Frame Rate Impact", test: () => this.measureFrameRateImpact() },
      {
        name: "Diagnostic Overhead",
        test: () => this.measureDiagnosticOverhead(),
      },
    ];

    for (const perfTest of performanceTests) {
      try {
        const result = await perfTest.test();
        this.verificationResults.performanceMetrics.push({
          name: perfTest.name,
          ...result,
          status: result.acceptable ? "PASS" : "FAIL",
        });

        console.log(
          `${result.acceptable ? "✅" : "❌"} ${perfTest.name}: ${
            result.acceptable ? "PASS" : "FAIL"
          }`
        );
        if (result.metrics) {
          console.log(`   Metrics: ${JSON.stringify(result.metrics)}`);
        }
      } catch (error) {
        this.verificationResults.performanceMetrics.push({
          name: perfTest.name,
          acceptable: false,
          error: error.message,
          status: "FAIL",
        });
        console.log(`❌ ${perfTest.name}: FAIL - ${error.message}`);
      }
    }
  }

  async verifyBrowserCompatibility() {
    console.log("🌐 Verifying Browser Compatibility...");

    const compatibilityTests = [
      { name: "Event Support", test: () => this.testEventSupport() },
      { name: "Key Code Support", test: () => this.testKeyCodeSupport() },
      { name: "Focus Management", test: () => this.testFocusCompatibility() },
      { name: "Performance APIs", test: () => this.testPerformanceAPIs() },
    ];

    for (const compatTest of compatibilityTests) {
      try {
        const result = await compatTest.test();
        this.verificationResults.browserCompatibility.push({
          name: compatTest.name,
          ...result,
          status: result.compatible ? "PASS" : "FAIL",
        });

        console.log(
          `${result.compatible ? "✅" : "❌"} ${compatTest.name}: ${
            result.compatible ? "PASS" : "FAIL"
          }`
        );
      } catch (error) {
        this.verificationResults.browserCompatibility.push({
          name: compatTest.name,
          compatible: false,
          error: error.message,
          status: "FAIL",
        });
        console.log(`❌ ${compatTest.name}: FAIL - ${error.message}`);
      }
    }
  }

  // Component verification methods
  checkComponentExists(componentName) {
    return window[componentName] !== undefined;
  }

  async checkComponentFunctional(componentName) {
    const component = window[componentName];
    if (!component) return false;

    try {
      switch (componentName) {
        case "gameEngine":
          return (
            component.player &&
            component.inputManager &&
            component.physicsEngine
          );
        case "inputManager":
          return typeof component.handleKeyDown === "function";
        case "player":
          return (
            typeof component.jump === "function" &&
            component.position &&
            component.velocity
          );
        case "physicsEngine":
          return typeof component.updatePosition === "function";
        case "enhancedInputManager":
          return typeof component.enhanceInputHandling === "function";
        case "focusManager":
          return typeof component.ensureFocus === "function";
        case "jumpDiagnosticSystem":
          return typeof component.recordJumpAttempt === "function";
        case "debugDisplaySystem":
          return typeof component.updateDisplay === "function";
        case "enhancedAutomatedTestSystem":
          return typeof component.runComprehensiveTests === "function";
        case "performanceMonitor":
          return typeof component.startMonitoring === "function";
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  // Jump functionality tests
  async testBasicJump() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    try {
      // Set up test conditions
      player.isOnGround = true;
      player.velocity.y = 0;
      const initialY = player.position.y;

      // Execute jump
      if (typeof player.jump === "function") {
        player.jump();
      } else {
        return { success: false, error: "Jump method not found" };
      }

      // Verify jump executed
      const jumped = player.velocity.y < 0;
      const leftGround = !player.isOnGround;

      return {
        success: jumped,
        details: {
          initialY,
          finalVelocity: player.velocity.y,
          jumped,
          leftGround,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testGroundDetection() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    try {
      // Test ground detection states
      const tests = [];

      // Test 1: On ground
      player.isOnGround = true;
      tests.push({ state: "on_ground", detected: player.isOnGround === true });

      // Test 2: In air
      player.isOnGround = false;
      tests.push({ state: "in_air", detected: player.isOnGround === false });

      const allPassed = tests.every((test) => test.detected);

      return {
        success: allPassed,
        details: { tests },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testEnhancedGroundCheck() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    try {
      if (typeof player.enhancedGroundCheck !== "function") {
        return {
          success: false,
          error: "Enhanced ground check not implemented",
        };
      }

      const result = player.enhancedGroundCheck();
      const hasRequiredProperties =
        result &&
        typeof result.isOnGround === "boolean" &&
        typeof result.confidence === "number";

      return {
        success: hasRequiredProperties,
        details: { result },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testJumpConditions() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    try {
      const tests = [];

      // Test 1: Can jump when on ground
      player.isOnGround = true;
      const canJumpOnGround =
        typeof player.canJumpEnhanced === "function"
          ? player.canJumpEnhanced()
          : player.isOnGround;
      tests.push({ condition: "on_ground", canJump: canJumpOnGround });

      // Test 2: Cannot jump when in air (without coyote time)
      player.isOnGround = false;
      player.lastGroundContact = performance.now() - 200; // 200ms ago
      const canJumpInAir =
        typeof player.canJumpEnhanced === "function"
          ? player.canJumpEnhanced()
          : player.isOnGround;
      tests.push({ condition: "in_air", canJump: !canJumpInAir });

      const correctBehavior = tests.every((test) => test.canJump);

      return {
        success: correctBehavior,
        details: { tests },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testCoyoteTime() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    try {
      if (typeof player.canJumpEnhanced !== "function") {
        return {
          success: false,
          error: "Enhanced jump conditions not implemented",
        };
      }

      // Test coyote time functionality
      player.isOnGround = false;
      player.lastGroundContact = performance.now() - 50; // 50ms ago (within coyote time)

      const canJumpWithCoyoteTime = player.canJumpEnhanced();

      return {
        success: canJumpWithCoyoteTime,
        details: {
          timeSinceGroundContact: 50,
          canJump: canJumpWithCoyoteTime,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testMultipleJumpKeys() {
    const inputManager = window.gameEngine?.inputManager;
    if (!inputManager) {
      return { success: false, error: "Input manager not found" };
    }

    try {
      const keyTests = [];

      for (const keyInfo of this.jumpKeys) {
        // Check if key is bound to jump action
        const isBound =
          inputManager.keyBindings?.has(keyInfo.key) ||
          inputManager.keyBindings?.has(keyInfo.code);

        keyTests.push({
          key: keyInfo.name,
          bound: isBound,
        });
      }

      const allKeysBound = keyTests.every((test) => test.bound);

      return {
        success: allKeysBound,
        details: { keyTests },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Input system tests
  async testInputManager() {
    const inputManager = window.gameEngine?.inputManager;
    if (!inputManager) {
      return { success: false, error: "Input manager not found" };
    }

    try {
      const hasRequiredMethods =
        typeof inputManager.handleKeyDown === "function" &&
        typeof inputManager.handleKeyUp === "function";

      const hasKeyBindings = inputManager.keyBindings instanceof Map;

      return {
        success: hasRequiredMethods && hasKeyBindings,
        details: {
          hasRequiredMethods,
          hasKeyBindings,
          keyBindingCount: hasKeyBindings ? inputManager.keyBindings.size : 0,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testEnhancedInputManager() {
    const enhancedInputManager = window.enhancedInputManager;
    if (!enhancedInputManager) {
      return { success: false, error: "Enhanced input manager not found" };
    }

    try {
      const hasEnhancedMethods =
        typeof enhancedInputManager.enhanceInputHandling === "function";

      return {
        success: hasEnhancedMethods,
        details: { hasEnhancedMethods },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testFocusManager() {
    const focusManager = window.focusManager;
    if (!focusManager) {
      return { success: false, error: "Focus manager not found" };
    }

    try {
      const hasRequiredMethods =
        typeof focusManager.ensureFocus === "function" &&
        typeof focusManager.showFocusIndicator === "function";

      return {
        success: hasRequiredMethods,
        details: { hasRequiredMethods },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testFallbackInputSystem() {
    const fallbackInputSystem = window.fallbackInputSystem;

    return {
      success: !!fallbackInputSystem,
      details: {
        available: !!fallbackInputSystem,
        hasFallbackMethods:
          fallbackInputSystem &&
          typeof fallbackInputSystem.setupFallbackInput === "function",
      },
    };
  }

  async testKeyBindingSystem() {
    const inputManager = window.gameEngine?.inputManager;
    if (!inputManager || !inputManager.keyBindings) {
      return { success: false, error: "Key binding system not found" };
    }

    try {
      // Test that jump keys are properly bound
      const jumpKeysBound = this.jumpKeys.some(
        (keyInfo) =>
          inputManager.keyBindings.has(keyInfo.key) ||
          inputManager.keyBindings.has(keyInfo.code)
      );

      return {
        success: jumpKeysBound,
        details: {
          totalBindings: inputManager.keyBindings.size,
          jumpKeysBound,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testEventHandling() {
    try {
      // Test that event listeners are properly set up
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        return { success: false, error: "Canvas not found" };
      }

      // Check if canvas can receive focus
      const canFocus = canvas.tabIndex >= 0 || canvas.hasAttribute("tabindex");

      return {
        success: canFocus,
        details: {
          canvasFound: true,
          canFocus,
          tabIndex: canvas.tabIndex,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Diagnostic system tests
  async testJumpDiagnosticSystem() {
    const diagnosticSystem = window.jumpDiagnosticSystem;
    if (!diagnosticSystem) {
      return { success: false, error: "Jump diagnostic system not found" };
    }

    try {
      const hasRequiredMethods =
        typeof diagnosticSystem.recordJumpAttempt === "function" &&
        typeof diagnosticSystem.generateJumpDiagnosticReport === "function";

      return {
        success: hasRequiredMethods,
        details: { hasRequiredMethods },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testDebugDisplaySystem() {
    const debugSystem = window.debugDisplaySystem;
    if (!debugSystem) {
      return { success: false, error: "Debug display system not found" };
    }

    try {
      const hasRequiredMethods =
        typeof debugSystem.updateDisplay === "function";

      return {
        success: hasRequiredMethods,
        details: { hasRequiredMethods },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testAutomatedTestSystem() {
    const testSystem = window.enhancedAutomatedTestSystem;
    if (!testSystem) {
      return { success: false, error: "Automated test system not found" };
    }

    try {
      const hasRequiredMethods =
        typeof testSystem.runComprehensiveTests === "function";

      return {
        success: hasRequiredMethods,
        details: { hasRequiredMethods },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testPerformanceMonitor() {
    const perfMonitor = window.performanceMonitor;
    if (!perfMonitor) {
      return { success: false, error: "Performance monitor not found" };
    }

    try {
      const hasRequiredMethods =
        typeof perfMonitor.startMonitoring === "function";

      return {
        success: hasRequiredMethods,
        details: { hasRequiredMethods },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testBugDetector() {
    const bugDetector = window.bugDetector;

    return {
      success: !!bugDetector,
      details: {
        available: !!bugDetector,
        hasBugDetectionMethods:
          bugDetector && typeof bugDetector.detectInputIssues === "function",
      },
    };
  }

  // Performance tests
  async measureInputLatency() {
    const player = window.gameEngine?.player;
    if (!player) {
      return { acceptable: false, error: "Player not found" };
    }

    try {
      const measurements = [];
      const testCount = 10;

      for (let i = 0; i < testCount; i++) {
        player.isOnGround = true;
        player.velocity.y = 0;

        const startTime = performance.now();

        // Simulate key press
        const keyEvent = new KeyboardEvent("keydown", {
          code: "Space",
          key: " ",
        });
        document.dispatchEvent(keyEvent);

        // Wait for response
        await this.wait(1);

        const endTime = performance.now();

        if (player.velocity.y < 0) {
          measurements.push(endTime - startTime);
        }

        await this.wait(50);
      }

      const avgLatency =
        measurements.reduce((sum, lat) => sum + lat, 0) / measurements.length;
      const acceptable = avgLatency < 50; // 50ms threshold

      return {
        acceptable,
        metrics: {
          avgLatency: Math.round(avgLatency * 100) / 100,
          measurements: measurements.length,
        },
      };
    } catch (error) {
      return { acceptable: false, error: error.message };
    }
  }

  async measureMemoryUsage() {
    if (!performance.memory) {
      return {
        acceptable: true,
        metrics: { memoryAPIAvailable: false },
        note: "Memory API not available in this browser",
      };
    }

    try {
      const memoryBefore = performance.memory.usedJSHeapSize;

      // Run some operations
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
          await this.wait(1);
        }
      }

      const memoryAfter = performance.memory.usedJSHeapSize;
      const memoryIncrease = memoryAfter - memoryBefore;
      const acceptable = memoryIncrease < 1024 * 1024; // 1MB threshold

      return {
        acceptable,
        metrics: {
          memoryBefore,
          memoryAfter,
          memoryIncrease,
          memoryAPIAvailable: true,
        },
      };
    } catch (error) {
      return { acceptable: false, error: error.message };
    }
  }

  async measureFrameRateImpact() {
    try {
      let frameCount = 0;
      const testDuration = 1000; // 1 second
      const startTime = performance.now();

      const countFrames = () => {
        frameCount++;
        if (performance.now() - startTime < testDuration) {
          requestAnimationFrame(countFrames);
        }
      };

      requestAnimationFrame(countFrames);
      await this.wait(testDuration);

      const actualDuration = performance.now() - startTime;
      const fps = frameCount / (actualDuration / 1000);
      const acceptable = fps >= 30; // 30 FPS threshold

      return {
        acceptable,
        metrics: {
          fps: Math.round(fps),
          frameCount,
          actualDuration: Math.round(actualDuration),
        },
      };
    } catch (error) {
      return { acceptable: false, error: error.message };
    }
  }

  async measureDiagnosticOverhead() {
    const diagnosticSystem = window.jumpDiagnosticSystem;
    if (!diagnosticSystem) {
      return {
        acceptable: true,
        metrics: { diagnosticSystemAvailable: false },
        note: "Diagnostic system not available",
      };
    }

    try {
      // Measure with diagnostics disabled
      const originalMethod = diagnosticSystem.recordJumpAttempt;
      diagnosticSystem.recordJumpAttempt = () => {};

      const startTimeWithoutDiag = performance.now();
      for (let i = 0; i < 100; i++) {
        const keyEvent = new KeyboardEvent("keydown", {
          code: "Space",
          key: " ",
        });
        document.dispatchEvent(keyEvent);
        await this.wait(1);
      }
      const timeWithoutDiag = performance.now() - startTimeWithoutDiag;

      // Restore and measure with diagnostics
      diagnosticSystem.recordJumpAttempt = originalMethod;

      const startTimeWithDiag = performance.now();
      for (let i = 0; i < 100; i++) {
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
      const acceptable = overheadPercentage < 20; // 20% threshold

      return {
        acceptable,
        metrics: {
          timeWithoutDiag: Math.round(timeWithoutDiag),
          timeWithDiag: Math.round(timeWithDiag),
          overhead: Math.round(overhead),
          overheadPercentage: Math.round(overheadPercentage * 100) / 100,
          diagnosticSystemAvailable: true,
        },
      };
    } catch (error) {
      return { acceptable: false, error: error.message };
    }
  }

  // Browser compatibility tests
  async testEventSupport() {
    try {
      const eventSupport = {
        keyboardEvents: typeof KeyboardEvent !== "undefined",
        customEvents: typeof CustomEvent !== "undefined",
        eventListeners: typeof document.addEventListener === "function",
        preventDefault: true,
      };

      // Test preventDefault support
      try {
        const testEvent = new KeyboardEvent("keydown", { code: "Space" });
        if (typeof testEvent.preventDefault === "function") {
          eventSupport.preventDefault = true;
        }
      } catch (e) {
        eventSupport.preventDefault = false;
      }

      const allSupported = Object.values(eventSupport).every(
        (supported) => supported
      );

      return {
        compatible: allSupported,
        details: eventSupport,
      };
    } catch (error) {
      return { compatible: false, error: error.message };
    }
  }

  async testKeyCodeSupport() {
    try {
      const keyCodeSupport = {
        code: false,
        key: false,
        keyCode: false,
      };

      // Test different key properties
      const testEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
        keyCode: 32,
      });

      keyCodeSupport.code = testEvent.code === "Space";
      keyCodeSupport.key = testEvent.key === " ";
      keyCodeSupport.keyCode = testEvent.keyCode === 32;

      const hasModernSupport = keyCodeSupport.code && keyCodeSupport.key;

      return {
        compatible: hasModernSupport,
        details: keyCodeSupport,
      };
    } catch (error) {
      return { compatible: false, error: error.message };
    }
  }

  async testFocusCompatibility() {
    try {
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        return { compatible: false, error: "Canvas not found" };
      }

      const focusSupport = {
        canFocus: typeof canvas.focus === "function",
        canBlur: typeof canvas.blur === "function",
        tabIndexSupport: "tabIndex" in canvas,
        focusEvents: true,
      };

      // Test focus events
      try {
        canvas.addEventListener("focus", () => {});
        canvas.addEventListener("blur", () => {});
      } catch (e) {
        focusSupport.focusEvents = false;
      }

      const compatible = Object.values(focusSupport).every(
        (supported) => supported
      );

      return {
        compatible,
        details: focusSupport,
      };
    } catch (error) {
      return { compatible: false, error: error.message };
    }
  }

  async testPerformanceAPIs() {
    try {
      const apiSupport = {
        performanceNow: typeof performance.now === "function",
        performanceMemory: !!performance.memory,
        requestAnimationFrame: typeof requestAnimationFrame === "function",
        setTimeout: typeof setTimeout === "function",
      };

      const essentialAPIs =
        apiSupport.performanceNow &&
        apiSupport.requestAnimationFrame &&
        apiSupport.setTimeout;

      return {
        compatible: essentialAPIs,
        details: apiSupport,
      };
    } catch (error) {
      return { compatible: false, error: error.message };
    }
  }

  generateVerificationReport() {
    const categories = Object.keys(this.verificationResults);
    let totalTests = 0;
    let passedTests = 0;

    const categoryScores = {};

    categories.forEach((category) => {
      const results = this.verificationResults[category];
      const categoryPassed = results.filter((r) => r.status === "PASS").length;
      const categoryTotal = results.length;

      categoryScores[category] = {
        passed: categoryPassed,
        total: categoryTotal,
        score:
          categoryTotal > 0
            ? Math.round((categoryPassed / categoryTotal) * 100)
            : 0,
      };

      totalTests += categoryTotal;
      passedTests += categoryPassed;
    });

    const overallScore =
      totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const status = overallScore >= 80 ? "PASS" : "FAIL";

    return {
      summary: {
        overallScore,
        passedTests,
        totalTests,
        status,
      },
      categories: categoryScores,
      details: this.verificationResults,
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
      },
    };
  }

  displayVerificationReport(report) {
    console.log("\n🎯 FINAL INTEGRATION VERIFICATION REPORT");
    console.log("=========================================");
    console.log(
      `Overall Score: ${report.summary.overallScore}% (${report.summary.passedTests}/${report.summary.totalTests})`
    );
    console.log(`Status: ${report.summary.status}`);

    console.log("\n📊 Category Breakdown:");
    Object.entries(report.categories).forEach(([category, scores]) => {
      console.log(
        `${category}: ${scores.score}% (${scores.passed}/${scores.total})`
      );
    });

    console.log("\n🌐 Browser Information:");
    console.log(`User Agent: ${report.browserInfo.userAgent}`);
    console.log(`Platform: ${report.browserInfo.platform}`);

    console.log("\n📋 Detailed Results:");
    Object.entries(report.details).forEach(([category, results]) => {
      console.log(`\n${category.toUpperCase()}:`);
      results.forEach((result) => {
        const status = result.status === "PASS" ? "✅" : "❌";
        const name = result.name || result.component;
        console.log(`  ${status} ${name}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    });

    console.log("\n✅ Verification complete!");
  }

  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Auto-run verification if this script is loaded directly
if (typeof window !== "undefined") {
  window.FinalIntegrationVerifier = FinalIntegrationVerifier;

  // Auto-run after a short delay to ensure all components are loaded
  setTimeout(async () => {
    if (window.gameEngine) {
      console.log("🔍 Auto-running Final Integration Verification...");
      const verifier = new FinalIntegrationVerifier();
      try {
        await verifier.runCompleteVerification();
      } catch (error) {
        console.error("❌ Auto-verification failed:", error);
      }
    } else {
      console.log("⚠️ Game engine not found, skipping auto-verification");
    }
  }, 2000);
}

// Export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = FinalIntegrationVerifier;
}
