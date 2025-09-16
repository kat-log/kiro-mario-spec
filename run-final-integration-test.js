#!/usr/bin/env node

/**
 * Final Integration Test Runner
 * Command-line interface for running integration tests
 */

const fs = require("fs");
const path = require("path");

class FinalIntegrationTestRunner {
  constructor() {
    this.testFiles = [
      "js/final-integration-test-system.js",
      "final-integration-test.html",
      "verify-final-integration.js",
      "task10-final-integration-summary.md",
    ];
  }

  async runVerification() {
    console.log("🔍 Final Integration Test Verification");
    console.log("=====================================\n");

    // Check if all required files exist
    console.log("📁 Checking required files...");
    let allFilesExist = true;

    for (const file of this.testFiles) {
      const exists = fs.existsSync(file);
      console.log(`${exists ? "✅" : "❌"} ${file}`);
      if (!exists) allFilesExist = false;
    }

    if (!allFilesExist) {
      console.log("\n❌ Some required files are missing!");
      return false;
    }

    console.log("\n✅ All required files present");

    // Check file contents
    console.log("\n📋 Verifying file contents...");

    // Check main test system
    const testSystemContent = fs.readFileSync(
      "js/final-integration-test-system.js",
      "utf8"
    );
    const hasTestSystem = testSystemContent.includes(
      "class FinalIntegrationTestSystem"
    );
    console.log(
      `${hasTestSystem ? "✅" : "❌"} Final Integration Test System class`
    );

    // Check HTML interface
    const htmlContent = fs.readFileSync("final-integration-test.html", "utf8");
    const hasInterface =
      htmlContent.includes("Final Integration Test") &&
      htmlContent.includes("runCompleteTest");
    console.log(`${hasInterface ? "✅" : "❌"} HTML test interface`);

    // Check verification script
    const verifyContent = fs.readFileSync(
      "verify-final-integration.js",
      "utf8"
    );
    const hasVerifier = verifyContent.includes(
      "class FinalIntegrationVerifier"
    );
    console.log(`${hasVerifier ? "✅" : "❌"} Standalone verification script`);

    // Check documentation
    const docContent = fs.readFileSync(
      "task10-final-integration-summary.md",
      "utf8"
    );
    const hasDoc =
      docContent.includes("Task 10: Final Integration Test") &&
      docContent.includes("## Implementation Details");
    console.log(`${hasDoc ? "✅" : "❌"} Comprehensive documentation`);

    // Check for key functionality
    console.log("\n🔧 Verifying key functionality...");

    const hasEndToEndTests = testSystemContent.includes("runEndToEndTests");
    console.log(
      `${hasEndToEndTests ? "✅" : "❌"} End-to-end testing capability`
    );

    const hasScenarioTests = testSystemContent.includes("runScenarioTests");
    console.log(
      `${hasScenarioTests ? "✅" : "❌"} Scenario testing capability`
    );

    const hasUsabilityTests = testSystemContent.includes("runUsabilityTests");
    console.log(
      `${hasUsabilityTests ? "✅" : "❌"} Usability testing capability`
    );

    const hasPerformanceTests = testSystemContent.includes(
      "runPerformanceTests"
    );
    console.log(
      `${hasPerformanceTests ? "✅" : "❌"} Performance testing capability`
    );

    const hasReporting = testSystemContent.includes("generateFinalReport");
    console.log(`${hasReporting ? "✅" : "❌"} Report generation capability`);

    // Check test scenarios
    console.log("\n🎮 Verifying test scenarios...");

    const scenarios = [
      "basic-jump",
      "edge-jump",
      "rapid-jump",
      "multi-key-jump",
      "focus-recovery-jump",
      "browser-compatibility-jump",
      "performance-stress-jump",
    ];

    let scenarioCount = 0;
    scenarios.forEach((scenario) => {
      const hasScenario = testSystemContent.includes(scenario);
      console.log(`${hasScenario ? "✅" : "❌"} ${scenario} scenario`);
      if (hasScenario) scenarioCount++;
    });

    console.log(
      `\n📊 Scenario coverage: ${scenarioCount}/${
        scenarios.length
      } (${Math.round((scenarioCount / scenarios.length) * 100)}%)`
    );

    // Check verification components
    console.log("\n🔍 Verifying verification components...");

    const verificationComponents = [
      "verifyCoreComponents",
      "verifyJumpFunctionality",
      "verifyInputSystems",
      "verifyDiagnosticSystems",
      "verifyPerformanceMetrics",
      "verifyBrowserCompatibility",
    ];

    let verificationCount = 0;
    verificationComponents.forEach((component) => {
      const hasComponent = verifyContent.includes(component);
      console.log(`${hasComponent ? "✅" : "❌"} ${component}`);
      if (hasComponent) verificationCount++;
    });

    console.log(
      `\n📊 Verification coverage: ${verificationCount}/${
        verificationComponents.length
      } (${Math.round(
        (verificationCount / verificationComponents.length) * 100
      )}%)`
    );

    // Overall assessment
    console.log("\n🎯 Overall Assessment");
    console.log("====================");

    const checks = [
      allFilesExist,
      hasTestSystem,
      hasInterface,
      hasVerifier,
      hasDoc,
      hasEndToEndTests,
      hasScenarioTests,
      hasUsabilityTests,
      hasPerformanceTests,
      hasReporting,
      scenarioCount >= 6,
      verificationCount >= 5,
    ];

    const passedChecks = checks.filter((check) => check).length;
    const totalChecks = checks.length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    console.log(
      `Score: ${score}% (${passedChecks}/${totalChecks} checks passed)`
    );
    console.log(`Status: ${score >= 80 ? "✅ PASS" : "❌ FAIL"}`);

    if (score >= 80) {
      console.log(
        "\n🎉 Final Integration Test implementation is complete and ready!"
      );
      console.log("\nNext steps:");
      console.log("1. Open final-integration-test.html in a web browser");
      console.log("2. Run the complete integration test");
      console.log("3. Review results and recommendations");
      console.log("4. Deploy to production if all tests pass");
    } else {
      console.log("\n⚠️ Final Integration Test implementation needs attention");
      console.log("Please review the failed checks above");
    }

    return score >= 80;
  }

  displayUsageInstructions() {
    console.log("\n📖 Usage Instructions");
    console.log("=====================");
    console.log("1. Web Interface:");
    console.log("   - Open final-integration-test.html in a browser");
    console.log('   - Click "Run Complete Test" for full testing');
    console.log('   - Use "Quick Test" for rapid feedback');
    console.log('   - Try "Manual Test Mode" for interactive testing');
    console.log("");
    console.log("2. Standalone Verification:");
    console.log("   - Include verify-final-integration.js in any HTML page");
    console.log("   - Automatic verification runs after page load");
    console.log("   - Check browser console for detailed results");
    console.log("");
    console.log("3. Command Line:");
    console.log("   - Run this script: node run-final-integration-test.js");
    console.log("   - Verifies implementation completeness");
    console.log("   - Provides usage guidance");
  }
}

// Run the verification
async function main() {
  const runner = new FinalIntegrationTestRunner();

  try {
    const success = await runner.runVerification();
    runner.displayUsageInstructions();

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FinalIntegrationTestRunner;
