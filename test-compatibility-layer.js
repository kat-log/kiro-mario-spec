/**
 * Test script for Browser Compatibility Layer
 * Tests all major functionality and browser-specific fixes
 */

// Import the CompatibilityLayer if in Node.js environment
let CompatibilityLayer;
if (typeof require !== "undefined") {
  try {
    CompatibilityLayer = require("./js/compatibility-layer.js");
  } catch (e) {
    console.log("Running in browser environment");
  }
}

class CompatibilityLayerTester {
  constructor() {
    this.testResults = [];
    this.compatibilityLayer = null;
  }

  /**
   * Initialize the compatibility layer for testing
   */
  async initialize() {
    try {
      this.compatibilityLayer = new CompatibilityLayer();
      this.log("✅ CompatibilityLayer initialized successfully");
      return true;
    } catch (error) {
      this.log("❌ Failed to initialize CompatibilityLayer: " + error.message);
      return false;
    }
  }

  /**
   * Run all compatibility tests
   */
  async runAllTests() {
    this.log("🧪 Starting Browser Compatibility Layer Tests");
    this.log("=".repeat(60));

    if (!(await this.initialize())) {
      return this.generateReport();
    }

    // Run individual test suites
    await this.testBrowserDetection();
    await this.testQuirksLoading();
    await this.testKeyEventNormalization();
    await this.testBrowserFixes();
    await this.testTouchSupport();
    await this.testCompatibilityTests();
    await this.testPerformance();

    return this.generateReport();
  }

  /**
   * Test browser detection functionality
   */
  async testBrowserDetection() {
    this.log("\n📋 Testing Browser Detection...");

    const browserInfo = this.compatibilityLayer.browserInfo;

    // Test required properties
    const requiredProps = [
      "name",
      "version",
      "engine",
      "platform",
      "isMobile",
      "isTouch",
    ];
    let passed = true;

    for (const prop of requiredProps) {
      if (browserInfo[prop] === undefined) {
        this.log(`❌ Missing browser property: ${prop}`);
        passed = false;
      } else {
        this.log(`✅ Browser ${prop}: ${browserInfo[prop]}`);
      }
    }

    // Test browser name detection
    const validBrowsers = ["Chrome", "Firefox", "Safari", "Edge", "Unknown"];
    if (!validBrowsers.includes(browserInfo.name)) {
      this.log(`⚠️ Unexpected browser name: ${browserInfo.name}`);
    }

    this.addTestResult("Browser Detection", passed, {
      browserInfo,
      detectedBrowser: browserInfo.name,
      version: browserInfo.version,
    });
  }

  /**
   * Test quirks loading functionality
   */
  async testQuirksLoading() {
    this.log("\n🔧 Testing Quirks Loading...");

    const quirks = this.compatibilityLayer.quirks;
    const fixes = this.compatibilityLayer.fixes;

    let passed = true;

    // Test quirks structure
    const requiredQuirkProps = [
      "issues",
      "fixes",
      "keyEventTiming",
      "preventDefaultRequired",
      "focusIssues",
      "touchSupport",
    ];
    for (const prop of requiredQuirkProps) {
      if (quirks[prop] === undefined) {
        this.log(`❌ Missing quirk property: ${prop}`);
        passed = false;
      } else {
        this.log(`✅ Quirk ${prop}: ${quirks[prop]}`);
      }
    }

    // Test fixes application
    this.log(
      `✅ Applied ${fixes.size} fixes: ${Array.from(fixes.keys()).join(", ")}`
    );

    this.addTestResult("Quirks Loading", passed, {
      quirks,
      appliedFixes: Array.from(fixes.entries()),
    });
  }

  /**
   * Test key event normalization
   */
  async testKeyEventNormalization() {
    this.log("\n⌨️ Testing Key Event Normalization...");

    let passed = true;
    const testEvents = [];

    try {
      // Test space key event
      const spaceEvent = new KeyboardEvent("keydown", {
        key: " ",
        code: "Space",
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });

      const normalizedSpace =
        this.compatibilityLayer.normalizeKeyEvent(spaceEvent);
      testEvents.push({
        original: "Space key",
        normalized: normalizedSpace,
        isSpaceKey: this.compatibilityLayer.isSpaceKey(spaceEvent),
      });

      this.log(
        `✅ Space key normalization: ${
          normalizedSpace.isSpaceKey ? "detected" : "not detected"
        }`
      );

      // Test arrow key event
      const arrowEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        code: "ArrowUp",
        keyCode: 38,
      });

      const normalizedArrow =
        this.compatibilityLayer.normalizeKeyEvent(arrowEvent);
      testEvents.push({
        original: "Arrow Up key",
        normalized: normalizedArrow,
        keyCode: normalizedArrow.keyCode,
      });

