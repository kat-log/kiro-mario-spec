/**
 * UI System Implementation
 * Handles game UI elements, HUD, and real-time updates
 */

/**
 * UI System Class
 * Manages all UI elements and their updates
 */
class UISystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;

    // DOM elements
    this.hudElement = document.getElementById("hud");
    this.scoreElement = document.getElementById("score-value");
    this.coinElement = document.getElementById("coin-value");
    this.livesElement = document.getElementById("lives-value");

    // UI state
    this.isVisible = false;
    this.lastUpdateTime = 0;
    this.updateInterval = 100; // Update every 100ms for performance

    // Initialize UI
    this.init();

    console.log("UISystem initialized");
  }

  /**
   * Initialize the UI system
   */
  init() {
    // Verify DOM elements exist
    if (!this.hudElement) {
      console.error("HUD element not found");
      return false;
    }

    if (!this.scoreElement || !this.coinElement || !this.livesElement) {
      console.error("One or more HUD value elements not found");
      return false;
    }

    // Set initial values
    this.updateScore(0);
    this.updateCoins(0);
    this.updateLives(3);

    console.log("UI elements initialized successfully");
    return true;
  }

  /**
   * Update the UI system
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    // Only update at specified intervals for performance
    this.lastUpdateTime += deltaTime;
    if (this.lastUpdateTime < this.updateInterval) {
      return;
    }
    this.lastUpdateTime = 0;

    // Update UI based on game state
    const gameState = this.gameEngine.getGameState();

    // Show/hide HUD based on game mode
    if (gameState.mode === "playing" && !this.isVisible) {
      this.showHUD();
    } else if (gameState.mode !== "playing" && this.isVisible) {
      this.hideHUD();
    }

    // Update player stats if in game
    if (gameState.mode === "playing" && this.gameEngine.player) {
      const playerState = this.gameEngine.player.getState();
      this.updateScore(playerState.score);
      this.updateCoins(playerState.coins);
      this.updateLives(playerState.health);
    }
  }

  /**
   * Show the HUD
   */
  showHUD() {
    if (this.hudElement) {
      this.hudElement.classList.remove("hidden");
      this.hudElement.classList.add("visible");
      this.isVisible = true;
    }
  }

  /**
   * Hide the HUD
   */
  hideHUD() {
    if (this.hudElement) {
      this.hudElement.classList.remove("visible");
      this.hudElement.classList.add("hidden");
      this.isVisible = false;
    }
  }

  /**
   * Update score display
   * @param {number} score - Current score
   */
  updateScore(score) {
    if (this.scoreElement) {
      this.scoreElement.textContent = score.toLocaleString();
    }
  }

  /**
   * Update coins display
   * @param {number} coins - Current coin count
   */
  updateCoins(coins) {
    if (this.coinElement) {
      this.coinElement.textContent = coins.toString();
    }
  }

  /**
   * Update lives display
   * @param {number} lives - Current lives/health
   */
  updateLives(lives) {
    if (this.livesElement) {
      this.livesElement.textContent = lives.toString();

      // Add visual feedback for low health
      if (lives <= 1) {
        this.livesElement.style.color = "#ff4444";
        this.livesElement.style.animation = "pulse 1s infinite";
      } else {
        this.livesElement.style.color = "";
        this.livesElement.style.animation = "";
      }
    }
  }

  /**
   * Show a temporary message
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   * @param {string} type - Message type ('info', 'success', 'warning', 'error')
   */
  showMessage(message, duration = 2000, type = "info") {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById("game-message");
    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.id = "game-message";
      messageElement.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.getElementById("ui-overlay").appendChild(messageElement);
    }

    // Set message content and style based on type
    messageElement.textContent = message;
    messageElement.className = `message-${type}`;

    // Apply type-specific styling
    switch (type) {
      case "success":
        messageElement.style.borderLeft = "4px solid #4CAF50";
        break;
      case "warning":
        messageElement.style.borderLeft = "4px solid #FF9800";
        break;
      case "error":
        messageElement.style.borderLeft = "4px solid #F44336";
        break;
      default:
        messageElement.style.borderLeft = "4px solid #2196F3";
    }

    // Show message
    messageElement.style.opacity = "1";

    // Hide message after duration
    setTimeout(() => {
      messageElement.style.opacity = "0";
    }, duration);
  }

  /**
   * Update time display (if needed)
   * @param {number} timeRemaining - Time remaining in seconds
   */
  updateTime(timeRemaining) {
    // This could be added to the HUD if needed
    // For now, time is displayed in the canvas-based UI
  }

  /**
   * Show power-up indicator
   * @param {string} powerType - Type of power-up
   * @param {number} duration - Duration in milliseconds
   */
  showPowerUpIndicator(powerType, duration) {
    // Create or update power-up indicator
    let powerUpElement = document.getElementById("powerup-indicator");
    if (!powerUpElement) {
      powerUpElement = document.createElement("div");
      powerUpElement.id = "powerup-indicator";
      powerUpElement.style.cssText = `
        position: absolute;
        top: 80px;
        right: 20px;
        background: rgba(255, 215, 0, 0.9);
        color: #000;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        border: 2px solid #fff;
        z-index: 100;
      `;
      document.getElementById("ui-overlay").appendChild(powerUpElement);
    }

    // Update content
    const remainingSeconds = Math.ceil(duration / 1000);
    powerUpElement.textContent = `${powerType.toUpperCase()}: ${remainingSeconds}s`;
    powerUpElement.style.display = "block";

    // Auto-hide when duration expires
    setTimeout(() => {
      if (powerUpElement) {
        powerUpElement.style.display = "none";
      }
    }, duration);
  }

  /**
   * Get UI visibility state
   * @returns {boolean} - True if UI is visible
   */
  isUIVisible() {
    return this.isVisible;
  }

  /**
   * Reset UI to initial state
   */
  reset() {
    this.updateScore(0);
    this.updateCoins(0);
    this.updateLives(3);
    this.hideHUD();

    // Remove any temporary messages
    const messageElement = document.getElementById("game-message");
    if (messageElement) {
      messageElement.style.opacity = "0";
    }

    // Hide power-up indicator
    const powerUpElement = document.getElementById("powerup-indicator");
    if (powerUpElement) {
      powerUpElement.style.display = "none";
    }
  }
}
