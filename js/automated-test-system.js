/**
 * Automated Test System for Space Key Jump Functionality
 * スペースキージャンプ機能の自動テストシステム
 */

class AutomatedTestSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.inputManager = gameEngine.inputManager;
    this.player = gameEngine.player;
    this.diagnosticSystem = gameEngine.inputDiagnosticSystem;

    // テスト結果の保存
    this.testResults = [];
    this.regressionResults = [];
    this.currentTestSuite = null;

    // テスト設定
    this.testConfig = {
      simulationDelay: 100, // キー押下シミュレーション間隔
      verificationTimeout: 1000, // 検証タイムアウト
      maxRetries: 3, // 最大リトライ回数
      testIterations: 10, // 各テストの反復回数
    };

    // シミュレーション状態
    this.simulationState = {
      isRunning: false,
      currentTest: null,
      testStartTime: 0,
      eventQueue: [],
    };

    console.log("AutomatedTestSystem initialized");
  }

  /**
   * スペースキー入力のシミュレーション機能を実装
   * Requirements: 8.1
   */
  async simulateSpaceKeyInput(options = {}) {
    const config = {
      duration: options.duration || 100,
      repeat: options.repeat || 1,
      interval: options.interval || 200,
      preventDefault: options.preventDefault !== false,
      bubbles: options.bubbles !== false,
      cancelable: options.cancelable !== false,
      ...options,
    };

    console.log(`🧪 Simulating space key input (${config.repeat} times)`);

    const results = {
      timestamp: Date.now(),
      config,
      events: [],
      success: true,
      errors: [],
    };

    try {
      // Canvas要素にフォーカスを設定
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.focus();
        await this.waitForFocus(canvas);
      }

      for (let i = 0; i < config.repeat; i++) {
        const iterationResult = await this.simulateSingleSpaceKeyPress(config);
        results.events.push(iterationResult);

        if (!iterationResult.success) {
          results.success = false;
          results.errors.push(
            `Iteration ${i + 1} failed: ${iterationResult.error}`
          );
        }

        // 次の反復まで待機
        if (i < config.repeat - 1) {
          await this.sleep(config.interval);
        }
      }
    } catch (error) {
      results.success = false;
      results.errors.push(`Simulation failed: ${error.message}`);
      console.error("Space key simulation error:", error);
    }

    console.log(
      `🧪 Space key simulation completed. Success: ${results.success}`
    );
    return results;
  }

  /**
   * 単一のスペースキー押下をシミュレート
   */
  async simulateSingleSpaceKeyPress(config) {
    const result = {
      timestamp: Date.now(),
      keydownEvent: null,
      keyupEvent: null,
      success: false,
      error: null,
      playerStateBeforeJump: null,
      playerStateAfterJump: null,
      jumpExecuted: false,
    };

    try {
      // プレイヤー状態を記録（ジャンプ前）
      if (this.player) {
        result.playerStateBeforeJump = {
          position: { ...this.player.position },
          velocity: { ...this.player.velocity },
          isOnGround: this.player.isOnGround,
          state: this.player.state,
        };
      }

      // KeyDownイベントを作成・発火
      const keydownEvent = new KeyboardEvent("keydown", {
        code: "Space",
        key: " ",
        keyCode: 32,
        which: 32,
        bubbles: config.bubbles,
        cancelable: config.cancelable,
        composed: true,
      });

      result.keydownEvent = {
        type: keydownEvent.type,
        code: keydownEvent.code,
        timestamp: performance.now(),
      };

      // イベントを発火
      const target = document.querySelector("canvas") || document;
      target.dispatchEvent(keydownEvent);

      // 短時間待機してキー処理を完了させる
      await this.sleep(config.duration);

      // KeyUpイベントを作成・発火
      const keyupEvent = new KeyboardEvent("keyup", {
        code: "Space",
        key: " ",
        keyCode: 32,
        which: 32,
        bubbles: config.bubbles,
        cancelable: config.cancelable,
        composed: true,
      });

      result.keyupEvent = {
        type: keyupEvent.type,
        code: keyupEvent.code,
        timestamp: performance.now(),
      };

      target.dispatchEvent(keyupEvent);

      // ジャンプ実行の検証のため少し待機
      await this.sleep(50);

      // プレイヤー状態を記録（ジャンプ後）
      if (this.player) {
        result.playerStateAfterJump = {
          position: { ...this.player.position },
          velocity: { ...this.player.velocity },
          isOnGround: this.player.isOnGround,
          state: this.player.state,
        };

        // ジャンプが実行されたかチェック
        result.jumpExecuted = this.detectJumpExecution(
          result.playerStateBeforeJump,
          result.playerStateAfterJump
        );
      }

      result.success = true;
    } catch (error) {
      result.error = error.message;
      result.success = false;
    }

    return result;
  }

  /**
   * ジャンプ動作の自動検証テストを作成
   * Requirements: 8.2
   */
  async runJumpVerificationTests() {
    console.log("🔍 Running jump verification tests...");

    const testSuite = {
      name: "Jump Verification Tests",
      timestamp: Date.now(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        errors: 0,
      },
    };

    // テスト1: 基本的なジャンプ機能
    await this.runTest(testSuite, "Basic Jump Functionality", async () => {
      return await this.testBasicJumpFunctionality();
    });

    // テスト2: 地面状態でのジャンプ
    await this.runTest(testSuite, "Jump on Ground", async () => {
      return await this.testJumpOnGround();
    });

    // テスト3: 空中でのジャンプ防止
    await this.runTest(testSuite, "Prevent Air Jump", async () => {
      return await this.testPreventAirJump();
    });

    // テスト4: 連続ジャンプの制御
    await this.runTest(testSuite, "Consecutive Jump Control", async () => {
      return await this.testConsecutiveJumpControl();
    });

    // テスト5: ブロック状態でのジャンプ防止
    await this.runTest(testSuite, "Prevent Jump While Blocking", async () => {
      return await this.testPreventJumpWhileBlocking();
    });

    // テスト6: フォーカス状態でのジャンプ
    await this.runTest(testSuite, "Jump with Focus", async () => {
      return await this.testJumpWithFocus();
    });

    // テスト7: 入力レイテンシー測定
    await this.runTest(testSuite, "Input Latency Measurement", async () => {
      return await this.testInputLatency();
    });

    // テスト8: 複数回ジャンプの一貫性
    await this.runTest(testSuite, "Multiple Jump Consistency", async () => {
      return await this.testMultipleJumpConsistency();
    });

    this.testResults.push(testSuite);
    this.logTestSuiteResults(testSuite);

    return testSuite;
  }

  /**
   * 回帰テスト用のテストスイートを構築
   * Requirements: 8.3, 8.4
   */
  async buildRegressionTestSuite() {
    console.log("🔄 Building regression test suite...");

    const regressionSuite = {
      name: "Space Key Jump Regression Tests",
      version: "1.0.0",
      timestamp: Date.now(),
      testSuites: [],
      baseline: null,
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        regressionDetected: false,
        performanceRegression: false,
      },
    };

    try {
      // 1. 機能回帰テスト
      const functionalTests = await this.runFunctionalRegressionTests();
      regressionSuite.testSuites.push(functionalTests);

      // 2. パフォーマンス回帰テスト
      const performanceTests = await this.runPerformanceRegressionTests();
      regressionSuite.testSuites.push(performanceTests);

      // 3. ブラウザ互換性回帰テスト
      const compatibilityTests = await this.runCompatibilityRegressionTests();
      regressionSuite.testSuites.push(compatibilityTests);

      // 4. エラーハンドリング回帰テスト
      const errorHandlingTests = await this.runErrorHandlingRegressionTests();
      regressionSuite.testSuites.push(errorHandlingTests);

      // サマリーを計算
      this.calculateRegressionSummary(regressionSuite);

      // ベースラインとの比較
      if (this.regressionResults.length > 0) {
        regressionSuite.baseline =
          this.regressionResults[this.regressionResults.length - 1];
        this.compareWithBaseline(regressionSuite);
      }

      this.regressionResults.push(regressionSuite);
      this.logRegressionResults(regressionSuite);
    } catch (error) {
      console.error("Regression test suite failed:", error);
      regressionSuite.error = error.message;
    }

    return regressionSuite;
  }

  /**
   * 基本的なジャンプ機能をテスト
   */
  async testBasicJumpFunctionality() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      // プレイヤーを地面に配置
      if (this.player) {
        this.player.isOnGround = true;
        this.player.isBlocking = false;
        this.player.velocity.y = 0;
      }

      // スペースキーをシミュレート
      const simulationResult = await this.simulateSpaceKeyInput({
        repeat: 1,
        duration: 100,
      });

      if (!simulationResult.success) {
        result.message = "Space key simulation failed";
        result.details = simulationResult;
        return result;
      }

      // ジャンプが実行されたかチェック
      const jumpExecuted = simulationResult.events[0]?.jumpExecuted;

      if (jumpExecuted) {
        result.success = true;
        result.message = "Basic jump functionality working correctly";
      } else {
        result.message = "Jump was not executed despite valid conditions";
      }

      result.details = {
        simulation: simulationResult,
        jumpExecuted,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * 地面状態でのジャンプをテスト
   */
  async testJumpOnGround() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      if (!this.player) {
        result.message = "Player not available for testing";
        return result;
      }

      // プレイヤーを確実に地面に配置
      this.player.isOnGround = true;
      this.player.isBlocking = false;
      this.player.velocity.y = 0;
      this.player.position.y = 400; // 地面の高さに設定

      const initialVelocityY = this.player.velocity.y;

      // スペースキーをシミュレート
      const simulationResult = await this.simulateSpaceKeyInput({
        repeat: 1,
        duration: 100,
      });

      // ジャンプ後の状態をチェック
      const finalVelocityY = this.player.velocity.y;
      const jumpExecuted = finalVelocityY < initialVelocityY; // 上向きの速度

      if (jumpExecuted) {
        result.success = true;
        result.message = "Jump executed successfully on ground";
      } else {
        result.message = "Jump failed to execute on ground";
      }

      result.details = {
        initialVelocityY,
        finalVelocityY,
        velocityChange: finalVelocityY - initialVelocityY,
        jumpExecuted,
        simulation: simulationResult,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * 空中でのジャンプ防止をテスト
   */
  async testPreventAirJump() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      if (!this.player) {
        result.message = "Player not available for testing";
        return result;
      }

      // プレイヤーを空中に配置
      this.player.isOnGround = false;
      this.player.isBlocking = false;
      this.player.velocity.y = 5; // 下向きの速度

      const initialVelocityY = this.player.velocity.y;

      // スペースキーをシミュレート
      const simulationResult = await this.simulateSpaceKeyInput({
        repeat: 1,
        duration: 100,
      });

      // ジャンプが実行されなかったことをチェック
      const finalVelocityY = this.player.velocity.y;
      const jumpPrevented = Math.abs(finalVelocityY - initialVelocityY) < 1; // 速度変化が小さい

      if (jumpPrevented) {
        result.success = true;
        result.message = "Air jump correctly prevented";
      } else {
        result.message = "Air jump was not prevented";
      }

      result.details = {
        initialVelocityY,
        finalVelocityY,
        velocityChange: finalVelocityY - initialVelocityY,
        jumpPrevented,
        simulation: simulationResult,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * 連続ジャンプの制御をテスト
   */
  async testConsecutiveJumpControl() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      if (!this.player) {
        result.message = "Player not available for testing";
        return result;
      }

      const jumpResults = [];

      // 複数回連続でジャンプを試行
      for (let i = 0; i < 3; i++) {
        // 最初のジャンプのみ地面に配置
        this.player.isOnGround = i === 0;
        this.player.isBlocking = false;

        if (i === 0) {
          this.player.velocity.y = 0;
        }

        const initialVelocityY = this.player.velocity.y;

        const simulationResult = await this.simulateSpaceKeyInput({
          repeat: 1,
          duration: 100,
        });

        const finalVelocityY = this.player.velocity.y;
        const jumpExecuted = finalVelocityY < initialVelocityY;

        jumpResults.push({
          attempt: i + 1,
          isOnGround: i === 0,
          initialVelocityY,
          finalVelocityY,
          jumpExecuted,
          simulation: simulationResult,
        });

        await this.sleep(200); // 次の試行まで待機
      }

      // 最初のジャンプのみ成功し、後続は失敗することを確認
      const firstJumpSuccess = jumpResults[0].jumpExecuted;
      const subsequentJumpsPrevented = jumpResults
        .slice(1)
        .every((r) => !r.jumpExecuted);

      if (firstJumpSuccess && subsequentJumpsPrevented) {
        result.success = true;
        result.message = "Consecutive jump control working correctly";
      } else {
        result.message = "Consecutive jump control failed";
      }

      result.details = {
        jumpResults,
        firstJumpSuccess,
        subsequentJumpsPrevented,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * ブロック状態でのジャンプ防止をテスト
   */
  async testPreventJumpWhileBlocking() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      if (!this.player) {
        result.message = "Player not available for testing";
        return result;
      }

      // プレイヤーを地面に配置してブロック状態にする
      this.player.isOnGround = true;
      this.player.isBlocking = true;
      this.player.velocity.y = 0;

      const initialVelocityY = this.player.velocity.y;

      // スペースキーをシミュレート
      const simulationResult = await this.simulateSpaceKeyInput({
        repeat: 1,
        duration: 100,
      });

      // ジャンプが実行されなかったことをチェック
      const finalVelocityY = this.player.velocity.y;
      const jumpPrevented = Math.abs(finalVelocityY - initialVelocityY) < 1;

      if (jumpPrevented) {
        result.success = true;
        result.message = "Jump correctly prevented while blocking";
      } else {
        result.message = "Jump was not prevented while blocking";
      }

      result.details = {
        initialVelocityY,
        finalVelocityY,
        velocityChange: finalVelocityY - initialVelocityY,
        jumpPrevented,
        simulation: simulationResult,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * フォーカス状態でのジャンプをテスト
   */
  async testJumpWithFocus() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      // Canvas要素のフォーカス状態をテスト
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        result.message = "Canvas element not found";
        return result;
      }

      // フォーカスを設定
      canvas.focus();
      await this.waitForFocus(canvas);

      const hasFocus = document.activeElement === canvas;

      if (!hasFocus) {
        result.message = "Failed to set focus on canvas";
        return result;
      }

      // プレイヤーを地面に配置
      if (this.player) {
        this.player.isOnGround = true;
        this.player.isBlocking = false;
        this.player.velocity.y = 0;
      }

      // スペースキーをシミュレート
      const simulationResult = await this.simulateSpaceKeyInput({
        repeat: 1,
        duration: 100,
      });

      const jumpExecuted = simulationResult.events[0]?.jumpExecuted;

      if (jumpExecuted) {
        result.success = true;
        result.message = "Jump executed successfully with proper focus";
      } else {
        result.message = "Jump failed despite proper focus";
      }

      result.details = {
        hasFocus,
        activeElement: document.activeElement?.tagName,
        jumpExecuted,
        simulation: simulationResult,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * 入力レイテンシーを測定
   */
  async testInputLatency() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      const latencyMeasurements = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        if (this.player) {
          this.player.isOnGround = true;
          this.player.isBlocking = false;
          this.player.velocity.y = 0;
        }

        const startTime = performance.now();

        const simulationResult = await this.simulateSpaceKeyInput({
          repeat: 1,
          duration: 50,
        });

        const endTime = performance.now();
        const latency = endTime - startTime;

        latencyMeasurements.push({
          iteration: i + 1,
          latency,
          jumpExecuted: simulationResult.events[0]?.jumpExecuted,
        });

        await this.sleep(200); // 次の測定まで待機
      }

      const averageLatency =
        latencyMeasurements.reduce((sum, m) => sum + m.latency, 0) / iterations;
      const maxLatency = Math.max(...latencyMeasurements.map((m) => m.latency));
      const minLatency = Math.min(...latencyMeasurements.map((m) => m.latency));

      // レイテンシーが許容範囲内かチェック（100ms以下）
      const acceptableLatency = averageLatency < 100;

      if (acceptableLatency) {
        result.success = true;
        result.message = `Input latency within acceptable range: ${averageLatency.toFixed(
          1
        )}ms`;
      } else {
        result.message = `Input latency too high: ${averageLatency.toFixed(
          1
        )}ms`;
      }

      result.details = {
        measurements: latencyMeasurements,
        averageLatency: averageLatency.toFixed(1),
        maxLatency: maxLatency.toFixed(1),
        minLatency: minLatency.toFixed(1),
        acceptableLatency,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * 複数回ジャンプの一貫性をテスト
   */
  async testMultipleJumpConsistency() {
    const result = {
      success: false,
      message: "",
      details: {},
    };

    try {
      const jumpAttempts = [];
      const iterations = this.testConfig.testIterations;

      for (let i = 0; i < iterations; i++) {
        if (this.player) {
          this.player.isOnGround = true;
          this.player.isBlocking = false;
          this.player.velocity.y = 0;
        }

        const simulationResult = await this.simulateSpaceKeyInput({
          repeat: 1,
          duration: 100,
        });

        const jumpExecuted = simulationResult.events[0]?.jumpExecuted;

        jumpAttempts.push({
          iteration: i + 1,
          jumpExecuted,
          simulation: simulationResult,
        });

        await this.sleep(300); // 次の試行まで待機
      }

      const successfulJumps = jumpAttempts.filter((a) => a.jumpExecuted).length;
      const successRate = (successfulJumps / iterations) * 100;

      // 成功率が90%以上であることを確認
      const consistentPerformance = successRate >= 90;

      if (consistentPerformance) {
        result.success = true;
        result.message = `Jump consistency excellent: ${successRate.toFixed(
          1
        )}% success rate`;
      } else {
        result.message = `Jump consistency poor: ${successRate.toFixed(
          1
        )}% success rate`;
      }

      result.details = {
        iterations,
        successfulJumps,
        successRate: successRate.toFixed(1),
        consistentPerformance,
        jumpAttempts,
      };
    } catch (error) {
      result.message = `Test failed with error: ${error.message}`;
      result.details = { error: error.stack };
    }

    return result;
  }

  /**
   * 機能回帰テストを実行
   */
  async runFunctionalRegressionTests() {
    const testSuite = {
      name: "Functional Regression Tests",
      timestamp: Date.now(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    // 基本機能の回帰テスト
    await this.runTest(testSuite, "Basic Jump Regression", async () => {
      return await this.testBasicJumpFunctionality();
    });

    await this.runTest(testSuite, "Ground State Regression", async () => {
      return await this.testJumpOnGround();
    });

    await this.runTest(
      testSuite,
      "Air Jump Prevention Regression",
      async () => {
        return await this.testPreventAirJump();
      }
    );

    return testSuite;
  }

  /**
   * パフォーマンス回帰テストを実行
   */
  async runPerformanceRegressionTests() {
    const testSuite = {
      name: "Performance Regression Tests",
      timestamp: Date.now(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    await this.runTest(testSuite, "Input Latency Regression", async () => {
      return await this.testInputLatency();
    });

    await this.runTest(testSuite, "Consistency Regression", async () => {
      return await this.testMultipleJumpConsistency();
    });

    return testSuite;
  }

  /**
   * ブラウザ互換性回帰テストを実行
   */
  async runCompatibilityRegressionTests() {
    const testSuite = {
      name: "Compatibility Regression Tests",
      timestamp: Date.now(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    await this.runTest(testSuite, "Focus Management Regression", async () => {
      return await this.testJumpWithFocus();
    });

    return testSuite;
  }

  /**
   * エラーハンドリング回帰テストを実行
   */
  async runErrorHandlingRegressionTests() {
    const testSuite = {
      name: "Error Handling Regression Tests",
      timestamp: Date.now(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 0 },
    };

    await this.runTest(testSuite, "Blocking State Regression", async () => {
      return await this.testPreventJumpWhileBlocking();
    });

    return testSuite;
  }

  /**
   * 個別テストを実行
   */
  async runTest(testSuite, testName, testFunction) {
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
      console.log(`  Running test: ${testName}`);
      const result = await testFunction();

      testResult.success = result.success;
      testResult.message = result.message;
      testResult.details = result.details;

      if (result.success) {
        testSuite.summary.passed++;
      } else {
        testSuite.summary.failed++;
      }
    } catch (error) {
      testResult.success = false;
      testResult.error = error.message;
      testResult.message = `Test execution failed: ${error.message}`;
      testSuite.summary.errors++;
      console.error(`Test ${testName} failed:`, error);
    }

    testResult.duration = Math.round(performance.now() - startTime);
    testSuite.summary.total++;
    testSuite.tests.push(testResult);

    console.log(
      `  ${testResult.success ? "✅" : "❌"} ${testName}: ${testResult.message}`
    );
  }

  /**
   * 回帰サマリーを計算
   */
  calculateRegressionSummary(regressionSuite) {
    regressionSuite.summary.totalTests = 0;
    regressionSuite.summary.totalPassed = 0;
    regressionSuite.summary.totalFailed = 0;

    regressionSuite.testSuites.forEach((suite) => {
      regressionSuite.summary.totalTests += suite.summary.total;
      regressionSuite.summary.totalPassed += suite.summary.passed;
      regressionSuite.summary.totalFailed +=
        suite.summary.failed + suite.summary.errors;
    });

    regressionSuite.summary.successRate =
      regressionSuite.summary.totalTests > 0
        ? (regressionSuite.summary.totalPassed /
            regressionSuite.summary.totalTests) *
          100
        : 0;
  }

  /**
   * ベースラインとの比較
   */
  compareWithBaseline(regressionSuite) {
    const baseline = regressionSuite.baseline;
    if (!baseline) return;

    const currentSuccessRate = regressionSuite.summary.successRate;
    const baselineSuccessRate = baseline.summary.successRate;

    const regressionThreshold = 5; // 5%の低下で回帰とみなす

    if (currentSuccessRate < baselineSuccessRate - regressionThreshold) {
      regressionSuite.summary.regressionDetected = true;
      regressionSuite.regressionDetails = {
        type: "functional",
        currentSuccessRate,
        baselineSuccessRate,
        degradation: baselineSuccessRate - currentSuccessRate,
      };
    }
  }

  /**
   * ユーティリティメソッド
   */

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async waitForFocus(element, timeout = 1000) {
    const startTime = Date.now();

    while (
      document.activeElement !== element &&
      Date.now() - startTime < timeout
    ) {
      await this.sleep(10);
    }

    return document.activeElement === element;
  }

  detectJumpExecution(beforeState, afterState) {
    if (!beforeState || !afterState) return false;

    // 垂直速度が上向きに変化したかチェック
    const velocityChange = afterState.velocity.y - beforeState.velocity.y;
    return velocityChange < -5; // 上向きの速度変化
  }

  /**
   * ログ出力メソッド
   */

  logTestSuiteResults(testSuite) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🧪 ${testSuite.name.toUpperCase()} RESULTS`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Total Tests: ${testSuite.summary.total}`);
    console.log(`Passed: ${testSuite.summary.passed}`);
    console.log(`Failed: ${testSuite.summary.failed}`);
    console.log(`Errors: ${testSuite.summary.errors}`);
    console.log(
      `Success Rate: ${(
        (testSuite.summary.passed / testSuite.summary.total) *
        100
      ).toFixed(1)}%`
    );
    console.log(`${"=".repeat(60)}`);
  }

  logRegressionResults(regressionSuite) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔄 ${regressionSuite.name.toUpperCase()} RESULTS`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Total Tests: ${regressionSuite.summary.totalTests}`);
    console.log(`Passed: ${regressionSuite.summary.totalPassed}`);
    console.log(`Failed: ${regressionSuite.summary.totalFailed}`);
    console.log(
      `Success Rate: ${regressionSuite.summary.successRate.toFixed(1)}%`
    );

    if (regressionSuite.summary.regressionDetected) {
      console.log(`❌ REGRESSION DETECTED!`);
      console.log(
        `  Current: ${regressionSuite.regressionDetails.currentSuccessRate.toFixed(
          1
        )}%`
      );
      console.log(
        `  Baseline: ${regressionSuite.regressionDetails.baselineSuccessRate.toFixed(
          1
        )}%`
      );
      console.log(
        `  Degradation: ${regressionSuite.regressionDetails.degradation.toFixed(
          1
        )}%`
      );
    } else {
      console.log(`✅ No regression detected`);
    }

    console.log(`${"=".repeat(60)}`);
  }

  /**
   * 公開API
   */

  // 全自動テストを実行
  async runAllAutomatedTests() {
    console.log("🚀 Starting comprehensive automated test suite...");

    const results = {
      timestamp: Date.now(),
      jumpVerificationTests: null,
      regressionTests: null,
      duration: 0,
    };

    const startTime = performance.now();

    try {
      // ジャンプ検証テスト
      results.jumpVerificationTests = await this.runJumpVerificationTests();

      // 回帰テスト
      results.regressionTests = await this.buildRegressionTestSuite();

      results.duration = Math.round(performance.now() - startTime);

      console.log(`🎉 Automated test suite completed in ${results.duration}ms`);
    } catch (error) {
      console.error("Automated test suite failed:", error);
      results.error = error.message;
    }

    return results;
  }

  // テスト結果の取得
  getTestResults() {
    return {
      testResults: this.testResults,
      regressionResults: this.regressionResults,
      lastRun:
        this.testResults.length > 0
          ? this.testResults[this.testResults.length - 1]
          : null,
    };
  }

  // テスト履歴のクリア
  clearTestHistory() {
    this.testResults = [];
    this.regressionResults = [];
    console.log("Test history cleared");
  }
}

// Export for use in main game
window.AutomatedTestSystem = AutomatedTestSystem;
