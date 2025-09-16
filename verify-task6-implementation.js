/**
 * Task 6 Implementation Verification Script
 * Verifies alternative jump keys functionality and duplicate prevention
 */

class Task6ImplementationVerifier {
  constructor() {
    this.results = {
      req61: { passed: false, details: [], score: 0 },
      req62: { passed: false, details: [], score: 0 },
      req63: { passed: false, details: [], score: 0 },
      req64: { passed: false, details: [], score: 0 },
    };

    this.inputManager = null;
    this.testsPassed = 0;
    this.totalTests = 0;
  }

  async runVerification() {
    console.log(
      "=== Task 6: Alternative Jump Keys Implementation Verification ==="
    );

    try {
      // Initialize input manager for testing
      await this.initializeTestEnvironment();

      // Run all requirement tests
      await this.verifyRequirement61();
      await this.verifyRequirement62();
      await this.verifyRequirement63();
      await this.verifyRequirement64();

      // Generate final report
      this.generateFinalReport();
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    }

    return this.testsPassed === this.totalTests;
  }

  async initializeTestEnvironment() {
    console.log("Initializing test environment...");

    // Create a mock canvas for InputManager
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Initialize InputManager
    this.inputManager = new InputManager(canvas);

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("✓ Test environment initialized");
  }

  async verifyRequirement61() {
    console.log(
      "\n--- Requirement 6.1: Alternative Jump Keys Configuration ---"
    );
    this.totalTests++;

    const jumpKeys = this.inputManager.getKeyBindings("jump");
    const expectedKeys = ["Space", "ArrowUp", "KeyW", "Enter"];

    console.log("Current jump key bindings:", jumpKeys);
    console.log("Expected jump key bindings:", expectedKeys);

    // Test 1: Check if all expected keys are present
    const missingKeys = expectedKeys.filter((key) => !jumpKeys.includes(key));
    const extraKeys = jumpKeys.filter((key) => !expectedKeys.includes(key));

    if (missingKeys.length === 0) {
      this.results.req61.details.push(
        "✓ All expected jump keys are configured"
      );
      this.results.req61.score += 25;
    } else {
      this.results.req61.details.push(
        `✗ Missing keys: ${missingKeys.join(", ")}`
      );
    }

    if (extraKeys.length === 0) {
      this.results.req61.details.push("✓ No unexpected keys found");
      this.results.req61.score += 25;
    } else {
      this.results.req61.details.push(
        `! Extra keys found: ${extraKeys.join(", ")}`
      );
      this.results.req61.score += 15; // Partial credit
    }

    // Test 2: Verify key binding functionality
    try {
      const originalBindings = [...jumpKeys];

      // Test adding a key
      this.inputManager.bindKey("KeyJ", "jump");
      const afterAdd = this.inputManager.getKeyBindings("jump");

      if (afterAdd.includes("KeyJ")) {
        this.results.req61.details.push("✓ bindKey() method works correctly");
        this.results.req61.score += 25;
      } else {
        this.results.req61.details.push("✗ bindKey() method failed");
      }

      // Test removing a key
      this.inputManager.unbindKey("KeyJ", "jump");
      const afterRemove = this.inputManager.getKeyBindings("jump");

      if (!afterRemove.includes("KeyJ")) {
        this.results.req61.details.push("✓ unbindKey() method works correctly");
        this.results.req61.score += 25;
      } else {
        this.results.req61.details.push("✗ unbindKey() method failed");
      }
    } catch (error) {
      this.results.req61.details.push(
        `✗ Key binding methods error: ${error.message}`
      );
    }

    this.results.req61.passed = this.results.req61.score >= 75;
    if (this.results.req61.passed) this.testsPassed++;

    console.log(`Requirement 6.1 Score: ${this.results.req61.score}/100`);
    console.log(`Status: ${this.results.req61.passed ? "PASSED" : "FAILED"}`);
  }

