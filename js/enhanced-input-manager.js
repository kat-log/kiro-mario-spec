/**
 * Enhanced Input Manager with Browser Compatibility Layer
 * Integrates CompatibilityLayer for cross-browser input handling
 */

class EnhancedInputManager {
  constructor(canvas = null) {
    // Initialize compatibility layer first
    this.compatibilityLayer = new CompatibilityLayer();

    // Key state tracking
    this.keyStates = new Map();
    this.previousKeyStates = new Map();

    // Enhanced input detection properties
    this.lastKeyEventTime = new Map();
    this.eventSequenceId = 0;
    this.duplicateEventThreshold = 10;
    this.eventHistory = [];
    this.maxEventHistory = 100;

    // Key bindings for player actions
    this.keyBindings = {
      moveLeft: ["ArrowLeft", "KeyA"],
      moveRight: ["ArrowRight", "KeyD"],
      jump: ["Space", "ArrowUp", "KeyW"],
      dash: ["ShiftLeft", "ShiftRight"],
      block: ["ArrowDown", "KeyS"],
      pause: ["KeyP"],
      escape: ["Escape"],
      enter: ["Enter"],
      debug: ["KeyF1"],
    };

    // Action states
    this.actionStates = new Map();

    // Canvas and focus management
    this.canvas = canvas;
    this.focusManager = null;

    // Diagnostic mode
    this.diagnosticMode = false;
    this.inputDiagnostics = [];

    // Event capture options with browser-specific optimizations
    this.eventCaptureOptions = {
      passive: false,
      capture: true,
    };

    // Initialize focus manager
    if (this.canvas) {
      this.focusManager = new FocusManager(this.canvas);
    }

    // Setup touch controls if supported
    this.touchControls = null;
    if (this.compatibilityLayer.touchSupport.hasTouch) {
      this.setupTouchControls();
    }

    // Initialize event listeners
    this.initEventListeners();

    console.log(
      `EnhancedInputManager initialized for ${this.compatibilityLayer.browserInfo.name} ${this.compatibilityLayer.browserInfo.version}`
    );
  }

