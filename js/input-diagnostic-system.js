/**
 * Input Diagnostic System
 * 詳細な入力診断とデバッグ機能を提供
 */

class InputDiagnosticSystem {
  constructor(inputManager, player = null) {
    this.inputManager = inputManager;
    this.player = player;

    // 診断データ収集
    this.diagnosticData = new Map();
    this.eventHistory = [];
    this.isRecording = false;
    this.maxHistorySize = 1000;

    // 診断統計
    this.statistics = {
      totalSpaceKeyEvents: 0,
      successfulJumps: 0,
      failedJumps: 0,
      focusIssues: 0,
      timingIssues: 0,
      startTime: Date.now(),
    };

    // パフォーマンス測定
    this.performanceMetrics = {
      keydownToAction: [],
      actionToJump: [],
      totalLatency: [],
    };

    // ブラウザ情報
    this.browserInfo = this.detectBrowser();

    console.log("InputDiagnosticSystem initialized");
  }

  /**
   * 診断開始
   */
  startDiagnostics() {
    this.isRecording = true;
    this.eventHistory = [];
    this.statistics.startTime = Date.now();

    // 既存のイベントリスナーを拡張
    this.setupDiagnosticListeners();

    console.log("🔍 Input diagnostics started");
    return true;
  }

  /**
   * 診断停止
   */
  stopDiagnostics() {
    this.isRecording = false;
    console.log("🔍 Input diagnostics stopped");
    return this.generateDiagnosticReport();
  }

  /**
   * 診断用イベントリスナーを設定
   */
  setupDiagnosticListeners() {
    // 元のhandleKeyDownメソッドを拡張
    if (this.inputManager && !this.inputManager._diagnosticEnhanced) {
      const originalHandleKeyDown = this.inputManager.handleKeyDown.bind(
        this.inputManager
      );
      const originalHandleKeyUp = this.inputManager.handleKeyUp.bind(
        this.inputManager
      );

      this.inputManager.handleKeyDown = (event) => {
        const timestamp = performance.now();

        // 診断データを記録
        if (this.isRecording && event.code === "Space") {
          this.recordInputEvent("keydown", {
            timestamp,
            keyCode: event.code,
            focusElement: document.activeElement?.tagName || "unknown",
            hasFocus: document.hasFocus(),
            preventDefault: false,
          });
        }

        // 元の処理を実行
        const result = originalHandleKeyDown(event);

        // 処理後の状態を記録
        if (this.isRecording && event.code === "Space") {
          this.recordInputEvent("keydown-processed", {
            timestamp: performance.now(),
            keyState: this.inputManager.keyStates.get("Space"),
            actionState: this.inputManager.actionStates.get("jump"),
            preventDefault: event.defaultPrevented,
          });
        }

        return result;
      };

      this.inputManager.handleKeyUp = (event) => {
        const timestamp = performance.now();

        // 診断データを記録
        if (this.isRecording && event.code === "Space") {
          this.recordInputEvent("keyup", {
            timestamp,
            keyCode: event.code,
          });
        }

        return originalHandleKeyUp(event);
      };

      this.inputManager._diagnosticEnhanced = true;
    }

    // プレイヤーのjumpメソッドを拡張
    if (this.player && !this.player._diagnosticEnhanced) {
      const originalJump = this.player.jump.bind(this.player);

      this.player.jump = () => {
        const timestamp = performance.now();
        const canJump = this.player.isOnGround && !this.player.isBlocking;

        if (this.isRecording) {
          this.recordInputEvent("jump-attempt", {
            timestamp,
            canJump,
            isOnGround: this.player.isOnGround,
            isBlocking: this.player.isBlocking,
            playerState: this.player.state,
            position: { ...this.player.position },
            velocity: { ...this.player.velocity },
          });
        }

        const result = originalJump();

        if (this.isRecording) {
          this.recordInputEvent("jump-result", {
            timestamp: performance.now(),
            success: canJump,
            newVelocity: { ...this.player.velocity },
            newState: this.player.state,
          });

          // 統計を更新
          if (canJump) {
            this.statistics.successfulJumps++;
          } else {
            this.statistics.failedJumps++;
          }
        }

        return result;
      };

      this.player._diagnosticEnhanced = true;
    }
  }

  /**
   * 入力イベントを記録
   */
  recordInputEvent(eventType, data) {
    if (!this.isRecording) return;

    const event = {
      type: eventType,
      timestamp: data.timestamp || performance.now(),
      data: { ...data },
      sequenceId: this.eventHistory.length,
    };

    this.eventHistory.push(event);

    // 履歴サイズ制限
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // リアルタイム分析
    this.analyzeEventSequence(event);
  }

  /**
   * イベントシーケンスをリアルタイム分析
   */
  analyzeEventSequence(currentEvent) {
    if (
      currentEvent.type === "keydown" &&
      currentEvent.data.keyCode === "Space"
    ) {
      this.statistics.totalSpaceKeyEvents++;

      // フォーカス問題の検出
      if (
        !currentEvent.data.hasFocus ||
        currentEvent.data.focusElement !== "CANVAS"
      ) {
        this.statistics.focusIssues++;
        console.warn("🚨 Focus issue detected:", currentEvent.data);
      }
    }

    // レイテンシー測定
    this.measureLatency(currentEvent);
  }

