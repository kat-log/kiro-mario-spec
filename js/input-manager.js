/**
 * Input Manager - Keyboard Input Handling System
 * Handles keyboard input with state tracking (pressed, held, released)
 */

/**
 * InputManager Class
 * Manages keyboard input states and key bindings for player controls
 */
class InputManager {
  constructor(canvas = null) {
    // Key state tracking
    this.keyStates = new Map();
    this.previousKeyStates = new Map();

    // Enhanced input detection properties
    this.lastKeyEventTime = new Map(); // Track timing for duplicate detection
    this.eventSequenceId = 0; // Unique ID for event sequences
    this.duplicateEventThreshold = 10; // ms threshold for duplicate detection
    this.eventHistory = []; // Recent event history for debugging
    this.maxEventHistory = 100; // Maximum events to keep in history

    // Key bindings for player actions
    this.keyBindings = {
      // Movement controls
      moveLeft: ["ArrowLeft", "KeyA"],
      moveRight: ["ArrowRight", "KeyD"],
      jump: ["Space", "ArrowUp", "KeyW", "Enter"], // Added Enter key for jump
      dash: ["ShiftLeft", "ShiftRight"],
      block: ["ArrowDown", "KeyS"],

      // Game controls
      pause: ["KeyP"],
      escape: ["Escape"],

      // Debug controls (for development)
      debug: ["KeyF1"],
    };

    // Duplicate execution prevention (REDUCED THRESHOLD FOR DEBUGGING)
    this.actionExecutionHistory = new Map(); // Track recent action executions
    this.duplicateActionThreshold = 10; // ms threshold for duplicate action prevention (reduced from 50)
    this.lastActionTrigger = new Map(); // Track last trigger time for each action

    // Action states (derived from key states)
    this.actionStates = new Map();

    // Focus management
    this.canvas = canvas;
    this.focusManager = null;

    // Enhanced event capture settings
    this.eventCaptureOptions = {
      passive: false,
      capture: true, // Use capture phase for better event handling
    };

    // Initialize focus manager if canvas is provided
    if (this.canvas) {
      this.focusManager = new FocusManager(this.canvas);
    }

    // Initialize event listeners
    this.initEventListeners();

    console.log("InputManager initialized with enhanced input detection");
  }