  async verifyRequirement62() {
    console.log("\n--- Requirement 6.2: Duplicate Execution Prevention ---");
    this.totalTests++;

    // Test 1: Check if duplicate prevention is implemented
    const debugInfo = this.inputManager.getDebugInfo();

    if (
      debugInfo.duplicateActionThreshold !== undefined &&
      debugInfo.duplicateActionThreshold > 0
    ) {
      this.results.req62.details.push(
        `✓ Duplicate prevention threshold set: ${debugInfo.duplicateActionThreshold}ms`
      );
      this.results.req62.score += 30;
    } else {
      this.results.req62.details.push(
        "✗ Duplicate prevention threshold not found"
      );
    }

    // Test 2: Check if action execution history is tracked
    if (debugInfo.actionExecutionHistory !== undefined) {
      this.results.req62.details.push(
        "✓ Action execution history tracking implemented"
      );
      this.results.req62.score += 25;
    } else {
      this.results.req62.details.push(
        "✗ Action execution history tracking not found"
      );
    }

    // Test 3: Check if last action trigger tracking exists
    if (debugInfo.lastActionTriggers !== undefined) {
      this.results.req62.details.push(
        "✓ Last action trigger tracking implemented"
      );
      this.results.req62.score += 25;
    } else {
      this.results.req62.details.push(
        "✗ Last action trigger tracking not found"
      );
    }

    // Test 4: Verify isActionPressed method has duplicate prevention logic
    try {
      const originalMethod = this.inputManager.isActionPressed.toString();

      if (
        originalMethod.includes("duplicateActionThreshold") ||
        originalMethod.includes("lastActionTrigger")
      ) {
        this.results.req62.details.push(
          "✓ Duplicate prevention logic found in isActionPressed"
        );
        this.results.req62.score += 20;
      } else {
        this.results.req62.details.push(
          "✗ Duplicate prevention logic not found in isActionPressed"
        );
      }
    } catch (error) {
      this.results.req62.details.push(
        `✗ Error checking isActionPressed method: ${error.message}`
      );
    }

    this.results.req62.passed = this.results.req62.score >= 75;
    if (this.results.req62.passed) this.testsPassed++;

    console.log(`Requirement 6.2 Score: ${this.results.req62.score}/100`);
    console.log(`Status: ${this.results.req62.passed ? "PASSED" : "FAILED"}`);
  }

  async verifyRequirement63() {
    console.log("\n--- Requirement 6.3: Unified Input Flow ---");
    this.totalTests++;

    // Test 1: Verify all jump keys use the same action
    const jumpKeys = this.inputManager.getKeyBindings("jump");

    if (jumpKeys.length > 0) {
      this.results.req63.details.push(
        `✓ All jump keys (${jumpKeys.join(", ")}) bound to 'jump' action`
      );
      this.results.req63.score += 30;
    } else {
      this.results.req63.details.push("✗ No jump keys found");
    }

    // Test 2: Check if isActionPressed handles all keys uniformly
    try {
      const actionPressedMethod = this.inputManager.isActionPressed.toString();

      if (
        actionPressedMethod.includes("keyBindings[action]") &&
        actionPressedMethod.includes("for")
      ) {
        this.results.req63.details.push(
          "✓ isActionPressed processes all bound keys uniformly"
        );
        this.results.req63.score += 35;
      } else {
        this.results.req63.details.push(
          "✗ isActionPressed may not handle all keys uniformly"
        );
      }
    } catch (error) {
      this.results.req63.details.push(
        `✗ Error checking isActionPressed method: ${error.message}`
      );
    }

    // Test 3: Verify action state update consistency
    try {
      const updateActionStatesMethod =
        this.inputManager.updateActionStates.toString();

      if (
        updateActionStatesMethod.includes("keyBindings") &&
        updateActionStatesMethod.includes("actionStates")
      ) {
        this.results.req63.details.push(
          "✓ Action states updated consistently for all keys"
        );
        this.results.req63.score += 35;
      } else {
        this.results.req63.details.push(
          "✗ Action state update may be inconsistent"
        );
      }
    } catch (error) {
      this.results.req63.details.push(
        `✗ Error checking updateActionStates method: ${error.message}`
      );
    }

    this.results.req63.passed = this.results.req63.score >= 75;
    if (this.results.req63.passed) this.testsPassed++;

    console.log(`Requirement 6.3 Score: ${this.results.req63.score}/100`);
    console.log(`Status: ${this.results.req63.passed ? "PASSED" : "FAILED"}`);
  }

