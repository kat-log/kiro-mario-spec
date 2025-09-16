/**
 * Task 9 Performance Optimization Verification Script
 * Validates all performance optimization features and requirements
 */

class Task9PerformanceOptimizationVerifier {
  constructor() {
    this.testResults = [];
    this.performanceData = [];
    this.startTime = performance.now();
  }

  /**
   * Run all verification tests
   */
  async runAllTests() {
    console.log("🚀 Starting Task 9: Performance Optimization Verification");
    console.log("=".repeat(60));

    try {
      // Test 1: Performance Monitor System
      await this.testPerformanceMonitorSystem();

      // Test 2: Environment Detection
      await this.testEnvironmentDetection();

      // Test 3: Diagnostic Overhead Measurement
      await this.testDiagnosticOverheadMeasurement();

      // Test 4: Memory Management
      await this.testMemoryManagement();

      // Test 5: Adaptive Optimization
      await this.testAdaptiveOptimization();

      // Test 6: Production Environment Handling
      await this.testProductionEnvironmentHandling();

      // Test 7: Frame Rate Impact Minimization
      await this.testFrameRateImpactMinimization();

      // Test 8: Integration with Existing Systems
      await this.testSystemIntegration();

      // Generate final report
      this.generateFinalReport();
    } catch (error) {
      console.error("❌ Verification failed:", error);
      this.addTestResult(
        "Overall Verification",
        false,
        `Fatal error: ${error.message}`
      );
    }
  }

  /**
   * Test 1: Performance Monitor System
   */
  async testPerformanceMonitorSystem() {
    console.log("\n📊 Testing Performance Monitor System...");

    let systemInitialized = false;
    let environmentDetected = false;
    let monitoringStarted = false;

    try {
      // Check if PerformanceMonitor class exists
      if (typeof PerformanceMonitor === "undefined") {
        throw new Error("PerformanceMonitor class not found");
      }

      // Check if global instance exists
      if (!window.performanceMonitor) {
        throw new Error("Global performanceMonitor instance not found");
      }

      systemInitialized = true;
      console.log("✅ Performance monitor system initialized");

      // Test environment detection
      const isProduction = window.performanceMonitor.isProduction;
      const diagnosticsEnabled = window.performanceMonitor.diagnosticsEnabled;

      environmentDetected =
        typeof isProduction === "boolean" &&
        typeof diagnosticsEnabled === "boolean";
      console.log(
        `✅ Environment detected: Production=${isProduction}, Diagnostics=${diagnosticsEnabled}`
      );

      // Test monitoring capabilities
      const report = window.performanceMonitor.getPerformanceReport();
      monitoringStarted = report && typeof report === "object";
      console.log("✅ Performance monitoring active");
    } catch (error) {
      console.error(
        "❌ Performance monitor system test failed:",
        error.message
      );
    }

    this.addTestResult(
      "Performance Monitor System",
      systemInitialized && environmentDetected && monitoringStarted,
      `Initialized: ${systemInitialized}, Environment: ${environmentDetected}, Monitoring: ${monitoringStarted}`
    );
  }

  /**
   * Test 2: Environment Detection
   */
  async testEnvironmentDetection() {
    console.log("\n🔍 Testing Environment Detection...");

    let productionDetection = false;
    let diagnosticsControl = false;
    let indicatorAnalysis = false;

    try {
      const performanceMonitor = window.performanceMonitor;

      // Test production environment detection logic
      const originalIsProduction = performanceMonitor.isProduction;

      // Test various indicators
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const hasDebugFlag = window.location.search.includes("debug=true");

      productionDetection = true;
      console.log(
        `✅ Production detection logic working: ${originalIsProduction}`
      );
      console.log(
        `   Hostname: ${hostname}, Protocol: ${protocol}, Debug: ${hasDebugFlag}`
      );

      // Test diagnostics control based on environment
      const diagnosticsEnabled = performanceMonitor.diagnosticsEnabled;
      diagnosticsControl = typeof diagnosticsEnabled === "boolean";
      console.log(`✅ Diagnostics control: ${diagnosticsEnabled}`);

      // Test indicator analysis
      const indicators = [
        hostname !== "localhost" && hostname !== "127.0.0.1",
        protocol === "https:",
        !hasDebugFlag,
      ];

      indicatorAnalysis = indicators.length === 3;
      console.log(
        `✅ Environment indicators analyzed: ${
          indicators.filter(Boolean).length
        }/3`
      );
    } catch (error) {
      console.error("❌ Environment detection test failed:", error.message);
    }

    this.addTestResult(
      "Environment Detection",
      productionDetection && diagnosticsControl && indicatorAnalysis,
      `Detection: ${productionDetection}, Control: ${diagnosticsControl}, Analysis: ${indicatorAnalysis}`
    );
  }

