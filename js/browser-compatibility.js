/**
 * Browser Compatibility Checker for Mario Style Platformer
 * Tests browser support and identifies compatibility issues
 */

class BrowserCompatibilityChecker {
  constructor() {
    this.browserInfo = this.detectBrowser();
    this.supportedFeatures = {};
    this.compatibilityIssues = [];
    this.recommendations = [];

    console.log("Browser Compatibility Checker initialized");
  }

  /**
   * Detect browser information
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    const browserInfo = {
      userAgent,
      name: "Unknown",
      version: "Unknown",
      engine: "Unknown",
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };

    // Detect browser name and version
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      browserInfo.name = "Chrome";
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserInfo.version = match ? match[1] : "Unknown";
      browserInfo.engine = "Blink";
    } else if (userAgent.includes("Firefox")) {
      browserInfo.name = "Firefox";
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserInfo.version = match ? match[1] : "Unknown";
      browserInfo.engine = "Gecko";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserInfo.name = "Safari";
      const match = userAgent.match(/Version\/(\d+)/);
      browserInfo.version = match ? match[1] : "Unknown";
      browserInfo.engine = "WebKit";
    } else if (userAgent.includes("Edg")) {
      browserInfo.name = "Edge";
      const match = userAgent.match(/Edg\/(\d+)/);
      browserInfo.version = match ? match[1] : "Unknown";
      browserInfo.engine = "Blink";
    }

    return browserInfo;
  }

  /**
   * Run comprehensive compatibility check
   */
  async runCompatibilityCheck() {
    console.log("Running browser compatibility check...");

    this.compatibilityIssues = [];
    this.recommendations = [];

    // Test core web technologies
    this.checkHTML5Support();
    this.checkCanvas2DSupport();
    this.checkAudioSupport();
    this.checkJavaScriptFeatures();
    this.checkPerformanceAPIs();
    this.checkLocalStorageSupport();
    this.checkEventSupport();

    // Test game-specific requirements
    this.checkGameRequirements();

    // Generate compatibility report
    return this.generateCompatibilityReport();
  }

  /**
   * Check HTML5 support
   */
  checkHTML5Support() {
    const features = {
      canvas: !!document.createElement("canvas").getContext,
      audio: !!document.createElement("audio").canPlayType,
      localStorage: typeof Storage !== "undefined",
      sessionStorage: typeof sessionStorage !== "undefined",
      webWorkers: typeof Worker !== "undefined",
      applicationCache: !!window.applicationCache,
      geolocation: !!navigator.geolocation,
      dragAndDrop: "draggable" in document.createElement("div"),
    };

    this.supportedFeatures.html5 = features;

    // Check for critical missing features
    if (!features.canvas) {
      this.compatibilityIssues.push({
        severity: "critical",
        feature: "HTML5 Canvas",
        message: "Canvas support is required for the game to function",
        recommendation: "Please update your browser to a modern version",
      });
    }

    if (!features.audio) {
      this.compatibilityIssues.push({
        severity: "warning",
        feature: "HTML5 Audio",
        message: "Audio support is limited or missing",
        recommendation: "Game will work but without sound effects",
      });
    }

    if (!features.localStorage) {
      this.compatibilityIssues.push({
        severity: "warning",
        feature: "Local Storage",
        message: "Local storage not supported",
        recommendation: "Game progress cannot be saved locally",
      });
    }
  }

