/**
 * Test Runner for Mario Style Platformer
 * Provides easy access to all testing and validation functions
 */

class TestRunner {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.testHistory = [];

    console.log("Test Runner initialized");
    console.log("Available commands:");
    console.log("  TestRunner.runAll() - Run all tests and validations");
    console.log(
      "  TestRunner.runIntegrationTests() - Run integration tests only"
    );
    console.log(
      "  TestRunner.runSystemValidation() - Run system validation only"
    );
    console.log(
      "  TestRunner.runPerformanceTests() - Run performance benchmarks"
    );
    console.log("  TestRunner.quickCheck() - Quick system health check");
    console.log("  TestRunner.showHelp() - Show all available commands");
  }

  /**
   * Run all tests and validations
   */
  async runAll() {
    console.log("🚀 Starting comprehensive test suite...");
    const startTime = performance.now();

    const results = {
      timestamp: new Date().toISOString(),
      integrationTests: null,
      systemValidation: null,
      performanceTests: null,
      healthCheck: null,
      browserCompatibility: null,
      bugDetection: null,
      totalDuration: 0,
    };

    try {
      // 1. Quick health check first
      console.log("1️⃣ Running health check...");
      results.healthCheck = this.gameEngine.quickHealthCheck();

      // 2. Browser compatibility check
      console.log("2️⃣ Running browser compatibility check...");
      results.browserCompatibility =
        await this.gameEngine.runBrowserCompatibilityCheck();

      // 3. System validation
      console.log("3️⃣ Running system validation...");
      results.systemValidation = await this.gameEngine.runSystemValidation();

      // 4. Integration tests
      console.log("4️⃣ Running integration tests...");
      results.integrationTests = await this.gameEngine.runIntegrationTests();

      // 5. Bug detection
      console.log("5️⃣ Running bug detection...");
      results.bugDetection = await this.gameEngine.runBugDetection();

      // 6. Performance tests
      console.log("6️⃣ Running performance tests...");
      results.performanceTests = this.gameEngine.getPerformanceMetrics();

      const endTime = performance.now();
      results.totalDuration = Math.round(endTime - startTime);

      // Generate summary report
      this.generateSummaryReport(results);

      // Store in history
      this.testHistory.push(results);

      return results;
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      return { error: error.message, results };
    }
  }

  /**
   * Run integration tests only
   */
  async runIntegrationTests() {
    console.log("🔧 Running integration tests...");

    try {
      const results = await this.gameEngine.runIntegrationTests();
      console.log("✅ Integration tests completed");
      return results;
    } catch (error) {
      console.error("❌ Integration tests failed:", error);
      return { error: error.message };
    }
  }

  /**
   * Run system validation only
   */
  async runSystemValidation() {
    console.log("🔍 Running system validation...");

    try {
      const results = await this.gameEngine.runSystemValidation();
      console.log("✅ System validation completed");
      return results;
    } catch (error) {
      console.error("❌ System validation failed:", error);
      return { error: error.message };
    }
  }

  /**
   * Run performance tests only
   */
  async runPerformanceTests() {
    console.log("⚡ Running performance tests...");

    try {
      const metrics = this.gameEngine.getPerformanceMetrics();
      const report = this.gameEngine.generatePerformanceReport();

      console.log("✅ Performance tests completed");
      return { metrics, report };
    } catch (error) {
      console.error("❌ Performance tests failed:", error);
      return { error: error.message };
    }
  }

  /**
   * Quick system health check
   */
  quickCheck() {
    console.log("🏥 Running quick health check...");

    try {
      const health = this.gameEngine.quickHealthCheck();

      if (health.healthy) {
        console.log("✅ System is healthy");
      } else {
        console.warn("⚠️ System health issues detected:");
        health.issues.forEach((issue) => console.warn(`  - ${issue}`));
      }

      return health;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Generate comprehensive summary report
   */
  generateSummaryReport(results) {
    console.log("\n" + "=".repeat(80));
    console.log("🎮 MARIO PLATFORMER - COMPREHENSIVE TEST REPORT");
    console.log("=".repeat(80));
    console.log(`📅 Timestamp: ${results.timestamp}`);
    console.log(`⏱️ Total Duration: ${results.totalDuration}ms`);
    console.log("=".repeat(80));

    // Health Check Summary
    if (results.healthCheck) {
      const healthIcon = results.healthCheck.healthy ? "✅" : "❌";
      console.log(
        `${healthIcon} SYSTEM HEALTH: ${
          results.healthCheck.healthy ? "HEALTHY" : "UNHEALTHY"
        }`
      );
      if (!results.healthCheck.healthy) {
        console.log(`   Issues: ${results.healthCheck.issues.length}`);
      }
    }

    // Browser Compatibility Summary
    if (results.browserCompatibility) {
      const compat = results.browserCompatibility.compatibility;
      const compatIcon = compat.isCompatible ? "✅" : "❌";
      console.log(
        `${compatIcon} BROWSER COMPATIBILITY: ${
          compat.isCompatible ? "COMPATIBLE" : "INCOMPATIBLE"
        }`
      );
      console.log(
        `   Browser: ${results.browserCompatibility.browserInfo.name} ${results.browserCompatibility.browserInfo.version}`
      );
      if (compat.criticalIssues > 0) {
        console.log(`   Critical Issues: ${compat.criticalIssues}`);
      }
      if (compat.warnings > 0) {
        console.log(`   Warnings: ${compat.warnings}`);
      }
    }

    // Bug Detection Summary
    if (results.bugDetection) {
      const bugs = results.bugDetection.summary;
      const bugIcon = bugs.critical === 0 ? "✅" : "❌";
      console.log(`${bugIcon} BUG DETECTION: ${bugs.totalBugs} bugs found`);
      if (bugs.critical > 0) {
        console.log(`   Critical: ${bugs.critical}`);
      }
      if (bugs.high > 0) {
        console.log(`   High Priority: ${bugs.high}`);
      }
      if (bugs.autoFixable > 0) {
        console.log(`   Auto-fixed: ${bugs.autoFixable}`);
      }
    }

    // System Validation Summary
    if (results.systemValidation) {
      const validation = results.systemValidation.summary;
      const validationIcon = validation.failedSystems === 0 ? "✅" : "❌";
      console.log(
        `${validationIcon} SYSTEM VALIDATION: ${validation.successRate.toFixed(
          1
        )}% success rate`
      );
      console.log(
        `   Systems: ${validation.passedSystems}/${validation.totalSystems} passed`
      );
      console.log(`   Critical Issues: ${validation.criticalIssues}`);
      console.log(`   Warnings: ${validation.warnings}`);
    }

    // Integration Tests Summary
    if (results.integrationTests) {
      const tests = results.integrationTests.testResults;
      const passedTests = tests.filter((t) => t.passed).length;
      const testIcon = passedTests === tests.length ? "✅" : "❌";
      console.log(
        `${testIcon} INTEGRATION TESTS: ${passedTests}/${tests.length} passed`
      );

      if (results.integrationTests.benchmarks) {
        const benchmarks = results.integrationTests.benchmarks;
        console.log(
          `   Game Loop: ${benchmarks.gameLoopPerformance.fps.toFixed(1)} FPS`
        );
        console.log(
          `   Rendering: ${benchmarks.renderingPerformance.fps.toFixed(1)} FPS`
        );
      }
    }

    // Performance Summary
    if (results.performanceTests) {
      const perf = results.performanceTests;
      const perfLevel = perf.performanceLevel || "unknown";
      const perfIcon =
        perfLevel === "good" ? "✅" : perfLevel === "warning" ? "⚠️" : "❌";
      console.log(`${perfIcon} PERFORMANCE: ${perfLevel.toUpperCase()}`);
      console.log(`   Current FPS: ${perf.fps.toFixed(1)}`);
      console.log(`   Avg Frame Time: ${perf.averageFrameTime.toFixed(2)}ms`);
    }

    console.log("=".repeat(80));

    // Overall Assessment
    const overallHealthy = results.healthCheck?.healthy ?? false;
    const browserCompatible =
      results.browserCompatibility?.compatibility.isCompatible ?? false;
    const validationPassed =
      (results.systemValidation?.summary.failedSystems ?? 1) === 0;
    const testsPassed = results.integrationTests
      ? results.integrationTests.testResults.every((t) => t.passed)
      : false;
    const noCriticalBugs = (results.bugDetection?.summary.critical ?? 1) === 0;
    const performanceGood =
      results.performanceTests?.performanceLevel === "good";

    const overallScore = [
      overallHealthy,
      browserCompatible,
      validationPassed,
      testsPassed,
      noCriticalBugs,
      performanceGood,
    ].filter(Boolean).length;

    let overallStatus, overallIcon, overallMessage;

    if (overallScore === 6) {
      overallStatus = "EXCELLENT";
      overallIcon = "🎉";
      overallMessage = "All systems are functioning perfectly!";
    } else if (overallScore >= 5) {
      overallStatus = "GOOD";
      overallIcon = "✅";
      overallMessage = "System is mostly healthy with minor issues.";
    } else if (overallScore >= 3) {
      overallStatus = "FAIR";
      overallIcon = "⚠️";
      overallMessage = "System has some issues that should be addressed.";
    } else {
      overallStatus = "POOR";
      overallIcon = "❌";
      overallMessage =
        "System has significant issues requiring immediate attention.";
    }

    console.log(`${overallIcon} OVERALL STATUS: ${overallStatus}`);
    console.log(`   ${overallMessage}`);
    console.log(`   Score: ${overallScore}/6 systems healthy`);
    console.log("=".repeat(80));

    // Recommendations
    if (overallScore < 6) {
      console.log("📋 RECOMMENDATIONS:");

      if (!overallHealthy) {
        console.log("   • Fix critical system initialization issues");
      }
      if (!browserCompatible) {
        console.log("   • Address browser compatibility issues");
      }
      if (!validationPassed) {
        console.log("   • Address system validation failures");
      }
      if (!testsPassed) {
        console.log("   • Fix failing integration tests");
      }
      if (!noCriticalBugs) {
        console.log("   • Fix critical bugs detected by bug detector");
      }
      if (!performanceGood) {
        console.log("   • Optimize performance bottlenecks");
      }

      console.log("=".repeat(80));
    }

    return {
      overallStatus,
      score: overallScore,
      maxScore: 6,
      message: overallMessage,
    };
  }

  /**
   * Show help with all available commands
   */
  showHelp() {
    console.log("\n" + "=".repeat(60));
    console.log("🎮 MARIO PLATFORMER - TEST RUNNER HELP");
    console.log("=".repeat(60));
    console.log("Available Commands:");
    console.log("");
    console.log("🚀 TestRunner.runAll()");
    console.log(
      "   Run complete test suite (health, validation, integration, performance)"
    );
    console.log("");
    console.log("🔧 TestRunner.runIntegrationTests()");
    console.log("   Run integration tests to verify component interactions");
    console.log("");
    console.log("🔍 TestRunner.runSystemValidation()");
    console.log("   Validate all game systems and their configurations");
    console.log("");
    console.log("⚡ TestRunner.runPerformanceTests()");
    console.log("   Run performance benchmarks and get metrics");
    console.log("");
    console.log("🏥 TestRunner.quickCheck()");
    console.log("   Quick health check of critical systems");
    console.log("");
    console.log("📊 TestRunner.getHistory()");
    console.log("   Get history of previous test runs");
    console.log("");
    console.log("🧹 TestRunner.clearHistory()");
    console.log("   Clear test history");
    console.log("");
    console.log("Keyboard Shortcuts (in game):");
    console.log("   F1 - Toggle performance overlay");
    console.log("   F2 - Run integration tests");
    console.log("   F3 - Run system validation");
    console.log("   F4 - Quick health check");
    console.log("   F5 - Generate performance report");
    console.log("   F6 - Reset performance metrics");
    console.log("   F7 - Run browser compatibility check");
    console.log("   F8 - Run bug detection");
    console.log("   F9 - Get comprehensive system status");
    console.log("=".repeat(60));
  }

  /**
   * Get test history
   */
  getHistory() {
    console.log(`📊 Test History (${this.testHistory.length} runs):`);

    if (this.testHistory.length === 0) {
      console.log("   No test runs recorded yet.");
      return [];
    }

    this.testHistory.forEach((run, index) => {
      console.log(`   ${index + 1}. ${run.timestamp} (${run.totalDuration}ms)`);
    });

    return this.testHistory;
  }

  /**
   * Clear test history
   */
  clearHistory() {
    const count = this.testHistory.length;
    this.testHistory = [];
    console.log(`🧹 Cleared ${count} test runs from history`);
  }

  /**
   * Get the most recent test results
   */
  getLastResults() {
    if (this.testHistory.length === 0) {
      console.log("No test results available. Run TestRunner.runAll() first.");
      return null;
    }

    return this.testHistory[this.testHistory.length - 1];
  }

  /**
   * Compare current performance with previous runs
   */
  comparePerformance() {
    if (this.testHistory.length < 2) {
      console.log("Need at least 2 test runs to compare performance.");
      return null;
    }

    const current = this.testHistory[this.testHistory.length - 1];
    const previous = this.testHistory[this.testHistory.length - 2];

    if (!current.performanceTests || !previous.performanceTests) {
      console.log("Performance data not available for comparison.");
      return null;
    }

    const currentFPS = current.performanceTests.fps;
    const previousFPS = previous.performanceTests.fps;
    const fpsChange = currentFPS - previousFPS;
    const fpsChangePercent = (fpsChange / previousFPS) * 100;

    console.log("📈 Performance Comparison:");
    console.log(`   Previous FPS: ${previousFPS.toFixed(1)}`);
    console.log(`   Current FPS: ${currentFPS.toFixed(1)}`);
    console.log(
      `   Change: ${fpsChange > 0 ? "+" : ""}${fpsChange.toFixed(1)} (${
        fpsChangePercent > 0 ? "+" : ""
      }${fpsChangePercent.toFixed(1)}%)`
    );

    if (Math.abs(fpsChangePercent) < 5) {
      console.log("   Status: 📊 Performance is stable");
    } else if (fpsChangePercent > 0) {
      console.log("   Status: 📈 Performance improved!");
    } else {
      console.log("   Status: 📉 Performance degraded");
    }

    return {
      previousFPS,
      currentFPS,
      change: fpsChange,
      changePercent: fpsChangePercent,
    };
  }
}

// Make TestRunner globally available
window.TestRunner = TestRunner;
