/**
 * Node.js test for Enhanced Ground Detection
 * Tests the Player class ground detection functionality
 */

// Mock performance.now() for Node.js environment
if (typeof performance === "undefined") {
  global.performance = {
    now: () => Date.now(),
  };
}

// Mock console for cleaner test output
const originalConsoleLog = console.log;
console.log = () => {}; // Suppress Player class logs during testing

// Load the Player class
const fs = require("fs");
const path = require("path");
const playerCode = fs.readFileSync(
  path.join(__dirname, "js", "player.js"),
  "utf8"
);
eval(playerCode);

// Restore console.log
console.log = originalConsoleLog;

class GroundDetectionTester {
  constructor() {
    this.testResults = [];
  }

  addResult(testName, passed, message, data = null) {
    this.testResults.push({
      testName,
      passed,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  runAllTests() {
    console.log("🧪 Running Enhanced Ground Detection Tests...\n");

    this.testBasicStructure();
    this.testGroundCheckMethods();
    this.testConfidenceCalculation();
    this.testHistoryRecording();
    this.testDiagnostics();
    this.testStateIntegration();

    this.printResults();
  }

  testBasicStructure() {
    try {
      const player = new Player(100, 100);
      const groundCheck = player.enhancedGroundCheck();

      const hasRequiredProperties =
        typeof groundCheck === "object" &&
        groundCheck.hasOwnProperty("isOnGround") &&
        groundCheck.hasOwnProperty("confidence") &&
        groundCheck.hasOwnProperty("details") &&
        groundCheck.hasOwnProperty("timestamp") &&
        groundCheck.hasOwnProperty("diagnostics");

      this.addResult(
        "Basic Structure",
        hasRequiredProperties,
        hasRequiredProperties
          ? "Enhanced ground check returns proper structure"
          : "Missing required properties",
        { properties: Object.keys(groundCheck) }
      );
    } catch (error) {
      this.addResult("Basic Structure", false, `Error: ${error.message}`);
    }
  }

  testGroundCheckMethods() {
    try {
      const player = new Player(100, 100);

      // Test individual methods
      const positionCheck = player.checkGroundByPosition();
      const velocityCheck = player.checkGroundByVelocity();

      const methodsWork =
        typeof positionCheck === "boolean" &&
        typeof velocityCheck === "boolean";

      this.addResult(
        "Ground Check Methods",
        methodsWork,
        methodsWork
          ? "Individual ground check methods work"
          : "Ground check methods failed",
        { positionCheck, velocityCheck }
      );
    } catch (error) {
      this.addResult("Ground Check Methods", false, `Error: ${error.message}`);
    }
  }

  testConfidenceCalculation() {
    try {
      const player = new Player(100, 100);

      // Test confidence calculation with different scenarios
      const testCases = [
        { physics: true, position: true, velocity: true, expectedMin: 0.9 },
        { physics: true, position: false, velocity: false, expectedMax: 0.7 },
        { physics: false, position: false, velocity: false, expected: 0.0 },
      ];

      let allPassed = true;
      const results = [];

      testCases.forEach((testCase, index) => {
        const confidence = player.calculateGroundConfidence({
          physicsGroundCheck: testCase.physics,
          positionGroundCheck: testCase.position,
          velocityGroundCheck: testCase.velocity,
        });

        let testPassed = true;
        if (testCase.expected !== undefined) {
          testPassed = Math.abs(confidence - testCase.expected) < 0.01;
        } else if (testCase.expectedMin !== undefined) {
          testPassed = confidence >= testCase.expectedMin;
        } else if (testCase.expectedMax !== undefined) {
          testPassed = confidence <= testCase.expectedMax;
        }

        if (!testPassed) allPassed = false;

        results.push({
          case: index + 1,
          confidence,
          passed: testPassed,
        });
      });

      this.addResult(
        "Confidence Calculation",
        allPassed,
        allPassed
          ? "All confidence calculations passed"
          : "Some confidence calculations failed",
        { results }
      );
    } catch (error) {
      this.addResult(
        "Confidence Calculation",
        false,
        `Error: ${error.message}`
      );
    }
  }

  testHistoryRecording() {
    try {
      const player = new Player(100, 100);

      // Perform multiple ground checks
      for (let i = 0; i < 5; i++) {
        player.enhancedGroundCheck();
      }

      const historyLength = player.groundDetectionHistory.length;
      const historyRecorded = historyLength === 5;

      this.addResult(
        "History Recording",
        historyRecorded,
        historyRecorded
          ? `History recorded correctly (${historyLength} entries)`
          : `History recording failed (${historyLength} entries)`
      );

      // Test history limit
      for (let i = 0; i < 50; i++) {
        player.enhancedGroundCheck();
      }

      const limitedLength = player.groundDetectionHistory.length;
      const limitEnforced = limitedLength <= 50;

      this.addResult(
        "History Limit",
        limitEnforced,
        limitEnforced
          ? `History limit enforced (${limitedLength} entries)`
          : `History limit failed (${limitedLength} entries)`
      );
    } catch (error) {
      this.addResult("History Recording", false, `Error: ${error.message}`);
    }
  }

  testDiagnostics() {
    try {
      const player = new Player(100, 100);

      // Set up test data
      player.lastGroundContact = performance.now() - 1000;

      // Perform some ground checks
      for (let i = 0; i < 3; i++) {
        player.enhancedGroundCheck();
      }

      const diagnostics = player.getGroundDetectionDiagnostics();

      const diagnosticsValid =
        typeof diagnostics === "object" &&
        diagnostics.hasOwnProperty("lastGroundContact") &&
        diagnostics.hasOwnProperty("timeSinceLastContact") &&
        diagnostics.hasOwnProperty("historyLength") &&
        diagnostics.hasOwnProperty("averageConfidence");

      this.addResult(
        "Diagnostics",
        diagnosticsValid,
        diagnosticsValid
          ? "Diagnostics structure is correct"
          : "Diagnostics structure is invalid",
        { diagnosticsKeys: Object.keys(diagnostics) }
      );
    } catch (error) {
      this.addResult("Diagnostics", false, `Error: ${error.message}`);
    }
  }

  testStateIntegration() {
    try {
      const player = new Player(100, 100);

      // Perform a ground check to populate data
      player.enhancedGroundCheck();

      const state = player.getState();

      const stateIntegrated =
        state.hasOwnProperty("lastGroundContact") &&
        state.hasOwnProperty("groundDetectionHistory") &&
        state.hasOwnProperty("groundTolerance");

      this.addResult(
        "State Integration",
        stateIntegrated,
        stateIntegrated
          ? "Ground detection data included in player state"
          : "Ground detection data missing from player state"
      );
    } catch (error) {
      this.addResult("State Integration", false, `Error: ${error.message}`);
    }
  }

  printResults() {
    console.log("\n📊 Test Results Summary:");
    console.log("========================\n");

    let passed = 0;
    let total = this.testResults.length;

    this.testResults.forEach((result) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.testName}: ${result.message}`);
      if (result.passed) passed++;
    });

    console.log(
      `\n📈 Overall: ${passed}/${total} tests passed (${(
        (passed / total) *
        100
      ).toFixed(1)}%)`
    );

    if (passed === total) {
      console.log(
        "🎉 All tests passed! Enhanced ground detection is working correctly."
      );
    } else {
      console.log("⚠️  Some tests failed. Please review the implementation.");
    }
  }
}

// Run the tests
const tester = new GroundDetectionTester();
tester.runAllTests();