  /**
   * Check Canvas 2D support and features
   */
  checkCanvas2DSupport() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      this.compatibilityIssues.push({
        severity: "critical",
        feature: "Canvas 2D Context",
        message: "Cannot get 2D rendering context",
        recommendation: "Browser does not support Canvas 2D rendering",
      });
      return;
    }

    const features = {
      basicDrawing: typeof ctx.fillRect === "function",
      textRendering: typeof ctx.fillText === "function",
      imageDrawing: typeof ctx.drawImage === "function",
      transformations: typeof ctx.translate === "function",
      gradients: typeof ctx.createLinearGradient === "function",
      patterns: typeof ctx.createPattern === "function",
      compositing: typeof ctx.globalCompositeOperation === "string",
      imageData: typeof ctx.getImageData === "function",
    };

    this.supportedFeatures.canvas2d = features;

    // Check for missing critical features
    const criticalFeatures = [
      "basicDrawing",
      "textRendering",
      "transformations",
    ];
    for (const feature of criticalFeatures) {
      if (!features[feature]) {
        this.compatibilityIssues.push({
          severity: "critical",
          feature: `Canvas 2D ${feature}`,
          message: `${feature} not supported in Canvas 2D context`,
          recommendation: "Update browser for full Canvas 2D support",
        });
      }
    }
  }

  /**
   * Check audio support and formats
   */
  checkAudioSupport() {
    const audio = document.createElement("audio");

    const formats = {
      mp3: audio.canPlayType("audio/mpeg"),
      ogg: audio.canPlayType("audio/ogg"),
      wav: audio.canPlayType("audio/wav"),
      aac: audio.canPlayType("audio/aac"),
      webm: audio.canPlayType("audio/webm"),
    };

    const features = {
      basicPlayback: typeof audio.play === "function",
      volumeControl: typeof audio.volume === "number",
      currentTime: typeof audio.currentTime === "number",
      duration: typeof audio.duration === "number",
      autoplay: "autoplay" in audio,
      loop: "loop" in audio,
    };

    this.supportedFeatures.audio = { formats, features };

    // Check if any audio format is supported
    const supportedFormats = Object.values(formats).filter(
      (support) => support !== ""
    );
    if (supportedFormats.length === 0) {
      this.compatibilityIssues.push({
        severity: "warning",
        feature: "Audio Formats",
        message: "No supported audio formats detected",
        recommendation: "Game will run without sound",
      });
    }

    // Check Web Audio API support
    const webAudioSupported = !!(
      window.AudioContext || window.webkitAudioContext
    );
    this.supportedFeatures.webAudio = webAudioSupported;

    if (!webAudioSupported) {
      this.recommendations.push(
        "Web Audio API not supported - using fallback audio system"
      );
    }
  }

  /**
   * Check JavaScript features used by the game
   */
  checkJavaScriptFeatures() {
    const features = {
      es6Classes: typeof class {} === "function",
      arrowFunctions: (() => true)(),
      letConst: (() => {
        try {
          eval("let x = 1; const y = 2;");
          return true;
        } catch (e) {
          return false;
        }
      })(),
      destructuring: (() => {
        try {
          eval("const {a} = {a:1};");
          return true;
        } catch (e) {
          return false;
        }
      })(),
      templateLiterals: (() => {
        try {
          eval("`template`");
          return true;
        } catch (e) {
          return false;
        }
      })(),
      promises: typeof Promise !== "undefined",
      asyncAwait: (() => {
        try {
          eval("async function test() { await 1; }");
          return true;
        } catch (e) {
          return false;
        }
      })(),
      modules:
        typeof document !== "undefined" &&
        "noModule" in document.createElement("script"),
      maps: typeof Map !== "undefined",
      sets: typeof Set !== "undefined",
      symbols: typeof Symbol !== "undefined",
    };

    this.supportedFeatures.javascript = features;

    // Check for missing critical features
    const criticalFeatures = ["es6Classes", "promises"];
    for (const feature of criticalFeatures) {
      if (!features[feature]) {
        this.compatibilityIssues.push({
          severity: "critical",
          feature: `JavaScript ${feature}`,
          message: `${feature} not supported`,
          recommendation: "Update browser for modern JavaScript support",
        });
      }
    }

    // Check for recommended features
    const recommendedFeatures = ["arrowFunctions", "letConst", "maps"];
    for (const feature of recommendedFeatures) {
      if (!features[feature]) {
        this.recommendations.push(
          `Consider updating browser for ${feature} support`
        );
      }
    }
  }

  /**
   * Check Performance APIs
   */
  checkPerformanceAPIs() {
    const features = {
      performanceNow:
        typeof performance !== "undefined" &&
        typeof performance.now === "function",
      requestAnimationFrame: typeof requestAnimationFrame === "function",
      cancelAnimationFrame: typeof cancelAnimationFrame === "function",
      performanceMemory:
        typeof performance !== "undefined" && !!performance.memory,
      performanceTiming:
        typeof performance !== "undefined" && !!performance.timing,
      performanceObserver: typeof PerformanceObserver !== "undefined",
    };

    this.supportedFeatures.performance = features;

    if (!features.performanceNow) {
      this.compatibilityIssues.push({
        severity: "warning",
        feature: "Performance.now()",
        message: "High-resolution timing not available",
        recommendation: "Game timing may be less accurate",
      });
    }

    if (!features.requestAnimationFrame) {
      this.compatibilityIssues.push({
        severity: "critical",
        feature: "requestAnimationFrame",
        message: "Smooth animation API not supported",
        recommendation: "Game may have poor performance or not work at all",
      });
    }
  }

  /**
   * Check Local Storage support
   */
  checkLocalStorageSupport() {
    let localStorageSupported = false;
    let sessionStorageSupported = false;

    try {
      const testKey = "browserCompatibilityTest";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      localStorageSupported = true;
    } catch (e) {
      this.compatibilityIssues.push({
        severity: "warning",
        feature: "Local Storage",
        message: "Local storage not available or disabled",
        recommendation: "Game settings and progress cannot be saved",
      });
    }

    try {
      const testKey = "browserCompatibilityTest";
      sessionStorage.setItem(testKey, "test");
      sessionStorage.removeItem(testKey);
      sessionStorageSupported = true;
    } catch (e) {
      this.recommendations.push(
        "Session storage not available - temporary data cannot be stored"
      );
    }

    this.supportedFeatures.storage = {
      localStorage: localStorageSupported,
      sessionStorage: sessionStorageSupported,
    };
  }

  /**
   * Check event support
   */
  checkEventSupport() {
    const features = {
      keyboardEvents: typeof KeyboardEvent !== "undefined",
      mouseEvents: typeof MouseEvent !== "undefined",
      touchEvents: typeof TouchEvent !== "undefined",
      pointerEvents: typeof PointerEvent !== "undefined",
      customEvents: typeof CustomEvent !== "undefined",
      eventListeners: typeof document.addEventListener === "function",
    };

    this.supportedFeatures.events = features;

    if (!features.keyboardEvents) {
      this.compatibilityIssues.push({
        severity: "critical",
        feature: "Keyboard Events",
        message: "Keyboard input not supported",
        recommendation: "Game controls will not work",
      });
    }

    if (!features.eventListeners) {
      this.compatibilityIssues.push({
        severity: "critical",
        feature: "Event Listeners",
        message: "Modern event handling not supported",
        recommendation: "Game may not respond to user input",
      });
    }

    // Check for mobile support
    if (features.touchEvents) {
      this.recommendations.push(
        "Touch events supported - consider adding mobile controls"
      );
    }
  }

  /**
   * Check game-specific requirements
   */
  checkGameRequirements() {
    // Check viewport size
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };

    this.supportedFeatures.viewport = viewport;

    if (viewport.width < 800 || viewport.height < 600) {
      this.recommendations.push(
        "Small viewport detected - game may not display optimally"
      );
    }

    // Check for mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    this.supportedFeatures.isMobile = isMobile;

    if (isMobile) {
      this.recommendations.push(
        "Mobile device detected - consider implementing touch controls"
      );
    }

    // Check memory constraints (if available)
    if (navigator.deviceMemory) {
      this.supportedFeatures.deviceMemory = navigator.deviceMemory;

      if (navigator.deviceMemory < 2) {
        this.recommendations.push(
          "Low device memory detected - consider enabling performance optimizations"
        );
      }
    }

    // Check network connection (if available)
    if (navigator.connection) {
      this.supportedFeatures.connection = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      };

      if (
        navigator.connection.effectiveType === "slow-2g" ||
        navigator.connection.effectiveType === "2g"
      ) {
        this.recommendations.push(
          "Slow network detected - consider reducing asset sizes"
        );
      }
    }
  }

  /**
   * Generate compatibility report
   */
  generateCompatibilityReport() {
    const criticalIssues = this.compatibilityIssues.filter(
      (issue) => issue.severity === "critical"
    );
    const warnings = this.compatibilityIssues.filter(
      (issue) => issue.severity === "warning"
    );

    const report = {
      timestamp: new Date().toISOString(),
      browserInfo: this.browserInfo,
      supportedFeatures: this.supportedFeatures,
      compatibility: {
        isCompatible: criticalIssues.length === 0,
        criticalIssues: criticalIssues.length,
        warnings: warnings.length,
        recommendations: this.recommendations.length,
      },
      issues: this.compatibilityIssues,
      recommendations: this.recommendations,
    };

    this.logCompatibilityReport(report);
    return report;
  }

  /**
   * Log compatibility report to console
   */
  logCompatibilityReport(report) {
    console.log("\n" + "=".repeat(70));
    console.log("🌐 BROWSER COMPATIBILITY REPORT");
    console.log("=".repeat(70));
    console.log(
      `🖥️ Browser: ${report.browserInfo.name} ${report.browserInfo.version}`
    );
    console.log(`⚙️ Engine: ${report.browserInfo.engine}`);
    console.log(`🖱️ Platform: ${report.browserInfo.platform}`);
    console.log(`🌍 Language: ${report.browserInfo.language}`);
    console.log("=".repeat(70));

    // Compatibility status
    const compatIcon = report.compatibility.isCompatible ? "✅" : "❌";
    const compatStatus = report.compatibility.isCompatible
      ? "COMPATIBLE"
      : "INCOMPATIBLE";
    console.log(`${compatIcon} STATUS: ${compatStatus}`);

    if (report.compatibility.criticalIssues > 0) {
      console.log(`❌ Critical Issues: ${report.compatibility.criticalIssues}`);
    }

    if (report.compatibility.warnings > 0) {
      console.log(`⚠️ Warnings: ${report.compatibility.warnings}`);
    }

    if (report.compatibility.recommendations > 0) {
      console.log(
        `💡 Recommendations: ${report.compatibility.recommendations}`
      );
    }

    console.log("=".repeat(70));

    // Critical issues
    if (report.compatibility.criticalIssues > 0) {
      console.log("❌ CRITICAL ISSUES:");
      report.issues
        .filter((issue) => issue.severity === "critical")
        .forEach((issue) => {
          console.log(`   • ${issue.feature}: ${issue.message}`);
          console.log(`     Recommendation: ${issue.recommendation}`);
        });
      console.log("=".repeat(70));
    }

    // Warnings
    if (report.compatibility.warnings > 0) {
      console.log("⚠️ WARNINGS:");
      report.issues
        .filter((issue) => issue.severity === "warning")
        .forEach((issue) => {
          console.log(`   • ${issue.feature}: ${issue.message}`);
          console.log(`     Recommendation: ${issue.recommendation}`);
        });
      console.log("=".repeat(70));
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log("💡 RECOMMENDATIONS:");
      report.recommendations.forEach((rec) => {
        console.log(`   • ${rec}`);
      });
      console.log("=".repeat(70));
    }

    // Feature support summary
    console.log("📋 FEATURE SUPPORT SUMMARY:");
    console.log(
      `   HTML5 Canvas: ${report.supportedFeatures.html5?.canvas ? "✅" : "❌"}`
    );
    console.log(
      `   HTML5 Audio: ${report.supportedFeatures.html5?.audio ? "✅" : "❌"}`
    );
    console.log(
      `   Local Storage: ${
        report.supportedFeatures.storage?.localStorage ? "✅" : "❌"
      }`
    );
    console.log(
      `   ES6 Classes: ${
        report.supportedFeatures.javascript?.es6Classes ? "✅" : "❌"
      }`
    );
    console.log(
      `   Performance API: ${
        report.supportedFeatures.performance?.performanceNow ? "✅" : "❌"
      }`
    );
    console.log(
      `   Animation Frame: ${
        report.supportedFeatures.performance?.requestAnimationFrame
          ? "✅"
          : "❌"
      }`
    );
    console.log("=".repeat(70));

    return report;
  }

  /**
   * Get browser-specific optimizations
   */
  getBrowserOptimizations() {
    const optimizations = [];

    switch (this.browserInfo.name) {
      case "Chrome":
        optimizations.push(
          "Enable hardware acceleration for better Canvas performance"
        );
        optimizations.push("Use Chrome DevTools for performance profiling");
        break;

      case "Firefox":
        optimizations.push(
          "Consider using Firefox-specific Canvas optimizations"
        );
        optimizations.push("Test with Firefox Developer Tools");
        break;

      case "Safari":
        optimizations.push("Be aware of Safari-specific audio limitations");
        optimizations.push("Test touch events on iOS Safari");
        break;

      case "Edge":
        optimizations.push("Leverage Edge performance improvements");
        optimizations.push("Test with Edge DevTools");
        break;
    }

    return optimizations;
  }

  /**
   * Apply automatic compatibility fixes
   */
  async applyCompatibilityFixes() {
    console.log("互換性修正を適用中...");
    const fixes = [];

    // Apply polyfills and fallbacks
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => {
        return setTimeout(callback, 1000 / 60);
      };
      window.cancelAnimationFrame = clearTimeout;
      fixes.push("requestAnimationFrame polyfill applied");
    }

    if (!performance.now) {
      performance.now = () => Date.now();
      fixes.push("performance.now() polyfill applied");
    }

    // Fix audio context issues
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (!window.audioContext) {
          window.audioContext = new AudioContextClass();
          fixes.push("Audio context initialized");
        }
      } catch (error) {
        console.warn("Audio context initialization failed:", error);
      }
    }

    // Fix viewport issues on mobile
    if (this.supportedFeatures.isMobile) {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement("meta");
        viewport.name = "viewport";
        viewport.content =
          "width=device-width, initial-scale=1.0, user-scalable=no";
        document.head.appendChild(viewport);
        fixes.push("Viewport meta tag added for mobile");
      }
    }

    // Fix touch-action for better mobile performance
    if (this.supportedFeatures.events.touchEvents) {
      document.body.style.touchAction = "manipulation";
      fixes.push("Touch-action optimization applied");
    }

    console.log("適用された修正:", fixes);
    return fixes;
  }

  /**
   * Test game performance in current browser
   */
  async testGamePerformance() {
    console.log("Testing game performance in current browser...");

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return { error: "Canvas 2D context not available" };
    }

    // Performance test
    const iterations = 100;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate game rendering
      ctx.fillStyle = "#5C94FC";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw some rectangles (simulate game objects)
      for (let j = 0; j < 50; j++) {
        ctx.fillStyle = `hsl(${j * 7}, 70%, 50%)`;
        ctx.fillRect(j * 15, j * 10, 32, 32);
      }

      // Draw some text (simulate UI)
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px Arial";
      ctx.fillText("Performance Test", 10, 30);

      const end = performance.now();
      times.push(end - start);
    }

    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const fps = 1000 / averageTime;

    const result = {
      averageFrameTime: averageTime,
      maxFrameTime: maxTime,
      minFrameTime: minTime,
      estimatedFPS: fps,
      samples: iterations,
      performanceLevel: fps >= 50 ? "good" : fps >= 30 ? "fair" : "poor",
    };

    console.log("Performance test results:", result);
    return result;
  }
}

// Export for use in main game
window.BrowserCompatibilityChecker = BrowserCompatibilityChecker;
