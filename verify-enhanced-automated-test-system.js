/**
 * Verification Script for Enhanced Automated Test System
 * Task 8 実装の検証スクリプト
 *
 * Requirements verification:
 * - 8.1: ジャンプ機能の自動テストスイートを作成
 * - 8.2: 様々な状況でのジャンプ動作を自動検証
 * - 8.3: テスト結果の詳細レポート生成機能を実装
 * - 8.4: 回帰テスト用のベンチマーク機能を追加
 */

class EnhancedTestSystemVerifier {
  constructor() {
    this.verificationResults = [];
    this.testSystem = null;
    this.gameEngine = null;
  }

  async runVerification() {
    console.log("🔍 Starting Enhanced Automated Test System Verification...");

    const verificationSuite = {
      name: "Enhanced Automated Test System Verification",
      timestamp: Date.now(),
      requirements: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        successRate: 0,
      },
    };

    try {
      // Initialize test environment
      await this.initializeTestEnvironment();

      // Requirement 8.1: 自動テストスイートの作成
      await this.verifyRequirement81(verificationSuite);

      // Requirement 8.2: 様々な状況での自動検証
      await this.verifyRequirement82(verificationSuite);

      // Requirement 8.3: 詳細レポート生成機能
      await this.verifyRequirement83(verificationSuite);

      // Requirement 8.4: 回帰テスト用ベンチマーク機能
      await this.verifyRequirement84(verificationSuite);

      // Calculate summary
      this.calculateVerificationSummary(verificationSuite);

      // Generate verification report
      this.generateVerificationReport(verificationSuite);

      console.log(
        `✅ Verification completed: ${verificationSuite.summary.successRate}% success rate`
      );
    } catch (error) {
      console.error("❌ Verification failed:", error);
      verificationSuite.error = error.message;
    }