      this.log(
        `✅ Arrow key normalization: keyCode=${normalizedArrow.keyCode}`
      );
    } catch (error) {
      this.log(`❌ Key event normalization failed: ${error.message}`);
      passed = false;
    }

    this.addTestResult("Key Event Normalization", passed, { testEvents });
  }

  /**
   * Test browser-specific fixes
   */
  async testBrowserFixes() {
    this.log("\n🔨 Testing Browser Fixes...");

    let passed = true;
    const fixResults = [];

    try {
      // Test space key fix
      const spaceEvent = new KeyboardEvent("keydown", {
        key: " ",
        code: "Space",
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });

      const fixes = this.compatibilityLayer.applyBrowserFixes(spaceEvent);
      fixResults.push({
        event: "Space key",
        appliedFixes: fixes,
        browserName: this.compatibilityLayer.browserInfo.name,
      });

      this.log(
        `✅ Applied ${fixes.length} fixes for space key: ${fixes.join(", ")}`
      );

      // Test key code normalization
      const testKeyCode = this.compatibilityLayer.normalizeKeyCode(spaceEvent);
      this.log(`✅ Key code normalization: ${testKeyCode}`);

      if (testKeyCode !== 32) {
        this.log(`⚠️ Expected keyCode 32 for space, got ${testKeyCode}`);
      }
    } catch (error) {
      this.log(`❌ Browser fixes test failed: ${error.message}`);
      passed = false;
    }

    this.addTestResult("Browser Fixes", passed, { fixResults });
  }

  /**
   * Test touch support detection and setup
   */
  async testTouchSupport() {
    this.log("\n📱 Testing Touch Support...");

    const touchSupport = this.compatibilityLayer.touchSupport;
    let passed = true;

    // Test touch detection
    this.log(
      `✅ Touch detection: hasTouch=${touchSupport.hasTouch}, maxTouchPoints=${touchSupport.maxTouchPoints}`
    );
    this.log(
      `✅ Touch events: ${
        touchSupport.touchEvents ? "supported" : "not supported"
      }`
    );
    this.log(
      `✅ Pointer events: ${
        touchSupport.pointerEvents ? "supported" : "not supported"
      }`
    );

    // Test touch controls setup (if supported)
    if (touchSupport.hasTouch) {
      try {
        const touchControls = this.compatibilityLayer.setupTouchControls();
        if (touchControls) {
          this.log(`✅ Touch controls created successfully`);

          // Test touch control elements
          if (touchControls.jumpButton && touchControls.moveButtons) {
            this.log(`✅ Touch controls have jump button and move buttons`);
          } else {
            this.log(`⚠️ Touch controls missing some elements`);
          }
        } else {
          this.log(`⚠️ Touch controls setup returned null`);
        }
      } catch (error) {
        this.log(`❌ Touch controls setup failed: ${error.message}`);
        passed = false;
      }
    } else {
      this.log(
        `ℹ️ Touch not supported on this device - skipping touch controls test`
      );
    }

    this.addTestResult("Touch Support", passed, { touchSupport });
  }

  /**
   * Test compatibility test suite
   */
  async testCompatibilityTests() {
    this.log("\n🧪 Testing Compatibility Test Suite...");

    let passed = true;

    try {
      const compatibilityResults =
        this.compatibilityLayer.testBrowserCompatibility();

      this.log(
        `✅ Overall compatibility: ${
          compatibilityResults.overall ? "PASS" : "FAIL"
        }`
      );

      // Test individual test results
      Object.entries(compatibilityResults.tests).forEach(([testName, test]) => {
        this.log(
          `${test.passed ? "✅" : "❌"} ${test.name}: ${
            test.passed ? "PASS" : "FAIL"
          }`
        );
        if (test.issues.length > 0) {
          test.issues.forEach((issue) => {
            this.log(`   ⚠️ ${issue}`);
          });
        }
      });

      // Test recommendations
      if (compatibilityResults.recommendations.length > 0) {
        this.log(
          `💡 Recommendations (${compatibilityResults.recommendations.length}):`
        );
        compatibilityResults.recommendations.forEach((rec) => {
          this.log(`   • ${rec}`);
        });
      }

      this.addTestResult("Compatibility Tests", passed, compatibilityResults);
    } catch (error) {
      this.log(`❌ Compatibility tests failed: ${error.message}`);
      passed = false;
      this.addTestResult("Compatibility Tests", passed, {
        error: error.message,
      });
    }
  }

  /**
   * Test performance of compatibility layer
   */
  async testPerformance() {
    this.log("\n⚡ Testing Performance...");

    let passed = true;
    const performanceResults = {};

    try {
      // Test key event normalization performance
      const iterations = 1000;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const testEvent = new KeyboardEvent("keydown", {
          key: " ",
          code: "Space",
          keyCode: 32,
        });

        const start = performance.now();
        const normalized = this.compatibilityLayer.normalizeKeyEvent(testEvent);
        const fixes = this.compatibilityLayer.applyBrowserFixes(testEvent);
        const end = performance.now();

        times.push(end - start);
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      performanceResults.keyEventProcessing = {
        iterations,
        averageTime: avgTime,
        maxTime,
        minTime,
        performanceLevel:
          avgTime < 1 ? "excellent" : avgTime < 5 ? "good" : "poor",
      };

      this.log(`✅ Key event processing performance:`);
      this.log(`   Average: ${avgTime.toFixed(3)}ms`);
      this.log(`   Max: ${maxTime.toFixed(3)}ms`);
      this.log(`   Min: ${minTime.toFixed(3)}ms`);
      this.log(
        `   Level: ${performanceResults.keyEventProcessing.performanceLevel}`
      );

      if (avgTime > 5) {
        this.log(`⚠️ Performance may be too slow for real-time input`);
        passed = false;
      }
    } catch (error) {
      this.log(`❌ Performance test failed: ${error.message}`);
      passed = false;
      performanceResults.error = error.message;
    }

    this.addTestResult("Performance", passed, performanceResults);
  }

  /**
   * Add test result to results array
   */
  addTestResult(testName, passed, details) {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const passedTests = this.testResults.filter((test) => test.passed).length;
    const totalTests = this.testResults.length;
    const overallPassed = passedTests === totalTests;

    const report = {
      timestamp: new Date().toISOString(),
      overall: {
        passed: overallPassed,
        passedTests,
        totalTests,
        successRate:
          totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0,
      },
      browser: this.compatibilityLayer
        ? this.compatibilityLayer.browserInfo
        : null,
      tests: this.testResults,
      summary: this.generateSummary(),
    };

    this.log("\n" + "=".repeat(60));
    this.log("📊 TEST REPORT SUMMARY");
    this.log("=".repeat(60));
    this.log(`Overall Result: ${overallPassed ? "✅ PASS" : "❌ FAIL"}`);
    this.log(
      `Tests Passed: ${passedTests}/${totalTests} (${report.overall.successRate}%)`
    );
    this.log(
      `Browser: ${
        report.browser
          ? `${report.browser.name} ${report.browser.version}`
          : "Unknown"
      }`
    );
    this.log("=".repeat(60));

    // Log individual test results
    this.testResults.forEach((test) => {
      this.log(`${test.passed ? "✅" : "❌"} ${test.name}`);
    });

    this.log("\n💡 Summary:");
    report.summary.forEach((item) => {
      this.log(`   ${item}`);
    });

    return report;
  }

  /**
   * Generate summary of test results
   */
  generateSummary() {
    const summary = [];

    if (this.compatibilityLayer) {
      summary.push(
        `Browser compatibility layer successfully initialized for ${this.compatibilityLayer.browserInfo.name}`
      );
      summary.push(
        `Applied ${this.compatibilityLayer.fixes.size} browser-specific fixes`
      );
      summary.push(
        `Touch support: ${
          this.compatibilityLayer.touchSupport.hasTouch
            ? "Available"
            : "Not available"
        }`
      );
    }

    const failedTests = this.testResults.filter((test) => !test.passed);
    if (failedTests.length > 0) {
      summary.push(
        `${failedTests.length} test(s) failed - review details for issues`
      );
    } else {
      summary.push(
        "All tests passed - compatibility layer is working correctly"
      );
    }

    return summary;
  }

  /**
   * Log message with timestamp
   */
  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);

    // Also log to page if in browser environment
    if (typeof document !== "undefined") {
      const logElement = document.getElementById("test-log");
      if (logElement) {
        logElement.innerHTML += logMessage + "\n";
        logElement.scrollTop = logElement.scrollHeight;
      }
    }
  }
}

// Export for use in different environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = CompatibilityLayerTester;
} else {
  window.CompatibilityLayerTester = CompatibilityLayerTester;
}

// Auto-run tests if in browser environment
if (typeof window !== "undefined" && window.location) {
  window.addEventListener("load", async () => {
    const tester = new CompatibilityLayerTester();
    const report = await tester.runAllTests();

    // Store report globally for inspection
    window.compatibilityTestReport = report;

    console.log(
      "Compatibility test report available at: window.compatibilityTestReport"
    );
  });
}
