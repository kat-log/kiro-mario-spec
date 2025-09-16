/**
 * Focus Manager - Canvas Focus Control System
 * Manages canvas focus state and provides visual indicators
 */

/**
 * FocusManager Class
 * Handles canvas focus control, visual indicators, and automatic recovery
 */
class FocusManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.hasFocus = false;
    this.focusIndicator = null;
    this.focusPollingInterval = null;
    this.focusPollingRate = 100; // Check focus every 100ms

    // Configuration
    this.config = {
      showFocusIndicator: true,
      autoRecovery: true,
      aggressiveFocus: true,
      focusPollingEnabled: true,
      indicatorStyle: {
        color: "#00FF00",
        width: 3,
        dashPattern: [5, 5],
        opacity: 0.8,
      },
    };

    // Event listeners storage for cleanup
    this.eventListeners = new Map();

    // Focus state history for debugging
    this.focusHistory = [];
    this.maxHistoryLength = 10;

    console.log("FocusManager initialized for canvas");
    this.init();
  }

  /**
   * Initialize focus management system
   */
  init() {
    this.setupCanvas();
    this.setupFocusListeners();
    this.createFocusIndicator();

    if (this.config.focusPollingEnabled) {
      this.startFocusPolling();
    }

    // Ensure initial focus
    this.ensureCanvasFocus();
  }

  /**
   * Setup canvas for focus management
   */
  setupCanvas() {
    // Make canvas focusable
    if (!this.canvas.hasAttribute("tabindex")) {
      this.canvas.setAttribute("tabindex", "0");
    }

    // Prevent outline on focus (we'll use our custom indicator)
    this.canvas.style.outline = "none";

    // Ensure canvas can receive focus
    this.canvas.style.cursor = "pointer";
  }

  /**
   * Setup focus event listeners
   */
  setupFocusListeners() {
    // Canvas focus events
    const canvasFocusHandler = (event) => {
      this.handleCanvasFocus(event);
    };
    const canvasBlurHandler = (event) => {
      this.handleCanvasBlur(event);
    };

    this.canvas.addEventListener("focus", canvasFocusHandler);
    this.canvas.addEventListener("blur", canvasBlurHandler);

    this.eventListeners.set("canvasFocus", canvasFocusHandler);
    this.eventListeners.set("canvasBlur", canvasBlurHandler);

    // Window focus events
    const windowFocusHandler = (event) => {
      this.handleWindowFocus(event);
    };
    const windowBlurHandler = (event) => {
      this.handleWindowBlur(event);
    };

    window.addEventListener("focus", windowFocusHandler);
    window.addEventListener("blur", windowBlurHandler);

    this.eventListeners.set("windowFocus", windowFocusHandler);
    this.eventListeners.set("windowBlur", windowBlurHandler);

    // Click handler for focus recovery
    const clickHandler = (event) => {
      this.handleCanvasClick(event);
    };

    this.canvas.addEventListener("click", clickHandler);
    this.eventListeners.set("canvasClick", clickHandler);

    // Document visibility change
    const visibilityChangeHandler = () => {
      this.handleVisibilityChange();
    };

    document.addEventListener("visibilitychange", visibilityChangeHandler);
    this.eventListeners.set("visibilityChange", visibilityChangeHandler);

    console.log("Focus event listeners setup complete");
  }

  /**
   * Create visual focus indicator
   */
  createFocusIndicator() {
    if (!this.config.showFocusIndicator) {
      return;
    }

    // Create indicator element
    this.focusIndicator = document.createElement("div");
    this.focusIndicator.style.position = "absolute";
    this.focusIndicator.style.pointerEvents = "none";
    this.focusIndicator.style.border = `${this.config.indicatorStyle.width}px dashed ${this.config.indicatorStyle.color}`;
    this.focusIndicator.style.opacity = this.config.indicatorStyle.opacity;
    this.focusIndicator.style.borderRadius = "4px";
    this.focusIndicator.style.display = "none";
    this.focusIndicator.style.zIndex = "1000";
    this.focusIndicator.style.transition = "opacity 0.2s ease";

    // Position indicator around canvas
    this.updateIndicatorPosition();

    // Add to DOM
    document.body.appendChild(this.focusIndicator);

    console.log("Focus indicator created");
  }

  /**
   * Update focus indicator position to match canvas
   */
  updateIndicatorPosition() {
    if (!this.focusIndicator) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    this.focusIndicator.style.left =
      rect.left + scrollX - this.config.indicatorStyle.width + "px";
    this.focusIndicator.style.top =
      rect.top + scrollY - this.config.indicatorStyle.width + "px";
    this.focusIndicator.style.width =
      rect.width + this.config.indicatorStyle.width * 2 + "px";
    this.focusIndicator.style.height =
      rect.height + this.config.indicatorStyle.width * 2 + "px";
  }

  /**
   * Show focus indicator
   */
  showFocusIndicator() {
    if (!this.focusIndicator || !this.config.showFocusIndicator) {
      return;
    }

    this.updateIndicatorPosition();
    this.focusIndicator.style.display = "block";

    // Animate in
    setTimeout(() => {
      if (this.focusIndicator) {
        this.focusIndicator.style.opacity = this.config.indicatorStyle.opacity;
      }
    }, 10);

    console.log("Focus indicator shown");
  }

  /**
   * Hide focus indicator
   */
  hideFocusIndicator() {
    if (!this.focusIndicator) {
      return;
    }

    this.focusIndicator.style.opacity = "0";

    setTimeout(() => {
      if (this.focusIndicator) {
        this.focusIndicator.style.display = "none";
      }
    }, 200);

    console.log("Focus indicator hidden");
  }

  /**
   * Ensure canvas has focus
   */
  ensureCanvasFocus() {
    if (document.activeElement !== this.canvas) {
      try {
        this.canvas.focus();
        console.log("Canvas focus ensured");
        return true;
      } catch (error) {
        console.warn("Failed to focus canvas:", error);
        return false;
      }
    }
    return true;
  }

  /**
   * Handle canvas focus event
   */
  handleCanvasFocus(event) {
    this.hasFocus = true;
    this.recordFocusEvent("canvas_focus", true);

    if (this.config.showFocusIndicator) {
      this.showFocusIndicator();
    }

    console.log("Canvas gained focus");
  }

  /**
   * Handle canvas blur event
   */
  handleCanvasBlur(event) {
    this.hasFocus = false;
    this.recordFocusEvent("canvas_blur", false);

    this.hideFocusIndicator();

    console.log("Canvas lost focus");
  }

  /**
   * Handle window focus event
   */
  handleWindowFocus(event) {
    this.recordFocusEvent("window_focus", true);

    if (this.config.autoRecovery) {
      // Delay focus recovery to allow other events to process
      setTimeout(() => {
        if (this.config.aggressiveFocus) {
          this.ensureCanvasFocus();
        }
      }, 100);
    }

    console.log("Window gained focus");
  }

  /**
   * Handle window blur event
   */
  handleWindowBlur(event) {
    this.recordFocusEvent("window_blur", false);
    this.hasFocus = false;
    this.hideFocusIndicator();

    console.log("Window lost focus");
  }

  /**
   * Handle canvas click for focus recovery
   */
  handleCanvasClick(event) {
    this.recordFocusEvent("canvas_click", null);

    if (!this.hasFocus) {
      this.ensureCanvasFocus();
    }

    console.log("Canvas clicked - focus recovery attempted");
  }

  /**
   * Handle document visibility change
   */
  handleVisibilityChange() {
    const isVisible = !document.hidden;
    this.recordFocusEvent("visibility_change", isVisible);

    if (isVisible && this.config.autoRecovery) {
      setTimeout(() => {
        if (this.config.aggressiveFocus) {
          this.ensureCanvasFocus();
        }
      }, 200);
    } else if (!isVisible) {
      this.hasFocus = false;
      this.hideFocusIndicator();
    }

    console.log(
      `Document visibility changed: ${isVisible ? "visible" : "hidden"}`
    );
  }

  /**
   * Start focus polling for continuous monitoring
   */
  startFocusPolling() {
    if (this.focusPollingInterval) {
      return;
    }

    this.focusPollingInterval = setInterval(() => {
      this.checkFocusState();
    }, this.focusPollingRate);

    console.log("Focus polling started");
  }

  /**
   * Stop focus polling
   */
  stopFocusPolling() {
    if (this.focusPollingInterval) {
      clearInterval(this.focusPollingInterval);
      this.focusPollingInterval = null;
      console.log("Focus polling stopped");
    }
  }

  /**
   * Check current focus state and update if necessary
   */
  checkFocusState() {
    const actuallyHasFocus = document.activeElement === this.canvas;

    if (actuallyHasFocus !== this.hasFocus) {
      console.log(
        `Focus state mismatch detected: expected ${this.hasFocus}, actual ${actuallyHasFocus}`
      );

      if (actuallyHasFocus) {
        this.handleCanvasFocus({ type: "polling" });
      } else {
        this.handleCanvasBlur({ type: "polling" });
      }
    }

    // Auto-recovery if focus is lost unexpectedly
    if (
      !actuallyHasFocus &&
      this.config.autoRecovery &&
      this.config.aggressiveFocus
    ) {
      // Only attempt recovery if window is visible and focused
      if (!document.hidden && document.hasFocus && document.hasFocus()) {
        this.ensureCanvasFocus();
      }
    }
  }

  /**
   * Record focus event for debugging and analysis
   */
  recordFocusEvent(eventType, focusState) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      focusState: focusState,
      activeElement: document.activeElement
        ? document.activeElement.tagName
        : "none",
      documentHidden: document.hidden,
      windowHasFocus: document.hasFocus ? document.hasFocus() : "unknown",
    };

    this.focusHistory.push(event);

    // Limit history size
    if (this.focusHistory.length > this.maxHistoryLength) {
      this.focusHistory.shift();
    }
  }

  /**
   * Get current focus state
   */
  getFocusState() {
    return {
      hasFocus: this.hasFocus,
      activeElement: document.activeElement === this.canvas,
      documentHidden: document.hidden,
      windowHasFocus: document.hasFocus ? document.hasFocus() : false,
      indicatorVisible: this.focusIndicator
        ? this.focusIndicator.style.display !== "none"
        : false,
    };
  }

  /**
   * Get focus history for debugging
   */
  getFocusHistory() {
    return [...this.focusHistory];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Apply configuration changes
    if (this.focusIndicator) {
      if (this.config.showFocusIndicator) {
        this.focusIndicator.style.border = `${this.config.indicatorStyle.width}px dashed ${this.config.indicatorStyle.color}`;
        this.focusIndicator.style.opacity = this.config.indicatorStyle.opacity;
      } else {
        this.hideFocusIndicator();
      }
    }

    // Update polling
    if (this.config.focusPollingEnabled && !this.focusPollingInterval) {
      this.startFocusPolling();
    } else if (!this.config.focusPollingEnabled && this.focusPollingInterval) {
      this.stopFocusPolling();
    }

    console.log("FocusManager configuration updated:", this.config);
  }

  /**
   * Force focus recovery
   */
  forceFocusRecovery() {
    console.log("Forcing focus recovery...");

    this.ensureCanvasFocus();

    if (this.hasFocus && this.config.showFocusIndicator) {
      this.showFocusIndicator();
    }

    return this.getFocusState();
  }

  /**
   * Get diagnostic information
   */
  getDiagnosticInfo() {
    return {
      config: this.config,
      currentState: this.getFocusState(),
      history: this.getFocusHistory(),
      pollingActive: !!this.focusPollingInterval,
      indicatorExists: !!this.focusIndicator,
      eventListenersCount: this.eventListeners.size,
    };
  }

  /**
   * Cleanup and destroy focus manager
   */
  destroy() {
    console.log("Destroying FocusManager...");

    // Stop polling
    this.stopFocusPolling();

    // Remove event listeners
    this.eventListeners.forEach((handler, eventType) => {
      switch (eventType) {
        case "canvasFocus":
          this.canvas.removeEventListener("focus", handler);
          break;
        case "canvasBlur":
          this.canvas.removeEventListener("blur", handler);
          break;
        case "canvasClick":
          this.canvas.removeEventListener("click", handler);
          break;
        case "windowFocus":
          window.removeEventListener("focus", handler);
          break;
        case "windowBlur":
          window.removeEventListener("blur", handler);
          break;
        case "visibilityChange":
          document.removeEventListener("visibilitychange", handler);
          break;
      }
    });

    this.eventListeners.clear();

    // Remove focus indicator
    if (this.focusIndicator && this.focusIndicator.parentNode) {
      this.focusIndicator.parentNode.removeChild(this.focusIndicator);
      this.focusIndicator = null;
    }

    // Clear history
    this.focusHistory = [];

    console.log("FocusManager destroyed");
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FocusManager;
}
