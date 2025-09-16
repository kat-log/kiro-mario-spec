/**
 * Jump Diagnostic System Verification Script
 * Tests all functionality of the JumpDiagnosticSystem class
 */

class JumpDiagnosticSystemVerifier {
  constructor() {
    this.testResults = [];
    this.mockPlayer = null;
    this.mockInputManager = null;
    this.diagnosticSystem = null;
  }

  /**
   * Run all verification tests
   */
  async runAllTests() {
    console.log("🔍 Starting Jump Diagnostic System Verification...\n");

    this.setupMockObjects();
    this.testSystemInitialization();
    this.testJumpAttemptRecording();
    this.testReportGeneration();
    this.testFailureAnalysis();
    this.testRecommendationGeneration();
    this.testPerformanceMetrics();
    this.testRealTimeDisplay();
    this.testDataManagement();
    this.testExportFunctionality();

    this.displayResults();
    return this.testResults;
  }

  /**
   * Setup mock objects for testing
   */
  setupMockObjects() {
    // Mock Player object
    this.mockPlayer = {
      position: { x: 100, y: 400 },
      velocity: { x: 0, y: 0 },
      isOnGround: true,
      lastGroundContact: performance.now(),
      size: { width: 32, height: 32 },
    };

    // Mock InputManager object
    this.mockInputManager = {
      keyStates: new Map(),
      getInputState: () => ({ jump: false, moveLeft: false, moveRight: false }),
    };

    // Create diagnostic system
    this.diagnosticSystem = new JumpDiagnosticSystem(
      this.mockPlayer,
      this.mockInputManager
    );
  }