  /**
   * Initialize event listeners with compatibility layer integration
   */
  initEventListeners() {
    // Enhanced keydown event with compatibility layer
    document.addEventListener(
      "keydown",
      (event) => {
        this.handleKeyDownEnhanced(event);
      },
      this.eventCaptureOptions
    );

    // Enhanced keyup event with compatibility layer
    document.addEventListener(
      "keyup",
      (event) => {
        this.handleKeyUpEnhanced(event);
      },
      this.eventCaptureOptions
    );

    // Listen for compatibility layer events (touch controls)
    document.addEventListener("compatibilityJump", (event) => {
      this.handleCompatibilityAction("jump", event.detail);
    });

    document.addEventListener("compatibilityMove", (event) => {
      this.handleCompatibilityAction("move", event.detail);
    });

    // Window focus/blur handling
    window.addEventListener("blur", () => {
      this.handleFocusLoss();
    });

    window.addEventListener("focus", () => {
      this.handleFocusGain();
    });

    // Visibility change handling
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.handleFocusLoss();
      } else {
        this.handleFocusGain();
      }
    });

    // Canvas focus management
    if (this.canvas) {
      this.canvas.addEventListener("click", () => {
        this.ensureFocus();
      });

      // Make canvas focusable
      if (!this.canvas.hasAttribute("tabindex")) {
        this.canvas.setAttribute("tabindex", "0");
      }
    }

    console.log(
      "Enhanced event listeners initialized with compatibility layer"
    );
  }

  /**
   * Enhanced keydown handler with compatibility layer
   */
  handleKeyDownEnhanced(event) {
    // Normalize event through compatibility layer
    const normalizedEvent = this.compatibilityLayer.normalizeKeyEvent(event);

    // Apply browser-specific fixes
    const appliedFixes = this.compatibilityLayer.applyBrowserFixes(event);

    // Log diagnostic information if enabled
    if (this.diagnosticMode) {
      this.logInputDiagnostic("keydown", normalizedEvent, appliedFixes);
    }

    // Check for duplicate events
    if (this.isDuplicateEvent(normalizedEvent)) {
      return;
    }

    // Record event timing
    this.recordEventTiming(normalizedEvent);

    // Update key states
    this.updateKeyState(normalizedEvent.code, true);

    // Update action states
    this.updateActionStates();

    // Add to event history
    this.addToEventHistory({
      type: "keydown",
      event: normalizedEvent,
      fixes: appliedFixes,
      timestamp: performance.now(),
    });

    // Special handling for space key
    if (this.compatibilityLayer.isSpaceKey(event)) {
      this.handleSpaceKeyPress(normalizedEvent, appliedFixes);
    }
  }

  /**
   * Enhanced keyup handler with compatibility layer
   */
  handleKeyUpEnhanced(event) {
    // Normalize event through compatibility layer
    const normalizedEvent = this.compatibilityLayer.normalizeKeyEvent(event);

    // Apply browser-specific fixes
    const appliedFixes = this.compatibilityLayer.applyBrowserFixes(event);

    // Log diagnostic information if enabled
    if (this.diagnosticMode) {
      this.logInputDiagnostic("keyup", normalizedEvent, appliedFixes);
    }

    // Update key states
    this.updateKeyState(normalizedEvent.code, false);

    // Update action states
    this.updateActionStates();

    // Add to event history
    this.addToEventHistory({
      type: "keyup",
      event: normalizedEvent,
      fixes: appliedFixes,
      timestamp: performance.now(),
    });
  }

  /**
   * Handle space key press with special attention
   */
  handleSpaceKeyPress(normalizedEvent, appliedFixes) {
    console.log(
      `🚀 Space key detected! Applied fixes: [${appliedFixes.join(", ")}]`
    );

    if (this.diagnosticMode) {
      console.log("Space key diagnostic:", {
        normalizedEvent,
        appliedFixes,
        keyStates: Array.from(this.keyStates.entries()),
        actionStates: Array.from(this.actionStates.entries()),
      });
    }

    // Ensure jump action is triggered
    this.actionStates.set("jump", true);

    // Dispatch custom event for game systems
    const jumpEvent = new CustomEvent("spaceKeyJump", {
      detail: {
        normalizedEvent,
        appliedFixes,
        timestamp: performance.now(),
      },
    });
    document.dispatchEvent(jumpEvent);
  }

  /**
   * Handle compatibility layer actions (touch controls)
   */
  handleCompatibilityAction(actionType, detail) {
    if (this.diagnosticMode) {
      console.log(`Compatibility action: ${actionType}`, detail);
    }

    switch (actionType) {
      case "jump":
        this.actionStates.set("jump", true);
        // Simulate key press for consistency
        this.updateKeyState("Space", true);
        setTimeout(() => {
          this.updateKeyState("Space", false);
          this.updateActionStates();
        }, 100);
        break;

      case "move":
        if (detail.direction === "left") {
          this.actionStates.set("moveLeft", detail.pressed);
          this.updateKeyState("ArrowLeft", detail.pressed);
        } else if (detail.direction === "right") {
          this.actionStates.set("moveRight", detail.pressed);
          this.updateKeyState("ArrowRight", detail.pressed);
        }
        break;
    }

    this.addToEventHistory({
      type: "compatibility",
      actionType,
      detail,
      timestamp: performance.now(),
    });
  }

  /**
   * Setup touch controls using compatibility layer
   */
  setupTouchControls() {
    if (this.compatibilityLayer.touchSupport.hasTouch) {
      this.touchControls = this.compatibilityLayer.setupOnScreenControls();
      if (this.touchControls) {
        console.log("Touch controls enabled via compatibility layer");
      }
    }
  }

  /**
   * Check if event is a duplicate
   */
  isDuplicateEvent(event) {
    const key = event.code;
    const currentTime = performance.now();
    const lastTime = this.lastKeyEventTime.get(key) || 0;

    if (currentTime - lastTime < this.duplicateEventThreshold) {
      if (this.diagnosticMode) {
        console.log(
          `Duplicate event detected for ${key}: ${currentTime - lastTime}ms`
        );
      }
      return true;
    }

    return false;
  }

  /**
   * Record event timing
   */
  recordEventTiming(event) {
    this.lastKeyEventTime.set(event.code, performance.now());
    this.eventSequenceId++;
  }

  /**
   * Update key state
   */
  updateKeyState(keyCode, pressed) {
    // Store previous state
    this.previousKeyStates.set(keyCode, this.keyStates.get(keyCode) || false);

    // Update current state
    this.keyStates.set(keyCode, pressed);
  }

  /**
   * Update action states based on key bindings
   */
  updateActionStates() {
    for (const [action, keys] of Object.entries(this.keyBindings)) {
      const isPressed = keys.some((key) => this.keyStates.get(key));
      this.actionStates.set(action, isPressed);
    }
  }

  /**
   * Add event to history for debugging
   */
  addToEventHistory(eventData) {
    this.eventHistory.push(eventData);

    // Limit history size
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory.shift();
    }
  }

  /**
   * Log input diagnostic information
   */
  logInputDiagnostic(type, event, fixes) {
    const diagnostic = {
      timestamp: performance.now(),
      type,
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      fixes,
      browser: this.compatibilityLayer.browserInfo.name,
      isSpaceKey: this.compatibilityLayer.isSpaceKey(event),
    };

    this.inputDiagnostics.push(diagnostic);

    // Limit diagnostic history
    if (this.inputDiagnostics.length > 1000) {
      this.inputDiagnostics.shift();
    }

    console.log(`[INPUT DIAGNOSTIC] ${type}:`, diagnostic);
  }

  /**
   * Handle focus loss
   */
  handleFocusLoss() {
    // Clear all key states
    this.keyStates.clear();
    this.actionStates.clear();

    if (this.diagnosticMode) {
      console.log("Focus lost - cleared all key states");
    }
  }

  /**
   * Handle focus gain
   */
  handleFocusGain() {
    // Ensure focus is properly set
    this.ensureFocus();

    if (this.diagnosticMode) {
      console.log("Focus gained - ensuring proper focus state");
    }
  }

  /**
   * Ensure proper focus for input handling
   */
  ensureFocus() {
    if (this.focusManager) {
      this.focusManager.ensureCanvasFocus();
    } else if (this.canvas) {
      this.canvas.focus();
    } else {
      document.body.focus();
    }
  }

  /**
   * Enable diagnostic mode
   */
  enableDiagnostics() {
    this.diagnosticMode = true;
    console.log("Input diagnostics enabled");
  }

  /**
   * Disable diagnostic mode
   */
  disableDiagnostics() {
    this.diagnosticMode = false;
    console.log("Input diagnostics disabled");
  }

  /**
   * Get diagnostic report
   */
  getInputDiagnostics() {
    return {
      diagnostics: this.inputDiagnostics,
      eventHistory: this.eventHistory,
      currentKeyStates: Array.from(this.keyStates.entries()),
      currentActionStates: Array.from(this.actionStates.entries()),
      compatibilityReport: this.compatibilityLayer.getCompatibilityReport(),
    };
  }

  /**
   * Check if action is currently pressed
   */
  isActionPressed(action) {
    return this.actionStates.get(action) || false;
  }

  /**
   * Check if action was just pressed (this frame)
   */
  isActionJustPressed(action) {
    const keys = this.keyBindings[action] || [];
    return keys.some((key) => {
      const current = this.keyStates.get(key) || false;
      const previous = this.previousKeyStates.get(key) || false;
      return current && !previous;
    });
  }

  /**
   * Check if action was just released (this frame)
   */
  isActionJustReleased(action) {
    const keys = this.keyBindings[action] || [];
    return keys.some((key) => {
      const current = this.keyStates.get(key) || false;
      const previous = this.previousKeyStates.get(key) || false;
      return !current && previous;
    });
  }

  /**
   * Check if key is a game-related key
   */
  isGameKey(keyCode) {
    const allKeys = Object.values(this.keyBindings).flat();
    return allKeys.includes(keyCode);
  }

  /**
   * Get browser compatibility information
   */
  getBrowserCompatibility() {
    return this.compatibilityLayer.getCompatibilityReport();
  }

  /**
   * Test browser compatibility
   */
  testBrowserCompatibility() {
    return this.compatibilityLayer.testBrowserCompatibility();
  }

  /**
   * Update method to be called each frame
   */
  update() {
    // Update previous key states for next frame
    this.previousKeyStates.clear();
    for (const [key, state] of this.keyStates) {
      this.previousKeyStates.set(key, state);
    }
  }

  /**
   * Cleanup method
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeyDownEnhanced);
    document.removeEventListener("keyup", this.handleKeyUpEnhanced);

    // Remove touch controls if they exist
    if (this.touchControls) {
      if (this.touchControls.jumpButton) {
        this.touchControls.jumpButton.remove();
      }
      if (
        this.touchControls.moveButtons &&
        this.touchControls.moveButtons.container
      ) {
        this.touchControls.moveButtons.container.remove();
      }
    }

    console.log("EnhancedInputManager destroyed");
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = EnhancedInputManager;
} else {
  window.EnhancedInputManager = EnhancedInputManager;
}