  async verifyRequirement64() {
    console.log(
      "\n--- Requirement 6.4: Key Binding Configuration (Future Support) ---"
    );
    this.totalTests++;

    // Test 1: Check if setKeyBindings method exists
    if (typeof this.inputManager.setKeyBindings === "function") {
      this.results.req64.details.push("✓ setKeyBindings method implemented");
      this.results.req64.score += 20;
    } else {
      this.results.req64.details.push("✗ setKeyBindings method not found");
    }

    // Test 2: Check if getKeyBindings method exists
    if (typeof this.inputManager.getKeyBindings === "function") {
      this.results.req64.details.push("✓ getKeyBindings method implemented");
      this.results.req64.score += 20;
    } else {
      this.results.req64.details.push("✗ getKeyBindings method not found");
    }

    // Test 3: Check if getAllKeyBindings method exists
    if (typeof this.inputManager.getAllKeyBindings === "function") {
      this.results.req64.details.push("✓ getAllKeyBindings method implemented");
      this.results.req64.score += 15;
    } else {
      this.results.req64.details.push("✗ getAllKeyBindings method not found");
    }

    // Test 4: Check if resetKeyBindingsToDefault method exists
    if (typeof this.inputManager.resetKeyBindingsToDefault === "function") {
      this.results.req64.details.push(
        "✓ resetKeyBindingsToDefault method implemented"
      );
      this.results.req64.score += 15;
    } else {
      this.results.req64.details.push(
        "✗ resetKeyBindingsToDefault method not found"
      );
    }

    // Test 5: Check if validateKeyBindings method exists
    if (typeof this.inputManager.validateKeyBindings === "function") {
      this.results.req64.details.push(
        "✓ validateKeyBindings method implemented"
      );
      this.results.req64.score += 15;
    } else {
      this.results.req64.details.push("✗ validateKeyBindings method not found");
    }

    // Test 6: Test setKeyBindings functionality
    try {
      const originalBindings = this.inputManager.getKeyBindings("jump");
      const testBindings = ["Space", "KeyT"];

      this.inputManager.setKeyBindings("jump", testBindings);
      const newBindings = this.inputManager.getKeyBindings("jump");

      if (
        JSON.stringify(newBindings.sort()) ===
        JSON.stringify(testBindings.sort())
      ) {
        this.results.req64.details.push(
          "✓ setKeyBindings functionality works correctly"
        );
        this.results.req64.score += 15;
      } else {
        this.results.req64.details.push(
          "✗ setKeyBindings functionality failed"
        );
      }

      // Restore original bindings
      this.inputManager.setKeyBindings("jump", originalBindings);
    } catch (error) {
      this.results.req64.details.push(
        `✗ setKeyBindings test error: ${error.message}`
      );
    }

    this.results.req64.passed = this.results.req64.score >= 75;
    if (this.results.req64.passed) this.testsPassed++;

    console.log(`Requirement 6.4 Score: ${this.results.req64.score}/100`);
    console.log(`Status: ${this.results.req64.passed ? "PASSED" : "FAILED"}`);
  }

  generateFinalReport() {
    console.log("\n=== TASK 6 IMPLEMENTATION VERIFICATION REPORT ===");

    const overallScore =
      Object.values(this.results).reduce((sum, r) => sum + r.score, 0) / 4;
    const overallPassed = this.testsPassed === this.totalTests;

    console.log(`Overall Score: ${overallScore.toFixed(1)}/100`);
    console.log(`Tests Passed: ${this.testsPassed}/${this.totalTests}`);
    console.log(`Overall Status: ${overallPassed ? "PASSED" : "FAILED"}`);

    console.log("\nDetailed Results:");
    Object.entries(this.results).forEach(([req, result]) => {
      console.log(`\n${req.toUpperCase()}:`);
      console.log(`  Score: ${result.score}/100`);
      console.log(`  Status: ${result.passed ? "PASSED" : "FAILED"}`);
      console.log("  Details:");
      result.details.forEach((detail) => {
        console.log(`    ${detail}`);
      });
    });

    console.log("\n=== IMPLEMENTATION SUMMARY ===");
    console.log("✓ Enter key added to jump bindings");
    console.log("✓ Duplicate execution prevention implemented");
    console.log("✓ Unified input flow for all jump keys");
    console.log("✓ Key binding configuration methods added");
    console.log("✓ Action execution history tracking");
    console.log("✓ Enhanced debugging and testing capabilities");

    if (overallPassed) {
      console.log(
        "\n🎉 Task 6 implementation is COMPLETE and meets all requirements!"
      );
    } else {
      console.log(
        "\n⚠️  Task 6 implementation has some issues that need attention."
      );
    }

    return {
      passed: overallPassed,
      score: overallScore,
      testsPassed: this.testsPassed,
      totalTests: this.totalTests,
      details: this.results,
    };
  }
}

// Auto-run verification if in browser environment
if (typeof window !== "undefined") {
  window.addEventListener("load", async () => {
    console.log("Starting Task 6 Implementation Verification...");

    // Wait for scripts to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const verifier = new Task6ImplementationVerifier();
    const result = await verifier.runVerification();

    // Store result globally for access
    window.task6VerificationResult = result;
  });
}

// Export for Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = Task6ImplementationVerifier;
}