  /**
   * レイテンシーを測定
   */
  measureLatency(currentEvent) {
    const recentEvents = this.eventHistory.slice(-10);

    if (currentEvent.type === "keydown-processed") {
      // keydown → keydown-processed のレイテンシー
      const keydownEvent = recentEvents.find((e) => e.type === "keydown");
      if (keydownEvent) {
        const latency = currentEvent.timestamp - keydownEvent.timestamp;
        this.performanceMetrics.keydownToAction.push(latency);
      }
    }

    if (currentEvent.type === "jump-result") {
      // keydown → jump-result の総レイテンシー
      const keydownEvent = recentEvents.find((e) => e.type === "keydown");
      if (keydownEvent) {
        const totalLatency = currentEvent.timestamp - keydownEvent.timestamp;
        this.performanceMetrics.totalLatency.push(totalLatency);
      }

      // jump-attempt → jump-result のレイテンシー
      const jumpAttemptEvent = recentEvents.find(
        (e) => e.type === "jump-attempt"
      );
      if (jumpAttemptEvent) {
        const jumpLatency = currentEvent.timestamp - jumpAttemptEvent.timestamp;
        this.performanceMetrics.actionToJump.push(jumpLatency);
      }
    }
  }

  /**
   * スペースキーの動作をシミュレート
   */
  simulateSpaceKeyPress() {
    console.log("🧪 Simulating space key press...");

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.focus();
    }

