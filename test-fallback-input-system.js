/**
 * Comprehensive Test Suite for Fallback Input System
 * Tests all requirements: 6.1, 6.2, 6.3, 6.4
 */

class FallbackInputSystemTest {
  constructor() {
    this.testResults = {
      requirement_6_1: { passed: false, details: [] }, // スペースキーが無効時の上矢印キー
      requirement_6_2: { passed: false, details: [] }, // キーボード使用不可時の画面上ボタン
      requirement_6_3: { passed: false, details: [] }, // タッチデバイスでのタップ操作
      requirement_6_4: { passed: false, details: [] }, // アクセシビリティ設定でのキーバインド変更
    };

    this.fallbackInputSystem = null;
    this.mockGameEngine = null;
  }

  /**
   * Initialize test environment
   */
  async init() {
    console.log("🧪 Initializing Fallback Input System Test Suite...");

    // Create mock canvas
    const mockCanvas = document.createElement("canvas");
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    document.body.appendChild(mockCanvas);

    // Create mock game engine
    this.mockGameEngine = {
      canvas: mockCanvas,
      inputManager: new InputManager(mockCanvas),
    };

    // Initialize fallback input system
    try {
      this.fallbackInputSystem = new FallbackInputSystem(this.mockGameEngine);
      console.log("✅ FallbackInputSystem initialized for testing");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize FallbackInputSystem:", error);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🚀 Starting comprehensive fallback input system tests...");

    if (!(await this.init())) {
      console.error("❌ Test initialization failed");
      return this.testResults;
    }

    // Test Requirement 6.1: 上矢印キーによるジャンプ機能
    await this.testRequirement6_1();

    // Test Requirement 6.2: 画面上のジャンプボタン
    await this.testRequirement6_2();

    // Test Requirement 6.3: タッチデバイス用のタップ操作
    await this.testRequirement6_3();

    // Test Requirement 6.4: アクセシビリティ設定
    await this.testRequirement6_4();

    // Generate final report
    this.generateTestReport();

    return this.testResults;
  }