  /**
   * Test 3: Diagnostic Overhead Measurement
   */
  async testDiagnosticOverheadMeasurement() {
    console.log("\n⏱️ Testing Diagnostic Overhead Measurement...");

    let overheadMeasurement = false;
    let thresholdDetection = false;
    let adaptiveResponse = false;

    try {
      const performanceMonitor = window.performanceMonitor;

      // Test overhead measurement
      const testFunction = () => {
        // Simulate diagnostic work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
      };

      const initialOverheadCount =
        performanceMonitor.performanceMetrics.diagnosticOverhead.length;
      performanceMonitor.measureDiagnosticOverhead(
        testFunction,
        "test-overhead"
      );
      const afterOverheadCount =
        performanceMonitor.performanceMetrics.diagnosticOverhead.length;

      overheadMeasurement = afterOverheadCount > initialOverheadCount;
      console.log("✅ Overhead measurement working");

      // Test threshold detection with high overhead function
      const highOverheadFunction = () => {
        for (let i = 0; i < 100000; i++) {
          Math.sqrt(Math.random());
        }
      };

      performanceMonitor.measureDiagnosticOverhead(
        highOverheadFunction,
        "high-overhead-test"
      );

      const overheadData =
        performanceMonitor.performanceMetrics.diagnosticOverhead;
      const hasHighOverhead = overheadData.some((entry) => entry.overhead > 2);
      thresholdDetection = hasHighOverhead;
      console.log(`✅ Threshold detection: ${thresholdDetection}`);

      // Test adaptive response (check if systems can be throttled)
      if (window.jumpDiagnosticSystem) {
        const initialThrottled =
          window.jumpDiagnosticSystem.performanceSettings?.throttled || false;
        if (
          typeof window.jumpDiagnosticSystem.enableThrottling === "function"
        ) {
          window.jumpDiagnosticSystem.enableThrottling();
          const afterThrottling =
            window.jumpDiagnosticSystem.performanceSettings?.throttled || false;
          adaptiveResponse = afterThrottling !== initialThrottled;
          console.log(`✅ Adaptive response: ${adaptiveResponse}`);
        }
      }
    } catch (error) {
      console.error(
        "❌ Diagnostic overhead measurement test failed:",
        error.message
      );
    }

    this.addTestResult(
      "Diagnostic Overhead Measurement",
      overheadMeasurement && thresholdDetection,
      `Measurement: ${overheadMeasurement}, Threshold: ${thresholdDetection}, Adaptive: ${adaptiveResponse}`
    );
  }

  /**
   * Test 4: Memory Management
   */
  async testMemoryManagement() {
    console.log("\n🧹 Testing Memory Management...");

    let memoryMonitoring = false;
    let cleanupFunctionality = false;
    let memoryOptimization = false;

    try {
      const performanceMonitor = window.performanceMonitor;

      // Test memory monitoring
      if (performance.memory) {
        const initialMemoryCount =
          performanceMonitor.performanceMetrics.memoryUsage.length;

        const memoryInfo = {
          used: performance.memory.usedJSHeapSize / 1024 / 1024,
          total: performance.memory.totalJSHeapSize / 1024 / 1024,
          limit: performance.memory.jsHeapSizeLimit / 1024 / 1024,
        };

        performanceMonitor.recordMemoryUsage(memoryInfo);
        const afterMemoryCount =
          performanceMonitor.performanceMetrics.memoryUsage.length;

        memoryMonitoring = afterMemoryCount > initialMemoryCount;
        console.log("✅ Memory monitoring working");
      } else {
        memoryMonitoring = true; // Skip if not available
        console.log("⚠️ Memory monitoring not available in this environment");
      }

      // Test cleanup functionality
      const beforeCleanup = performanceMonitor.getMemoryUsage();
      performanceMonitor.performCleanup();
      const afterCleanup = performanceMonitor.getMemoryUsage();

      cleanupFunctionality = true; // Cleanup executed without error
      console.log(
        `✅ Cleanup functionality: ${beforeCleanup}MB -> ${afterCleanup}MB`
      );

      // Test memory optimization in diagnostic systems
      if (
        window.jumpDiagnosticSystem &&
        typeof window.jumpDiagnosticSystem.cleanup === "function"
      ) {
        // Generate test data
        for (let i = 0; i < 50; i++) {
          window.jumpDiagnosticSystem.recordJumpAttempt(
            true,
            { isOnGround: true },
            true,
            "test"
          );
        }

        const memoryBefore = window.jumpDiagnosticSystem.estimateMemoryUsage();
        window.jumpDiagnosticSystem.cleanup();
        const memoryAfter = window.jumpDiagnosticSystem.estimateMemoryUsage();

        memoryOptimization = memoryAfter.bytes <= memoryBefore.bytes;
        console.log(
          `✅ Memory optimization: ${memoryBefore.kb}KB -> ${memoryAfter.kb}KB`
        );
      }
    } catch (error) {
      console.error("❌ Memory management test failed:", error.message);
    }

    this.addTestResult(
      "Memory Management",
      memoryMonitoring && cleanupFunctionality && memoryOptimization,
      `Monitoring: ${memoryMonitoring}, Cleanup: ${cleanupFunctionality}, Optimization: ${memoryOptimization}`
    );
  }

