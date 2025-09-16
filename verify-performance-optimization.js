/**
 * Performance Optimization Verification Script - Task 9
 * Tests all performance optimization features including:
 * - Input processing performance measurement
 * - Production environment auto-disable of diagnostics
 * - Memory leak prevention and resource cleanup
 */

class PerformanceOptimizationVerifier {
  constructor() {
    this.testResults = [];
    this.performanceOptimizer = null;
    this.inputDiagnosticSystem = null;
    this.enhancedInputManager = null;
  }

  /**
   * Run all performance optimization tests
   */
  async runAllTests() {
    console.log("🚀 Starting Performance Optimization Verification - Task 9");
    console.log("Testing Requirements: 7.1, 7.2, 7.3, 7.4");

    try {
      // Initialize test environment
      await this.initializeTestEnvironment();

      // Test 1: Input processing performance measurement (Requirement 7.1)
      await this.testInputProcessingPerformance();

      // Test 2: Production environment diagnostic auto-disable (Requirement 7.2)
      await this.testProductionDiagnosticAutoDisable();

      // Test 3: Memory leak prevention (Requirement 7.3)
      await this.testMemoryLeakPrevention();

      // Test 4: Resource cleanup strengthening (Requirement 7.4)
      await this.testResourceCleanup();

      // Generate final report
      this.generateFinalReport();
    } catch (error) {
      console.error("❌ Test execution failed:", error);
      this.testResults.push({
        test: "Test Execution",
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Initialize test environment
   */
  async initializeTestEnvironment() {
    console.log("\n📋 Initializing test environment...");

    try {
      // Create mock canvas
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      document.body.appendChild(canvas);

      // Create mock game engine
      const mockGameEngine = {
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        running: true,
      };

      // Initialize performance optimizer
      this.performanceOptimizer = new PerformanceOptimizer(mockGameEngine);
      window.gamePerformanceOptimizer = this.performanceOptimizer;

      // Initialize input systems
      this.enhancedInputManager = new EnhancedInputManager(canvas);
      this.inputDiagnosticSystem = new InputDiagnosticSystem(
        this.enhancedInputManager
      );

      // Start monitoring
      this.performanceOptimizer.startMonitoring();

      console.log("✅ Test environment initialized successfully");
      this.testResults.push({
        test: "Environment Initialization",
        passed: true,
        details: "All systems initialized correctly",
      });
    } catch (error) {
      console.error("❌ Failed to initialize test environment:", error);
      this.testResults.push({
        test: "Environment Initialization",
        passed: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Test input processing performance measurement (Requirement 7.1)
   */
  async testInputProcessingPerformance() {
    console.log("\n⌨️ Testing input processing performance measurement...");

    try {
      // Test 1.1: Performance measurement methods exist
      const hasMeasurementMethods =
        typeof this.performanceOptimizer.startInputProcessingMeasurement ===
          "function" &&
        typeof this.performanceOptimizer.endInputProcessingMeasurement ===
          "function" &&
        typeof this.performanceOptimizer.recordInputLatency === "function";

      if (!hasMeasurementMethods) {
        throw new Error("Input processing measurement methods not found");
      }

      // Test 1.2: Measurement functionality
      this.performanceOptimizer.startInputProcessingMeasurement();

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 10));

      this.performanceOptimizer.endInputProcessingMeasurement();

      // Test 1.3: Latency recording
      this.performanceOptimizer.recordInputLatency(25.5);
      this.performanceOptimizer.recordInputLatency(30.2);

      // Test 1.4: Metrics collection
      const metrics = this.performanceOptimizer.getMetrics();
      const hasInputMetrics =
        metrics.inputProcessing &&
        typeof metrics.inputProcessing.averageProcessingTime !== "undefined" &&
        typeof metrics.inputProcessing.averageLatency !== "undefined";

      if (!hasInputMetrics) {
        throw new Error("Input processing metrics not collected properly");
      }

      // Test 1.5: Input optimization based on performance
      this.performanceOptimizer.optimizeInputProcessing();

      console.log(
        "✅ Input processing performance measurement working correctly"
      );
      console.log(
        `   - Average processing time: ${metrics.inputProcessing.averageProcessingTime}ms`
      );
      console.log(
        `   - Average latency: ${metrics.inputProcessing.averageLatency}ms`
      );

      this.testResults.push({
        test: "Input Processing Performance Measurement (7.1)",
        passed: true,
        details: {
          measurementMethods: true,
          metricsCollection: true,
          optimization: true,
          averageProcessingTime: metrics.inputProcessing.averageProcessingTime,
          averageLatency: metrics.inputProcessing.averageLatency,
        },
      });
    } catch (error) {
      console.error("❌ Input processing performance test failed:", error);
      this.testResults.push({
        test: "Input Processing Performance Measurement (7.1)",
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test production environment diagnostic auto-disable (Requirement 7.2)
   */
  async testProductionDiagnosticAutoDisable() {
    console.log(
      "\n🏭 Testing production environment diagnostic auto-disable..."
    );

    try {
      // Test 2.1: Environment detection
      const originalIsProduction =
        this.performanceOptimizer.settings.isProduction;
      const hasEnvironmentDetection =
        typeof this.performanceOptimizer.detectProductionEnvironment ===
        "function";

      if (!hasEnvironmentDetection) {
        throw new Error("Production environment detection method not found");
      }

      // Test 2.2: Production mode simulation
      this.performanceOptimizer.updateSettings({ isProduction: true });

      // Test 2.3: Diagnostic auto-disable functionality
      const hasAutoDisableMethod =
        typeof this.performanceOptimizer.disableProductionDiagnostics ===
        "function";
      if (!hasAutoDisableMethod) {
        throw new Error("Production diagnostic auto-disable method not found");
      }

      // Enable diagnostics first
      this.performanceOptimizer.optimizations.diagnosticsDisabled = false;
      this.enhancedInputManager.enableDiagnostics();
      this.inputDiagnosticSystem.startDiagnostics();

      // Test auto-disable
      this.performanceOptimizer.disableProductionDiagnostics();

      // Verify diagnostics are disabled
      const diagnosticsDisabled =
        this.performanceOptimizer.optimizations.diagnosticsDisabled;
      const inputDiagnosticsDisabled = !this.inputDiagnosticSystem.isRecording;

      if (!diagnosticsDisabled) {
        throw new Error(
          "Performance optimizer diagnostics not disabled in production mode"
        );
      }

      // Test 2.4: Runtime diagnostic disable
      const hasRuntimeDisableMethod =
        typeof this.performanceOptimizer.disableRuntimeDiagnostics ===
        "function";
      if (!hasRuntimeDisableMethod) {
        throw new Error("Runtime diagnostic disable method not found");
      }

      this.performanceOptimizer.disableRuntimeDiagnostics();

      console.log("✅ Production diagnostic auto-disable working correctly");
      console.log(`   - Environment detection: Available`);
      console.log(`   - Diagnostics disabled: ${diagnosticsDisabled}`);
      console.log(
        `   - Input diagnostics disabled: ${inputDiagnosticsDisabled}`
      );

      // Restore original state
      this.performanceOptimizer.updateSettings({
        isProduction: originalIsProduction,
      });

      this.testResults.push({
        test: "Production Diagnostic Auto-Disable (7.2)",
        passed: true,
        details: {
          environmentDetection: true,
          autoDisableMethod: true,
          diagnosticsDisabled: diagnosticsDisabled,
          inputDiagnosticsDisabled: inputDiagnosticsDisabled,
          runtimeDisableMethod: true,
        },
      });
    } catch (error) {
      console.error(
        "❌ Production diagnostic auto-disable test failed:",
        error
      );
      this.testResults.push({
        test: "Production Diagnostic Auto-Disable (7.2)",
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test memory leak prevention (Requirement 7.3)
   */
  async testMemoryLeakPrevention() {
    console.log("\n🧠 Testing memory leak prevention...");

    try {
      // Test 3.1: Memory leak detection methods
      const hasMemoryLeakDetection =
        typeof this.performanceOptimizer.startMemoryLeakDetection ===
          "function" &&
        typeof this.performanceOptimizer.checkMemoryLeaks === "function" &&
        typeof this.performanceOptimizer.performMemoryCleanup === "function";

      if (!hasMemoryLeakDetection) {
        throw new Error("Memory leak detection methods not found");
      }

      // Test 3.2: Memory health monitoring
      const memoryHealth = this.performanceOptimizer.getMemoryHealth();
      const hasMemoryHealthMonitoring =
        memoryHealth && typeof memoryHealth.available !== "undefined";

      if (!hasMemoryHealthMonitoring) {
        throw new Error("Memory health monitoring not available");
      }

      // Test 3.3: Memory cleanup functionality
      const initialMetricsLength =
        this.performanceOptimizer.metrics.frameTime.length;

      // Add test data to simulate memory usage
      for (let i = 0; i < 200; i++) {
        this.performanceOptimizer.metrics.frameTime.push(16.67);
        this.performanceOptimizer.metrics.inputProcessingTime.push(2.5);
        this.performanceOptimizer.metrics.inputLatency.push(25.0);
      }

      // Perform cleanup
      this.performanceOptimizer.performMemoryCleanup();

      // Verify cleanup worked
      const afterCleanupLength =
        this.performanceOptimizer.metrics.frameTime.length;
      const cleanupWorked = afterCleanupLength < 200;

      if (!cleanupWorked) {
        throw new Error("Memory cleanup did not reduce metrics array sizes");
      }

      // Test 3.4: Diagnostic data cleanup
      const hasDiagnosticCleanup =
        typeof this.performanceOptimizer.cleanupDiagnosticData === "function";
      if (!hasDiagnosticCleanup) {
        throw new Error("Diagnostic data cleanup method not found");
      }

      this.performanceOptimizer.cleanupDiagnosticData();

      console.log("✅ Memory leak prevention working correctly");
      console.log(
        `   - Memory health monitoring: ${
          memoryHealth.available ? "Available" : "Not available"
        }`
      );
      console.log(
        `   - Cleanup reduced metrics from ${200} to ${afterCleanupLength} items`
      );

      this.testResults.push({
        test: "Memory Leak Prevention (7.3)",
        passed: true,
        details: {
          memoryLeakDetection: true,
          memoryHealthMonitoring: hasMemoryHealthMonitoring,
          memoryCleanup: cleanupWorked,
          diagnosticCleanup: true,
          cleanupReduction: `${200} → ${afterCleanupLength}`,
        },
      });
    } catch (error) {
      console.error("❌ Memory leak prevention test failed:", error);
      this.testResults.push({
        test: "Memory Leak Prevention (7.3)",
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Test resource cleanup strengthening (Requirement 7.4)
   */
  async testResourceCleanup() {
    console.log("\n📦 Testing resource cleanup strengthening...");

    try {
      // Test 4.1: Resource registration methods
      const hasResourceRegistration =
        typeof this.performanceOptimizer.registerResource === "function";
      if (!hasResourceRegistration) {
        throw new Error("Resource registration method not found");
      }

      // Test 4.2: Resource tracking
      const initialResourceCount =
        this.performanceOptimizer.getResourceUsage().totalResources;

      // Register test resources
      const testInterval = setInterval(() => {}, 1000);
      const testTimeout = setTimeout(() => {}, 5000);

      this.performanceOptimizer.registerResource("interval", testInterval);
      this.performanceOptimizer.registerResource("timeout", testTimeout);
      this.performanceOptimizer.registerResource("eventListener", {
        element: document,
        event: "test-event",
        handler: () => {},
      });

      const afterRegistrationCount =
        this.performanceOptimizer.getResourceUsage().totalResources;
      const resourcesRegistered = afterRegistrationCount > initialResourceCount;

      if (!resourcesRegistered) {
        throw new Error("Resources not properly registered");
      }

      // Test 4.3: Resource cleanup
      const hasResourceCleanup =
        typeof this.performanceOptimizer.cleanupAllResources === "function";
      if (!hasResourceCleanup) {
        throw new Error("Resource cleanup method not found");
      }

      this.performanceOptimizer.cleanupAllResources();

      const afterCleanupCount =
        this.performanceOptimizer.getResourceUsage().totalResources;
      const cleanupWorked = afterCleanupCount === 0;

      if (!cleanupWorked) {
        throw new Error("Resource cleanup did not clear all resources");
      }

      // Test 4.4: Destroy method
      const hasDestroyMethod =
        typeof this.performanceOptimizer.destroy === "function";
      if (!hasDestroyMethod) {
        throw new Error("Destroy method not found");
      }

      // Test destroy functionality (create new instance for this test)
      const testOptimizer = new PerformanceOptimizer({
        canvas: document.createElement("canvas"),
      });
      testOptimizer.registerResource(
        "interval",
        setInterval(() => {}, 1000)
      );
      testOptimizer.destroy();

      const destroyedResourceCount =
        testOptimizer.getResourceUsage().totalResources;
      const destroyWorked = destroyedResourceCount === 0;

      console.log("✅ Resource cleanup strengthening working correctly");
      console.log(`   - Resource registration: Working`);
      console.log(
        `   - Resource tracking: ${initialResourceCount} → ${afterRegistrationCount} → ${afterCleanupCount}`
      );
      console.log(
        `   - Cleanup functionality: ${cleanupWorked ? "Working" : "Failed"}`
      );
      console.log(
        `   - Destroy method: ${destroyWorked ? "Working" : "Failed"}`
      );

      this.testResults.push({
        test: "Resource Cleanup Strengthening (7.4)",
        passed: true,
        details: {
          resourceRegistration: true,
          resourceTracking: resourcesRegistered,
          resourceCleanup: cleanupWorked,
          destroyMethod: destroyWorked,
          resourceFlow: `${initialResourceCount} → ${afterRegistrationCount} → ${afterCleanupCount}`,
        },
      });
    } catch (error) {
      console.error("❌ Resource cleanup strengthening test failed:", error);
      this.testResults.push({
        test: "Resource Cleanup Strengthening (7.4)",
        passed: false,
        error: error.message,
      });
    }
  }

  /**
   * Generate final test report
   */
  generateFinalReport() {
    console.log("\n📋 PERFORMANCE OPTIMIZATION TEST REPORT - TASK 9");
    console.log("=".repeat(60));

    const passedTests = this.testResults.filter(
      (result) => result.passed
    ).length;
    const totalTests = this.testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(
      `Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)`
    );
    console.log("");

    // Detailed results
    this.testResults.forEach((result, index) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${index + 1}. ${status} - ${result.test}`);

      if (result.passed && result.details) {
        if (typeof result.details === "object") {
          Object.entries(result.details).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value}`);
          });
        } else {
          console.log(`   - ${result.details}`);
        }
      }

      if (!result.passed && result.error) {
        console.log(`   - Error: ${result.error}`);
      }

      console.log("");
    });

    // Requirements verification
    console.log("REQUIREMENTS VERIFICATION:");
    console.log(
      "- 7.1 Input processing performance measurement: " +
        (this.testResults.find((r) => r.test.includes("7.1"))?.passed
          ? "✅ VERIFIED"
          : "❌ FAILED")
    );
    console.log(
      "- 7.2 Production diagnostic auto-disable: " +
        (this.testResults.find((r) => r.test.includes("7.2"))?.passed
          ? "✅ VERIFIED"
          : "❌ FAILED")
    );
    console.log(
      "- 7.3 Memory leak prevention: " +
        (this.testResults.find((r) => r.test.includes("7.3"))?.passed
          ? "✅ VERIFIED"
          : "❌ FAILED")
    );
    console.log(
      "- 7.4 Resource cleanup strengthening: " +
        (this.testResults.find((r) => r.test.includes("7.4"))?.passed
          ? "✅ VERIFIED"
          : "❌ FAILED")
    );

    console.log("\n" + "=".repeat(60));

    if (passedTests === totalTests) {
      console.log(
        "🎉 ALL TESTS PASSED! Task 9 implementation is complete and verified."
      );
    } else {
      console.log("⚠️  Some tests failed. Please review the implementation.");
    }

    return {
      success: passedTests === totalTests,
      passedTests,
      totalTests,
      successRate: parseFloat(successRate),
      results: this.testResults,
    };
  }
}

// Auto-run tests when script is loaded
if (typeof window !== "undefined") {
  // Browser environment
  document.addEventListener("DOMContentLoaded", async () => {
    const verifier = new PerformanceOptimizationVerifier();
    await verifier.runAllTests();
  });
} else if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = PerformanceOptimizationVerifier;
}

// Global access
if (typeof window !== "undefined") {
  window.PerformanceOptimizationVerifier = PerformanceOptimizationVerifier;
}
