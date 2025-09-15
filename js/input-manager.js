/**
 * Input Manager - Keyboard Input Handling System
 * Handles keyboard input with state tracking (pressed, held, released)
 */

/**
 * InputManager Class
 * Manages keyboard input states and key bindings for player controls
 */
class InputManager {
  constructor() {
    // Key state tracking
    this.keyStates = new Map();
    this.previousKeyStates = new Map();

    // Key bindings for player actions
    this.keyBindings = {
      // Movement controls
      moveLeft: ["ArrowLeft", "KeyA"],
      moveRight: ["ArrowRight", "KeyD"],
      jump: ["Space", "ArrowUp", "KeyW"],
      dash: ["ShiftLeft", "ShiftRight"],
      block: ["ArrowDown", "KeyS"],

      // Game controls
      pause: ["KeyP"],
      escape: ["Escape"],
      enter: ["Enter"],

      // Debug controls (for development)
      debug: ["KeyF1"],
    };

    // Action states (derived from key states)
    this.actionStates = new Map();

    // Initialize event listeners
    this.initEventListeners();

    console.log("InputManager initialized");
  }

  /**
   * Initialize keyboard event listeners
   */
  initEventListeners() {
    // Keydown event
    document.addEventListener(
      "keydown",
      (event) => {
        this.handleKeyDown(event);
      },
      { passive: false }
    );

    // Keyup event
    document.addEventListener(
      "keyup",
      (event) => {
        this.handleKeyUp(event);
      },
      { passive: false }
    );

    // Prevent context menu on right click (for future mouse support)
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    // Handle window focus/blur to reset key states
    window.addEventListener("blur", () => {
      this.resetAllKeys();
    });

    // Ensure document has focus for keyboard events
    document.addEventListener("click", () => {
      document.body.focus();
    });

    // Make sure the document is focusable
    if (!document.body.hasAttribute("tabindex")) {
      document.body.setAttribute("tabindex", "0");
    }
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(event) {
    const keyCode = event.code;

    // Prevent default behavior for game keys
    if (this.isGameKey(keyCode)) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Set key state to pressed if not already held
    if (!this.keyStates.get(keyCode)) {
      this.keyStates.set(keyCode, true);
      console.log(`Key pressed: ${keyCode}`); // デバッグログ追加
    }
  }

  /**
   * Handle keyup events
   */
  handleKeyUp(event) {
    const keyCode = event.code;

    // Prevent default behavior for game keys
    if (this.isGameKey(keyCode)) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Set key state to released
    this.keyStates.set(keyCode, false);
    console.log(`Key released: ${keyCode}`); // デバッグログ追加
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
   * Check if an action was just triggered this frame
   */
  isActionPressed(action) {
    const keys = this.keyBindings[action] || [];

    for (const key of keys) {
      if (this.isKeyPressed(key)) {
        if (action === "jump") {
          console.log(`Jump action triggered by key: ${key}`); // デバッグログ追加
        }
        return true;
      }
    }

    return false;
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
   * Bind a key to an action
   */
  bindKey(keyCode, action) {
    if (!this.keyBindings[action]) {
      this.keyBindings[action] = [];
    }

    if (!this.keyBindings[action].includes(keyCode)) {
      this.keyBindings[action].push(keyCode);
      console.log(`Bound key ${keyCode} to action ${action}`);
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
        console.log(`Unbound key ${keyCode} from action ${action}`);
      }
    }
  }

  /**
   * Reset all key states (useful when window loses focus)
   */
  resetAllKeys() {
    this.keyStates.clear();
    this.previousKeyStates.clear();
    this.actionStates.clear();
    console.log("All key states reset");
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
    };
  }

  /**
   * Destroy the input manager and clean up event listeners
   */
  destroy() {
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