    return verificationSuite;
  }

  async initializeTestEnvironment() {
    console.log("🔧 Initializing test environment...");

    try {
      // Create mock canvas if not available
      if (!document.querySelector("canvas")) {
        const canvas = document.createElement("canvas");
        canvas.id = "testCanvas";
        canvas.width = 800;
        canvas.height = 400;
        document.body.appendChild(canvas);
      }

      // Initialize game engine (mock if necessary)
      if (typeof GameEngine !== "undefined") {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        this.gameEngine = new GameEngine(canvas, ctx);
        await this.gameEngine.initialize();
      } else {
        this.gameEngine = this.createMockGameEngine();
      }

      // Initialize enhanced test system
      if (typeof EnhancedAutomatedTestSystem !== "undefined") {
        this.testSystem = new EnhancedAutomatedTestSystem(this.gameEngine);
      } else {
        throw new Error("EnhancedAutomatedTestSystem not available");
      }

      console.log("✅ Test environment initialized");
    } catch (error) {
      console.error("❌ Failed to initialize test environment:", error);
      throw error;
    }
  }

  createMockGameEngine() {
    return {
      player: {
        position: { x: 100, y: 400 },
        velocity: { x: 0, y: 0 },
        isOnGround: true,
        isBlocking: false,
        state: "idle",
      },
      inputManager: {
        keys: {},
        actions: {},
      },
      initialize: async () => {},
      startGame: () => {},
      stopGame: () => {},
      togglePause: () => {},
    };
  }

  /**
   * Requirement 8.1: ジャンプ機能の自動テストスイートを作成
   */
  async verifyRequirement81(verificationSuite) {
    console.log("📋 Verifying Requirement 8.1: Automated Test Suite Creation");

    const requirement = {
      id: "8.1",
      name: "ジャンプ機能の自動テストスイートを作成",
      tests: [],
      passed: 0,
      failed: 0,
    };

    // Test 1: Test system initialization
    await this.runVerificationTest(
      requirement,
      "Test System Initialization",
      async () => {
        if (!this.testSystem) {
          throw new Error("Enhanced test system not initialized");
        }

        // Check if required methods exist
        const requiredMethods = [
          "runComprehensiveJumpTests",
          "runBasicFunctionalityTests",
          "runEdgeCaseTests",
          "runPerformanceTests",
          "runStressTests",
        ];

        for (const method of requiredMethods) {
          if (typeof this.testSystem[method] !== "function") {
            throw new Error(`Required method ${method} not found`);
          }
        }

        return {
          success: true,
          message: "Test system properly initialized with all required methods",
        };
      }
    );

    // Test 2: Basic test suite execution
    await this.runVerificationTest(
      requirement,
      "Basic Test Suite Execution",
      async () => {
        const results = await this.testSystem.runBasicFunctionalityTests();

        if (!results || !results.tests || !Array.isArray(results.tests)) {
          throw new Error("Test suite did not return proper results structure");
        }

        if (results.tests.length === 0) {
          throw new Error("No tests were executed");
        }

        return {
          success: true,
          message: `Basic test suite executed ${results.tests.length} tests`,
          details: {
            testCount: results.tests.length,
            summary: results.summary,
          },
        };
      }
    );

    // Test 3: Test configuration validation
    await this.runVerificationTest(
      requirement,
      "Test Configuration Validation",
      async () => {
        const config = this.testSystem.testConfig;

        const requiredConfigKeys = [
          "simulationDelay",
          "verificationTimeout",
          "maxRetries",
          "testIterations",
          "performanceThresholds",
        ];

        for (const key of requiredConfigKeys) {
          if (!(key in config)) {
            throw new Error(`Required configuration key ${key} not found`);
          }
        }

        return {
          success: true,
          message: "Test configuration properly defined",
          details: { config },
        };
      }
    );

    verificationSuite.requirements.push(requirement);
  }

  /**
   * Requirement 8.2: 様々な状況でのジャンプ動作を自動検証
   */
  async verifyRequirement82(verificationSuite) {
    console.log("🎯 Verifying Requirement 8.2: Various Situation Testing");

    const requirement = {
      id: "8.2",
      name: "様々な状況でのジャンプ動作を自動検証",
      tests: [],
      passed: 0,
      failed: 0,
    };

    // Test 1: Edge case testing capability
    await this.runVerificationTest(
      requirement,
      "Edge Case Testing Capability",
      async () => {
        const results = await this.testSystem.runEdgeCaseTests();

        if (!results || !results.tests) {
          throw new Error("Edge case tests did not execute properly");
        }

        // Check for specific edge case tests
        const expectedEdgeCases = [
          "Jump at Platform Edge",
          "Rapid Key Presses",
          "Jump During Collision",
          "Jump with Low Frame Rate",
        ];

        const testNames = results.tests.map((test) => test.name);
        const missingTests = expectedEdgeCases.filter(
          (expected) => !testNames.some((name) => name.includes(expected))
        );

        if (missingTests.length > 0) {
          throw new Error(
            `Missing edge case tests: ${missingTests.join(", ")}`
          );
        }

        return {
          success: true,
          message: `Edge case testing implemented with ${results.tests.length} tests`,
          details: { testNames, summary: results.summary },
        };
      }
    );

    // Test 2: Stress testing capability
    await this.runVerificationTest(
      requirement,
      "Stress Testing Capability",
      async () => {
        const results = await this.testSystem.runStressTests();

        if (!results || !results.tests) {
          throw new Error("Stress tests did not execute properly");
        }

        // Check for stress test scenarios
        const expectedStressTests = [
          "Continuous Jump Attempts",
          "High Frequency Input",
          "Long Duration Testing",
        ];

        const testNames = results.tests.map((test) => test.name);
        const missingTests = expectedStressTests.filter(
          (expected) => !testNames.some((name) => name.includes(expected))
        );

        if (missingTests.length > 0) {
          throw new Error(`Missing stress tests: ${missingTests.join(", ")}`);
        }

        return {
          success: true,
          message: `Stress testing implemented with ${results.tests.length} tests`,
          details: { testNames, summary: results.summary },
        };
      }
    );

    // Test 3: Browser compatibility testing
    await this.runVerificationTest(
      requirement,
      "Browser Compatibility Testing",
      async () => {
        const results = await this.testSystem.runBrowserCompatibilityTests();

        if (!results || !results.tests) {
          throw new Error(
            "Browser compatibility tests did not execute properly"
          );
        }

        return {
          success: true,
          message: `Browser compatibility testing implemented with ${results.tests.length} tests`,
          details: { summary: results.summary },
        };
      }
    );

    verificationSuite.requirements.push(requirement);
  }

  /**
   * Requirement 8.3: テスト結果の詳細レポート生成機能を実装
   */
  async verifyRequirement83(verificationSuite) {
    console.log("📊 Verifying Requirement 8.3: Detailed Report Generation");

    const requirement = {
      id: "8.3",
      name: "テスト結果の詳細レポート生成機能を実装",
      tests: [],
      passed: 0,
      failed: 0,
    };

    // Test 1: Report generation capability
    await this.runVerificationTest(
      requirement,
      "Report Generation Capability",
      async () => {
        // Check if report generation method exists
        if (typeof this.testSystem.generateDetailedReport !== "function") {
          throw new Error("generateDetailedReport method not found");
        }

        // Run a test suite to generate data
        const testResults = await this.testSystem.runBasicFunctionalityTests();

        // Generate report
        const report = this.testSystem.generateDetailedReport({
          name: "Test Report",
          testCategories: [testResults],
          summary: testResults.summary,
          environment: this.testSystem.captureEnvironmentInfo(),
        });

        if (!report) {
          throw new Error("Report generation failed");
        }

        // Check report structure
        const requiredReportSections = [
          "metadata",
          "summary",
          "categories",
          "performance",
          "recommendations",
        ];

        for (const section of requiredReportSections) {
          if (!(section in report)) {
            throw new Error(`Report missing required section: ${section}`);
          }
        }

        return {
          success: true,
          message: "Detailed report generation working properly",
          details: { reportSections: Object.keys(report) },
        };
      }
    );

    // Test 2: Test history tracking
    await this.runVerificationTest(
      requirement,
      "Test History Tracking",
      async () => {
        // Check if history methods exist
        if (typeof this.testSystem.getTestHistory !== "function") {
          throw new Error("getTestHistory method not found");
        }

        const history = this.testSystem.getTestHistory();

        if (!Array.isArray(history)) {
          throw new Error("Test history should be an array");
        }

        return {
          success: true,
          message: "Test history tracking implemented",
          details: { historyLength: history.length },
        };
      }
    );

    // Test 3: Performance metrics collection
    await this.runVerificationTest(
      requirement,
      "Performance Metrics Collection",
      async () => {
        // Check if performance monitoring exists
        if (!this.testSystem.performanceMonitor) {
          throw new Error("Performance monitor not initialized");
        }

        const monitor = this.testSystem.performanceMonitor;
        const requiredMetrics = [
          "startTime",
          "memoryUsage",
          "frameDrops",
          "latencyMeasurements",
        ];

        for (const metric of requiredMetrics) {
          if (!(metric in monitor)) {
            throw new Error(`Performance monitor missing metric: ${metric}`);
          }
        }

        return {
          success: true,
          message: "Performance metrics collection implemented",
          details: { availableMetrics: Object.keys(monitor) },
        };
      }
    );

    verificationSuite.requirements.push(requirement);
  }

  /**
   * Requirement 8.4: 回帰テスト用のベンチマーク機能を追加
   */
  async verifyRequirement84(verificationSuite) {
    console.log(
      "📈 Verifying Requirement 8.4: Benchmark and Regression Testing"
    );

    const requirement = {
      id: "8.4",
      name: "回帰テスト用のベンチマーク機能を追加",
      tests: [],
      passed: 0,
      failed: 0,
    };

    // Test 1: Benchmark suite execution
    await this.runVerificationTest(
      requirement,
      "Benchmark Suite Execution",
      async () => {
        if (typeof this.testSystem.runBenchmarkSuite !== "function") {
          throw new Error("runBenchmarkSuite method not found");
        }

        const benchmarkResults = await this.testSystem.runBenchmarkSuite();

        if (!benchmarkResults || !benchmarkResults.metrics) {
          throw new Error("Benchmark suite did not return proper results");
        }

        // Check for required benchmark metrics
        const requiredMetrics = [
          "latency",
          "throughput",
          "successRate",
          "memoryUsage",
        ];

        const availableMetrics = Object.keys(benchmarkResults.metrics);
        const missingMetrics = requiredMetrics.filter(
          (metric) => !availableMetrics.includes(metric)
        );

        if (missingMetrics.length > 0) {
          throw new Error(
            `Missing benchmark metrics: ${missingMetrics.join(", ")}`
          );
        }

        return {
          success: true,
          message: "Benchmark suite executed successfully",
          details: {
            availableMetrics,
            benchmarkName: benchmarkResults.name,
            version: benchmarkResults.version,
          },
        };
      }
    );

    // Test 2: Regression detection capability
    await this.runVerificationTest(
      requirement,
      "Regression Detection Capability",
      async () => {
        if (typeof this.testSystem.runRegressionTests !== "function") {
          throw new Error("runRegressionTests method not found");
        }

        const regressionResults = await this.testSystem.runRegressionTests();

        if (!regressionResults) {
          throw new Error("Regression tests did not execute properly");
        }

        // Check for regression detection properties
        const requiredProperties = ["regressionDetected", "baselineComparison"];

        for (const prop of requiredProperties) {
          if (!(prop in regressionResults)) {
            throw new Error(`Regression results missing property: ${prop}`);
          }
        }

        return {
          success: true,
          message: "Regression detection capability implemented",
          details: {
            regressionDetected: regressionResults.regressionDetected,
            hasBaseline: !!regressionResults.baselineComparison,
          },
        };
      }
    );

    // Test 3: Benchmark data persistence
    await this.runVerificationTest(
      requirement,
      "Benchmark Data Persistence",
      async () => {
        if (typeof this.testSystem.getBenchmarkData !== "function") {
          throw new Error("getBenchmarkData method not found");
        }

        const benchmarkData = this.testSystem.getBenchmarkData();

        if (!Array.isArray(benchmarkData)) {
          throw new Error("Benchmark data should be an array");
        }

        // Check data structure
        if (benchmarkData.length > 0) {
          const sample = benchmarkData[0];
          const requiredFields = ["name", "timestamp", "metrics"];

          for (const field of requiredFields) {
            if (!(field in sample)) {
              throw new Error(`Benchmark data missing field: ${field}`);
            }
          }
        }

        return {
          success: true,
          message: "Benchmark data persistence implemented",
          details: { dataCount: benchmarkData.length },
        };
      }
    );

    verificationSuite.requirements.push(requirement);
  }

  async runVerificationTest(requirement, testName, testFunction) {
    const test = {
      name: testName,
      timestamp: Date.now(),
      duration: 0,
      success: false,
      message: "",
      details: {},
      error: null,
    };

    const startTime = performance.now();

    try {
      console.log(`  Running: ${testName}`);
      const result = await testFunction();

      test.success = result.success;
      test.message = result.message;
      test.details = result.details || {};

      if (result.success) {
        requirement.passed++;
        console.log(`  ✅ ${testName}: ${result.message}`);
      } else {
        requirement.failed++;
        console.log(`  ❌ ${testName}: ${result.message}`);
      }
    } catch (error) {
      test.success = false;
      test.error = error.message;
      test.message = `Test failed: ${error.message}`;
      requirement.failed++;
      console.log(`  ❌ ${testName}: ${error.message}`);
    }

    test.duration = performance.now() - startTime;
    requirement.tests.push(test);
  }

  calculateVerificationSummary(verificationSuite) {
    verificationSuite.summary.total = 0;
    verificationSuite.summary.passed = 0;
    verificationSuite.summary.failed = 0;

    verificationSuite.requirements.forEach((requirement) => {
      verificationSuite.summary.total += requirement.tests.length;
      verificationSuite.summary.passed += requirement.passed;
      verificationSuite.summary.failed += requirement.failed;
    });

    verificationSuite.summary.successRate =
      verificationSuite.summary.total > 0
        ? (verificationSuite.summary.passed / verificationSuite.summary.total) *
          100
        : 0;
  }

  generateVerificationReport(verificationSuite) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📋 ENHANCED AUTOMATED TEST SYSTEM VERIFICATION REPORT`);
    console.log(`${"=".repeat(80)}`);
    console.log(
      `Timestamp: ${new Date(verificationSuite.timestamp).toLocaleString()}`
    );
    console.log(
      `Overall Success Rate: ${verificationSuite.summary.successRate.toFixed(
        1
      )}%`
    );
    console.log(`Total Tests: ${verificationSuite.summary.total}`);
    console.log(`Passed: ${verificationSuite.summary.passed}`);
    console.log(`Failed: ${verificationSuite.summary.failed}`);
    console.log(`${"=".repeat(80)}`);

    verificationSuite.requirements.forEach((requirement) => {
      const successRate =
        requirement.tests.length > 0
          ? (requirement.passed / requirement.tests.length) * 100
          : 0;

      console.log(`\n📋 Requirement ${requirement.id}: ${requirement.name}`);
      console.log(
        `   Success Rate: ${successRate.toFixed(1)}% (${requirement.passed}/${
          requirement.tests.length
        })`
      );

      requirement.tests.forEach((test) => {
        const status = test.success ? "✅" : "❌";
        console.log(
          `   ${status} ${test.name} (${test.duration.toFixed(0)}ms)`
        );
        if (!test.success && test.error) {
          console.log(`      Error: ${test.error}`);
        }
      });
    });

    console.log(`\n${"=".repeat(80)}`);

    // Save report to localStorage
    try {
      localStorage.setItem(
        "enhancedTestSystemVerification",
        JSON.stringify(verificationSuite)
      );
      console.log("📁 Verification report saved to localStorage");
    } catch (error) {
      console.warn("⚠️ Failed to save verification report:", error);
    }
  }
}

// Auto-run verification if in browser environment
if (typeof window !== "undefined") {
  window.addEventListener("load", async () => {
    // Wait a bit for other systems to initialize
    setTimeout(async () => {
      const verifier = new EnhancedTestSystemVerifier();
      try {
        await verifier.runVerification();
      } catch (error) {
        console.error("Verification failed:", error);
      }
    }, 2000);
  });
}

// Export for Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = EnhancedTestSystemVerifier;
}

// Make available globally
if (typeof window !== "undefined") {
  window.EnhancedTestSystemVerifier = EnhancedTestSystemVerifier;
}