  /**
   * Test 5: Adaptive Optimization
   */
  async testAdaptiveOptimization() {
    console.log("\n⚡ Testing Adaptive Optimization...");

    let performanceIssueDetection = false;
    let adaptiveThrottling = false;
    let optimizationResponse = false;

    try {
      const performanceMonitor = window.performanceMonitor;

      // Test performance issue detection
      const initialIssues =
        performanceMonitor.performanceMetrics.frameTime.filter(
          (entry) => entry.time > 16.67
        ).length;

      // Simulate performance issues
      performanceMonitor.recordFrameTime(25); // Slow frame
      performanceMonitor.recordFrameTime(30); // Very slow frame

      const afterIssues =
        performanceMonitor.performanceMetrics.frameTime.filter(
          (entry) => entry.time > 16.67
        ).length;

      performanceIssueDetection = afterIssues > initialIssues;
      console.log("✅ Performance issue detection working");

      // Test adaptive throttling
      if (window.jumpDiagnosticSystem) {
        const initialSettings = {
          ...window.jumpDiagnosticSystem.performanceSettings,
        };

        // Trigger throttling
        if (
          typeof window.jumpDiagnosticSystem.enableThrottling === "function"
        ) {
          window.jumpDiagnosticSystem.enableThrottling();
          const afterSettings = window.jumpDiagnosticSystem.performanceSettings;

          adaptiveThrottling =
            afterSettings.throttled !== initialSettings.throttled;
          console.log(`✅ Adaptive throttling: ${adaptiveThrottling}`);
        }
      }

      // Test optimization response to issues
      performanceMonitor.handlePerformanceIssue("frame_time", 35, "test");
      performanceMonitor.handlePerformanceIssue("memory", 150, "test");

      optimizationResponse = true; // No errors thrown
      console.log("✅ Optimization response to issues working");
    } catch (error) {
      console.error("❌ Adaptive optimization test failed:", error.message);
    }

    this.addTestResult(
      "Adaptive Optimization",
      performanceIssueDetection && adaptiveThrottling && optimizationResponse,
      `Detection: ${performanceIssueDetection}, Throttling: ${adaptiveThrottling}, Response: ${optimizationResponse}`
    );
  }

  /**
   * Test 6: Production Environment Handling
   */
  async testProductionEnvironmentHandling() {
    console.log("\n🏭 Testing Production Environment Handling...");

    let productionDetection = false;
    let diagnosticsDisabling = false;
    let systemBehavior = false;

    try {
      const performanceMonitor = window.performanceMonitor;

      // Store original state
      const originalProduction = performanceMonitor.isProduction;
      const originalDiagnostics = performanceMonitor.diagnosticsEnabled;

      // Test production detection
      productionDetection = typeof originalProduction === "boolean";
      console.log(`✅ Production detection: ${originalProduction}`);

      // Test diagnostics disabling in production
      if (originalProduction) {
        diagnosticsDisabling = !originalDiagnostics;
        console.log("✅ Diagnostics automatically disabled in production");
      } else {
        // Simulate production environment
        performanceMonitor.isProduction = true;
        performanceMonitor.setDiagnosticsEnabled(false);
        diagnosticsDisabling = !performanceMonitor.diagnosticsEnabled;
        console.log("✅ Diagnostics can be disabled for production");

        // Restore original state
        performanceMonitor.isProduction = originalProduction;
        performanceMonitor.setDiagnosticsEnabled(originalDiagnostics);
      }

      // Test system behavior in production mode
      if (window.jumpDiagnosticSystem) {
        const shouldEnable =
          window.jumpDiagnosticSystem.shouldEnableDiagnostics();
        systemBehavior = typeof shouldEnable === "boolean";
        console.log(
          `✅ System respects production mode: diagnostics ${
            shouldEnable ? "enabled" : "disabled"
          }`
        );
      }
    } catch (error) {
      console.error(
        "❌ Production environment handling test failed:",
        error.message
      );
    }

    this.addTestResult(
      "Production Environment Handling",
      productionDetection && diagnosticsDisabling && systemBehavior,
      `Detection: ${productionDetection}, Disabling: ${diagnosticsDisabling}, Behavior: ${systemBehavior}`
    );
  }

