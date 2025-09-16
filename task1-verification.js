/**
 * Task 1 Verification Script
 * Verifies that all requirements for enhanced ground detection are implemented
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

try {
  const playerCode = fs.readFileSync(
    path.join(__dirname, "js", "player.js"),
    "utf8"
  );
  eval(playerCode);
} catch (error) {
  console.error("Failed to load Player class:", error.message);
  process.exit(1);
}

// Restore console.log
console.log = originalConsoleLog;

class Task1Verifier {
  constructor() {
    this.results = [];
  }

  verify() {
    console.log("🔍 Task 1: Enhanced Ground Detection Verification");
    console.log("================================================\n");

    this.verifyRequirement1();
    this.verifyRequirement2();
    this.verifyRequirement3();
    this.verifyRequirement4();

    this.printSummary();
  }

  addResult(requirement, description, passed, details = null) {
    this.results.push({
      requirement,
      description,
      passed,
      details,
    });

    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${requirement}: ${description}`);
    if (details && !passed) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  verifyRequirement1() {
    console.log(
      "📋 Requirement 1: Player クラスの enhancedGroundCheck() メソッドを実装\n"
    );

    try {
      const player = new Player(100, 100);

      // Check if method exists
      const methodExists = typeof player.enhancedGroundCheck === "function";
      this.addResult(
        "1.1",
        "enhancedGroundCheck() method exists",
        methodExists
      );

      if (methodExists) {
        // Check if method returns proper structure
        const result = player.enhancedGroundCheck();
        const hasCorrectStructure =
          typeof result === "object" &&
          result.hasOwnProperty("isOnGround") &&
          result.hasOwnProperty("confidence") &&
          result.hasOwnProperty("details") &&
          result.hasOwnProperty("timestamp") &&
          result.hasOwnProperty("diagnostics");

        this.addResult(
          "1.2",
          "Method returns correct structure",
          hasCorrectStructure,
          hasCorrectStructure ? null : { actualKeys: Object.keys(result) }
        );
      }
    } catch (error) {
      this.addResult(
        "1.1",
        "enhancedGroundCheck() method implementation",
        false,
        { error: error.message }
      );
    }

    console.log("");
  }

  verifyRequirement2() {
    console.log(
      "📋 Requirement 2: 複数の方法（物理判定、位置判定、速度判定）で地面状態を検証\n"
    );

    try {
      const player = new Player(100, 100);

      // Check individual detection methods
      const hasPositionMethod =
        typeof player.checkGroundByPosition === "function";
      const hasVelocityMethod =
        typeof player.checkGroundByVelocity === "function";

      this.addResult(
        "2.1",
        "checkGroundByPosition() method exists",
        hasPositionMethod
      );
      this.addResult(
        "2.2",
        "checkGroundByVelocity() method exists",
        hasVelocityMethod
      );

      if (hasPositionMethod && hasVelocityMethod) {
        // Test that methods return boolean values
        const positionResult = player.checkGroundByPosition();
        const velocityResult = player.checkGroundByVelocity();

        const positionReturnsBoolean = typeof positionResult === "boolean";
        const velocityReturnsBoolean = typeof velocityResult === "boolean";

        this.addResult(
          "2.3",
          "Position method returns boolean",
          positionReturnsBoolean
        );
        this.addResult(
          "2.4",
          "Velocity method returns boolean",
          velocityReturnsBoolean
        );

        // Test that enhanced method uses all detection methods
        const enhancedResult = player.enhancedGroundCheck();
        const usesAllMethods =
          enhancedResult.details &&
          enhancedResult.details.hasOwnProperty("physicsGroundCheck") &&
          enhancedResult.details.hasOwnProperty("positionGroundCheck") &&
          enhancedResult.details.hasOwnProperty("velocityGroundCheck");

        this.addResult(
          "2.5",
          "Enhanced method uses all detection methods",
          usesAllMethods
        );
      }
    } catch (error) {
      this.addResult(
        "2.1",
        "Multiple detection methods implementation",
        false,
        { error: error.message }
      );
    }

    console.log("");
  }

  verifyRequirement3() {
    console.log(
      "📋 Requirement 3: 地面接触の履歴を記録する lastGroundContact プロパティを追加\n"
    );

    try {
      const player = new Player(100, 100);

      // Check if property exists
      const hasProperty = player.hasOwnProperty("lastGroundContact");
      this.addResult("3.1", "lastGroundContact property exists", hasProperty);

      if (hasProperty) {
        // Check initial value
        const initialValue = player.lastGroundContact;
        const hasValidInitialValue = typeof initialValue === "number";
        this.addResult(
          "3.2",
          "Property has valid initial value",
          hasValidInitialValue
        );

        // Test that property gets updated during ground checks
        const beforeCheck = player.lastGroundContact;

        // Simulate ground contact
        player.isOnGround = true;
        player.enhancedGroundCheck();

        const afterCheck = player.lastGroundContact;
        const propertyUpdated = afterCheck > beforeCheck;

        this.addResult(
          "3.3",
          "Property updates during ground contact",
          propertyUpdated
        );

        // Test that property is included in player state
        const state = player.getState();
        const includedInState = state.hasOwnProperty("lastGroundContact");
        this.addResult(
          "3.4",
          "Property included in player state",
          includedInState
        );
      }
    } catch (error) {
      this.addResult(
        "3.1",
        "lastGroundContact property implementation",
        false,
        { error: error.message }
      );
    }

    console.log("");
  }

  verifyRequirement4() {
    console.log("📋 Requirement 4: 地面判定の信頼度を計算する機能を実装\n");

    try {
      const player = new Player(100, 100);

      // Check if confidence calculation method exists
      const hasConfidenceMethod =
        typeof player.calculateGroundConfidence === "function";
      this.addResult(
        "4.1",
        "calculateGroundConfidence() method exists",
        hasConfidenceMethod
      );

      if (hasConfidenceMethod) {
        // Test confidence calculation with different scenarios
        const testScenarios = [
          { physics: true, position: true, velocity: true },
          { physics: true, position: false, velocity: false },
          { physics: false, position: false, velocity: false },
        ];

        let allScenariosValid = true;
        const scenarioResults = [];

        testScenarios.forEach((scenario, index) => {
          const confidence = player.calculateGroundConfidence({
            physicsGroundCheck: scenario.physics,
            positionGroundCheck: scenario.position,
            velocityGroundCheck: scenario.velocity,
          });

          const isValidConfidence =
            typeof confidence === "number" &&
            confidence >= 0 &&
            confidence <= 1;

          if (!isValidConfidence) allScenariosValid = false;

          scenarioResults.push({
            scenario: index + 1,
            confidence,
            valid: isValidConfidence,
          });
        });

        this.addResult(
          "4.2",
          "Confidence calculation returns valid values (0-1)",
          allScenariosValid,
          allScenariosValid ? null : { scenarioResults }
        );

        // Test that enhanced ground check includes confidence
        const enhancedResult = player.enhancedGroundCheck();
        const includesConfidence =
          enhancedResult.hasOwnProperty("confidence") &&
          typeof enhancedResult.confidence === "number";

        this.addResult(
          "4.3",
          "Enhanced ground check includes confidence",
          includesConfidence
        );

        // Test history recording includes confidence
        const hasHistoryRecording =
          typeof player.recordGroundDetectionHistory === "function";
        this.addResult(
          "4.4",
          "Ground detection history recording method exists",
          hasHistoryRecording
        );

        if (hasHistoryRecording) {
          // Perform ground check to populate history
          player.enhancedGroundCheck();

          const hasHistory =
            Array.isArray(player.groundDetectionHistory) &&
            player.groundDetectionHistory.length > 0;

          const historyIncludesConfidence =
            hasHistory &&
            player.groundDetectionHistory[0].hasOwnProperty("confidence");

          this.addResult(
            "4.5",
            "History records include confidence values",
            historyIncludesConfidence
          );
        }
      }
    } catch (error) {
      this.addResult("4.1", "Confidence calculation implementation", false, {
        error: error.message,
      });
    }

    console.log("");
  }

  printSummary() {
    console.log("📊 Verification Summary");
    console.log("======================\n");

    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(
      `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`
    );

    if (failedTests > 0) {
      console.log("❌ Failed Tests:");
      this.results
        .filter((r) => !r.passed)
        .forEach((result) => {
          console.log(`   - ${result.requirement}: ${result.description}`);
        });
      console.log("");
    }

    if (passedTests === totalTests) {
      console.log("🎉 All requirements verified successfully!");
      console.log("✅ Task 1: Enhanced Ground Detection is COMPLETE");
    } else {
      console.log("⚠️  Some requirements not fully implemented.");
      console.log("❌ Task 1: Enhanced Ground Detection is INCOMPLETE");
    }
  }
}

// Run verification
const verifier = new Task1Verifier();
verifier.verify();
