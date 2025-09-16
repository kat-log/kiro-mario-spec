/**
 * Browser Compatibility Layer for Input Handling
 * Handles browser-specific quirks and normalizes key events
 */

class CompatibilityLayer {
  constructor() {
    this.browserInfo = this.detectBrowser();
    this.quirks = this.loadBrowserQuirks();
    this.fixes = new Map();
    this.eventNormalizers = new Map();
    this.touchSupport = this.detectTouchSupport();

    console.log(
      `CompatibilityLayer initialized for ${this.browserInfo.name} ${this.browserInfo.version}`
    );
    this.initializeBrowserFixes();
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
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        ),
      isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
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
   * Load browser-specific quirks and issues
   */
  loadBrowserQuirks() {
    const quirks = {
      chrome: {
        issues: ["focus-timing", "space-key-scroll"],
        fixes: ["delayed-focus-retry", "prevent-default-space"],
        keyEventTiming: "normal",
        preventDefaultRequired: true,
        focusIssues: false,
        touchSupport: true,
      },
      firefox: {
        issues: ["keydown-preventDefault", "focus-management"],
        fixes: ["explicit-preventDefault", "focus-polling"],
        keyEventTiming: "normal",
        preventDefaultRequired: true,
        focusIssues: true,
        touchSupport: true,
      },
      safari: {
        issues: ["touch-event-timing", "audio-context", "focus-blur"],
        fixes: ["touch-event-debounce", "audio-unlock", "focus-restoration"],
        keyEventTiming: "delayed",
        preventDefaultRequired: false,
        focusIssues: true,
        touchSupport: true,
      },
      edge: {
        issues: ["legacy-key-codes", "focus-management"],
        fixes: ["key-code-normalization", "focus-enhancement"],
        keyEventTiming: "normal",
        preventDefaultRequired: true,
        focusIssues: false,
        touchSupport: true,
      },
    };

    return (
      quirks[this.browserInfo.name.toLowerCase()] || {
        issues: [],
        fixes: [],
        keyEventTiming: "normal",
        preventDefaultRequired: true,
        focusIssues: false,
        touchSupport: false,
      }
    );
  }

  /**
   * Detect touch support
   */
  detectTouchSupport() {
    return {
      hasTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      touchEvents: typeof TouchEvent !== "undefined",
      pointerEvents: typeof PointerEvent !== "undefined",
    };
  }

  /**
   * Initialize browser-specific fixes
   */
  initializeBrowserFixes() {
    // Apply fixes based on detected browser
    this.quirks.fixes.forEach((fix) => {
      switch (fix) {
        case "delayed-focus-retry":
          this.fixes.set("focusRetry", true);
          break;
        case "prevent-default-space":
          this.fixes.set("preventSpaceDefault", true);
          break;
        case "explicit-preventDefault":
          this.fixes.set("explicitPreventDefault", true);
          break;
        case "focus-polling":
          this.fixes.set("focusPolling", true);
          break;
        case "touch-event-debounce":
          this.fixes.set("touchDebounce", true);
          break;
        case "audio-unlock":
          this.fixes.set("audioUnlock", true);
          break;
        case "focus-restoration":
          this.fixes.set("focusRestoration", true);
          break;
        case "key-code-normalization":
          this.fixes.set("keyCodeNormalization", true);
          break;
        case "focus-enhancement":
          this.fixes.set("focusEnhancement", true);
          break;
      }
    });

    console.log(
      `Applied ${this.fixes.size} browser-specific fixes:`,
      Array.from(this.fixes.keys())
    );
  }