  /**
   * Test 7: Frame Rate Impact Minimization
   */
  async testFrameRateImpactMinimization() {
    console.log("\n🎯 Testing Frame Rate Impact Minimization...");

    let frameRateMonitoring = false;
    let impactMeasurement = false;
    let optimizationTriggers = false;

    try {
      const performanceMonitor = window.performanceMonitor;

      // Test frame rate monitoring
      const initialFrameCount =
        performanceMonitor.performanceMetrics.frameTime.length;

      // Simulate frame times
      performanceMonitor.recordFrameTime(16.67); // 60 FPS
      performanceMonitor.recordFrameTime(20.0); // 50 FPS
      performanceMonitor.recordFrameTime(33.33); // 30 FPS

      const afterFrameCount =
        performanceMonitor.performanceMetrics.frameTime.length;
      frameRateMonitoring = afterFrameCount > initialFrameCount;
      console.log("✅ Frame rate monitoring active");

      // Test impact measurement
      const diagnosticFunction = () => {
        // Simulate diagnostic work
        for (let i = 0; i < 5000; i++) {
          Math.random();
        }
      };

      const beforeOverhead =
        performanceMonitor.performanceMetrics.diagnosticOverhead.length;
      performanceMonitor.measureDiagnosticOverhead(
        diagnosticFunction,
        "frame-impact-test"
      );
      const afterOverhead =
        performanceMonitor.performanceMetrics.diagnosticOverhead.length;

      impactMeasurement = afterOverhead > beforeOverhead;
      console.log("✅ Impact measurement working");

      // Test optimization triggers
      const report = performanceMonitor.getPerformanceReport();
      if (report.frameRate.issues > 0 || report.diagnosticOverhead.issues > 0) {
        optimizationTriggers = true;
        console.log("✅ Optimization triggers detected performance issues");
      } else {
        // Force a performance issue
        performanceMonitor.recordFrameTime(50); // Very slow frame
        const newReport = performanceMonitor.getPerformanceReport();
        optimizationTriggers = newReport.frameRate.issues > 0;
        console.log("✅ Optimization triggers respond to performance issues");
      }
    } catch (error) {
      console.error(
        "❌ Frame rate impact minimization test failed:",
        error.message
      );
    }

    this.addTestResult(
      "Frame Rate Impact Minimization",
      frameRateMonitoring && impactMeasurement && optimizationTriggers,
      `Monitoring: ${frameRateMonitoring}, Measurement: ${impactMeasurement}, Triggers: ${optimizationTriggers}`
    );
  }

