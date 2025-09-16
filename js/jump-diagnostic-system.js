/**
 * Jump Diagnostic System
 * ジャンプ機能の詳細な診断と分析を行うシステム
 */
class JumpDiagnosticSystem {
  constructor(player, inputManager) {
    this.player = player;
    this.inputManager = inputManager;
    this.jumpAttempts = [];
    this.isRecording = true;
    this.maxAttempts = 100;
    this.displayElement = null;
    this.isDisplayVisible = false;

    // Performance optimization settings
    this.performanceSettings = {
      throttled: false,
      updateFrequency: 60, // Hz
      maxRecordingOverhead: 2, // ms
      adaptiveThrottling: true,
    };

    this.lastUpdateTime = 0;
    this.updateInterval = 1000 / this.performanceSettings.updateFrequency;

    // Check if diagnostics should be enabled
    this.isRecording = this.shouldEnableDiagnostics();

    // リアルタイム表示用の要素を作成
    this.createDisplayElement();

    // F1キーでデバッグ表示の切り替え
    this.setupToggleKey();

    console.log("[JUMP_DIAGNOSTIC] Jump Diagnostic System initialized", {
      recording: this.isRecording,
      throttled: this.performanceSettings.throttled,
    });
  }

  /**
   * ジャンプ試行の記録
   */
  recordJumpAttempt(inputDetected, groundState, jumpExecuted, reason = null) {
    if (!this.isRecording || !this.shouldEnableDiagnostics()) return;

    // Performance monitoring
    const recordingStart = performance.now();

    const attempt = {
      timestamp: performance.now(),
      inputDetected,
      groundState: this.cloneGroundState(groundState),
      jumpExecuted,
      reason,
      playerState: {
        position: { ...this.player.position },
        velocity: { ...this.player.velocity },
        isOnGround: this.player.isOnGround,
        lastGroundContact: this.player.lastGroundContact || 0,
      },
      frameInfo: {
        frameTime: performance.now(),
        deltaTime: this.getLastDeltaTime(),
      },
    };

    this.jumpAttempts.push(attempt);

    // 最新の指定回数のみ保持（メモリ最適化）
    const maxAttempts = this.performanceSettings.throttled
      ? 50
      : this.maxAttempts;
    if (this.jumpAttempts.length > maxAttempts) {
      this.jumpAttempts.shift();
    }

    // 詳細ログ出力（スロットル時は重要なもののみ）
    if (!this.performanceSettings.throttled || !jumpExecuted) {
      this.logJumpAttempt(attempt);
    }

    // リアルタイム表示を更新（頻度制限）
    this.updateRealTimeDisplayThrottled();

    // Performance overhead measurement
    const recordingEnd = performance.now();
    const overhead = recordingEnd - recordingStart;

    if (window.performanceMonitor) {
      window.performanceMonitor.measureDiagnosticOverhead(
        () => overhead,
        "jump-diagnostic-recording"
      );
    }

    // Adaptive throttling based on overhead
    if (
      this.performanceSettings.adaptiveThrottling &&
      overhead > this.performanceSettings.maxRecordingOverhead
    ) {
      this.enableThrottling();
    }
  }

  /**
   * 地面状態のクローン作成
   */
  cloneGroundState(groundState) {
    if (!groundState) return null;

    return {
      isOnGround: groundState.isOnGround,
      confidence: groundState.confidence,
      details: groundState.details ? { ...groundState.details } : null,
      timeSinceGroundContact: groundState.timeSinceGroundContact || 0,
    };
  }

  /**
   * ジャンプ試行のログ出力
   */
  logJumpAttempt(attempt) {
    const status = attempt.jumpExecuted ? "✅ SUCCESS" : "❌ FAILED";
    const timeSinceGround = attempt.playerState.lastGroundContact
      ? performance.now() - attempt.playerState.lastGroundContact
      : "N/A";

    console.log(`[JUMP_DIAGNOSTIC] ${status} Jump attempt:`, {
      inputDetected: attempt.inputDetected,
      isOnGround: attempt.playerState.isOnGround,
      timeSinceGroundContact: timeSinceGround,
      velocity: attempt.playerState.velocity,
      position: attempt.playerState.position,
      reason: attempt.reason,
      groundState: attempt.groundState,
    });
  }