  /**
   * Initialize keyboard event listeners with enhanced capture
   */
  initEventListeners() {
    // Enhanced keydown event with improved capture
    document.addEventListener(
      "keydown",
      (event) => {
        this.handleKeyDownEnhanced(event);
      },
      this.eventCaptureOptions
    );

    // Enhanced keyup event with improved capture
    document.addEventListener(
      "keyup",
      (event) => {
        this.handleKeyUpEnhanced(event);
      },
      this.eventCaptureOptions
    );

    // Additional event listeners for better input capture
    window.addEventListener(
      "keydown",
      (event) => {
        // Backup event listener in case document listener fails
        if (this.isGameKey(event.code)) {
          this.handleKeyDownEnhanced(event);
        }
      },
      this.eventCaptureOptions
    );

    window.addEventListener(
      "keyup",
      (event) => {
        // Backup event listener in case document listener fails
        if (this.isGameKey(event.code)) {
          this.handleKeyUpEnhanced(event);
        }
      },
      this.eventCaptureOptions
    );

    // Prevent context menu on right click (for future mouse support)
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    // Handle window focus/blur to reset key states
    window.addEventListener("blur", () => {
      this.handleFocusLoss();
    });

    // Handle visibility change to reset key states
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.handleFocusLoss();
      }
    });

    // Ensure canvas focus for keyboard events (if canvas is available)
    if (this.canvas) {
      document.addEventListener("click", (event) => {
        // If click is outside canvas, try to restore focus
        if (event.target !== this.canvas && this.focusManager) {
          setTimeout(() => {
            this.focusManager.ensureCanvasFocus();
          }, 10);
        }
      });
    } else {
      // Fallback to document body focus
      document.addEventListener("click", () => {
        document.body.focus();
      });

      // Make sure the document is focusable
      if (!document.body.hasAttribute("tabindex")) {
        document.body.setAttribute("tabindex", "0");
      }
    }
  }

  /**
   * Enhanced keydown event handler with improved duplicate detection and preventDefault timing
   */
  handleKeyDownEnhanced(event) {
    const keyCode = event.code;
    const currentTime = performance.now();

    // Check for duplicate events
    if (this.isDuplicateKeyEvent(keyCode, "keydown", currentTime)) {
      console.log(`Duplicate keydown event detected for ${keyCode}, ignoring`);
      return;
    }

    // Record event in history for debugging
    this.recordEventInHistory("keydown", keyCode, currentTime, event);

    // Ensure focus before processing input
    this.ensureFocus();

    // Apply preventDefault early and appropriately for game keys
    const isGameKey = this.isGameKey(keyCode);
    if (isGameKey) {
      // Prevent default behavior immediately for game keys
      event.preventDefault();
      event.stopPropagation();
    }

    // Set key state to pressed if not already held
    const wasPressed = this.keyStates.get(keyCode);
    if (!wasPressed) {
      this.keyStates.set(keyCode, true);
      this.lastKeyEventTime.set(keyCode + "_keydown", currentTime);

      // Enhanced logging for jump key
      if (keyCode === "Space") {
        console.log(
          `Space key pressed at ${currentTime.toFixed(2)}ms - Focus state:`,
          this.getFocusState()
        );
      } else {
        console.log(`Key pressed: ${keyCode}`);
      }
    } else {
      // Key is being held - this is a repeat event
      console.log(`Key held (repeat): ${keyCode}`);
    }
  }

  /**
   * Enhanced keyup event handler with improved duplicate detection and preventDefault timing
   */
  handleKeyUpEnhanced(event) {
    const keyCode = event.code;
    const currentTime = performance.now();

    // Check for duplicate events
    if (this.isDuplicateKeyEvent(keyCode, "keyup", currentTime)) {
      console.log(`Duplicate keyup event detected for ${keyCode}, ignoring`);
      return;
    }

    // Record event in history for debugging
    this.recordEventInHistory("keyup", keyCode, currentTime, event);

    // Apply preventDefault early and appropriately for game keys
    const isGameKey = this.isGameKey(keyCode);
    if (isGameKey) {
      // Prevent default behavior immediately for game keys
      event.preventDefault();
      event.stopPropagation();
    }

    // Set key state to released
    this.keyStates.set(keyCode, false);
    this.lastKeyEventTime.set(keyCode + "_keyup", currentTime);

    // Enhanced logging for jump key
    if (keyCode === "Space") {
      console.log(`Space key released at ${currentTime.toFixed(2)}ms`);
    } else {
      console.log(`Key released: ${keyCode}`);
    }
  }

  /**
   * Legacy keydown handler (for backward compatibility)
   */
  handleKeyDown(event) {
    this.handleKeyDownEnhanced(event);
  }

  /**
   * Legacy keyup handler (for backward compatibility)
   */
  handleKeyUp(event) {
    this.handleKeyUpEnhanced(event);
  }

  /**
   * Check if a key code is used for game controls
   */
  isGameKey(keyCode) {
    for (const action in this.keyBindings) {
      if (this.keyBindings[action].includes(keyCode)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if this is a duplicate key event that should be ignored
   */
  isDuplicateKeyEvent(keyCode, eventType, currentTime) {
    const eventKey = keyCode + "_" + eventType;
    const lastEventTime = this.lastKeyEventTime.get(eventKey);

    if (
      lastEventTime &&
      currentTime - lastEventTime < this.duplicateEventThreshold
    ) {
      return true; // This is likely a duplicate event
    }

    return false;
  }

  /**
   * Record event in history for debugging and analysis
   */
  recordEventInHistory(eventType, keyCode, timestamp, originalEvent) {
    const eventRecord = {
      id: ++this.eventSequenceId,
      type: eventType,
      keyCode: keyCode,
      timestamp: timestamp,
      focusState: this.getFocusState(),
      preventDefault: originalEvent.defaultPrevented,
      isTrusted: originalEvent.isTrusted,
      target: originalEvent.target ? originalEvent.target.tagName : "unknown",
    };

    this.eventHistory.push(eventRecord);

    // Keep history size manageable
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory.shift(); // Remove oldest event
    }
  }

  /**
   * Get recent event history for debugging
   */
  getEventHistory(filterKeyCode = null, maxEvents = 20) {
    let history = this.eventHistory.slice(-maxEvents);

    if (filterKeyCode) {
      history = history.filter((event) => event.keyCode === filterKeyCode);
    }

    return history;
  }

  /**
   * Clear event history (useful for testing)
   */
  clearEventHistory() {
    this.eventHistory = [];
    this.lastKeyEventTime.clear();
    this.eventSequenceId = 0;
    console.log("Event history cleared");
  }

  /**
   * Update input states (call this once per frame)
   */
  update() {
    // Store previous frame's key states
    this.previousKeyStates.clear();
    for (const [key, state] of this.keyStates) {
      this.previousKeyStates.set(key, state);
    }

    // Update action states based on key bindings
    this.updateActionStates();
  }

  /**
   * Update action states based on current key bindings
   */
  updateActionStates() {
    for (const action in this.keyBindings) {
      const keys = this.keyBindings[action];
      let actionPressed = false;

      // Check if any of the bound keys are pressed
      for (const key of keys) {
        if (this.keyStates.get(key)) {
          actionPressed = true;
          break;
        }
      }

      this.actionStates.set(action, actionPressed);
    }
  }

  /**
   * Check if a specific key is currently pressed (held down)
   */
  isKeyHeld(keyCode) {
    return this.keyStates.get(keyCode) || false;
  }

  /**
   * Check if a key was just pressed this frame (pressed but not held)
   */
  isKeyPressed(keyCode) {
    const currentState = this.keyStates.get(keyCode) || false;
    const previousState = this.previousKeyStates.get(keyCode) || false;
    return currentState && !previousState;
  }

  /**
   * Check if a key was just released this frame
   */
  isKeyReleased(keyCode) {
    const currentState = this.keyStates.get(keyCode) || false;
    const previousState = this.previousKeyStates.get(keyCode) || false;
    return !currentState && previousState;
  }

  /**
   * Check if an action is currently active (any bound key is held)
   */
  isActionHeld(action) {
    return this.actionStates.get(action) || false;
  }

  /**
   * Check if an action was just triggered this frame with duplicate prevention
   */
  isActionPressed(action) {
    const keys = this.keyBindings[action] || [];
    const currentTime = performance.now();

    // Check if any bound key was pressed
    let triggeringKey = null;
    for (const key of keys) {
      if (this.isKeyPressed(key)) {
        triggeringKey = key;
        break;
      }
    }

    if (!triggeringKey) {
      return false;
    }

    // Duplicate execution prevention for jump action (DISABLED FOR DEBUGGING)
    if (action === "jump") {
      const lastTriggerTime = this.lastActionTrigger.get(action) || 0;
      const timeSinceLastTrigger = currentTime - lastTriggerTime;

      // TEMPORARILY DISABLE duplicate prevention to fix jump issue
      // if (timeSinceLastTrigger < this.duplicateActionThreshold) {
      //   console.log(
      //     `[INPUT] Duplicate ${action} action prevented (${timeSinceLastTrigger.toFixed(
      //       1
      //     )}ms since last trigger, threshold: ${
      //       this.duplicateActionThreshold
      //     }ms)`
      //   );
      //   return false;
      // }

      // Record this action execution
      this.lastActionTrigger.set(action, currentTime);

      // Enhanced logging for jump action
      console.log(
        `[INPUT] ${action} action triggered by key: ${triggeringKey} at ${currentTime.toFixed(
          2
        )}ms - JUMP SHOULD WORK NOW!`
      );

      // Record in execution history
      this.recordActionExecution(action, triggeringKey, currentTime);
    }

    return true;
  }

  /**
   * Check if an action was just released this frame
   */
  isActionReleased(action) {
    const keys = this.keyBindings[action] || [];

    for (const key of keys) {
      if (this.isKeyReleased(key)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the current input state for player movement
   * Returns an object with movement directions and actions
   */
  getPlayerInput() {
    return {
      // Movement directions
      moveLeft: this.isActionHeld("moveLeft"),
      moveRight: this.isActionHeld("moveRight"),

      // Actions (use pressed for single-frame actions)
      jump: this.isActionPressed("jump"),
      jumpHeld: this.isActionHeld("jump"),
      dash: this.isActionHeld("dash"),
      block: this.isActionHeld("block"),

      // Game controls
      pause: this.isActionPressed("pause"),
      escape: this.isActionPressed("escape"),
      enter: this.isActionPressed("enter"),

      // Debug
      debug: this.isActionPressed("debug"),
    };
  }

  /**
   * Record action execution for duplicate prevention and analysis
   */
  recordActionExecution(action, triggeringKey, timestamp) {
    if (!this.actionExecutionHistory.has(action)) {
      this.actionExecutionHistory.set(action, []);
    }

    const history = this.actionExecutionHistory.get(action);
    history.push({
      key: triggeringKey,
      timestamp: timestamp,
      frameId: this.eventSequenceId,
    });

    // Keep history size manageable (last 50 executions)
    if (history.length > 50) {
      history.shift();
    }
  }

  /**
   * Get action execution statistics
   */
  getActionExecutionStats(action) {
    const history = this.actionExecutionHistory.get(action) || [];
    const recentHistory = history.filter(
      (entry) => performance.now() - entry.timestamp < 5000 // Last 5 seconds
    );

    const keyUsage = {};
    recentHistory.forEach((entry) => {
      keyUsage[entry.key] = (keyUsage[entry.key] || 0) + 1;
    });

    return {
      totalExecutions: history.length,
      recentExecutions: recentHistory.length,
      keyUsageDistribution: keyUsage,
      averageInterval: this.calculateAverageInterval(recentHistory),
      lastExecution: history[history.length - 1] || null,
    };
  }

  /**
   * Calculate average interval between action executions
   */
  calculateAverageInterval(history) {
    if (history.length < 2) return 0;

    let totalInterval = 0;
    for (let i = 1; i < history.length; i++) {
      totalInterval += history[i].timestamp - history[i - 1].timestamp;
    }

    return totalInterval / (history.length - 1);
  }

  /**
   * Bind a key to an action
   */
  bindKey(keyCode, action) {
    if (!this.keyBindings[action]) {
      this.keyBindings[action] = [];
    }

    if (!this.keyBindings[action].includes(keyCode)) {
      this.keyBindings[action].push(keyCode);
      console.log(`[INPUT] Bound key ${keyCode} to action ${action}`);

      // Clear action execution history when bindings change
      this.actionExecutionHistory.delete(action);
    }
  }

  /**
   * Unbind a key from an action
   */
  unbindKey(keyCode, action) {
    if (this.keyBindings[action]) {
      const index = this.keyBindings[action].indexOf(keyCode);
      if (index > -1) {
        this.keyBindings[action].splice(index, 1);
        console.log(`[INPUT] Unbound key ${keyCode} from action ${action}`);

        // Clear action execution history when bindings change
        this.actionExecutionHistory.delete(action);
      }
    }
  }

  /**
   * Set key bindings for an action (replaces all existing bindings)
   */
  setKeyBindings(action, keyCodes) {
    if (!Array.isArray(keyCodes)) {
      keyCodes = [keyCodes];
    }

    this.keyBindings[action] = [...keyCodes];
    console.log(`[INPUT] Set key bindings for ${action}:`, keyCodes);

    // Clear action execution history when bindings change
    this.actionExecutionHistory.delete(action);
  }

  /**
   * Get current key bindings for an action
   */
  getKeyBindings(action) {
    return [...(this.keyBindings[action] || [])];
  }

  /**
   * Get all key bindings
   */
  getAllKeyBindings() {
    const bindings = {};
    for (const action in this.keyBindings) {
      bindings[action] = [...this.keyBindings[action]];
    }
    return bindings;
  }

  /**
   * Reset key bindings to default configuration
   */
  resetKeyBindingsToDefault() {
    this.keyBindings = {
      // Movement controls
      moveLeft: ["ArrowLeft", "KeyA"],
      moveRight: ["ArrowRight", "KeyD"],
      jump: ["Space", "ArrowUp", "KeyW", "Enter"],
      dash: ["ShiftLeft", "ShiftRight"],
      block: ["ArrowDown", "KeyS"],

      // Game controls
      pause: ["KeyP"],
      escape: ["Escape"],

      // Debug controls (for development)
      debug: ["KeyF1"],
    };

    // Clear all action execution history
    this.actionExecutionHistory.clear();
    this.lastActionTrigger.clear();

    console.log("[INPUT] Key bindings reset to default configuration");
  }

  /**
   * Validate key binding configuration
   */
  validateKeyBindings() {
    const issues = [];
    const usedKeys = new Set();

    for (const action in this.keyBindings) {
      const keys = this.keyBindings[action];

      if (!Array.isArray(keys) || keys.length === 0) {
        issues.push(`Action '${action}' has no key bindings`);
        continue;
      }

      for (const key of keys) {
        if (usedKeys.has(key)) {
          issues.push(`Key '${key}' is bound to multiple actions`);
        }
        usedKeys.add(key);
      }
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      totalKeys: usedKeys.size,
      totalActions: Object.keys(this.keyBindings).length,
    };
  }

  /**
   * Ensure canvas has focus for input
   */
  ensureFocus() {
    if (this.focusManager) {
      return this.focusManager.ensureCanvasFocus();
    }
    return true;
  }

  /**
   * Handle focus loss event
   */
  handleFocusLoss() {
    this.resetAllKeys();
    console.log("Focus lost - key states reset");
  }

  /**
   * Get focus state information
   */
  getFocusState() {
    if (this.focusManager) {
      return this.focusManager.getFocusState();
    }
    return {
      hasFocus: document.activeElement === document.body,
      activeElement: false,
      documentHidden: document.hidden,
      windowHasFocus: document.hasFocus ? document.hasFocus() : false,
      indicatorVisible: false,
    };
  }

  /**
   * Force focus recovery
   */
  forceFocusRecovery() {
    if (this.focusManager) {
      return this.focusManager.forceFocusRecovery();
    }

    // Fallback focus recovery
    try {
      if (this.canvas) {
        this.canvas.focus();
      } else {
        document.body.focus();
      }
      return true;
    } catch (error) {
      console.warn("Focus recovery failed:", error);
      return false;
    }
  }

  /**
   * Reset all key states (useful when window loses focus)
   */
  resetAllKeys() {
    this.keyStates.clear();
    this.previousKeyStates.clear();
    this.actionStates.clear();
    this.lastKeyEventTime.clear();
    console.log("All key states and event timing reset");
  }

  /**
   * Get debug information about current input state
   */
  getDebugInfo() {
    const pressedKeys = [];
    const activeActions = [];

    // Get currently pressed keys
    for (const [key, state] of this.keyStates) {
      if (state) {
        pressedKeys.push(key);
      }
    }

    // Get active actions
    for (const [action, state] of this.actionStates) {
      if (state) {
        activeActions.push(action);
      }
    }

    return {
      pressedKeys,
      activeActions,
      totalKeysTracked: this.keyStates.size,
      keyBindings: this.keyBindings,
      focusState: this.getFocusState(),
      focusManager: !!this.focusManager,
      // Enhanced input detection debug info
      eventSequenceId: this.eventSequenceId,
      eventHistorySize: this.eventHistory.length,
      duplicateEventThreshold: this.duplicateEventThreshold,
      lastEventTimes: Object.fromEntries(this.lastKeyEventTime),
      recentEvents: this.getEventHistory(null, 5), // Last 5 events
      eventCaptureOptions: this.eventCaptureOptions,
      // Alternative jump keys and duplicate prevention debug info
      duplicateActionThreshold: this.duplicateActionThreshold,
      lastActionTriggers: Object.fromEntries(this.lastActionTrigger),
      actionExecutionHistory: this.getActionExecutionHistorySummary(),
      keyBindingValidation: this.validateKeyBindings(),
    };
  }

  /**
   * Get summary of action execution history for debugging
   */
  getActionExecutionHistorySummary() {
    const summary = {};
    for (const [action, history] of this.actionExecutionHistory) {
      summary[action] = {
        totalExecutions: history.length,
        recentExecutions: history.filter(
          (entry) => performance.now() - entry.timestamp < 1000
        ).length,
        lastExecution: history[history.length - 1] || null,
      };
    }
    return summary;
  }

  /**
   * Clear event history (useful for testing)
   */
  clearEventHistory() {
    this.eventHistory = [];
    this.lastKeyEventTime.clear();
    this.eventSequenceId = 0;
    console.log("Event history cleared");
  }

  /**
   * Test alternative jump keys detection (for debugging)
   */
  testAlternativeJumpKeys() {
    console.log("=== Alternative Jump Keys Detection Test ===");

    const jumpKeys = this.keyBindings.jump || [];
    console.log("Configured jump keys:", jumpKeys);

    const keyStates = {};
    const keyEvents = {};

    jumpKeys.forEach((key) => {
      keyStates[key] = this.keyStates.get(key) || false;
      keyEvents[key] = {
        recent: this.getEventHistory(key, 5),
        lastDown: this.lastKeyEventTime.get(key + "_keydown"),
        lastUp: this.lastKeyEventTime.get(key + "_keyup"),
      };
    });

    const jumpActionStats = this.getActionExecutionStats("jump");

    console.log("Jump action state:", this.actionStates.get("jump"));
    console.log("Key states:", keyStates);
    console.log("Jump action statistics:", jumpActionStats);
    console.log("Focus state:", this.getFocusState());
    console.log(
      "Duplicate prevention threshold:",
      this.duplicateActionThreshold
    );

    return {
      configuredJumpKeys: jumpKeys,
      keyStates: keyStates,
      keyEvents: keyEvents,
      jumpActionActive: this.actionStates.get("jump"),
      jumpActionStats: jumpActionStats,
      focusState: this.getFocusState(),
      duplicatePreventionEnabled: this.duplicateActionThreshold > 0,
      lastActionTrigger: this.lastActionTrigger.get("jump") || 0,
    };
  }

  /**
   * Test space key input detection (for debugging) - Legacy method
   */
  testSpaceKeyDetection() {
    console.log("=== Space Key Detection Test (Legacy) ===");
    console.log(
      "Note: Use testAlternativeJumpKeys() for comprehensive jump key testing"
    );

    console.log("Current space key state:", this.keyStates.get("Space"));
    console.log("Jump action state:", this.actionStates.get("jump"));
    console.log("Focus state:", this.getFocusState());

    const spaceEvents = this.getEventHistory("Space", 10);
    console.log("Recent space key events:", spaceEvents);

    const lastSpaceDown = this.lastKeyEventTime.get("Space_keydown");
    const lastSpaceUp = this.lastKeyEventTime.get("Space_keyup");
    console.log("Last space keydown time:", lastSpaceDown);
    console.log("Last space keyup time:", lastSpaceUp);

    return {
      spaceKeyPressed: this.keyStates.get("Space"),
      jumpActionActive: this.actionStates.get("jump"),
      focusState: this.getFocusState(),
      recentSpaceEvents: spaceEvents,
      lastEventTimes: {
        keydown: lastSpaceDown,
        keyup: lastSpaceUp,
      },
    };
  }

  /**
   * Destroy the input manager and clean up event listeners
   */
  destroy() {
    // Clean up focus manager
    if (this.focusManager) {
      this.focusManager.destroy();
      this.focusManager = null;
    }

    // Note: In a real implementation, we would store references to the event listeners
    // and remove them here. For this implementation, we'll rely on page unload cleanup.
    this.resetAllKeys();
    console.log("InputManager destroyed");
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = InputManager;
}