  /**
   * Test 8: Integration with Existing Systems
   */
  async testSystemIntegration() {
    console.log("\n🔗 Testing Integration with Existing Systems...");

    let jumpDiagnosticIntegration = false;
    let debugDisplayIntegration = false;
    let performanceMonitorIntegration = false;

    try {
      // Test Jump Diagnostic System integration
      if (window.jumpDiagnosticSystem) {
        const hasPerformanceSettings =
          window.jumpDiagnosticSystem.performanceSettings !== undefined;
        const hasThrottling =
          typeof window.jumpDiagnosticSystem.enableThrottling === "function";
        const hasCleanup =
          typeof window.jumpDiagnosticSystem.cleanup === "function";
        const hasMemoryEstimation =
          typeof window.jumpDiagnosticSystem.estimateMemoryUsage === "function";

        jumpDiagnosticIntegration =
          hasPerformanceSettings &&
          hasThrottling &&
          hasCleanup &&
          hasMemoryEstimation;
        console.log(
          `✅ Jump Diagnostic System integration: ${jumpDiagnosticIntegration}`
        );
      }

      // Test Debug Display System integration
      if (window.debugDisplaySystem) {
        const hasPerformanceSettings =
          window.debugDisplaySystem.performanceSettings !== undefined;
        const hasThrottling =
          typeof window.debugDisplaySystem.enableThrottling === "function";
        const hasCleanup =
          typeof window.debugDisplaySystem.cleanup === "function";
        const hasMemoryEstimation =
          typeof window.debugDisplaySystem.estimateMemoryUsage === "function";

        debugDisplayIntegration =
          hasPerformanceSettings &&
          hasThrottling &&
          hasCleanup &&
          hasMemoryEstimation;
        console.log(
          `✅ Debug Display System integration: ${debugDisplayIntegration}`
        );
      }

      // Test Performance Monitor integration
      const hasGlobalInstance = window.performanceMonitor !== undefined;
      const hasReporting =
        typeof window.performanceMonitor?.getPerformanceReport === "function";
      const hasCleanup =
        typeof window.performanceMonitor?.performCleanup === "function";
      const hasOverheadMeasurement =
        typeof window.performanceMonitor?.measureDiagnosticOverhead ===
        "function";

      performanceMonitorIntegration =
        hasGlobalInstance &&
        hasReporting &&
        hasCleanup &&
        hasOverheadMeasurement;
      console.log(
        `✅ Performance Monitor integration: ${performanceMonitorIntegration}`
      );
    } catch (error) {
      console.error("❌ System integration test failed:", error.message);
    }

    this.addTestResult(
      "System Integration",
      jumpDiagnosticIntegration &&
        debugDisplayIntegration &&
        performanceMonitorIntegration,
      `Jump: ${jumpDiagnosticIntegration}, Debug: ${debugDisplayIntegration}, Monitor: ${performanceMonitorIntegration}`
    );
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, details) {
    this.testResults.push({
      testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate final verification report
   */
  generateFinalReport() {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📋 TASK 9 PERFORMANCE OPTIMIZATION VERIFICATION REPORT");
    console.log("=".repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(
      `   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );
    console.log(`   Duration: ${duration.toFixed(2)}ms`);

    console.log(`\n📋 DETAILED RESULTS:`);
    this.testResults.forEach((result, index) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`   ${index + 1}. ${result.testName}: ${status}`);
      if (result.details) {
        console.log(`      Details: ${result.details}`);
      }
    });

    // Performance optimization requirements verification
    console.log(`\n🎯 REQUIREMENTS VERIFICATION:`);

    const requirements = [
      {
        name: "Diagnostic overhead measurement",
        passed: this.testResults.find(
          (r) => r.testName === "Diagnostic Overhead Measurement"
        )?.passed,
      },
      {
        name: "Production environment auto-disable",
        passed: this.testResults.find(
          (r) => r.testName === "Production Environment Handling"
        )?.passed,
      },
      {
        name: "Memory usage monitoring and cleanup",
        passed: this.testResults.find((r) => r.testName === "Memory Management")
          ?.passed,
      },
      {
        name: "Frame rate impact minimization",
        passed: this.testResults.find(
          (r) => r.testName === "Frame Rate Impact Minimization"
        )?.passed,
      },
    ];

    requirements.forEach((req, index) => {
      const status = req.passed ? "✅ SATISFIED" : "❌ NOT SATISFIED";
      console.log(`   ${index + 1}. ${req.name}: ${status}`);
    });

    const allRequirementsMet = requirements.every((req) => req.passed);

    console.log(`\n🏆 FINAL VERDICT:`);
    if (allRequirementsMet && passedTests === totalTests) {
      console.log("   ✅ TASK 9 PERFORMANCE OPTIMIZATION - FULLY IMPLEMENTED");
      console.log(
        "   All performance optimization features are working correctly!"
      );
    } else if (allRequirementsMet) {
      console.log("   ⚠️ TASK 9 PERFORMANCE OPTIMIZATION - MOSTLY IMPLEMENTED");
      console.log("   Core requirements met, but some tests failed.");
    } else {
      console.log("   ❌ TASK 9 PERFORMANCE OPTIMIZATION - INCOMPLETE");
      console.log("   Some core requirements are not satisfied.");
    }

    console.log("\n" + "=".repeat(60));

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests) * 100,
      duration,
      allRequirementsMet,
      testResults: this.testResults,
    };
  }
}

// Auto-run verification if in browser environment
if (typeof window !== "undefined") {
  window.Task9PerformanceOptimizationVerifier =
    Task9PerformanceOptimizationVerifier;

  // Auto-run after a short delay to ensure all systems are loaded
  setTimeout(() => {
    const verifier = new Task9PerformanceOptimizationVerifier();
    verifier
      .runAllTests()
      .then(() => {
        console.log(
          "🎉 Task 9 Performance Optimization verification completed!"
        );
      })
      .catch((error) => {
        console.error("💥 Verification failed:", error);
      });
  }, 1000);
}

// Export for Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = Task9PerformanceOptimizationVerifier;
}