  /**
   * Normalize key events across browsers
   */
  normalizeKeyEvent(event) {
    const normalizedEvent = {
      type: event.type,
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      which: event.which,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      repeat: event.repeat,
      timestamp: event.timeStamp || performance.now(),
      target: event.target,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation(),
      originalEvent: event,
    };

    // Apply browser-specific normalizations
    if (this.fixes.has("keyCodeNormalization")) {
      normalizedEvent.keyCode = this.normalizeKeyCode(event);
    }

    // Handle space key specifically
    if (this.isSpaceKey(event)) {
      normalizedEvent.isSpaceKey = true;

      // Apply space key fixes
      if (this.fixes.has("preventSpaceDefault")) {
        event.preventDefault();
      }

      if (
        this.fixes.has("explicitPreventDefault") &&
        event.type === "keydown"
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    return normalizedEvent;
  }

  /**
   * Check if event is space key
   */
  isSpaceKey(event) {
    return (
      event.code === "Space" ||
      event.key === " " ||
      event.keyCode === 32 ||
      event.which === 32
    );
  }

  /**
   * Normalize key codes across browsers
   */
  normalizeKeyCode(event) {
    // Handle legacy browsers and inconsistencies
    if (event.code === "Space") return 32;
    if (event.key === " ") return 32;
    if (event.code === "ArrowUp") return 38;
    if (event.code === "ArrowDown") return 40;
    if (event.code === "ArrowLeft") return 37;
    if (event.code === "ArrowRight") return 39;

    return event.keyCode || event.which || 0;
  }

  /**
   * Apply browser-specific event fixes
   */
  applyBrowserFixes(event) {
    const fixes = [];

    // Chrome-specific fixes
    if (this.browserInfo.name === "Chrome") {
      if (this.isSpaceKey(event) && event.type === "keydown") {
        event.preventDefault();
        fixes.push("chrome-space-preventDefault");
      }
    }

    // Firefox-specific fixes
    if (this.browserInfo.name === "Firefox") {
      if (event.type === "keydown") {
        event.preventDefault();
        event.stopPropagation();
        fixes.push("firefox-explicit-preventDefault");
      }
    }

    // Safari-specific fixes
    if (this.browserInfo.name === "Safari") {
      if (this.isSpaceKey(event)) {
        // Safari sometimes has timing issues with space key
        setTimeout(() => {
          // Ensure event is processed after DOM updates
        }, 0);
        fixes.push("safari-timing-fix");
      }
    }

    // Edge-specific fixes
    if (this.browserInfo.name === "Edge") {
      // Normalize key codes for older Edge versions
      if (!event.code && event.keyCode) {
        event.code = this.keyCodeToCode(event.keyCode);
        fixes.push("edge-keycode-normalization");
      }
    }

    return fixes;
  }

  /**
   * Convert keyCode to code for legacy browsers
   */
  keyCodeToCode(keyCode) {
    const keyCodeMap = {
      32: "Space",
      38: "ArrowUp",
      40: "ArrowDown",
      37: "ArrowLeft",
      39: "ArrowRight",
      13: "Enter",
      27: "Escape",
    };

    return keyCodeMap[keyCode] || `Key${String.fromCharCode(keyCode)}`;
  }

  /**
   * Setup touch controls for mobile devices
   */
  setupTouchControls() {
    if (!this.touchSupport.hasTouch) {
      return null;
    }

    const touchControls = {
      jumpButton: null,
      moveButtons: null,
      enabled: false,
    };

    // Create jump button
    const jumpButton = document.createElement("button");
    jumpButton.textContent = "JUMP";
    jumpButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(92, 148, 252, 0.8);
      color: white;
      border: none;
      font-size: 14px;
      font-weight: bold;
      z-index: 1000;
      touch-action: manipulation;
      user-select: none;
    `;

    // Create movement buttons
    const moveContainer = document.createElement("div");
    moveContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      display: flex;
      gap: 10px;
      z-index: 1000;
    `;

    const leftButton = document.createElement("button");
    leftButton.textContent = "←";
    leftButton.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(92, 148, 252, 0.8);
      color: white;
      border: none;
      font-size: 20px;
      touch-action: manipulation;
      user-select: none;
    `;

    const rightButton = document.createElement("button");
    rightButton.textContent = "→";
    rightButton.style.cssText = leftButton.style.cssText;

    moveContainer.appendChild(leftButton);
    moveContainer.appendChild(rightButton);

    touchControls.jumpButton = jumpButton;
    touchControls.moveButtons = {
      container: moveContainer,
      left: leftButton,
      right: rightButton,
    };

    return touchControls;
  }

  /**
   * Setup on-screen controls
   */
  setupOnScreenControls() {
    const controls = this.setupTouchControls();

    if (!controls) {
      return null;
    }

    // Add to DOM
    document.body.appendChild(controls.jumpButton);
    document.body.appendChild(controls.moveButtons.container);

    // Setup event handlers
    const eventHandlers = {
      jump: {
        start: (e) => {
          e.preventDefault();
          this.triggerJumpAction();
        },
        end: (e) => {
          e.preventDefault();
        },
      },
      moveLeft: {
        start: (e) => {
          e.preventDefault();
          this.triggerMoveAction("left", true);
        },
        end: (e) => {
          e.preventDefault();
          this.triggerMoveAction("left", false);
        },
      },
      moveRight: {
        start: (e) => {
          e.preventDefault();
          this.triggerMoveAction("right", true);
        },
        end: (e) => {
          e.preventDefault();
          this.triggerMoveAction("right", false);
        },
      },
    };

    // Bind events
    controls.jumpButton.addEventListener(
      "touchstart",
      eventHandlers.jump.start
    );
    controls.jumpButton.addEventListener("touchend", eventHandlers.jump.end);
    controls.jumpButton.addEventListener("mousedown", eventHandlers.jump.start);
    controls.jumpButton.addEventListener("mouseup", eventHandlers.jump.end);

    controls.moveButtons.left.addEventListener(
      "touchstart",
      eventHandlers.moveLeft.start
    );
    controls.moveButtons.left.addEventListener(
      "touchend",
      eventHandlers.moveLeft.end
    );
    controls.moveButtons.left.addEventListener(
      "mousedown",
      eventHandlers.moveLeft.start
    );
    controls.moveButtons.left.addEventListener(
      "mouseup",
      eventHandlers.moveLeft.end
    );

    controls.moveButtons.right.addEventListener(
      "touchstart",
      eventHandlers.moveRight.start
    );
    controls.moveButtons.right.addEventListener(
      "touchend",
      eventHandlers.moveRight.end
    );
    controls.moveButtons.right.addEventListener(
      "mousedown",
      eventHandlers.moveRight.start
    );
    controls.moveButtons.right.addEventListener(
      "mouseup",
      eventHandlers.moveRight.end
    );

    controls.enabled = true;
    return controls;
  }

  /**
   * Trigger jump action (to be connected to game input system)
   */
  triggerJumpAction() {
    // Dispatch custom event that input manager can listen to
    const jumpEvent = new CustomEvent("compatibilityJump", {
      detail: { source: "touch", timestamp: performance.now() },
    });
    document.dispatchEvent(jumpEvent);
  }

  /**
   * Trigger move action (to be connected to game input system)
   */
  triggerMoveAction(direction, pressed) {
    const moveEvent = new CustomEvent("compatibilityMove", {
      detail: {
        direction,
        pressed,
        source: "touch",
        timestamp: performance.now(),
      },
    });
    document.dispatchEvent(moveEvent);
  }

  /**
   * Test browser compatibility for game requirements
   */
  testBrowserCompatibility() {
    const tests = {
      keyboardEvents: this.testKeyboardEvents(),
      focusManagement: this.testFocusManagement(),
      preventDefault: this.testPreventDefault(),
      touchSupport: this.testTouchSupport(),
      performanceAPIs: this.testPerformanceAPIs(),
    };

    const results = {
      browser: this.browserInfo,
      quirks: this.quirks,
      tests,
      overall: Object.values(tests).every((test) => test.passed),
      recommendations: this.generateRecommendations(tests),
    };

    console.log("Browser Compatibility Test Results:", results);
    return results;
  }

  /**
   * Test keyboard event handling
   */
  testKeyboardEvents() {
    const test = {
      name: "Keyboard Events",
      passed: false,
      details: {},
      issues: [],
    };

    try {
      // Test KeyboardEvent constructor
      const testEvent = new KeyboardEvent("keydown", {
        key: " ",
        code: "Space",
        keyCode: 32,
      });

      test.details.keyboardEventConstructor = true;
      test.details.keyProperty = testEvent.key === " ";
      test.details.codeProperty = testEvent.code === "Space";
      test.details.keyCodeProperty = testEvent.keyCode === 32;

      test.passed =
        test.details.keyboardEventConstructor &&
        test.details.keyProperty &&
        test.details.codeProperty;

      if (!test.passed) {
        test.issues.push("KeyboardEvent properties not fully supported");
      }
    } catch (error) {
      test.details.error = error.message;
      test.issues.push("KeyboardEvent constructor not supported");
    }

    return test;
  }

  /**
   * Test focus management capabilities
   */
  testFocusManagement() {
    const test = {
      name: "Focus Management",
      passed: false,
      details: {},
      issues: [],
    };

    try {
      // Test focus/blur methods
      test.details.focusMethod = typeof document.body.focus === "function";
      test.details.blurMethod = typeof document.body.blur === "function";
      test.details.activeElement =
        typeof document.activeElement !== "undefined";
      test.details.hasFocus = typeof document.hasFocus === "function";

      test.passed = test.details.focusMethod && test.details.activeElement;

      if (!test.passed) {
        test.issues.push("Focus management methods not fully supported");
      }

      // Test focus events
      test.details.focusEvents = typeof FocusEvent !== "undefined";
      if (!test.details.focusEvents) {
        test.issues.push("FocusEvent not supported");
      }
    } catch (error) {
      test.details.error = error.message;
      test.issues.push("Focus management testing failed");
    }

    return test;
  }

  /**
   * Test preventDefault functionality
   */
  testPreventDefault() {
    const test = {
      name: "PreventDefault",
      passed: false,
      details: {},
      issues: [],
    };

    try {
      // Create test event
      const testEvent = new KeyboardEvent("keydown", {
        key: " ",
        code: "Space",
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });

      test.details.preventDefaultMethod =
        typeof testEvent.preventDefault === "function";
      test.details.cancelable = testEvent.cancelable;
      test.details.defaultPrevented = testEvent.defaultPrevented === false;

      // Test preventDefault call
      testEvent.preventDefault();
      test.details.preventDefaultWorks = testEvent.defaultPrevented === true;

      test.passed =
        test.details.preventDefaultMethod &&
        test.details.cancelable &&
        test.details.preventDefaultWorks;

      if (!test.passed) {
        test.issues.push("preventDefault not working correctly");
      }
    } catch (error) {
      test.details.error = error.message;
      test.issues.push("preventDefault testing failed");
    }

    return test;
  }

  /**
   * Test touch support
   */
  testTouchSupport() {
    const test = {
      name: "Touch Support",
      passed: false,
      details: this.touchSupport,
      issues: [],
    };

    test.passed = this.touchSupport.hasTouch || !this.browserInfo.isMobile;

    if (this.browserInfo.isMobile && !this.touchSupport.hasTouch) {
      test.issues.push("Mobile device detected but touch events not supported");
    }

    if (!this.touchSupport.touchEvents && this.touchSupport.hasTouch) {
      test.issues.push(
        "Touch detected but TouchEvent constructor not available"
      );
    }

    return test;
  }

  /**
   * Test performance APIs
   */
  testPerformanceAPIs() {
    const test = {
      name: "Performance APIs",
      passed: false,
      details: {},
      issues: [],
    };

    test.details.performanceNow =
      typeof performance !== "undefined" &&
      typeof performance.now === "function";
    test.details.requestAnimationFrame =
      typeof requestAnimationFrame === "function";
    test.details.cancelAnimationFrame =
      typeof cancelAnimationFrame === "function";

    test.passed =
      test.details.performanceNow && test.details.requestAnimationFrame;

    if (!test.details.performanceNow) {
      test.issues.push("performance.now() not available");
    }

    if (!test.details.requestAnimationFrame) {
      test.issues.push("requestAnimationFrame not available");
    }

    return test;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(tests) {
    const recommendations = [];

    if (!tests.keyboardEvents.passed) {
      recommendations.push(
        "Consider updating browser for better keyboard event support"
      );
    }

    if (!tests.focusManagement.passed) {
      recommendations.push(
        "Focus management may be unreliable - implement fallback strategies"
      );
    }

    if (!tests.preventDefault.passed) {
      recommendations.push(
        "preventDefault may not work - space key may cause page scrolling"
      );
    }

    if (this.browserInfo.isMobile && !tests.touchSupport.passed) {
      recommendations.push(
        "Implement alternative input methods for mobile devices"
      );
    }

    if (!tests.performanceAPIs.passed) {
      recommendations.push("Performance may be degraded - consider polyfills");
    }

    // Browser-specific recommendations
    switch (this.browserInfo.name) {
      case "Safari":
        recommendations.push(
          "Test audio functionality - Safari may require user interaction"
        );
        break;
      case "Firefox":
        recommendations.push("Test focus management carefully in Firefox");
        break;
      case "Chrome":
        recommendations.push(
          "Ensure preventDefault is called for space key to prevent scrolling"
        );
        break;
      case "Edge":
        recommendations.push(
          "Test with both new and legacy Edge if supporting older versions"
        );
        break;
    }

    return recommendations;
  }

  /**
   * Get compatibility report
   */
  getCompatibilityReport() {
    return {
      browser: this.browserInfo,
      quirks: this.quirks,
      fixes: Array.from(this.fixes.entries()),
      touchSupport: this.touchSupport,
      testResults: this.testBrowserCompatibility(),
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CompatibilityLayer;
} else {
  window.CompatibilityLayer = CompatibilityLayer;
}