  /**
   * Test Requirement 6.1: 上矢印キーによるジャンプ機能の確実な動作を検証
   */
  async testRequirement6_1() {
    console.log("📋 Testing Requirement 6.1: Up Arrow Key Jump Functionality");

    const details = [];
    let passed = true;

    try {
      // Test 1: Verify up arrow key is bound to jump
      const jumpKeys = this.mockGameEngine.inputManager.keyBindings.jump || [];
      const upArrowBound = jumpKeys.includes("ArrowUp");

      details.push(`Up arrow key bound to jump: ${upArrowBound ? "✅" : "❌"}`);
      if (!upArrowBound) passed = false;

      // Test 2: Simulate up arrow key press and verify jump action
      const originalActionState =
        this.mockGameEngine.inputManager.actionStates.get("jump");

      // Simulate keydown event
      const keyDownEvent = new KeyboardEvent("keydown", {
        code: "ArrowUp",
        key: "ArrowUp",
        bubbles: true,
      });

      document.dispatchEvent(keyDownEvent);
      this.mockGameEngine.inputManager.update();

      const jumpActionTriggered =
        this.mockGameEngine.inputManager.isActionPressed("jump");
      details.push(
        `Up arrow key triggers jump action: ${
          jumpActionTriggered ? "✅" : "❌"
        }`
      );
      if (!jumpActionTriggered) passed = false;

      // Test 3: Verify alternative key verification function
      const verificationResult = this.fallbackInputSystem.verifyUpArrowJump();
      details.push(
        `Up arrow verification function works: ${
          verificationResult.upArrowBound ? "✅" : "❌"
        }`
      );
      if (!verificationResult.upArrowBound) passed = false;

      // Test 4: Test other alternative jump keys
      const alternativeKeys = ["KeyW", "Enter"];
      for (const key of alternativeKeys) {
        const keyEvent = new KeyboardEvent("keydown", {
          code: key,
          key: key === "KeyW" ? "w" : "Enter",
          bubbles: true,
        });

        document.dispatchEvent(keyEvent);
        this.mockGameEngine.inputManager.update();

        const altKeyWorks =
          this.mockGameEngine.inputManager.isActionPressed("jump");
        details.push(
          `Alternative key ${key} triggers jump: ${altKeyWorks ? "✅" : "❌"}`
        );
        if (!altKeyWorks) passed = false;
      }
    } catch (error) {
      details.push(`❌ Error during testing: ${error.message}`);
      passed = false;
    }

    this.testResults.requirement_6_1 = { passed, details };
    console.log(`Requirement 6.1: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  }

  /**
   * Test Requirement 6.2: キーボードが使用できない場合の画面上ジャンプボタン
   */
  async testRequirement6_2() {
    console.log("📋 Testing Requirement 6.2: On-Screen Jump Button");

    const details = [];
    let passed = true;

    try {
      // Test 1: Check if on-screen controls are created
      const jumpButton = document.getElementById("fallback-jump-button");
      const jumpButtonExists = !!jumpButton;

      details.push(
        `On-screen jump button created: ${jumpButtonExists ? "✅" : "❌"}`
      );
      if (!jumpButtonExists) passed = false;

      if (jumpButtonExists) {
        // Test 2: Verify button properties
        const buttonVisible = jumpButton.style.display !== "none";
        const buttonClickable = jumpButton.style.pointerEvents !== "none";

        details.push(`Jump button visible: ${buttonVisible ? "✅" : "❌"}`);
        details.push(`Jump button clickable: ${buttonClickable ? "✅" : "❌"}`);

        if (!buttonVisible || !buttonClickable) passed = false;

        // Test 3: Test button functionality
        let jumpTriggered = false;
        const jumpHandler = (e) => {
          if (e.detail.pressed) jumpTriggered = true;
        };

        document.addEventListener("fallbackJump", jumpHandler);

        // Simulate button click
        const clickEvent = new MouseEvent("mousedown", { bubbles: true });
        jumpButton.dispatchEvent(clickEvent);

        // Wait a bit for event processing
        await new Promise((resolve) => setTimeout(resolve, 50));

        details.push(
          `Jump button triggers fallback jump: ${jumpTriggered ? "✅" : "❌"}`
        );
        if (!jumpTriggered) passed = false;

        document.removeEventListener("fallbackJump", jumpHandler);
      }

      // Test 4: Check movement buttons
      const leftButton =
        this.fallbackInputSystem.onScreenControls.moveButtons?.left;
      const rightButton =
        this.fallbackInputSystem.onScreenControls.moveButtons?.right;

      details.push(
        `Left movement button created: ${!!leftButton ? "✅" : "❌"}`
      );
      details.push(
        `Right movement button created: ${!!rightButton ? "✅" : "❌"}`
      );

      if (!leftButton || !rightButton) passed = false;

      // Test 5: Test toggle functionality
      const initialVisibility =
        this.fallbackInputSystem.settings.showOnScreenControls;
      const toggleResult = this.fallbackInputSystem.toggleOnScreenControls(
        !initialVisibility
      );

      details.push(
        `On-screen controls toggle works: ${
          toggleResult === !initialVisibility ? "✅" : "❌"
        }`
      );
      if (toggleResult !== !initialVisibility) passed = false;
    } catch (error) {
      details.push(`❌ Error during testing: ${error.message}`);
      passed = false;
    }

    this.testResults.requirement_6_2 = { passed, details };
    console.log(`Requirement 6.2: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  }

  /**
   * Test Requirement 6.3: タッチデバイス用のタップ操作でジャンプ実行
   */
  async testRequirement6_3() {
    console.log("📋 Testing Requirement 6.3: Touch Device Tap Controls");

    const details = [];
    let passed = true;

    try {
      // Test 1: Check touch support detection
      const touchSupported = this.fallbackInputSystem.touchSupported;
      details.push(`Touch support detected: ${touchSupported ? "✅" : "❌"}`);

      // Test 2: Test direct touch handler functionality
      let touchJumpTriggered = false;
      const touchJumpHandler = (e) => {
        if (e.detail.pressed) touchJumpTriggered = true;
      };

      document.addEventListener("fallbackJump", touchJumpHandler);

      // Simulate touch jump
      this.fallbackInputSystem.handleFallbackJump(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      details.push(
        `Direct touch jump handler works: ${touchJumpTriggered ? "✅" : "❌"}`
      );
      if (!touchJumpTriggered) passed = false;

      document.removeEventListener("fallbackJump", touchJumpHandler);

      // Test 3: Test touch movement handlers
      let touchMoveTriggered = false;
      const touchMoveHandler = (e) => {
        if (e.detail.direction === "left" && e.detail.pressed) {
          touchMoveTriggered = true;
        }
      };

      document.addEventListener("fallbackMove", touchMoveHandler);

      this.fallbackInputSystem.handleFallbackMove("left", true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      details.push(
        `Touch movement handler works: ${touchMoveTriggered ? "✅" : "❌"}`
      );
      if (!touchMoveTriggered) passed = false;

      document.removeEventListener("fallbackMove", touchMoveHandler);

      // Test 4: Test touch button integration with input manager
      const originalJumpState =
        this.mockGameEngine.inputManager.actionStates.get("jump");

      this.fallbackInputSystem.handleFallbackJump(true);
      const jumpStateAfterTouch =
        this.mockGameEngine.inputManager.actionStates.get("jump");

      details.push(
        `Touch input integrates with input manager: ${
          jumpStateAfterTouch ? "✅" : "❌"
        }`
      );
      if (!jumpStateAfterTouch) passed = false;

      // Test 5: Test haptic feedback (if available)
      const vibrationSupported = "vibrate" in navigator;
      details.push(
        `Haptic feedback support: ${
          vibrationSupported ? "✅" : "⚠️ Not available"
        }`
      );
    } catch (error) {
      details.push(`❌ Error during testing: ${error.message}`);
      passed = false;
    }

    this.testResults.requirement_6_3 = { passed, details };
    console.log(`Requirement 6.3: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  }

  /**
   * Test Requirement 6.4: アクセシビリティ設定でキーバインド変更
   */
  async testRequirement6_4() {
    console.log(
      "📋 Testing Requirement 6.4: Accessibility Key Binding Settings"
    );

    const details = [];
    let passed = true;

    try {
      // Test 1: Check if alternative keys are properly bound
      const alternativeKeys = this.fallbackInputSystem.alternativeKeys;
      const jumpAlternatives = alternativeKeys.jump || [];

      details.push(
        `Alternative jump keys defined: ${
          jumpAlternatives.length > 0 ? "✅" : "❌"
        }`
      );
      if (jumpAlternatives.length === 0) passed = false;

      // Test 2: Verify all alternative keys are bound to input manager
      for (const key of jumpAlternatives) {
        const isBound =
          this.mockGameEngine.inputManager.keyBindings.jump?.includes(key);
        details.push(`Alternative key ${key} bound: ${isBound ? "✅" : "❌"}`);
        if (!isBound) passed = false;
      }

      // Test 3: Test key binding modification functionality
      const testKey = "KeyT"; // Test key
      const originalBindings = [
        ...(this.mockGameEngine.inputManager.keyBindings.jump || []),
      ];

      // Add test key
      this.mockGameEngine.inputManager.bindKey(testKey, "jump");
      const keyAdded =
        this.mockGameEngine.inputManager.keyBindings.jump?.includes(testKey);

      details.push(`Dynamic key binding works: ${keyAdded ? "✅" : "❌"}`);
      if (!keyAdded) passed = false;

      // Remove test key
      this.mockGameEngine.inputManager.unbindKey(testKey, "jump");
      const keyRemoved =
        !this.mockGameEngine.inputManager.keyBindings.jump?.includes(testKey);

      details.push(`Dynamic key unbinding works: ${keyRemoved ? "✅" : "❌"}`);
      if (!keyRemoved) passed = false;

      // Test 4: Check accessibility help system
      const helpElement = document.getElementById("fallback-help-text");
      const helpSystemExists = !!helpElement;

      details.push(
        `Accessibility help system created: ${helpSystemExists ? "✅" : "❌"}`
      );
      if (!helpSystemExists) passed = false;

      // Test 5: Test help toggle functionality
      if (helpSystemExists) {
        const initialDisplay = helpElement.style.display;

        // Simulate H key press to toggle help
        const helpToggleEvent = new KeyboardEvent("keydown", {
          code: "KeyH",
          key: "h",
          bubbles: true,
        });

        document.dispatchEvent(helpToggleEvent);

        const displayAfterToggle = helpElement.style.display;
        const helpToggleWorks = initialDisplay !== displayAfterToggle;

        details.push(
          `Help toggle functionality works: ${helpToggleWorks ? "✅" : "❌"}`
        );
        if (!helpToggleWorks) passed = false;
      }

      // Test 6: Test settings persistence
      const settings = this.fallbackInputSystem.settings;
      const hasSettings = settings && typeof settings === "object";

      details.push(`Settings system exists: ${hasSettings ? "✅" : "❌"}`);
      if (!hasSettings) passed = false;

      if (hasSettings) {
        const settingsKeys = [
          "showOnScreenControls",
          "enableAlternativeKeys",
          "vibrationEnabled",
        ];
        for (const key of settingsKeys) {
          const hasSetting = key in settings;
          details.push(`Setting '${key}' exists: ${hasSetting ? "✅" : "❌"}`);
          if (!hasSetting) passed = false;
        }
      }
    } catch (error) {
      details.push(`❌ Error during testing: ${error.message}`);
      passed = false;
    }

    this.testResults.requirement_6_4 = { passed, details };
    console.log(`Requirement 6.4: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    console.log("\n📊 FALLBACK INPUT SYSTEM TEST REPORT");
    console.log("=====================================");

    let totalTests = 0;
    let passedTests = 0;

    for (const [requirement, result] of Object.entries(this.testResults)) {
      totalTests++;
      if (result.passed) passedTests++;

      console.log(
        `\n${requirement.toUpperCase()}: ${
          result.passed ? "✅ PASSED" : "❌ FAILED"
        }`
      );
      for (const detail of result.details) {
        console.log(`  ${detail}`);
      }
    }

    console.log(
      `\n📈 SUMMARY: ${passedTests}/${totalTests} requirements passed`
    );
    console.log(
      `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    if (passedTests === totalTests) {
      console.log(
        "🎉 ALL TESTS PASSED! Fallback Input System is fully functional."
      );
    } else {
      console.log("⚠️  Some tests failed. Please review the implementation.");
    }

    return {
      totalTests,
      passedTests,
      successRate: (passedTests / totalTests) * 100,
      allPassed: passedTests === totalTests,
    };
  }

  /**
   * Cleanup test environment
   */
  cleanup() {
    if (this.fallbackInputSystem) {
      this.fallbackInputSystem.destroy();
    }

    // Remove mock canvas
    const mockCanvas = this.mockGameEngine?.canvas;
    if (mockCanvas && mockCanvas.parentNode) {
      mockCanvas.parentNode.removeChild(mockCanvas);
    }

    console.log("🧹 Test environment cleaned up");
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FallbackInputSystemTest;
} else {
  window.FallbackInputSystemTest = FallbackInputSystemTest;
}

// Auto-run tests if this script is loaded directly
if (
  typeof window !== "undefined" &&
  window.location.pathname.includes("test")
) {
  window.addEventListener("load", async () => {
    const testSuite = new FallbackInputSystemTest();
    await testSuite.runAllTests();
  });
}