    // KeyboardEventを作成してシミュレート
    const keydownEvent = new KeyboardEvent("keydown", {
      code: "Space",
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    const keyupEvent = new KeyboardEvent("keyup", {
      code: "Space",
      key: " ",
      bubbles: true,
      cancelable: true,
    });

    // イベントを発火
    document.dispatchEvent(keydownEvent);

    setTimeout(() => {
      document.dispatchEvent(keyupEvent);
    }, 100);

    return {
      keydownDispatched: true,
      keyupScheduled: true,
      targetElement: canvas?.tagName || "unknown",
    };
  }

  /**
   * ジャンプシーケンス全体をテスト
   */
  testJumpSequence() {
    console.log("🧪 Testing complete jump sequence...");

    const testResults = {
      timestamp: Date.now(),
      steps: [],
      success: false,
      issues: [],
    };

    // Step 1: フォーカス確認
    const hasFocus = document.hasFocus();
    const activeElement = document.activeElement;
    testResults.steps.push({
      step: "focus-check",
      hasFocus,
      activeElement: activeElement?.tagName || "none",
      success: hasFocus && activeElement?.tagName === "CANVAS",
    });

    if (!hasFocus || activeElement?.tagName !== "CANVAS") {
      testResults.issues.push("Canvas does not have focus");
    }

    // Step 2: InputManager状態確認
    if (this.inputManager) {
      const debugInfo = this.inputManager.getDebugInfo();
      testResults.steps.push({
        step: "input-manager-check",
        initialized: true,
        keyBindings: debugInfo.keyBindings.jump || [],
        success: debugInfo.keyBindings.jump?.includes("Space"),
      });

      if (!debugInfo.keyBindings.jump?.includes("Space")) {
        testResults.issues.push("Space key not bound to jump action");
      }
    } else {
      testResults.steps.push({
        step: "input-manager-check",
        initialized: false,
        success: false,
      });
      testResults.issues.push("InputManager not available");
    }

    // Step 3: Player状態確認
    if (this.player) {
      const playerState = this.player.getState();
      testResults.steps.push({
        step: "player-check",
        initialized: true,
        isOnGround: playerState.isOnGround,
        isBlocking: playerState.isBlocking,
        canJump: playerState.isOnGround && !playerState.isBlocking,
        success: true,
      });

      if (!playerState.isOnGround) {
        testResults.issues.push("Player is not on ground");
      }
      if (playerState.isBlocking) {
        testResults.issues.push("Player is blocking");
      }
    } else {
      testResults.steps.push({
        step: "player-check",
        initialized: false,
        success: false,
      });
      testResults.issues.push("Player not available");
    }

    // Step 4: シミュレーションテスト
    this.startDiagnostics();
    const simulationResult = this.simulateSpaceKeyPress();

    setTimeout(() => {
      const diagnosticReport = this.stopDiagnostics();
      testResults.steps.push({
        step: "simulation-test",
        simulation: simulationResult,
        diagnostics: diagnosticReport,
        success: diagnosticReport.summary.successfulJumps > 0,
      });

      testResults.success =
        testResults.issues.length === 0 &&
        diagnosticReport.summary.successfulJumps > 0;

      console.log("🧪 Jump sequence test completed:", testResults);
    }, 500);

    return testResults;
  }

  /**
   * 入力チェーンを検証
   */
  validateInputChain() {
    const validation = {
      timestamp: Date.now(),
      chain: [],
      issues: [],
      recommendations: [],
    };

    // 1. ブラウザイベントキャプチャ
    validation.chain.push({
      stage: "browser-events",
      status: "checking",
      details: "Checking if browser events are properly captured",
    });

    // 2. InputManager処理
    if (this.inputManager) {
      validation.chain.push({
        stage: "input-manager",
        status: "ok",
        details: "InputManager is initialized and ready",
      });
    } else {
      validation.chain.push({
        stage: "input-manager",
        status: "error",
        details: "InputManager not found",
      });
      validation.issues.push("InputManager not initialized");
    }

    // 3. アクションマッピング
    if (this.inputManager?.keyBindings?.jump?.includes("Space")) {
      validation.chain.push({
        stage: "action-mapping",
        status: "ok",
        details: "Space key is mapped to jump action",
      });
    } else {
      validation.chain.push({
        stage: "action-mapping",
        status: "error",
        details: "Space key not mapped to jump action",
      });
      validation.issues.push("Space key mapping missing");
    }

    // 4. Player処理
    if (this.player) {
      validation.chain.push({
        stage: "player-controller",
        status: "ok",
        details: "Player controller is available",
      });
    } else {
      validation.chain.push({
        stage: "player-controller",
        status: "error",
        details: "Player controller not found",
      });
      validation.issues.push("Player not initialized");
    }

    // 推奨事項を生成
    if (validation.issues.length > 0) {
      validation.recommendations.push("Initialize missing components");
      validation.recommendations.push("Check component initialization order");
    }

    return validation;
  }

  /**
   * ブラウザ情報を検出
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    const browserInfo = {
      userAgent,
      name: "unknown",
      version: "unknown",
      engine: "unknown",
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };

    // ブラウザ検出
    if (userAgent.includes("Chrome")) {
      browserInfo.name = "Chrome";
      browserInfo.engine = "Blink";
    } else if (userAgent.includes("Firefox")) {
      browserInfo.name = "Firefox";
      browserInfo.engine = "Gecko";
    } else if (userAgent.includes("Safari")) {
      browserInfo.name = "Safari";
      browserInfo.engine = "WebKit";
    } else if (userAgent.includes("Edge")) {
      browserInfo.name = "Edge";
      browserInfo.engine = "Blink";
    }

    return browserInfo;
  }

  /**
   * 診断レポートを生成
   */
  generateDiagnosticReport() {
    const endTime = Date.now();
    const duration = endTime - this.statistics.startTime;

    const report = {
      timestamp: endTime,
      duration,
      browser: this.browserInfo,
      statistics: { ...this.statistics },
      performance: this.calculatePerformanceMetrics(),
      eventHistory: [...this.eventHistory],
      issues: this.identifyIssues(),
      recommendations: this.generateRecommendations(),
    };

    // サマリーを追加
    report.summary = {
      totalEvents: this.eventHistory.length,
      spaceKeyEvents: this.statistics.totalSpaceKeyEvents,
      successfulJumps: this.statistics.successfulJumps,
      failedJumps: this.statistics.failedJumps,
      successRate:
        this.statistics.totalSpaceKeyEvents > 0
          ? (
              (this.statistics.successfulJumps /
                this.statistics.totalSpaceKeyEvents) *
              100
            ).toFixed(1) + "%"
          : "N/A",
      focusIssues: this.statistics.focusIssues,
      averageLatency: report.performance.averageLatency,
    };

    return report;
  }

  /**
   * パフォーマンスメトリクスを計算
   */
  calculatePerformanceMetrics() {
    const metrics = {
      keydownToAction: this.calculateStats(
        this.performanceMetrics.keydownToAction
      ),
      actionToJump: this.calculateStats(this.performanceMetrics.actionToJump),
      totalLatency: this.calculateStats(this.performanceMetrics.totalLatency),
    };

    metrics.averageLatency = metrics.totalLatency.average || 0;

    return metrics;
  }

  /**
   * 統計を計算
   */
  calculateStats(values) {
    if (values.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: values.length,
      average: parseFloat(average.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
    };
  }

  /**
   * 問題を特定
   */
  identifyIssues() {
    const issues = [];

    // フォーカス問題
    if (this.statistics.focusIssues > 0) {
      issues.push({
        type: "focus",
        severity: "high",
        description: `${this.statistics.focusIssues} focus issues detected`,
        impact: "Space key events may not be captured properly",
      });
    }

    // 成功率の問題
    const successRate =
      this.statistics.totalSpaceKeyEvents > 0
        ? this.statistics.successfulJumps / this.statistics.totalSpaceKeyEvents
        : 0;

    if (successRate < 0.8 && this.statistics.totalSpaceKeyEvents > 0) {
      issues.push({
        type: "success-rate",
        severity: "high",
        description: `Low jump success rate: ${(successRate * 100).toFixed(
          1
        )}%`,
        impact: "Players may experience unreliable jump controls",
      });
    }

    // レイテンシー問題
    const avgLatency =
      this.performanceMetrics.totalLatency.length > 0
        ? this.performanceMetrics.totalLatency.reduce((a, b) => a + b, 0) /
          this.performanceMetrics.totalLatency.length
        : 0;

    if (avgLatency > 50) {
      issues.push({
        type: "latency",
        severity: "medium",
        description: `High input latency: ${avgLatency.toFixed(1)}ms`,
        impact: "Players may experience delayed response to input",
      });
    }

    return issues;
  }

  /**
   * 推奨事項を生成
   */
  generateRecommendations() {
    const recommendations = [];
    const issues = this.identifyIssues();

    for (const issue of issues) {
      switch (issue.type) {
        case "focus":
          recommendations.push({
            issue: issue.type,
            priority: "high",
            action: "Implement automatic canvas focus management",
            details:
              "Ensure canvas element receives focus on game start and after user interactions",
          });
          break;

        case "success-rate":
          recommendations.push({
            issue: issue.type,
            priority: "high",
            action: "Investigate jump execution conditions",
            details:
              "Check player ground state detection and blocking conditions",
          });
          break;

        case "latency":
          recommendations.push({
            issue: issue.type,
            priority: "medium",
            action: "Optimize input processing pipeline",
            details: "Review event handling and reduce processing overhead",
          });
          break;
      }
    }

    // 一般的な推奨事項
    if (recommendations.length === 0) {
      recommendations.push({
        issue: "general",
        priority: "low",
        action: "Continue monitoring",
        details: "Input system appears to be functioning normally",
      });
    }

    return recommendations;
  }

  /**
   * リアルタイム診断データを取得
   */
  getRealTimeDiagnostics() {
    if (!this.isRecording) {
      return { recording: false };
    }

    const recentEvents = this.eventHistory.slice(-10);
    const currentStats = { ...this.statistics };

    return {
      recording: true,
      recentEvents,
      statistics: currentStats,
      eventCount: this.eventHistory.length,
      lastEventTime:
        recentEvents.length > 0
          ? recentEvents[recentEvents.length - 1].timestamp
          : null,
      liveMetrics: this.getLiveMetrics(),
      systemHealth: this.getSystemHealth(),
    };
  }

  /**
   * ライブメトリクスを取得
   */
  getLiveMetrics() {
    const now = performance.now();
    const recentWindow = 5000; // 5秒間のウィンドウ
    const recentEvents = this.eventHistory.filter(
      (event) => now - event.timestamp < recentWindow
    );

    const spaceKeyEvents = recentEvents.filter(
      (event) => event.type === "keydown" && event.data.keyCode === "Space"
    );

    const jumpAttempts = recentEvents.filter(
      (event) => event.type === "jump-attempt"
    );

    const successfulJumps = recentEvents.filter(
      (event) => event.type === "jump-result" && event.data.success
    );

    return {
      recentSpaceKeys: spaceKeyEvents.length,
      recentJumpAttempts: jumpAttempts.length,
      recentSuccessfulJumps: successfulJumps.length,
      recentSuccessRate:
        jumpAttempts.length > 0
          ? ((successfulJumps.length / jumpAttempts.length) * 100).toFixed(1) +
            "%"
          : "N/A",
      eventsPerSecond: (recentEvents.length / (recentWindow / 1000)).toFixed(1),
      inputResponsiveness: this.calculateInputResponsiveness(recentEvents),
    };
  }

  /**
   * システムヘルス状態を取得
   */
  getSystemHealth() {
    const health = {
      overall: "good",
      issues: [],
      warnings: [],
      recommendations: [],
    };

    // フォーカス問題チェック
    const focusIssueRate =
      this.statistics.totalSpaceKeyEvents > 0
        ? this.statistics.focusIssues / this.statistics.totalSpaceKeyEvents
        : 0;

    if (focusIssueRate > 0.1) {
      health.overall = "warning";
      health.issues.push("High focus issue rate detected");
      health.recommendations.push("Implement automatic focus management");
    }

    // 成功率チェック
    const successRate =
      this.statistics.totalSpaceKeyEvents > 0
        ? this.statistics.successfulJumps / this.statistics.totalSpaceKeyEvents
        : 1;

    if (successRate < 0.8) {
      health.overall = "critical";
      health.issues.push("Low jump success rate");
      health.recommendations.push("Check player state conditions");
    } else if (successRate < 0.9) {
      health.overall = "warning";
      health.warnings.push("Moderate jump success rate");
    }

    // レイテンシーチェック
    const avgLatency =
      this.performanceMetrics.totalLatency.length > 0
        ? this.performanceMetrics.totalLatency.reduce((a, b) => a + b, 0) /
          this.performanceMetrics.totalLatency.length
        : 0;

    if (avgLatency > 100) {
      health.overall = "warning";
      health.warnings.push("High input latency detected");
      health.recommendations.push("Optimize input processing pipeline");
    }

    return health;
  }

  /**
   * 入力応答性を計算
   */
  calculateInputResponsiveness(events) {
    const keydownEvents = events.filter((e) => e.type === "keydown");
    const processedEvents = events.filter(
      (e) => e.type === "keydown-processed"
    );

    if (keydownEvents.length === 0 || processedEvents.length === 0) {
      return { score: 100, status: "excellent" };
    }

    const latencies = [];
    keydownEvents.forEach((keydown) => {
      const processed = processedEvents.find(
        (p) => Math.abs(p.timestamp - keydown.timestamp) < 100
      );
      if (processed) {
        latencies.push(processed.timestamp - keydown.timestamp);
      }
    });

    if (latencies.length === 0) {
      return { score: 0, status: "poor" };
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    let score = Math.max(0, 100 - avgLatency * 2); // 50ms = 0 score
    let status = "excellent";

    if (score < 50) status = "poor";
    else if (score < 70) status = "fair";
    else if (score < 85) status = "good";

    return {
      score: Math.round(score),
      status,
      averageLatency: avgLatency.toFixed(1) + "ms",
      sampleSize: latencies.length,
    };
  }

  /**
   * 診断システムをリセット
   */
  reset() {
    this.eventHistory = [];
    this.statistics = {
      totalSpaceKeyEvents: 0,
      successfulJumps: 0,
      failedJumps: 0,
      focusIssues: 0,
      timingIssues: 0,
      startTime: Date.now(),
    };
    this.performanceMetrics = {
      keydownToAction: [],
      actionToJump: [],
      totalLatency: [],
    };

    console.log("InputDiagnosticSystem reset");
  }

  /**
   * 診断データの可視化用データを生成
   */
  generateVisualizationData() {
    const timelineData = this.eventHistory.map((event) => ({
      timestamp: event.timestamp,
      type: event.type,
      success: event.type === "jump-result" ? event.data.success : null,
      latency: this.calculateEventLatency(event),
    }));

    const performanceChart = {
      latencyOverTime: this.performanceMetrics.totalLatency.map(
        (latency, index) => ({
          x: index,
          y: latency,
        })
      ),
      successRateOverTime: this.calculateSuccessRateOverTime(),
      eventDistribution: this.calculateEventDistribution(),
    };

    const heatmapData = this.generateInputHeatmap();

    return {
      timeline: timelineData,
      performance: performanceChart,
      heatmap: heatmapData,
      summary: this.generateVisualizationSummary(),
    };
  }

  /**
   * イベントのレイテンシーを計算
   */
  calculateEventLatency(event) {
    if (event.type !== "jump-result") return null;

    const keydownEvent = this.eventHistory
      .slice(0, event.sequenceId)
      .reverse()
      .find((e) => e.type === "keydown" && e.data.keyCode === "Space");

    return keydownEvent ? event.timestamp - keydownEvent.timestamp : null;
  }

  /**
   * 時系列での成功率を計算
   */
  calculateSuccessRateOverTime() {
    const windowSize = 10; // 10イベントのウィンドウ
    const jumpResults = this.eventHistory.filter(
      (e) => e.type === "jump-result"
    );
    const successRates = [];

    for (let i = windowSize; i <= jumpResults.length; i++) {
      const window = jumpResults.slice(i - windowSize, i);
      const successCount = window.filter((e) => e.data.success).length;
      const rate = (successCount / windowSize) * 100;

      successRates.push({
        x: i,
        y: rate,
        timestamp: window[window.length - 1].timestamp,
      });
    }

    return successRates;
  }

  /**
   * イベント分布を計算
   */
  calculateEventDistribution() {
    const distribution = {};

    this.eventHistory.forEach((event) => {
      distribution[event.type] = (distribution[event.type] || 0) + 1;
    });

    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / this.eventHistory.length) * 100).toFixed(1),
    }));
  }

  /**
   * 入力ヒートマップデータを生成
   */
  generateInputHeatmap() {
    const timeSlots = 24; // 1日を24時間に分割
    const heatmap = Array(timeSlots).fill(0);

    this.eventHistory
      .filter((e) => e.type === "keydown" && e.data.keyCode === "Space")
      .forEach((event) => {
        const hour = new Date(event.timestamp).getHours();
        heatmap[hour]++;
      });

    return heatmap.map((count, hour) => ({
      hour,
      count,
      intensity: count > 0 ? Math.min(count / 10, 1) : 0, // 正規化
    }));
  }

  /**
   * 可視化サマリーを生成
   */
  generateVisualizationSummary() {
    const totalEvents = this.eventHistory.length;
    const spaceKeyEvents = this.statistics.totalSpaceKeyEvents;
    const avgLatency =
      this.performanceMetrics.totalLatency.length > 0
        ? this.performanceMetrics.totalLatency.reduce((a, b) => a + b, 0) /
          this.performanceMetrics.totalLatency.length
        : 0;

    return {
      totalEvents,
      spaceKeyEvents,
      successRate:
        spaceKeyEvents > 0
          ? ((this.statistics.successfulJumps / spaceKeyEvents) * 100).toFixed(
              1
            ) + "%"
          : "N/A",
      averageLatency: avgLatency.toFixed(1) + "ms",
      peakLatency:
        this.performanceMetrics.totalLatency.length > 0
          ? Math.max(...this.performanceMetrics.totalLatency).toFixed(1) + "ms"
          : "N/A",
      focusIssueRate:
        spaceKeyEvents > 0
          ? ((this.statistics.focusIssues / spaceKeyEvents) * 100).toFixed(1) +
            "%"
          : "0%",
    };
  }

  /**
   * 詳細なパフォーマンス分析を実行
   */
  analyzePerformanceBottlenecks() {
    const analysis = {
      bottlenecks: [],
      optimizations: [],
      severity: "low",
    };

    // レイテンシー分析
    const latencies = this.performanceMetrics.totalLatency;
    if (latencies.length > 0) {
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const max = Math.max(...latencies);
      const p95 = this.calculatePercentile(latencies, 95);

      if (avg > 50) {
        analysis.bottlenecks.push({
          type: "high-average-latency",
          value: avg.toFixed(1) + "ms",
          impact: "medium",
          description: "Average input latency is higher than optimal",
        });
        analysis.optimizations.push("Optimize event processing pipeline");
        analysis.severity = "medium";
      }

      if (max > 200) {
        analysis.bottlenecks.push({
          type: "latency-spikes",
          value: max.toFixed(1) + "ms",
          impact: "high",
          description: "Severe latency spikes detected",
        });
        analysis.optimizations.push(
          "Investigate frame drops and blocking operations"
        );
        analysis.severity = "high";
      }

      if (p95 > 100) {
        analysis.bottlenecks.push({
          type: "inconsistent-performance",
          value: p95.toFixed(1) + "ms (95th percentile)",
          impact: "medium",
          description: "Inconsistent input performance",
        });
        analysis.optimizations.push("Implement input buffering and smoothing");
      }
    }

    // フォーカス問題分析
    const focusIssueRate =
      this.statistics.totalSpaceKeyEvents > 0
        ? this.statistics.focusIssues / this.statistics.totalSpaceKeyEvents
        : 0;

    if (focusIssueRate > 0.05) {
      analysis.bottlenecks.push({
        type: "focus-management",
        value: (focusIssueRate * 100).toFixed(1) + "%",
        impact: "high",
        description: "Frequent focus management issues",
      });
      analysis.optimizations.push("Implement robust focus management system");
      analysis.severity = "high";
    }

    // 成功率分析
    const successRate =
      this.statistics.totalSpaceKeyEvents > 0
        ? this.statistics.successfulJumps / this.statistics.totalSpaceKeyEvents
        : 1;

    if (successRate < 0.9) {
      analysis.bottlenecks.push({
        type: "input-reliability",
        value: (successRate * 100).toFixed(1) + "%",
        impact: "critical",
        description: "Input reliability below acceptable threshold",
      });
      analysis.optimizations.push(
        "Review input detection and player state logic"
      );
      analysis.severity = "high";
    }

    return analysis;
  }

  /**
   * パーセンタイル値を計算
   */
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * 診断レポートをエクスポート
   */
  exportDiagnosticReport(format = "json") {
    const report = this.generateDiagnosticReport();
    const visualization = this.generateVisualizationData();
    const performance = this.analyzePerformanceBottlenecks();

    const exportData = {
      ...report,
      visualization,
      performanceAnalysis: performance,
      exportTimestamp: new Date().toISOString(),
      exportFormat: format,
    };

    if (format === "json") {
      return JSON.stringify(exportData, null, 2);
    } else if (format === "csv") {
      return this.convertToCSV(exportData);
    } else if (format === "html") {
      return this.generateHTMLReport(exportData);
    }

    return exportData;
  }

  /**
   * CSVフォーマットに変換
   */
  convertToCSV(data) {
    const headers = [
      "Timestamp",
      "Event Type",
      "Success",
      "Latency",
      "Focus State",
    ];
    const rows = [headers.join(",")];

    data.eventHistory.forEach((event) => {
      const row = [
        new Date(event.timestamp).toISOString(),
        event.type,
        event.data.success || "N/A",
        this.calculateEventLatency(event) || "N/A",
        event.data.hasFocus || "N/A",
      ];
      rows.push(row.join(","));
    });

    return rows.join("\n");
  }

  /**
   * HTMLレポートを生成
   */
  generateHTMLReport(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Input Diagnostic Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .metric { margin: 10px 0; }
          .issue { background: #ffe6e6; padding: 10px; margin: 5px 0; border-left: 4px solid #ff4444; }
          .recommendation { background: #e6f7ff; padding: 10px; margin: 5px 0; border-left: 4px solid #1890ff; }
        </style>
      </head>
      <body>
        <h1>Input Diagnostic Report</h1>
        <div class="summary">
          <h2>Summary</h2>
          <div class="metric">Total Events: ${data.summary.totalEvents}</div>
          <div class="metric">Success Rate: ${data.summary.successRate}</div>
          <div class="metric">Average Latency: ${
            data.summary.averageLatency
          }</div>
        </div>

        <h2>Issues Detected</h2>
        ${data.issues
          .map(
            (issue) => `
          <div class="issue">
            <strong>${issue.type}:</strong> ${issue.description}<br>
            <em>Impact:</em> ${issue.impact}
          </div>
        `
          )
          .join("")}

        <h2>Recommendations</h2>
        ${data.recommendations
          .map(
            (rec) => `
          <div class="recommendation">
            <strong>Priority ${rec.priority}:</strong> ${rec.action}<br>
            <em>Details:</em> ${rec.details}
          </div>
        `
          )
          .join("")}

        <p><em>Generated on: ${data.exportTimestamp}</em></p>
      </body>
      </html>
    `;
  }
  /**
   * リアルタイム診断ダッシュボード用データを取得
   */
  getDashboardData() {
    const realTimeData = this.getRealTimeDiagnostics();
    const visualization = this.generateVisualizationData();
    const performance = this.analyzePerformanceBottlenecks();

    return {
      status: {
        recording: this.isRecording,
        systemHealth: realTimeData.systemHealth || { overall: "unknown" },
        lastUpdate: Date.now(),
      },
      metrics: {
        ...realTimeData.statistics,
        liveMetrics: realTimeData.liveMetrics,
      },
      charts: {
        latencyTrend: visualization.performance.latencyOverTime.slice(-20), // 最新20ポイント
        successRateTrend:
          visualization.performance.successRateOverTime.slice(-10), // 最新10ポイント
        eventDistribution: visualization.performance.eventDistribution,
      },
      alerts: this.generateRealTimeAlerts(),
      performance: {
        bottlenecks: performance.bottlenecks,
        severity: performance.severity,
      },
    };
  }

  /**
   * リアルタイムアラートを生成
   */
  generateRealTimeAlerts() {
    const alerts = [];
    const now = performance.now();
    const recentWindow = 10000; // 10秒間

    // 最近のイベントを取得
    const recentEvents = this.eventHistory.filter(
      (event) => now - event.timestamp < recentWindow
    );

    // 連続失敗の検出
    const recentJumpResults = recentEvents
      .filter((e) => e.type === "jump-result")
      .slice(-5); // 最新5回

    if (recentJumpResults.length >= 3) {
      const failureCount = recentJumpResults.filter(
        (e) => !e.data.success
      ).length;
      if (failureCount >= 3) {
        alerts.push({
          type: "consecutive-failures",
          severity: "high",
          message: `${failureCount} consecutive jump failures detected`,
          timestamp: now,
          action: "Check player state and ground detection",
        });
      }
    }

    // 高レイテンシーの検出
    const recentLatencies = this.performanceMetrics.totalLatency.slice(-5);
    if (recentLatencies.length > 0) {
      const avgRecentLatency =
        recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length;
      if (avgRecentLatency > 100) {
        alerts.push({
          type: "high-latency",
          severity: "medium",
          message: `High input latency detected: ${avgRecentLatency.toFixed(
            1
          )}ms`,
          timestamp: now,
          action: "Check for performance bottlenecks",
        });
      }
    }

    // フォーカス問題の検出
    const recentFocusIssues = recentEvents.filter(
      (e) =>
        e.type === "keydown" && e.data.keyCode === "Space" && !e.data.hasFocus
    );

    if (recentFocusIssues.length > 2) {
      alerts.push({
        type: "focus-issues",
        severity: "high",
        message: `Multiple focus issues detected in recent activity`,
        timestamp: now,
        action: "Implement automatic focus management",
      });
    }

    // 入力が全く検出されない場合
    const recentSpaceKeys = recentEvents.filter(
      (e) => e.type === "keydown" && e.data.keyCode === "Space"
    );

    if (
      this.isRecording &&
      recentSpaceKeys.length === 0 &&
      now - this.statistics.startTime > 30000
    ) {
      alerts.push({
        type: "no-input-detected",
        severity: "medium",
        message: "No space key input detected for extended period",
        timestamp: now,
        action: "Verify input system initialization",
      });
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp); // 新しい順
  }

  /**
   * 診断システムの自己診断を実行
   */
  runSelfDiagnostic() {
    const diagnostic = {
      timestamp: Date.now(),
      systemStatus: "healthy",
      checks: [],
      issues: [],
      recommendations: [],
    };

    // InputManager接続チェック
    if (!this.inputManager) {
      diagnostic.checks.push({
        name: "InputManager Connection",
        status: "failed",
        message: "InputManager not connected",
      });
      diagnostic.issues.push("InputManager not available");
      diagnostic.systemStatus = "critical";
    } else {
      diagnostic.checks.push({
        name: "InputManager Connection",
        status: "passed",
        message: "InputManager connected successfully",
      });
    }

    // Player接続チェック
    if (!this.player) {
      diagnostic.checks.push({
        name: "Player Connection",
        status: "warning",
        message: "Player not connected - some features unavailable",
      });
      diagnostic.issues.push("Player not available");
      if (diagnostic.systemStatus === "healthy") {
        diagnostic.systemStatus = "warning";
      }
    } else {
      diagnostic.checks.push({
        name: "Player Connection",
        status: "passed",
        message: "Player connected successfully",
      });
    }

    // イベント履歴チェック
    if (this.eventHistory.length > this.maxHistorySize * 0.9) {
      diagnostic.checks.push({
        name: "Event History Size",
        status: "warning",
        message: `Event history approaching limit (${this.eventHistory.length}/${this.maxHistorySize})`,
      });
      diagnostic.recommendations.push(
        "Consider increasing history size or implementing data archival"
      );
    } else {
      diagnostic.checks.push({
        name: "Event History Size",
        status: "passed",
        message: `Event history size normal (${this.eventHistory.length}/${this.maxHistorySize})`,
      });
    }

    // メモリ使用量チェック（概算）
    const estimatedMemoryUsage = this.eventHistory.length * 200; // 1イベント約200バイト
    if (estimatedMemoryUsage > 1024 * 1024) {
      // 1MB
      diagnostic.checks.push({
        name: "Memory Usage",
        status: "warning",
        message: `High memory usage estimated: ${(
          estimatedMemoryUsage /
          1024 /
          1024
        ).toFixed(1)}MB`,
      });
      diagnostic.recommendations.push(
        "Consider implementing data compression or cleanup"
      );
    } else {
      diagnostic.checks.push({
        name: "Memory Usage",
        status: "passed",
        message: `Memory usage normal: ${(estimatedMemoryUsage / 1024).toFixed(
          1
        )}KB`,
      });
    }

    // ブラウザ互換性チェック
    const browserIssues = this.checkBrowserCompatibility();
    if (browserIssues.length > 0) {
      diagnostic.checks.push({
        name: "Browser Compatibility",
        status: "warning",
        message: `${browserIssues.length} compatibility issues detected`,
      });
      diagnostic.issues.push(...browserIssues);
      diagnostic.recommendations.push(
        "Review browser-specific implementations"
      );
    } else {
      diagnostic.checks.push({
        name: "Browser Compatibility",
        status: "passed",
        message: "No known compatibility issues",
      });
    }

    return diagnostic;
  }

  /**
   * ブラウザ互換性をチェック
   */
  checkBrowserCompatibility() {
    const issues = [];
    const userAgent = navigator.userAgent;

    // Safari特有の問題
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      if (!("PointerEvent" in window)) {
        issues.push("Safari: Pointer events not supported");
      }
    }

    // Firefox特有の問題
    if (userAgent.includes("Firefox")) {
      // Firefox特有のキーイベント問題をチェック
      if (parseInt(userAgent.match(/Firefox\/(\d+)/)?.[1] || "0") < 70) {
        issues.push("Firefox: Old version may have key event issues");
      }
    }

    // モバイルブラウザ
    if (/Mobi|Android/i.test(userAgent)) {
      issues.push("Mobile browser: Touch input fallback recommended");
    }

    return issues;
  }

  /**
   * パフォーマンス最適化の提案を生成
   */
  generateOptimizationSuggestions() {
    const suggestions = [];
    const stats = this.statistics;
    const performance = this.performanceMetrics;

    // レイテンシー最適化
    if (performance.totalLatency.length > 0) {
      const avgLatency =
        performance.totalLatency.reduce((a, b) => a + b, 0) /
        performance.totalLatency.length;

      if (avgLatency > 50) {
        suggestions.push({
          category: "performance",
          priority: "high",
          title: "Reduce Input Latency",
          description: `Average latency is ${avgLatency.toFixed(
            1
          )}ms. Consider optimizing event processing.`,
          implementation: [
            "Use requestAnimationFrame for input processing",
            "Minimize DOM operations in event handlers",
            "Implement input buffering for batch processing",
          ],
        });
      }
    }

    // 成功率最適化
    const successRate =
      stats.totalSpaceKeyEvents > 0
        ? stats.successfulJumps / stats.totalSpaceKeyEvents
        : 1;

    if (successRate < 0.95) {
      suggestions.push({
        category: "reliability",
        priority: "high",
        title: "Improve Input Reliability",
        description: `Success rate is ${(successRate * 100).toFixed(
          1
        )}%. Review input detection logic.`,
        implementation: [
          "Add input validation and sanitization",
          "Implement retry mechanisms for failed inputs",
          "Review player state conditions",
        ],
      });
    }

    // フォーカス管理最適化
    if (stats.focusIssues > 0) {
      suggestions.push({
        category: "focus",
        priority: "medium",
        title: "Enhance Focus Management",
        description: `${stats.focusIssues} focus issues detected. Implement robust focus handling.`,
        implementation: [
          "Add automatic focus recovery",
          "Implement focus indicators",
          "Use focus polling for critical interactions",
        ],
      });
    }

    // メモリ最適化
    if (this.eventHistory.length > 500) {
      suggestions.push({
        category: "memory",
        priority: "low",
        title: "Optimize Memory Usage",
        description:
          "Large event history detected. Consider implementing data management.",
        implementation: [
          "Implement circular buffer for event history",
          "Add automatic cleanup of old events",
          "Compress diagnostic data for storage",
        ],
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = InputDiagnosticSystem;
}