  /**
   * 診断レポートの生成
   */
  generateJumpDiagnosticReport() {
    const recent = this.jumpAttempts.slice(-20); // 最新20回を分析
    const successful = recent.filter((a) => a.jumpExecuted);
    const failed = recent.filter((a) => !a.jumpExecuted);

    const report = {
      timestamp: new Date().toISOString(),
      totalAttempts: recent.length,
      successfulJumps: successful.length,
      failedJumps: failed.length,
      successRate:
        recent.length > 0
          ? ((successful.length / recent.length) * 100).toFixed(1)
          : 0,
      commonFailureReasons: this.analyzeFailureReasons(failed),
      recommendations: this.generateRecommendations(failed),
      performanceMetrics: this.calculatePerformanceMetrics(recent),
      detailedAnalysis: this.performDetailedAnalysis(recent),
    };

    console.log("[JUMP_DIAGNOSTIC] Generated diagnostic report:", report);
    return report;
  }

  /**
   * 失敗理由の分析
   */
  analyzeFailureReasons(failedAttempts) {
    const reasons = {};

    failedAttempts.forEach((attempt) => {
      const reason = attempt.reason || "Unknown";
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    // 頻度順にソート
    return Object.entries(reasons)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: ((count / failedAttempts.length) * 100).toFixed(1),
      }));
  }

  /**
   * 推奨事項の生成
   */
  generateRecommendations(failedAttempts) {
    const recommendations = [];
    const reasons = this.analyzeFailureReasons(failedAttempts);

    reasons.forEach(({ reason, count }) => {
      switch (reason) {
        case "Not on ground":
          recommendations.push({
            issue: "Ground detection issues",
            suggestion: "Check ground detection logic and collision resolution",
            priority: "high",
            technicalDetails:
              "Player.isOnGround may be incorrectly set to false",
          });
          break;
        case "Input not detected":
          recommendations.push({
            issue: "Input detection problems",
            suggestion: "Verify input manager and event listeners",
            priority: "high",
            technicalDetails: "Space key events may not be properly captured",
          });
          break;
        case "Physics timing":
          recommendations.push({
            issue: "Physics update timing",
            suggestion: "Review physics engine update order",
            priority: "medium",
            technicalDetails: "Ground state may be reset before jump execution",
          });
          break;
        default:
          recommendations.push({
            issue: `Unknown issue: ${reason}`,
            suggestion: "Investigate specific failure case",
            priority: "low",
            technicalDetails: "Additional debugging may be required",
          });
      }
    });

    return recommendations;
  }

  /**
   * パフォーマンスメトリクスの計算
   */
  calculatePerformanceMetrics(attempts) {
    if (attempts.length === 0) return null;

    const responseTimes = attempts
      .filter((a) => a.inputDetected && a.jumpExecuted)
      .map((a) => a.frameInfo.deltaTime || 16.67); // デフォルト60FPS

    return {
      averageResponseTime:
        responseTimes.length > 0
          ? (
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            ).toFixed(2)
          : 0,
      maxResponseTime:
        responseTimes.length > 0 ? Math.max(...responseTimes).toFixed(2) : 0,
      minResponseTime:
        responseTimes.length > 0 ? Math.min(...responseTimes).toFixed(2) : 0,
      frameDrops: responseTimes.filter((t) => t > 20).length, // 20ms以上は遅延とみなす
    };
  }

  /**
   * 詳細分析の実行
   */
  performDetailedAnalysis(attempts) {
    const analysis = {
      inputPatterns: this.analyzeInputPatterns(attempts),
      groundStatePatterns: this.analyzeGroundStatePatterns(attempts),
      timingAnalysis: this.analyzeTimingPatterns(attempts),
    };

    return analysis;
  }

  /**
   * 入力パターンの分析
   */
  analyzeInputPatterns(attempts) {
    const inputDetected = attempts.filter((a) => a.inputDetected).length;
    const inputMissed = attempts.length - inputDetected;

    return {
      inputDetectionRate:
        attempts.length > 0
          ? ((inputDetected / attempts.length) * 100).toFixed(1)
          : 0,
      inputsMissed: inputMissed,
      averageInputInterval: this.calculateAverageInterval(
        attempts.filter((a) => a.inputDetected)
      ),
    };
  }

  /**
   * 地面状態パターンの分析
   */
  analyzeGroundStatePatterns(attempts) {
    const onGroundAttempts = attempts.filter((a) => a.playerState.isOnGround);
    const offGroundAttempts = attempts.filter((a) => !a.playerState.isOnGround);

    return {
      onGroundAttempts: onGroundAttempts.length,
      offGroundAttempts: offGroundAttempts.length,
      onGroundSuccessRate:
        onGroundAttempts.length > 0
          ? (
              (onGroundAttempts.filter((a) => a.jumpExecuted).length /
                onGroundAttempts.length) *
              100
            ).toFixed(1)
          : 0,
      averageGroundContactTime:
        this.calculateAverageGroundContactTime(attempts),
    };
  }

  /**
   * タイミングパターンの分析
   */
  analyzeTimingPatterns(attempts) {
    const intervals = this.calculateAverageInterval(attempts);
    const rapidInputs = attempts.filter((a, i) => {
      if (i === 0) return false;
      return a.timestamp - attempts[i - 1].timestamp < 100; // 100ms以内の連続入力
    });

    return {
      averageAttemptInterval: intervals,
      rapidInputAttempts: rapidInputs.length,
      rapidInputSuccessRate:
        rapidInputs.length > 0
          ? (
              (rapidInputs.filter((a) => a.jumpExecuted).length /
                rapidInputs.length) *
              100
            ).toFixed(1)
          : 0,
    };
  }

  /**
   * 平均間隔の計算
   */
  calculateAverageInterval(attempts) {
    if (attempts.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < attempts.length; i++) {
      intervals.push(attempts[i].timestamp - attempts[i - 1].timestamp);
    }

    return intervals.length > 0
      ? (intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(2)
      : 0;
  }

  /**
   * 平均地面接触時間の計算
   */
  calculateAverageGroundContactTime(attempts) {
    const groundContactTimes = attempts
      .filter((a) => a.playerState.lastGroundContact > 0)
      .map((a) => a.timestamp - a.playerState.lastGroundContact);

    return groundContactTimes.length > 0
      ? (
          groundContactTimes.reduce((a, b) => a + b, 0) /
          groundContactTimes.length
        ).toFixed(2)
      : 0;
  }

  /**
   * リアルタイム表示要素の作成
   */
  createDisplayElement() {
    this.displayElement = document.createElement("div");
    this.displayElement.id = "jump-diagnostic-display";
    this.displayElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            display: none;
            white-space: pre-line;
        `;
    document.body.appendChild(this.displayElement);
  }

  /**
   * F1キーでの表示切り替え設定
   */
  setupToggleKey() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "F1") {
        event.preventDefault();
        this.toggleDisplay();
      }
    });
  }

  /**
   * 表示の切り替え
   */
  toggleDisplay() {
    this.isDisplayVisible = !this.isDisplayVisible;
    this.displayElement.style.display = this.isDisplayVisible
      ? "block"
      : "none";

    if (this.isDisplayVisible) {
      this.updateRealTimeDisplay();
      console.log("[JUMP_DIAGNOSTIC] Real-time display enabled (F1 to toggle)");
    } else {
      console.log(
        "[JUMP_DIAGNOSTIC] Real-time display disabled (F1 to toggle)"
      );
    }
  }

  /**
   * リアルタイム表示の更新（スロットル対応）
   */
  updateRealTimeDisplayThrottled() {
    const now = performance.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      return; // Skip update to maintain performance
    }

    this.lastUpdateTime = now;
    this.updateRealTimeDisplay();
  }

  /**
   * リアルタイム表示の更新
   */
  updateRealTimeDisplay() {
    if (
      !this.isDisplayVisible ||
      !this.displayElement ||
      !this.shouldEnableDiagnostics()
    )
      return;

    // Performance monitoring for display updates
    if (window.performanceMonitor) {
      return window.performanceMonitor.measureDiagnosticOverhead(() => {
        this.performDisplayUpdate();
      }, "jump-diagnostic-display");
    } else {
      this.performDisplayUpdate();
    }
  }

  /**
   * 実際の表示更新処理
   */
  performDisplayUpdate() {
    const currentState = this.getCurrentPlayerState();
    const recentAttempts = this.jumpAttempts.slice(-5);
    const report = this.generateJumpDiagnosticReport();

    // Performance status
    const perfStatus = window.performanceMonitor
      ? window.performanceMonitor.getPerformanceReport()
      : null;

    const displayText = `JUMP DIAGNOSTIC SYSTEM (F1 to toggle)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT STATE:
Position: (${currentState.position.x.toFixed(
      1
    )}, ${currentState.position.y.toFixed(1)})
Velocity: (${currentState.velocity.x.toFixed(
      1
    )}, ${currentState.velocity.y.toFixed(1)})
On Ground: ${currentState.isOnGround ? "✅ YES" : "❌ NO"}
Can Jump: ${this.player.canJumpEnhanced ? this.player.canJumpEnhanced() : "N/A"}
Ground Contact: ${currentState.timeSinceGroundContact}ms ago

RECENT PERFORMANCE:
Success Rate: ${report.successRate}% (${report.successfulJumps}/${
      report.totalAttempts
    })
Avg Response: ${report.performanceMetrics?.averageResponseTime || "N/A"}ms
Frame Drops: ${report.performanceMetrics?.frameDrops || 0}
${
  perfStatus
    ? `FPS: ${perfStatus.frameRate.average.toFixed(1)} | Memory: ${
        perfStatus.memory.current
      }MB`
    : ""
}
${this.performanceSettings.throttled ? "⚠️ THROTTLED MODE" : ""}

RECENT ATTEMPTS:
${recentAttempts
  .map(
    (a) =>
      `${a.jumpExecuted ? "✅" : "❌"} ${new Date(
        a.timestamp
      ).toLocaleTimeString()} - ${a.reason || "OK"}`
  )
  .join("\n")}

RECOMMENDATIONS:
${report.recommendations
  .slice(0, 2)
  .map((r) => `• ${r.suggestion}`)
  .join("\n")}`;

    this.displayElement.textContent = displayText;
  }

  /**
   * 現在のプレイヤー状態を取得
   */
  getCurrentPlayerState() {
    const timeSinceGroundContact = this.player.lastGroundContact
      ? performance.now() - this.player.lastGroundContact
      : "N/A";

    return {
      position: { ...this.player.position },
      velocity: { ...this.player.velocity },
      isOnGround: this.player.isOnGround,
      timeSinceGroundContact,
    };
  }

  /**
   * 最後のデルタタイムを取得（概算）
   */
  getLastDeltaTime() {
    // 60FPSを想定した概算値
    return 16.67;
  }

  /**
   * 診断システムの有効/無効切り替え
   */
  setRecording(enabled) {
    this.isRecording = enabled;
    console.log(
      `[JUMP_DIAGNOSTIC] Recording ${enabled ? "enabled" : "disabled"}`
    );
  }

  /**
   * 診断データのクリア
   */
  clearDiagnosticData() {
    this.jumpAttempts = [];
    console.log("[JUMP_DIAGNOSTIC] Diagnostic data cleared");
  }

  /**
   * 診断レポートのエクスポート
   */
  exportDiagnosticReport() {
    const report = this.generateJumpDiagnosticReport();
    const exportData = {
      report,
      rawData: this.jumpAttempts,
      systemInfo: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        gameVersion: "1.0.0",
      },
    };

    // コンソールに出力
    console.log("[JUMP_DIAGNOSTIC] Exported diagnostic report:", exportData);

    // ローカルストレージに保存
    try {
      localStorage.setItem(
        "jump-diagnostic-report",
        JSON.stringify(exportData)
      );
      console.log("[JUMP_DIAGNOSTIC] Report saved to localStorage");
    } catch (error) {
      console.warn(
        "[JUMP_DIAGNOSTIC] Failed to save report to localStorage:",
        error
      );
    }

    return exportData;
  }

  /**
   * Check if diagnostics should be enabled based on performance monitor
   */
  shouldEnableDiagnostics() {
    if (window.performanceMonitor) {
      return window.performanceMonitor.shouldEnableDiagnostics(
        "jump-diagnostic"
      );
    }
    return true; // Default to enabled if no performance monitor
  }

  /**
   * Enable throttling mode for performance optimization
   */
  enableThrottling() {
    if (!this.performanceSettings.throttled) {
      this.performanceSettings.throttled = true;
      this.updateInterval = 1000 / 30; // Reduce to 30 Hz
      this.maxAttempts = 50; // Reduce memory usage

      console.log(
        "[JUMP_DIAGNOSTIC] Throttling enabled due to performance concerns"
      );
    }
  }

  /**
   * Disable throttling mode
   */
  disableThrottling() {
    if (this.performanceSettings.throttled) {
      this.performanceSettings.throttled = false;
      this.updateInterval = 1000 / this.performanceSettings.updateFrequency;
      this.maxAttempts = 100;

      console.log("[JUMP_DIAGNOSTIC] Throttling disabled");
    }
  }

  /**
   * Set throttling mode externally
   */
  setThrottling(enabled) {
    if (enabled) {
      this.enableThrottling();
    } else {
      this.disableThrottling();
    }
  }

  /**
   * Reduce update frequency for performance
   */
  reduceUpdateFrequency() {
    this.performanceSettings.updateFrequency = Math.max(
      15,
      this.performanceSettings.updateFrequency * 0.5
    );
    this.updateInterval = 1000 / this.performanceSettings.updateFrequency;

    console.log(
      `[JUMP_DIAGNOSTIC] Update frequency reduced to ${this.performanceSettings.updateFrequency} Hz`
    );
  }

  /**
   * Cleanup old data and optimize memory usage
   */
  cleanup() {
    // Remove old jump attempts
    const maxAge = 60000; // 1 minute
    const now = performance.now();

    this.jumpAttempts = this.jumpAttempts.filter(
      (attempt) => now - attempt.timestamp < maxAge
    );

    // Limit array size for memory optimization
    if (this.jumpAttempts.length > this.maxAttempts) {
      this.jumpAttempts = this.jumpAttempts.slice(-this.maxAttempts);
    }

    console.log(
      `[JUMP_DIAGNOSTIC] Cleanup completed. Retained ${this.jumpAttempts.length} attempts`
    );
  }

  /**
   * Get performance metrics for this diagnostic system
   */
  getPerformanceMetrics() {
    return {
      isThrottled: this.performanceSettings.throttled,
      updateFrequency: this.performanceSettings.updateFrequency,
      recordedAttempts: this.jumpAttempts.length,
      memoryUsage: this.estimateMemoryUsage(),
      isRecording: this.isRecording,
    };
  }

  /**
   * Estimate memory usage of diagnostic data
   */
  estimateMemoryUsage() {
    // Rough estimate: each attempt is approximately 500 bytes
    const attemptSize = 500;
    const totalSize = this.jumpAttempts.length * attemptSize;

    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: Math.round((totalSize / 1024 / 1024) * 100) / 100,
    };
  }

  /**
   * システムの破棄
   */
  destroy() {
    if (this.displayElement) {
      document.body.removeChild(this.displayElement);
    }
    this.jumpAttempts = [];
    console.log("[JUMP_DIAGNOSTIC] Jump Diagnostic System destroyed");
  }
}

// グローバルに公開
window.JumpDiagnosticSystem = JumpDiagnosticSystem;
