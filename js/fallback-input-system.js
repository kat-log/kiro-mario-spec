/**
 * Fallback Input System - Alternative Input Methods
 * Provides alternative input methods when primary input fails
 * Supports touch controls, alternative keys, and accessibility options
 */

class FallbackInputSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.inputManager = gameEngine.inputManager;

    // Touch support detection
    this.touchSupported =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // On-screen controls
    this.onScreenControls = {
      jumpButton: null,
      moveButtons: {
        left: null,
        right: null,
        container: null,
      },
    };

    // Alternative key bindings
    this.alternativeKeys = {
      jump: ["ArrowUp", "KeyW", "Enter"], // Space is primary, these are alternatives
      moveLeft: ["KeyA"],
      moveRight: ["KeyD"],
      pause: ["KeyP", "Escape"],
    };

    // Touch event handlers
    this.touchHandlers = new Map();

    // Fallback input state
    this.fallbackState = {
      jumpPressed: false,
      moveLeft: false,
      moveRight: false,
      lastTouchTime: 0,
    };

    // Settings
    this.settings = {
      showOnScreenControls: this.touchSupported,
      enableAlternativeKeys: true,
      touchButtonSize: 60,
      touchButtonOpacity: 0.7,
      vibrationEnabled: true,
    };

    // Initialize the system
    this.init();

    console.log("FallbackInputSystem initialized", {
      touchSupported: this.touchSupported,
      onScreenControls: this.settings.showOnScreenControls,
      alternativeKeys: this.settings.enableAlternativeKeys,
    });
  }

  /**
   * Initialize the fallback input system
   */
  init() {
    // Setup alternative key bindings
    this.setupAlternativeKeys();

    // Setup touch controls if supported
    if (this.touchSupported && this.settings.showOnScreenControls) {
      this.createOnScreenControls();
    }

    // Setup touch event handlers
    this.setupTouchHandlers();

    // Integrate with existing input manager
    this.integrateWithInputManager();

    // Setup accessibility features
    this.setupAccessibilityFeatures();
  }

  /**
   * Setup alternative key bindings
   */
  setupAlternativeKeys() {
    if (!this.settings.enableAlternativeKeys) return;

    // Add alternative keys to input manager bindings
    for (const [action, keys] of Object.entries(this.alternativeKeys)) {
      for (const key of keys) {
        if (
          this.inputManager.keyBindings[action] &&
          !this.inputManager.keyBindings[action].includes(key)
        ) {
          this.inputManager.keyBindings[action].push(key);
          console.log(`Added alternative key ${key} for action ${action}`);
        }
      }
    }

    // Verify up arrow key is bound to jump
    this.verifyUpArrowJump();
  }

  /**
   * Verify up arrow key jump functionality
   */
  verifyUpArrowJump() {
    const jumpKeys = this.inputManager.keyBindings.jump || [];

    if (!jumpKeys.includes("ArrowUp")) {
      console.warn("Up arrow key not bound to jump, adding it...");
      this.inputManager.bindKey("ArrowUp", "jump");
    }

    // Test up arrow key binding
    const testResult = {
      upArrowBound: jumpKeys.includes("ArrowUp"),
      allJumpKeys: jumpKeys,
      timestamp: Date.now(),
    };

    console.log("Up arrow key jump verification:", testResult);
    return testResult;
  }

  /**
   * Create on-screen touch controls
   */
  createOnScreenControls() {
    // Create container for all controls
    const controlsContainer = document.createElement("div");
    controlsContainer.id = "fallback-touch-controls";
    controlsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;

    // Create jump button
    this.createJumpButton(controlsContainer);

    // Create movement buttons
    this.createMovementButtons(controlsContainer);

    // Add to document
    document.body.appendChild(controlsContainer);

    console.log("On-screen touch controls created");
  }

  /**
   * Create jump button for touch devices
   */
  createJumpButton(container) {
    const jumpButton = document.createElement("div");
    jumpButton.id = "fallback-jump-button";
    jumpButton.innerHTML = "⬆️<br>JUMP";

    const size = this.settings.touchButtonSize;
    jumpButton.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, ${this.settings.touchButtonOpacity});
      border: 2px solid #333;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #333;
      user-select: none;
      pointer-events: auto;
      cursor: pointer;
      transition: all 0.1s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    // Touch event handlers for jump button
    const handleJumpStart = (e) => {
      e.preventDefault();
      jumpButton.style.transform = "scale(0.9)";
      jumpButton.style.background = "rgba(255, 255, 0, 0.9)";
      this.handleFallbackJump(true);

      // Haptic feedback if available
      if (this.settings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(50);
      }
    };

    const handleJumpEnd = (e) => {
      e.preventDefault();
      jumpButton.style.transform = "scale(1)";
      jumpButton.style.background = `rgba(255, 255, 255, ${this.settings.touchButtonOpacity})`;
      this.handleFallbackJump(false);
    };

    // Add event listeners
    jumpButton.addEventListener("touchstart", handleJumpStart, {
      passive: false,
    });
    jumpButton.addEventListener("touchend", handleJumpEnd, { passive: false });
    jumpButton.addEventListener("touchcancel", handleJumpEnd, {
      passive: false,
    });

    // Mouse events for desktop testing
    jumpButton.addEventListener("mousedown", handleJumpStart);
    jumpButton.addEventListener("mouseup", handleJumpEnd);
    jumpButton.addEventListener("mouseleave", handleJumpEnd);

    // Store reference and add to container
    this.onScreenControls.jumpButton = jumpButton;
    container.appendChild(jumpButton);

    console.log("Jump button created");
  }

  /**
   * Create movement buttons for touch devices
   */
  createMovementButtons(container) {
    const moveContainer = document.createElement("div");
    moveContainer.id = "fallback-move-buttons";
    moveContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      display: flex;
      gap: 10px;
      pointer-events: auto;
    `;

    // Create left button
    const leftButton = this.createMoveButton("⬅️", "LEFT");
    const rightButton = this.createMoveButton("➡️", "RIGHT");

    // Add event handlers
    this.setupMoveButtonEvents(leftButton, "left");
    this.setupMoveButtonEvents(rightButton, "right");

    // Add to container
    moveContainer.appendChild(leftButton);
    moveContainer.appendChild(rightButton);
    container.appendChild(moveContainer);

    // Store references
    this.onScreenControls.moveButtons = {
      left: leftButton,
      right: rightButton,
      container: moveContainer,
    };

    console.log("Movement buttons created");
  }

  /**
   * Create individual movement button
   */
  createMoveButton(emoji, label) {
    const button = document.createElement("div");
    button.innerHTML = `${emoji}<br>${label}`;

    const size = this.settings.touchButtonSize;
    button.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, ${this.settings.touchButtonOpacity});
      border: 2px solid #333;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #333;
      user-select: none;
      cursor: pointer;
      transition: all 0.1s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    return button;
  }

  /**
   * Setup event handlers for movement buttons
   */
  setupMoveButtonEvents(button, direction) {
    const handleMoveStart = (e) => {
      e.preventDefault();
      button.style.transform = "scale(0.9)";
      button.style.background = "rgba(0, 255, 0, 0.9)";
      this.handleFallbackMove(direction, true);

      if (this.settings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(30);
      }
    };

    const handleMoveEnd = (e) => {
      e.preventDefault();
      button.style.transform = "scale(1)";
      button.style.background = `rgba(255, 255, 255, ${this.settings.touchButtonOpacity})`;
      this.handleFallbackMove(direction, false);
    };

    // Touch events
    button.addEventListener("touchstart", handleMoveStart, { passive: false });
    button.addEventListener("touchend", handleMoveEnd, { passive: false });
    button.addEventListener("touchcancel", handleMoveEnd, { passive: false });

    // Mouse events for desktop testing
    button.addEventListener("mousedown", handleMoveStart);
    button.addEventListener("mouseup", handleMoveEnd);
    button.addEventListener("mouseleave", handleMoveEnd);
  }

  /**
   * Setup general touch handlers for canvas
   */
  setupTouchHandlers() {
    if (!this.touchSupported) return;

    const canvas = this.gameEngine.canvas;
    if (!canvas) return;

    // Double-tap to jump
    let lastTouchTime = 0;
    const doubleTapThreshold = 300; // ms

    const handleCanvasTouch = (e) => {
      e.preventDefault();

      const currentTime = Date.now();
      const timeDiff = currentTime - lastTouchTime;

      if (timeDiff < doubleTapThreshold) {
        // Double tap detected - trigger jump
        this.handleFallbackJump(true);
        setTimeout(() => this.handleFallbackJump(false), 100);

        if (this.settings.vibrationEnabled && navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }

        console.log("Double-tap jump triggered");
      }

      lastTouchTime = currentTime;
    };

    canvas.addEventListener("touchstart", handleCanvasTouch, {
      passive: false,
    });

    console.log("Canvas touch handlers setup");
  }

  /**
   * Handle fallback jump input
   */
  handleFallbackJump(pressed) {
    const wasPressed = this.fallbackState.jumpPressed;
    this.fallbackState.jumpPressed = pressed;

    // Dispatch custom event for game systems
    const event = new CustomEvent("fallbackJump", {
      detail: {
        pressed,
        source: "fallback",
        timestamp: Date.now(),
      },
    });

    document.dispatchEvent(event);

    console.log(`Fallback jump ${pressed ? "pressed" : "released"}`);
  }

  /**
   * Handle fallback movement input
   */
  handleFallbackMove(direction, pressed) {
    const action = direction === "left" ? "moveLeft" : "moveRight";
    const wasPressed = this.fallbackState[action];
    this.fallbackState[action] = pressed;

    // Dispatch custom event
    const event = new CustomEvent("fallbackMove", {
      detail: {
        direction,
        pressed,
        source: "fallback",
        timestamp: Date.now(),
      },
    });

    document.dispatchEvent(event);

    console.log(`Fallback move ${direction}: ${pressed}`);
  }

  /**
   * Integrate with existing input manager
   */
  integrateWithInputManager() {
    // Store original methods
    const originalGetPlayerInput = this.inputManager.getPlayerInput.bind(
      this.inputManager
    );
    const originalIsActionPressed = this.inputManager.isActionPressed.bind(
      this.inputManager
    );

    // Track fallback input states for frame-based detection
    this.fallbackInputStates = {
      jump: { current: false, previous: false },
      moveLeft: { current: false, previous: false },
      moveRight: { current: false, previous: false },
    };

    // Override isActionPressed to include fallback inputs
    this.inputManager.isActionPressed = (action) => {
      const originalResult = originalIsActionPressed(action);

      // Check fallback state for frame-based detection
      if (this.fallbackInputStates[action]) {
        const fallbackPressed =
          this.fallbackInputStates[action].current &&
          !this.fallbackInputStates[action].previous;

        if (fallbackPressed && action === "jump") {
          console.log(`Fallback ${action} action triggered (frame-based)`);
        }

        return originalResult || fallbackPressed;
      }

      return originalResult;
    };

    // Override getPlayerInput to include fallback inputs
    this.inputManager.getPlayerInput = () => {
      const originalInput = originalGetPlayerInput();

      // Update fallback input states for frame-based detection
      this.updateFallbackInputStates();

      // Merge with fallback inputs
      return {
        ...originalInput,
        // Override jump if fallback is active (frame-based)
        jump:
          originalInput.jump ||
          (this.fallbackInputStates.jump.current &&
            !this.fallbackInputStates.jump.previous),
        // Override movement if fallback is active
        moveLeft: originalInput.moveLeft || this.fallbackState.moveLeft,
        moveRight: originalInput.moveRight || this.fallbackState.moveRight,
      };
    };

    console.log("Integrated with InputManager (enhanced)");
  }

  /**
   * Update fallback input states for frame-based detection
   */
  updateFallbackInputStates() {
    // Update previous states
    for (const action in this.fallbackInputStates) {
      this.fallbackInputStates[action].previous =
        this.fallbackInputStates[action].current;
    }

    // Update current states
    this.fallbackInputStates.jump.current = this.fallbackState.jumpPressed;
    this.fallbackInputStates.moveLeft.current = this.fallbackState.moveLeft;
    this.fallbackInputStates.moveRight.current = this.fallbackState.moveRight;
  }

  /**
   * Setup accessibility features
   */
  setupAccessibilityFeatures() {
    // Add keyboard shortcuts info
    const helpText = document.createElement("div");
    helpText.id = "fallback-help-text";
    helpText.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      font-family: monospace;
      z-index: 999;
      display: none;
    `;

    helpText.innerHTML = `
      <strong>Alternative Controls:</strong><br>
      Jump: SPACE, ↑, W, ENTER<br>
      Move: ← → or A D<br>
      ${this.touchSupported ? "Touch: Double-tap to jump<br>" : ""}
      Press H to toggle this help
    `;

    document.body.appendChild(helpText);

    // Toggle help with H key
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyH") {
        const isVisible = helpText.style.display !== "none";
        helpText.style.display = isVisible ? "none" : "block";
      }
    });

    console.log("Accessibility features setup");
  }

  /**
   * Test alternative input methods
   */
  testAlternativeInputs() {
    console.log("=== Testing Alternative Input Methods ===");

    const results = {
      upArrowJump: this.verifyUpArrowJump(),
      touchSupport: this.touchSupported,
      onScreenControls: !!this.onScreenControls.jumpButton,
      alternativeKeys: this.alternativeKeys,
      fallbackState: this.fallbackState,
    };

    // Test up arrow key simulation
    console.log("Testing up arrow key...");
    const upArrowEvent = new KeyboardEvent("keydown", { code: "ArrowUp" });
    document.dispatchEvent(upArrowEvent);

    // Test touch simulation if supported
    if (this.touchSupported && this.onScreenControls.jumpButton) {
      console.log("Testing touch jump button...");
      this.handleFallbackJump(true);
      setTimeout(() => this.handleFallbackJump(false), 100);
    }

    console.log("Alternative input test results:", results);
    return results;
  }

  /**
   * Show/hide on-screen controls
   */
  toggleOnScreenControls(show = null) {
    if (!this.touchSupported) return false;

    const container = document.getElementById("fallback-touch-controls");
    if (!container) return false;

    const shouldShow =
      show !== null ? show : container.style.display === "none";
    container.style.display = shouldShow ? "block" : "none";
    this.settings.showOnScreenControls = shouldShow;

    console.log(`On-screen controls ${shouldShow ? "shown" : "hidden"}`);
    return shouldShow;
  }

  /**
   * Update fallback input system (called each frame)
   */
  update(deltaTime) {
    // Update previous states for next frame detection
    this.updatePreviousStates();

    // Auto-release single-frame inputs after they've been processed
    this.autoReleaseSingleFrameInputs();
  }

  /**
   * Update previous states for frame-based detection
   */
  updatePreviousStates() {
    // Update previous states for fallback keys
    const fallbackKeys = ["FallbackJump", "FallbackLeft", "FallbackRight"];

    for (const key of fallbackKeys) {
      const currentState = this.inputManager.keyStates.get(key) || false;
      this.inputManager.previousKeyStates.set(key, currentState);
    }
  }

  /**
   * Auto-release single-frame inputs
   */
  autoReleaseSingleFrameInputs() {
    // Auto-release jump after one frame if it was triggered by fallback
    if (this.inputManager.keyStates.get("FallbackJump")) {
      setTimeout(() => {
        this.inputManager.keyStates.set("FallbackJump", false);
      }, 16); // ~1 frame at 60fps
    }
  }

  /**
   * Get fallback input status
   */
  getStatus() {
    return {
      touchSupported: this.touchSupported,
      onScreenControlsVisible: this.settings.showOnScreenControls,
      alternativeKeysEnabled: this.settings.enableAlternativeKeys,
      fallbackState: { ...this.fallbackState },
      onScreenControls: {
        jumpButton: !!this.onScreenControls.jumpButton,
        moveButtons: !!this.onScreenControls.moveButtons.container,
      },
    };
  }

  /**
   * Cleanup and destroy the fallback input system
   */
  destroy() {
    // Remove on-screen controls
    const container = document.getElementById("fallback-touch-controls");
    if (container) {
      container.remove();
    }

    // Remove help text
    const helpText = document.getElementById("fallback-help-text");
    if (helpText) {
      helpText.remove();
    }

    // Clear touch handlers
    this.touchHandlers.clear();

    // Reset input manager if we modified it
    // (In a real implementation, we'd restore the original method)

    console.log("FallbackInputSystem destroyed");
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FallbackInputSystem;
} else {
  window.FallbackInputSystem = FallbackInputSystem;
}