  /**
   * Test system initialization
   */
  testSystemInitialization() {
    const testName = "System Initialization";

    try {
      // Test basic properties
      const hasPlayer = this.diagnosticSystem.player === this.mockPlayer;
      const hasInputManager =
        this.diagnosticSystem.inputManager === this.mockInputManager;
      const hasJumpAttempts = Array.isArray(this.diagnosticSystem.jumpAttempts);
      const hasDisplayElement = this.diagnosticSystem.displayElement !== null;
      const isRecording = this.diagnosticSystem.isRecording === true;

      const passed =
        hasPlayer &&
        hasInputManager &&
        hasJumpAttempts &&
        hasDisplayElement &&
        isRecording;

      this.addTestResult(testName, passed, {
        hasPlayer,
        hasInputManager,
        hasJumpAttempts,
        hasDisplayElement,
        isRecording,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test jump attempt recording
   */
  testJumpAttemptRecording() {
    const testName = "Jump Attempt Recording";

    try {
      const initialCount = this.diagnosticSystem.jumpAttempts.length;

      // Record a successful jump attempt
      this.diagnosticSystem.recordJumpAttempt(
        true, // inputDetected
        { isOnGround: true, confidence: 1.0 }, // groundState
        true, // jumpExecuted
        "Success"
      );

      // Record a failed jump attempt
      this.diagnosticSystem.recordJumpAttempt(
        true, // inputDetected
        { isOnGround: false, confidence: 0.2 }, // groundState
        false, // jumpExecuted
        "Not on ground"
      );

      const finalCount = this.diagnosticSystem.jumpAttempts.length;
      const recordedCorrectly = finalCount === initialCount + 2;

      // Check data structure
      const lastAttempt = this.diagnosticSystem.jumpAttempts[finalCount - 1];
      const hasRequiredFields =
        lastAttempt.timestamp &&
        lastAttempt.inputDetected !== undefined &&
        lastAttempt.jumpExecuted !== undefined &&
        lastAttempt.reason !== undefined;

      const passed = recordedCorrectly && hasRequiredFields;

      this.addTestResult(testName, passed, {
        initialCount,
        finalCount,
        recordedCorrectly,
        hasRequiredFields,
        lastAttempt,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test report generation
   */
  testReportGeneration() {
    const testName = "Report Generation";

    try {
      const report = this.diagnosticSystem.generateJumpDiagnosticReport();

      const hasBasicFields =
        report.totalAttempts !== undefined &&
        report.successfulJumps !== undefined &&
        report.failedJumps !== undefined &&
        report.successRate !== undefined;

      const hasAnalysis =
        Array.isArray(report.commonFailureReasons) &&
        Array.isArray(report.recommendations);

      const hasPerformanceMetrics = report.performanceMetrics !== undefined;

      const hasDetailedAnalysis = report.detailedAnalysis !== undefined;

      const passed =
        hasBasicFields &&
        hasAnalysis &&
        hasPerformanceMetrics &&
        hasDetailedAnalysis;

      this.addTestResult(testName, passed, {
        hasBasicFields,
        hasAnalysis,
        hasPerformanceMetrics,
        hasDetailedAnalysis,
        report,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test failure analysis
   */
  testFailureAnalysis() {
    const testName = "Failure Analysis";

    try {
      // Add some failed attempts with different reasons
      this.diagnosticSystem.recordJumpAttempt(
        true,
        { isOnGround: false },
        false,
        "Not on ground"
      );
      this.diagnosticSystem.recordJumpAttempt(
        true,
        { isOnGround: false },
        false,
        "Not on ground"
      );
      this.diagnosticSystem.recordJumpAttempt(
        true,
        { isOnGround: true },
        false,
        "Input not detected"
      );

      const failedAttempts = this.diagnosticSystem.jumpAttempts.filter(
        (a) => !a.jumpExecuted
      );
      const analysis =
        this.diagnosticSystem.analyzeFailureReasons(failedAttempts);

      const hasReasons = analysis.length > 0;
      const hasCorrectStructure = analysis.every(
        (item) =>
          item.reason &&
          item.count !== undefined &&
          item.percentage !== undefined
      );
      const isSortedByFrequency =
        analysis.length <= 1 || analysis[0].count >= analysis[1].count;

      const passed = hasReasons && hasCorrectStructure && isSortedByFrequency;

      this.addTestResult(testName, passed, {
        failedAttemptsCount: failedAttempts.length,
        analysisCount: analysis.length,
        hasReasons,
        hasCorrectStructure,
        isSortedByFrequency,
        analysis,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test recommendation generation
   */
  testRecommendationGeneration() {
    const testName = "Recommendation Generation";

    try {
      const failedAttempts = this.diagnosticSystem.jumpAttempts.filter(
        (a) => !a.jumpExecuted
      );
      const recommendations =
        this.diagnosticSystem.generateRecommendations(failedAttempts);

      const hasRecommendations =
        Array.isArray(recommendations) && recommendations.length > 0;
      const hasCorrectStructure = recommendations.every(
        (rec) =>
          rec.issue && rec.suggestion && rec.priority && rec.technicalDetails
      );
      const hasPriorityLevels = recommendations.some((rec) =>
        ["high", "medium", "low"].includes(rec.priority)
      );

      const passed =
        hasRecommendations && hasCorrectStructure && hasPriorityLevels;

      this.addTestResult(testName, passed, {
        recommendationCount: recommendations.length,
        hasRecommendations,
        hasCorrectStructure,
        hasPriorityLevels,
        recommendations,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test performance metrics calculation
   */
  testPerformanceMetrics() {
    const testName = "Performance Metrics";

    try {
      // Add some attempts with timing data
      const attempts = [
        {
          inputDetected: true,
          jumpExecuted: true,
          frameInfo: { deltaTime: 16.67 },
        },
        {
          inputDetected: true,
          jumpExecuted: true,
          frameInfo: { deltaTime: 20.0 },
        },
        {
          inputDetected: true,
          jumpExecuted: false,
          frameInfo: { deltaTime: 16.67 },
        },
      ];

      const metrics =
        this.diagnosticSystem.calculatePerformanceMetrics(attempts);

      const hasAverageResponseTime = metrics.averageResponseTime !== undefined;
      const hasMaxResponseTime = metrics.maxResponseTime !== undefined;
      const hasMinResponseTime = metrics.minResponseTime !== undefined;
      const hasFrameDrops = metrics.frameDrops !== undefined;

      const passed =
        hasAverageResponseTime &&
        hasMaxResponseTime &&
        hasMinResponseTime &&
        hasFrameDrops;

      this.addTestResult(testName, passed, {
        hasAverageResponseTime,
        hasMaxResponseTime,
        hasMinResponseTime,
        hasFrameDrops,
        metrics,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test real-time display functionality
   */
  testRealTimeDisplay() {
    const testName = "Real-time Display";

    try {
      const initialVisibility = this.diagnosticSystem.isDisplayVisible;

      // Test toggle functionality
      this.diagnosticSystem.toggleDisplay();
      const afterToggle = this.diagnosticSystem.isDisplayVisible;

      this.diagnosticSystem.toggleDisplay();
      const afterSecondToggle = this.diagnosticSystem.isDisplayVisible;

      // Test display element exists
      const hasDisplayElement = this.diagnosticSystem.displayElement !== null;
      const displayElementInDOM = document.body.contains(
        this.diagnosticSystem.displayElement
      );

      // Test update functionality
      this.diagnosticSystem.updateRealTimeDisplay();

      const toggleWorks =
        initialVisibility !== afterToggle &&
        afterSecondToggle === initialVisibility;

      const passed = hasDisplayElement && displayElementInDOM && toggleWorks;

      this.addTestResult(testName, passed, {
        initialVisibility,
        afterToggle,
        afterSecondToggle,
        hasDisplayElement,
        displayElementInDOM,
        toggleWorks,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test data management functionality
   */
  testDataManagement() {
    const testName = "Data Management";

    try {
      const initialCount = this.diagnosticSystem.jumpAttempts.length;

      // Test recording toggle
      this.diagnosticSystem.setRecording(false);
      this.diagnosticSystem.recordJumpAttempt(
        true,
        { isOnGround: true },
        true,
        "Test"
      );
      const countAfterDisabled = this.diagnosticSystem.jumpAttempts.length;

      this.diagnosticSystem.setRecording(true);
      this.diagnosticSystem.recordJumpAttempt(
        true,
        { isOnGround: true },
        true,
        "Test"
      );
      const countAfterEnabled = this.diagnosticSystem.jumpAttempts.length;

      // Test data clearing
      this.diagnosticSystem.clearDiagnosticData();
      const countAfterClear = this.diagnosticSystem.jumpAttempts.length;

      const recordingToggleWorks =
        countAfterDisabled === initialCount &&
        countAfterEnabled > countAfterDisabled;
      const clearingWorks = countAfterClear === 0;

      const passed = recordingToggleWorks && clearingWorks;

      this.addTestResult(testName, passed, {
        initialCount,
        countAfterDisabled,
        countAfterEnabled,
        countAfterClear,
        recordingToggleWorks,
        clearingWorks,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Test export functionality
   */
  testExportFunctionality() {
    const testName = "Export Functionality";

    try {
      // Add some test data
      this.diagnosticSystem.recordJumpAttempt(
        true,
        { isOnGround: true },
        true,
        "Success"
      );

      const exportData = this.diagnosticSystem.exportDiagnosticReport();

      const hasReport = exportData.report !== undefined;
      const hasRawData = Array.isArray(exportData.rawData);
      const hasSystemInfo = exportData.systemInfo !== undefined;
      const hasUserAgent =
        exportData.systemInfo && exportData.systemInfo.userAgent !== undefined;
      const hasTimestamp =
        exportData.systemInfo && exportData.systemInfo.timestamp !== undefined;

      // Test localStorage saving
      const savedData = localStorage.getItem("jump-diagnostic-report");
      const savedSuccessfully = savedData !== null;

      const passed =
        hasReport &&
        hasRawData &&
        hasSystemInfo &&
        hasUserAgent &&
        hasTimestamp &&
        savedSuccessfully;

      this.addTestResult(testName, passed, {
        hasReport,
        hasRawData,
        hasSystemInfo,
        hasUserAgent,
        hasTimestamp,
        savedSuccessfully,
        exportData,
      });
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
    }
  }

  /**
   * Add test result
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
   * Display test results
   */
  displayResults() {
    const passedTests = this.testResults.filter((t) => t.passed).length;
    const totalTests = this.testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`\n📊 Jump Diagnostic System Verification Results:`);
    console.log(`✅ Passed: ${passedTests}/${totalTests} (${successRate}%)\n`);

    this.testResults.forEach((test) => {
      const icon = test.passed ? "✅" : "❌";
      console.log(`${icon} ${test.name}`);

      if (!test.passed) {
        console.log(`   Details:`, test.details);
      }
    });

    if (passedTests === totalTests) {
      console.log(
        `\n🎉 All tests passed! Jump Diagnostic System is working correctly.`
      );
    } else {
      console.log(`\n⚠️  Some tests failed. Please review the implementation.`);
    }

    return {
      totalTests,
      passedTests,
      successRate,
      allPassed: passedTests === totalTests,
    };
  }
}

// Auto-run verification if this script is loaded directly
if (typeof window !== "undefined" && window.JumpDiagnosticSystem) {
  const verifier = new JumpDiagnosticSystemVerifier();
  verifier.runAllTests().then((results) => {
    console.log("Jump Diagnostic System verification completed.");
  });
}

// Export for use in other contexts
if (typeof module !== "undefined" && module.exports) {
  module.exports = JumpDiagnosticSystemVerifier;
}
