/**
 * ユーザビリティ改善システム - マリオスタイルプラットフォーマー
 * ユーザーエクスペリエンスの向上とアクセシビリティの改善
 */

class UsabilityImprovements {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.improvements = [];
    this.appliedImprovements = [];
    this.userPreferences = this.loadUserPreferences();

    // アクセシビリティ設定
    this.accessibilitySettings = {
      highContrast: false,
      reducedMotion: false,
      largerText: false,
      colorBlindFriendly: false,
      audioDescriptions: false,
    };

    // モバイル対応設定
    this.mobileSettings = {
      touchControlsEnabled: false,
      virtualButtons: false,
      gestureControls: false,
      adaptiveUI: false,
    };

    console.log("ユーザビリティ改善システムが初期化されました");
    this.detectUserNeeds();
  }

  /**
   * ユーザーのニーズを検出
   */
  detectUserNeeds() {
    // モバイルデバイスの検出
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      this.improvements.push({
        category: "mobile",
        priority: "high",
        description:
          "モバイルデバイスが検出されました - タッチコントロールを有効にすることをお勧めします",
        action: () => this.enableMobileControls(),
        autoApply: false,
      });
    }

    // 画面サイズの確認
    if (window.innerWidth < 800 || window.innerHeight < 600) {
      this.improvements.push({
        category: "display",
        priority: "medium",
        description: "小さな画面が検出されました - UIの適応を推奨します",
        action: () => this.enableAdaptiveUI(),
        autoApply: true,
      });
    }

    // ユーザーの設定を確認
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.improvements.push({
        category: "accessibility",
        priority: "high",
        description: "モーション軽減設定が検出されました",
        action: () => this.enableReducedMotion(),
        autoApply: true,
      });
    }

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-contrast: high)").matches
    ) {
      this.improvements.push({
        category: "accessibility",
        priority: "high",
        description: "高コントラスト設定が検出されました",
        action: () => this.enableHighContrast(),
        autoApply: true,
      });
    }

    // キーボードナビゲーションの確認
    this.checkKeyboardNavigation();
  }

  /**
   * モバイルコントロールを有効化
   */
  enableMobileControls() {
    this.mobileSettings.touchControlsEnabled = true;
    this.createVirtualButtons();
    this.enableGestureControls();

    console.log("モバイルコントロールが有効になりました");

    this.appliedImprovements.push({
      improvement: "モバイルコントロール",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 仮想ボタンを作成
   */
  createVirtualButtons() {
    if (this.mobileSettings.virtualButtons) return;

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "virtual-controls";
    buttonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      height: 120px;
      pointer-events: none;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    `;

    // 左側のコントロール（移動）
    const leftControls = document.createElement("div");
    leftControls.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    const leftButton = this.createVirtualButton("←", "moveLeft");
    const rightButton = this.createVirtualButton("→", "moveRight");

    leftControls.appendChild(leftButton);
    leftControls.appendChild(rightButton);

    // 右側のコントロール（アクション）
    const rightControls = document.createElement("div");
    rightControls.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    const jumpButton = this.createVirtualButton("↑", "jump");
    const dashButton = this.createVirtualButton("D", "dash");

    rightControls.appendChild(jumpButton);
    rightControls.appendChild(dashButton);

    buttonContainer.appendChild(leftControls);
    buttonContainer.appendChild(rightControls);

    document.body.appendChild(buttonContainer);

    this.mobileSettings.virtualButtons = true;
    console.log("仮想ボタンが作成されました");
  }

  /**
   * 仮想ボタンを作成
   */
  createVirtualButton(text, action) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #fff;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 20px;
      font-weight: bold;
      pointer-events: auto;
      touch-action: manipulation;
      user-select: none;
    `;

    // タッチイベントの処理
    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.simulateKeyPress(action, true);
      button.style.background = "rgba(255, 255, 255, 0.3)";
    });

    button.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.simulateKeyPress(action, false);
      button.style.background = "rgba(0, 0, 0, 0.5)";
    });

    return button;
  }

  /**
   * キー入力をシミュレート
   */
  simulateKeyPress(action, isPressed) {
    if (this.gameEngine.inputManager) {
      // InputManagerに直接アクションを送信
      const actionMap = {
        moveLeft: "ArrowLeft",
        moveRight: "ArrowRight",
        jump: "Space",
        dash: "KeyX",
      };

      const keyCode = actionMap[action];
      if (keyCode) {
        const event = {
          code: keyCode,
          type: isPressed ? "keydown" : "keyup",
          preventDefault: () => {},
        };

        if (isPressed) {
          this.gameEngine.inputManager.handleKeyDown(event);
        } else {
          this.gameEngine.inputManager.handleKeyUp(event);
        }
      }
    }
  }

  /**
   * ジェスチャーコントロールを有効化
   */
  enableGestureControls() {
    if (this.mobileSettings.gestureControls) return;

    const canvas = this.gameEngine.canvas;
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
    });

    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // スワイプジェスチャーの検出
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.simulateKeyPress("moveRight", true);
          setTimeout(() => this.simulateKeyPress("moveRight", false), 100);
        } else {
          this.simulateKeyPress("moveLeft", true);
          setTimeout(() => this.simulateKeyPress("moveLeft", false), 100);
        }
      }

      if (deltaY < -50) {
        this.simulateKeyPress("jump", true);
        setTimeout(() => this.simulateKeyPress("jump", false), 100);
      }
    });

    this.mobileSettings.gestureControls = true;
    console.log("ジェスチャーコントロールが有効になりました");
  }

  /**
   * 適応的UIを有効化
   */
  enableAdaptiveUI() {
    if (this.mobileSettings.adaptiveUI) return;

    const canvas = this.gameEngine.canvas;
    const container = canvas.parentElement;

    // キャンバスのサイズを調整
    const resizeCanvas = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 800);
      const maxHeight = Math.min(window.innerHeight - 40, 600);

      const aspectRatio = 800 / 600;
      let newWidth = maxWidth;
      let newHeight = maxWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
      }

      canvas.style.width = newWidth + "px";
      canvas.style.height = newHeight + "px";
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    this.mobileSettings.adaptiveUI = true;
    console.log("適応的UIが有効になりました");
  }

  /**
   * モーション軽減を有効化
   */
  enableReducedMotion() {
    this.accessibilitySettings.reducedMotion = true;

    // ゲームエンジンにモーション軽減設定を適用
    if (this.gameEngine.performanceOptimizer) {
      this.gameEngine.performanceOptimizer.enableReducedMotion();
    }

    console.log("モーション軽減が有効になりました");
  }

  /**
   * 高コントラストを有効化
   */
  enableHighContrast() {
    this.accessibilitySettings.highContrast = true;

    // CSSクラスを追加してスタイルを変更
    document.body.classList.add("high-contrast");

    // 動的にスタイルを追加
    if (!document.getElementById("high-contrast-styles")) {
      const style = document.createElement("style");
      style.id = "high-contrast-styles";
      style.textContent = `
        .high-contrast canvas {
          filter: contrast(150%) brightness(110%);
        }
        .high-contrast #virtual-controls button {
          border: 3px solid #fff !important;
          background: rgba(0, 0, 0, 0.8) !important;
        }
      `;
      document.head.appendChild(style);
    }

    console.log("高コントラストが有効になりました");
  }

  /**
   * キーボードナビゲーションを確認
   */
  checkKeyboardNavigation() {
    // フォーカス可能な要素を確認
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      this.improvements.push({
        category: "accessibility",
        priority: "medium",
        description: "キーボードナビゲーション要素が不足しています",
        action: () => this.improveKeyboardNavigation(),
        autoApply: false,
      });
    }
  }

  /**
   * キーボードナビゲーションを改善
   */
  improveKeyboardNavigation() {
    // ゲームキャンバスにtabindexを追加
    const canvas = this.gameEngine.canvas;
    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "マリオスタイルプラットフォーマーゲーム");

    // フォーカス時の視覚的フィードバック
    canvas.addEventListener("focus", () => {
      canvas.style.outline = "3px solid #4A90E2";
    });

    canvas.addEventListener("blur", () => {
      canvas.style.outline = "none";
    });

    console.log("キーボードナビゲーションが改善されました");
  }

  /**
   * ユーザー設定を保存
   */
  saveUserPreferences() {
    const preferences = {
      accessibility: this.accessibilitySettings,
      mobile: this.mobileSettings,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "mario-platformer-preferences",
        JSON.stringify(preferences)
      );
      console.log("ユーザー設定が保存されました");
    } catch (error) {
      console.warn("ユーザー設定の保存に失敗しました:", error);
    }
  }

  /**
   * ユーザー設定を読み込み
   */
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem("mario-platformer-preferences");
      if (saved) {
        const preferences = JSON.parse(saved);
        console.log("ユーザー設定が読み込まれました");
        return preferences;
      }
    } catch (error) {
      console.warn("ユーザー設定の読み込みに失敗しました:", error);
    }
    return null;
  }

  /**
   * 改善提案を適用
   */
  applyImprovements() {
    const autoApplyImprovements = this.improvements.filter(
      (imp) => imp.autoApply
    );

    console.log(`${autoApplyImprovements.length}個の改善を自動適用します...`);

    for (const improvement of autoApplyImprovements) {
      try {
        improvement.action();
        this.appliedImprovements.push({
          improvement: improvement.description,
          category: improvement.category,
          timestamp: new Date().toISOString(),
          success: true,
        });
      } catch (error) {
        console.error(`改善の適用に失敗: ${improvement.description}`, error);
        this.appliedImprovements.push({
          improvement: improvement.description,
          category: improvement.category,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        });
      }
    }

    // 設定を保存
    this.saveUserPreferences();
  }

  /**
   * 改善レポートを生成
   */
  generateImprovementReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalImprovements: this.improvements.length,
      appliedImprovements: this.appliedImprovements.length,
      categories: {
        accessibility: this.improvements.filter(
          (imp) => imp.category === "accessibility"
        ).length,
        mobile: this.improvements.filter((imp) => imp.category === "mobile")
          .length,
        display: this.improvements.filter((imp) => imp.category === "display")
          .length,
      },
      settings: {
        accessibility: this.accessibilitySettings,
        mobile: this.mobileSettings,
      },
      improvements: this.improvements,
      applied: this.appliedImprovements,
    };

    this.logImprovementReport(report);
    return report;
  }

  /**
   * 改善レポートをログ出力
   */
  logImprovementReport(report) {
    console.log("\n" + "=".repeat(60));
    console.log("🎯 ユーザビリティ改善レポート");
    console.log("=".repeat(60));
    console.log(`📊 総改善提案数: ${report.totalImprovements}`);
    console.log(`✅ 適用済み改善: ${report.appliedImprovements}`);
    console.log(`♿ アクセシビリティ: ${report.categories.accessibility}`);
    console.log(`📱 モバイル対応: ${report.categories.mobile}`);
    console.log(`🖥️ ディスプレイ: ${report.categories.display}`);
    console.log("=".repeat(60));

    // 適用された改善
    if (report.applied.length > 0) {
      console.log("✅ 適用された改善:");
      report.applied.forEach((improvement) => {
        const status = improvement.success ? "✅" : "❌";
        console.log(`   ${status} ${improvement.improvement}`);
      });
      console.log("=".repeat(60));
    }

    // 未適用の改善提案
    const unapplied = report.improvements.filter((imp) => !imp.autoApply);
    if (unapplied.length > 0) {
      console.log("💡 手動適用可能な改善提案:");
      unapplied.forEach((improvement) => {
        console.log(
          `   • ${improvement.description} (優先度: ${improvement.priority})`
        );
      });
      console.log("=".repeat(60));
    }

    // 現在の設定
    console.log("⚙️ 現在の設定:");
    console.log(
      `   高コントラスト: ${
        report.settings.accessibility.highContrast ? "ON" : "OFF"
      }`
    );
    console.log(
      `   モーション軽減: ${
        report.settings.accessibility.reducedMotion ? "ON" : "OFF"
      }`
    );
    console.log(
      `   タッチコントロール: ${
        report.settings.mobile.touchControlsEnabled ? "ON" : "OFF"
      }`
    );
    console.log(
      `   適応的UI: ${report.settings.mobile.adaptiveUI ? "ON" : "OFF"}`
    );
    console.log("=".repeat(60));
  }

  /**
   * 手動で改善を適用
   */
  applyManualImprovement(improvementIndex) {
    const improvement = this.improvements[improvementIndex];
    if (!improvement) {
      console.error("指定された改善が見つかりません");
      return false;
    }

    try {
      improvement.action();
      console.log(`改善が適用されました: ${improvement.description}`);

      this.appliedImprovements.push({
        improvement: improvement.description,
        category: improvement.category,
        timestamp: new Date().toISOString(),
        success: true,
        manual: true,
      });

      this.saveUserPreferences();
      return true;
    } catch (error) {
      console.error(`改善の適用に失敗: ${improvement.description}`, error);
      return false;
    }
  }

  /**
   * 統計情報を取得
   */
  getStatistics() {
    return {
      totalImprovements: this.improvements.length,
      appliedImprovements: this.appliedImprovements.length,
      accessibilityEnabled: Object.values(this.accessibilitySettings).filter(
        Boolean
      ).length,
      mobileEnabled: Object.values(this.mobileSettings).filter(Boolean).length,
      userPreferencesLoaded: !!this.userPreferences,
    };
  }
}

// グローバルに公開
window.UsabilityImprovements = UsabilityImprovements;
