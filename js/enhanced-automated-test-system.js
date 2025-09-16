/**
 * Enhanced Automated Test System for Space Key Jump Functionality
 * スペースキージャンプ機能の強化された自動テストシステム
 *
 * Requirements: 5.3, 5.4
 * - ジャンプ機能の自動テストスイートを作成
 * - 様々な状況でのジャンプ動作を自動検証
 * - テスト結果の詳細レポート生成機能を実装
 * - 回帰テスト用のベンチマーク機能を追加
 */

class EnhancedAutomatedTestSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.inputManager = gameEngine.inputManager;
    this.player = gameEngine.player;
    this.diagnosticSystem = gameEngine.inputDiagnosticSystem;

    // テスト結果とベンチマークデータ
    this.testResults = [];
    this.benchmarkData = [];
    this.regressionBaseline = null;
    this.testHistory = [];

    // 強化されたテスト設定
    this.testConfig = {
      simulationDelay: 50,
      verificationTimeout: 2000,
      maxRetries: 5,
      testIterations: 20,
      benchmarkIterations: 50,
      performanceThresholds: {
        maxLatency: 100, // ms
        minSuccessRate: 95, // %
        maxMemoryUsage: 50, // MB
        maxFrameDrops: 5, // frames
      },
      regressionThresholds: {
        successRateDecrease: 5, // %
        latencyIncrease: 20, // ms
        memoryIncrease: 10, // MB
      },
    };

    // テスト状態管理
    this.testState = {
      isRunning: false,
      currentSuite: null,
      currentTest: null,
      startTime: 0,
      totalTests: 0,
      completedTests: 0,
      progressCallback: null,
    };

    // パフォーマンス監視
    this.performanceMonitor = {
      startTime: 0,
      memoryUsage: [],
      frameDrops: 0,
      latencyMeasurements: [],
      cpuUsage: [],
    };

    console.log("EnhancedAutomatedTestSystem initialized");
  }

  /**
   * 包括的なジャンプテストスイートを実行
   * Requirements: 8.1, 8.2
   */
  async runComprehensiveJumpTests(progressCallback = null) {
    console.log("🚀 Starting comprehensive jump test suite...");

    this.testState.isRunning = true;
    this.testState.progressCallback = progressCallback;
    this.testState.startTime = performance.now();

    const testSuite = {
      name: "Comprehensive Jump Test Suite",
      version: "2.0.0",
      timestamp: Date.now(),
      testCategories: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        skipped: 0,
        duration: 0,
        successRate: 0,
      },
      performance: {
        averageLatency: 0,
        maxLatency: 0,
        memoryUsage: 0,
        frameDrops: 0,
      },
      environment: this.captureEnvironmentInfo(),
    };

    try {
      // 1. 基本機能テスト
      const basicTests = await this.runBasicFunctionalityTests();
      testSuite.testCategories.push(basicTests);

      // 2. エッジケーステスト
      const edgeCaseTests = await this.runEdgeCaseTests();
      testSuite.testCategories.push(edgeCaseTests);

      // 3. パフォーマンステスト
      const performanceTests = await this.runPerformanceTests();
      testSuite.testCategories.push(performanceTests);

      // 4. ストレステスト
      const stressTests = await this.runStressTests();
      testSuite.testCategories.push(stressTests);

      // 5. ブラウザ互換性テスト
      const compatibilityTests = await this.runBrowserCompatibilityTests();
      testSuite.testCategories.push(compatibilityTests);

      // 6. 回帰テスト
      const regressionTests = await this.runRegressionTests();
      testSuite.testCategories.push(regressionTests);

      // サマリーを計算
      this.calculateTestSummary(testSuite);

      // パフォーマンスメトリクスを計算
      this.calculatePerformanceMetrics(testSuite);

      testSuite.summary.duration = performance.now() - this.testState.startTime;

      this.testResults.push(testSuite);
      this.generateDetailedReport(testSuite);

      console.log(
        `✅ Comprehensive test suite completed in ${testSuite.summary.duration.toFixed(
          0
        )}ms`
      );
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      testSuite.error = error.message;
      testSuite.summary.errors++;
    } finally {
      this.testState.isRunning = false;
    }

    return testSuite;
  }

  /**
   * 基本機能テストを実行
   */
  async runBasicFunctionalityTests() {
    const category = {
      name: "Basic Functionality Tests",
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    const tests = [
      { name: "Space Key Detection", fn: () => this.testSpaceKeyDetection() },
      {
        name: "Jump Execution on Ground",
        fn: () => this.testJumpExecutionOnGround(),
      },
      {
        name: "Jump Prevention in Air",
        fn: () => this.testJumpPreventionInAir(),
      },
      {
        name: "Jump Prevention While Blocking",
        fn: () => this.testJumpPreventionWhileBlocking(),
      },
      {
        name: "Velocity Change Verification",
        fn: () => this.testVelocityChangeVerification(),
      },
      {
        name: "Ground State Management",
        fn: () => this.testGroundStateManagement(),
      },
      { name: "Animation State Sync", fn: () => this.testAnimationStateSync() },
      { name: "Sound Effect Trigger", fn: () => this.testSoundEffectTrigger() },
    ];

    for (const test of tests) {
      await this.executeTest(category, test.name, test.fn);
      this.updateProgress();
    }

    return category;
  }

  /**
   * エッジケーステストを実行
   */
  async runEdgeCaseTests() {
    const category = {
      name: "Edge Case Tests",
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    const tests = [
      {
        name: "Jump at Platform Edge",
        fn: () => this.testJumpAtPlatformEdge(),
      },
      { name: "Rapid Key Presses", fn: () => this.testRapidKeyPresses() },
      {
        name: "Jump During Collision",
        fn: () => this.testJumpDuringCollision(),
      },
      {
        name: "Jump with Low Frame Rate",
        fn: () => this.testJumpWithLowFrameRate(),
      },
      {
        name: "Jump After Focus Loss",
        fn: () => this.testJumpAfterFocusLoss(),
      },
      {
        name: "Jump with Modified Physics",
        fn: () => this.testJumpWithModifiedPhysics(),
      },
      {
        name: "Jump Near Stage Boundaries",
        fn: () => this.testJumpNearStageBoundaries(),
      },
      {
        name: "Jump with High Velocity",
        fn: () => this.testJumpWithHighVelocity(),
      },
    ];

    for (const test of tests) {
      await this.executeTest(category, test.name, test.fn);
      this.updateProgress();
    }

    return category;
  }

  /**
   * パフォーマンステストを実行
   */
  async runPerformanceTests() {
    const category = {
      name: "Performance Tests",
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    const tests = [
      {
        name: "Input Latency Measurement",
        fn: () => this.testInputLatencyMeasurement(),
      },
      {
        name: "Memory Usage During Tests",
        fn: () => this.testMemoryUsageDuringTests(),
      },
      { name: "Frame Rate Impact", fn: () => this.testFrameRateImpact() },
      { name: "CPU Usage Monitoring", fn: () => this.testCPUUsageMonitoring() },
      {
        name: "Garbage Collection Impact",
        fn: () => this.testGarbageCollectionImpact(),
      },
      {
        name: "Event Handler Performance",
        fn: () => this.testEventHandlerPerformance(),
      },
    ];

    for (const test of tests) {
      await this.executeTest(category, test.name, test.fn);
      this.updateProgress();
    }

    return category;
  }

  /**
   * ストレステストを実行
   */
  async runStressTests() {
    const category = {
      name: "Stress Tests",
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    const tests = [
      {
        name: "Continuous Jump Attempts",
        fn: () => this.testContinuousJumpAttempts(),
      },
      { name: "High Frequency Input", fn: () => this.testHighFrequencyInput() },
      {
        name: "Long Duration Testing",
        fn: () => this.testLongDurationTesting(),
      },
      {
        name: "Memory Leak Detection",
        fn: () => this.testMemoryLeakDetection(),
      },
      { name: "Resource Exhaustion", fn: () => this.testResourceExhaustion() },
    ];

    for (const test of tests) {
      await this.executeTest(category, test.name, test.fn);
      this.updateProgress();
    }

    return category;
  }

  /**
   * ブラウザ互換性テストを実行
   */
  async runBrowserCompatibilityTests() {
    const category = {
      name: "Browser Compatibility Tests",
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    const tests = [
      {
        name: "KeyEvent Compatibility",
        fn: () => this.testKeyEventCompatibility(),
      },
      { name: "Focus Management", fn: () => this.testFocusManagement() },
      {
        name: "Event Timing Consistency",
        fn: () => this.testEventTimingConsistency(),
      },
      {
        name: "Touch Device Fallback",
        fn: () => this.testTouchDeviceFallback(),
      },
      {
        name: "Accessibility Features",
        fn: () => this.testAccessibilityFeatures(),
      },
    ];

    for (const test of tests) {
      await this.executeTest(category, test.name, test.fn);
      this.updateProgress();
    }

    return category;
  }

  /**
   * 回帰テストを実行
   * Requirements: 8.3, 8.4
   */
  async runRegressionTests() {
    const category = {
      name: "Regression Tests",
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
      regressionDetected: false,
      baselineComparison: null,
    };

    // ベースラインとの比較
    if (this.regressionBaseline) {
      category.baselineComparison = await this.compareWithBaseline();
    }

    const tests = [
      {
        name: "Baseline Functionality",
        fn: () => this.testBaselineFunctionality(),
      },
      {
        name: "Performance Regression",
        fn: () => this.testPerformanceRegression(),
      },
      {
        name: "Memory Usage Regression",
        fn: () => this.testMemoryUsageRegression(),
      },
      {
        name: "Success Rate Regression",
        fn: () => this.testSuccessRateRegression(),
      },
      { name: "Latency Regression", fn: () => this.testLatencyRegression() },
    ];

    for (const test of tests) {
      await this.executeTest(category, test.name, test.fn);
      this.updateProgress();
    }

    // 回帰検出の判定
    category.regressionDetected = this.detectRegression(category);

    return category;
  }

  /**
   * ベンチマーク機能を実装
   * Requirements: 8.4
   */
  async runBenchmarkSuite() {
    console.log("📊 Running benchmark suite...");

    const benchmark = {
      name: "Jump Functionality Benchmark",
      version: "1.0.0",
      timestamp: Date.now(),
      environment: this.captureEnvironmentInfo(),
      metrics: {},
      comparisons: [],
      recommendations: [],
    };

    try {
      // 1. レイテンシーベンチマーク
      benchmark.metrics.latency = await this.benchmarkLatency();

      // 2. スループットベンチマーク
      benchmark.metrics.throughput = await this.benchmarkThroughput();

      // 3. 成功率ベンチマーク
      benchmark.metrics.successRate = await this.benchmarkSuccessRate();

      // 4. メモリ使用量ベンチマーク
      benchmark.metrics.memoryUsage = await this.benchmarkMemoryUsage();

      // 5. CPU使用率ベンチマーク
      benchmark.metrics.cpuUsage = await this.benchmarkCPUUsage();

      // 過去のベンチマークとの比較
      if (this.benchmarkData.length > 0) {
        benchmark.comparisons = this.compareBenchmarks(benchmark);
      }

      // パフォーマンス推奨事項の生成
      benchmark.recommendations =
        this.generatePerformanceRecommendations(benchmark);

      this.benchmarkData.push(benchmark);
      this.generateBenchmarkReport(benchmark);

      console.log("✅ Benchmark suite completed");
    } catch (error) {
      console.error("❌ Benchmark suite failed:", error);
      benchmark.error = error.message;
    }

    return benchmark;
  }

  /**
   * 詳細なテストレポートを生成
   * Requirements: 8.3
   */
  generateDetailedReport(testSuite) {
    const report = {
      metadata: {
        testSuite: testSuite.name,
        version: testSuite.version,
        timestamp: testSuite.timestamp,
        duration: testSuite.summary.duration,
        environment: testSuite.environment,
      },
      summary: {
        overview: this.generateSummaryOverview(testSuite),
        statistics: this.generateStatistics(testSuite),
        trends: this.generateTrends(testSuite),
      },
      categories: testSuite.testCategories.map((category) => ({
        name: category.name,
        summary: category.summary,
        failedTests: category.tests.filter((test) => !test.success),
        recommendations: this.generateCategoryRecommendations(category),
      })),
      performance: {
        metrics: testSuite.performance,
        analysis: this.analyzePerformance(testSuite.performance),
        bottlenecks: this.identifyBottlenecks(testSuite),
      },
      recommendations: {
        immediate: this.generateImmediateRecommendations(testSuite),
        longTerm: this.generateLongTermRecommendations(testSuite),
        optimization: this.generateOptimizationRecommendations(testSuite),
      },
      regression: {
        detected: this.detectRegression(testSuite),
        analysis: this.analyzeRegression(testSuite),
        impact: this.assessRegressionImpact(testSuite),
      },
    };

    // レポートをローカルストレージに保存
    this.saveReportToStorage(report);

    // コンソールに要約を出力
    this.logReportSummary(report);

    return report;
  }

  /**
   * 個別テスト実装
   */

  async testSpaceKeyDetection() {
    const result = { success: false, message: "", details: {} };

    try {
      // キー検出のテスト
      const detectionResults = [];

      for (let i = 0; i < 5; i++) {
        const detected = await this.simulateAndDetectSpaceKey();
        detectionResults.push(detected);
        await this.sleep(100);
      }

      const detectionRate =
        (detectionResults.filter((d) => d).length / detectionResults.length) *
        100;

      if (detectionRate >= 100) {
        result.success = true;
        result.message = "Space key detection working perfectly";
      } else if (detectionRate >= 80) {
        result.success = true;
        result.message = `Space key detection mostly working (${detectionRate}%)`;
      } else {
        result.message = `Space key detection unreliable (${detectionRate}%)`;
      }

      result.details = { detectionRate, detectionResults };
    } catch (error) {
      result.message = `Test failed: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  async testJumpExecutionOnGround() {
    const result = { success: false, message: "", details: {} };

    try {
      // プレイヤーを地面に確実に配置
      this.setupPlayerOnGround();

      const initialState = this.capturePlayerState();

      // ジャンプを実行
      const jumpResult = await this.executeJumpTest();

      const finalState = this.capturePlayerState();

      // ジャンプが実行されたかチェック
      const jumpExecuted = this.verifyJumpExecution(initialState, finalState);

      if (jumpExecuted) {
        result.success = true;
        result.message = "Jump executed successfully on ground";
      } else {
        result.message = "Jump failed to execute on ground";
      }

      result.details = {
        initialState,
        finalState,
        jumpResult,
        jumpExecuted,
      };
    } catch (error) {
      result.message = `Test failed: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  async testInputLatencyMeasurement() {
    const result = { success: false, message: "", details: {} };

    try {
      const measurements = [];

      for (let i = 0; i < this.testConfig.benchmarkIterations; i++) {
        this.setupPlayerOnGround();

        const startTime = performance.now();
        await this.simulateSpaceKeyPress();
        const responseTime = performance.now() - startTime;

        measurements.push(responseTime);
        await this.sleep(50);
      }

      const avgLatency =
        measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxLatency = Math.max(...measurements);
      const minLatency = Math.min(...measurements);

      const acceptable =
        avgLatency <= this.testConfig.performanceThresholds.maxLatency;

      if (acceptable) {
        result.success = true;
        result.message = `Input latency acceptable: ${avgLatency.toFixed(
          1
        )}ms average`;
      } else {
        result.message = `Input latency too high: ${avgLatency.toFixed(
          1
        )}ms average`;
      }

      result.details = {
        measurements,
        avgLatency: avgLatency.toFixed(1),
        maxLatency: maxLatency.toFixed(1),
        minLatency: minLatency.toFixed(1),
        acceptable,
      };
    } catch (error) {
      result.message = `Test failed: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * ベンチマーク実装
   */

  async benchmarkLatency() {
    const measurements = [];

    for (let i = 0; i < this.testConfig.benchmarkIterations; i++) {
      this.setupPlayerOnGround();

      const startTime = performance.now();
      await this.simulateSpaceKeyPress();
      const latency = performance.now() - startTime;

      measurements.push(latency);
      await this.sleep(20);
    }

    return {
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      median: this.calculateMedian(measurements),
      p95: this.calculatePercentile(measurements, 95),
      p99: this.calculatePercentile(measurements, 99),
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      standardDeviation: this.calculateStandardDeviation(measurements),
    };
  }

  async benchmarkSuccessRate() {
    let successCount = 0;
    const totalTests = this.testConfig.benchmarkIterations;

    for (let i = 0; i < totalTests; i++) {
      this.setupPlayerOnGround();

      const initialState = this.capturePlayerState();
      await this.simulateSpaceKeyPress();
      const finalState = this.capturePlayerState();

      if (this.verifyJumpExecution(initialState, finalState)) {
        successCount++;
      }

      await this.sleep(50);
    }

    return {
      successRate: (successCount / totalTests) * 100,
      successCount,
      totalTests,
      failureRate: ((totalTests - successCount) / totalTests) * 100,
    };
  }

  /**
   * ユーティリティメソッド
   */

  setupPlayerOnGround() {
    if (this.player) {
      this.player.isOnGround = true;
      this.player.isBlocking = false;
      this.player.velocity.y = 0;
      this.player.position.y = 400; // 地面の高さ
    }
  }

  capturePlayerState() {
    if (!this.player) return null;

    return {
      position: { ...this.player.position },
      velocity: { ...this.player.velocity },
      isOnGround: this.player.isOnGround,
      isBlocking: this.player.isBlocking,
      state: this.player.state,
      timestamp: performance.now(),
    };
  }

  verifyJumpExecution(beforeState, afterState) {
    if (!beforeState || !afterState) return false;

    // 垂直速度が上向きに変化したかチェック
    const velocityChange = afterState.velocity.y - beforeState.velocity.y;
    return velocityChange < -5; // 上向きの速度変化
  }

  async simulateSpaceKeyPress() {
    const event = new KeyboardEvent("keydown", {
      code: "Space",
      key: " ",
      keyCode: 32,
      which: 32,
      bubbles: true,
      cancelable: true,
    });

    const target = document.querySelector("canvas") || document;
    target.dispatchEvent(event);

    await this.sleep(50);

    const upEvent = new KeyboardEvent("keyup", {
      code: "Space",
      key: " ",
      keyCode: 32,
      which: 32,
      bubbles: true,
      cancelable: true,
    });

    target.dispatchEvent(upEvent);
  }

  async simulateAndDetectSpaceKey() {
    let detected = false;

    const handler = (event) => {
      if (event.code === "Space") {
        detected = true;
      }
    };

    document.addEventListener("keydown", handler);
    await this.simulateSpaceKeyPress();
    document.removeEventListener("keydown", handler);

    return detected;
  }

  async executeTest(category, testName, testFunction) {
    const testResult = {
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
      const result = await testFunction();

      testResult.success = result.success;
      testResult.message = result.message;
      testResult.details = result.details;

      if (result.success) {
        category.summary.passed++;
      } else {
        category.summary.failed++;
      }
    } catch (error) {
      testResult.success = false;
      testResult.error = error.message;
      testResult.message = `Test execution failed: ${error.message}`;
      category.summary.errors++;
    }

    testResult.duration = performance.now() - startTime;
    category.summary.total++;
    category.tests.push(testResult);

    console.log(
      `  ${testResult.success ? "✅" : "❌"} ${testName}: ${testResult.message}`
    );
  }

  updateProgress() {
    this.testState.completedTests++;
    const progress =
      (this.testState.completedTests / this.testState.totalTests) * 100;

    if (this.testState.progressCallback) {
      this.testState.progressCallback(progress);
    }
  }

  calculateTestSummary(testSuite) {
    testSuite.summary.totalTests = 0;
    testSuite.summary.passed = 0;
    testSuite.summary.failed = 0;
    testSuite.summary.errors = 0;

    testSuite.testCategories.forEach((category) => {
      testSuite.summary.totalTests += category.summary.total;
      testSuite.summary.passed += category.summary.passed;
      testSuite.summary.failed += category.summary.failed;
      testSuite.summary.errors += category.summary.errors;
    });

    testSuite.summary.successRate =
      testSuite.summary.totalTests > 0
        ? (testSuite.summary.passed / testSuite.summary.totalTests) * 100
        : 0;
  }

  captureEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: Date.now(),
    };
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  calculateStandardDeviation(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
    const avgSquareDiff =
      squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 公開API
  async runFullTestSuite(progressCallback = null) {
    return await this.runComprehensiveJumpTests(progressCallback);
  }

  async runBenchmarks() {
    return await this.runBenchmarkSuite();
  }

  getTestHistory() {
    return this.testHistory;
  }

  getBenchmarkData() {
    return this.benchmarkData;
  }

  clearTestData() {
    this.testResults = [];
    this.benchmarkData = [];
    this.testHistory = [];
    console.log("Test data cleared");
  }

  // レポート保存とログ出力の実装は省略（実装済みのメソッドを参照）
  saveReportToStorage(report) {
    try {
      localStorage.setItem(
        `jumpTestReport_${Date.now()}`,
        JSON.stringify(report)
      );
    } catch (error) {
      console.warn("Failed to save report to storage:", error);
    }
  }

  logReportSummary(report) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 TEST REPORT SUMMARY`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Suite: ${report.metadata.testSuite}`);
    console.log(`Duration: ${report.metadata.duration.toFixed(0)}ms`);
    console.log(`Success Rate: ${report.summary.statistics.successRate}%`);
    console.log(`${"=".repeat(60)}`);
  }
}

// Export for use in main game
window.EnhancedAutomatedTestSystem = EnhancedAutomatedTestSystem;
