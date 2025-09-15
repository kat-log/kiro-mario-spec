/**
 * Goal System for Mario Style Platformer
 * Handles goal detection and stage completion
 */

/**
 * Goal Class
 * Represents the goal object that players need to reach to complete a stage
 */
class Goal {
  constructor(x, y, width = 60, height = 80) {
    // Position and size properties
    this.position = { x, y };
    this.size = { width, height };

    // Goal state
    this.isActive = true;
    this.isReached = false;

    // Visual properties
    this.color = "#FFD700"; // Gold color
    this.glowColor = "#FFFF00"; // Yellow glow
    this.flagColor = "#FF0000"; // Red flag

    // Animation properties
    this.animationTimer = 0;
    this.glowIntensity = 0;
    this.flagWaveOffset = 0;

    // Goal type and properties
    this.type = "flag"; // "flag", "door", "portal", etc.
    this.scoreBonus = 1000; // Bonus points for reaching goal

    console.log(
      `Goal created at position (${this.position.x}, ${this.position.y})`
    );
  }

  /**
   * Update goal logic and animations
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update animation timers
    this.animationTimer += deltaTime;
    this.flagWaveOffset = Math.sin(this.animationTimer * 0.005) * 5;

    // Update glow effect
    this.glowIntensity = (Math.sin(this.animationTimer * 0.008) + 1) * 0.5;
  }

  /**
   * Check collision with player
   * @param {Object} player - Player object to check collision with
   * @returns {boolean} - True if player is colliding with goal
   */
  checkCollision(player) {
    if (!this.isActive || !player) return false;

    const playerBox = player.getBoundingBox();

    // AABB collision detection
    const collision = !(
      playerBox.position.x > this.position.x + this.size.width ||
      playerBox.position.x + playerBox.size.width < this.position.x ||
      playerBox.position.y > this.position.y + this.size.height ||
      playerBox.position.y + playerBox.size.height < this.position.y
    );

    return collision;
  }

  /**
   * Trigger goal reached event
   * @param {Object} player - Player who reached the goal
   * @returns {Object} - Goal completion data
   */
  onGoalReached(player) {
    if (this.isReached || !this.isActive) {
      return null;
    }

    this.isReached = true;
    this.isActive = false;

    console.log("Goal reached!");

    // Calculate completion data
    const completionData = {
      goalReached: true,
      scoreBonus: this.scoreBonus,
      completionTime: Date.now(),
      playerState: player.getState(),
      goalType: this.type,
      goalPosition: { ...this.position },
    };

    return completionData;
  }

  /**
   * Render the goal
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (!ctx || !this.isActive) return;

    const renderX = this.position.x;
    const renderY = this.position.y;

    // Draw goal based on type
    switch (this.type) {
      case "flag":
        this.renderFlag(ctx, renderX, renderY);
        break;
      case "door":
        this.renderDoor(ctx, renderX, renderY);
        break;
      case "portal":
        this.renderPortal(ctx, renderX, renderY);
        break;
      default:
        this.renderFlag(ctx, renderX, renderY);
    }

    // Draw glow effect
    this.renderGlow(ctx, renderX, renderY);

    // Draw debug collision box
    this.renderDebugInfo(ctx, renderX, renderY);
  }

  /**
   * Render flag-style goal
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Render x position
   * @param {number} y - Render y position
   */
  renderFlag(ctx, x, y) {
    // Draw flag pole
    ctx.fillStyle = "#8B4513"; // Brown pole
    ctx.fillRect(x + this.size.width / 2 - 3, y, 6, this.size.height);

    // Draw flag with wave animation
    const flagWidth = this.size.width * 0.6;
    const flagHeight = this.size.height * 0.4;
    const flagX = x + this.size.width / 2 + 3;
    const flagY = y + 10 + this.flagWaveOffset;

    // Flag background
    ctx.fillStyle = this.flagColor;
    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.lineTo(flagX + flagWidth, flagY + flagHeight / 4);
    ctx.lineTo(flagX + flagWidth - 10, flagY + flagHeight / 2);
    ctx.lineTo(flagX + flagWidth, flagY + (flagHeight * 3) / 4);
    ctx.lineTo(flagX, flagY + flagHeight);
    ctx.closePath();
    ctx.fill();

    // Flag outline
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw flag details (star or pattern)
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("★", flagX + flagWidth / 2, flagY + flagHeight / 2 + 5);
  }

  /**
   * Render door-style goal
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Render x position
   * @param {number} y - Render y position
   */
  renderDoor(ctx, x, y) {
    // Draw door frame
    ctx.fillStyle = "#654321"; // Dark brown
    ctx.fillRect(x, y, this.size.width, this.size.height);

    // Draw door panels
    ctx.fillStyle = "#8B4513"; // Brown
    ctx.fillRect(x + 5, y + 5, this.size.width - 10, this.size.height - 10);

    // Draw door handle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      x + this.size.width - 15,
      y + this.size.height / 2,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw door decoration
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y + 15, this.size.width - 20, this.size.height / 3);
    ctx.strokeRect(
      x + 10,
      y + this.size.height / 2 + 5,
      this.size.width - 20,
      this.size.height / 3
    );
  }

  /**
   * Render portal-style goal
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Render x position
   * @param {number} y - Render y position
   */
  renderPortal(ctx, x, y) {
    const centerX = x + this.size.width / 2;
    const centerY = y + this.size.height / 2;
    const radius = Math.min(this.size.width, this.size.height) / 2 - 5;

    // Draw portal rings
    for (let i = 3; i >= 0; i--) {
      const ringRadius = radius * (0.3 + i * 0.2);
      const alpha = 0.3 + i * 0.2;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 2 === 0 ? this.color : this.glowColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1.0; // Reset alpha

    // Draw portal center
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render glow effect around goal
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Render x position
   * @param {number} y - Render y position
   */
  renderGlow(ctx, x, y) {
    const centerX = x + this.size.width / 2;
    const centerY = y + this.size.height / 2;
    const glowRadius = Math.max(this.size.width, this.size.height) * 0.8;

    // Create radial gradient for glow
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius
    );

    const glowAlpha = this.glowIntensity * 0.3;
    gradient.addColorStop(0, `rgba(255, 255, 0, ${glowAlpha})`);
    gradient.addColorStop(0.5, `rgba(255, 215, 0, ${glowAlpha * 0.5})`);
    gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render debug information
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Render x position
   * @param {number} y - Render y position
   */
  renderDebugInfo(ctx, x, y) {
    const showDebug = false; // Set to true for debugging

    if (!showDebug) return;

    // Draw bounding box
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.size.width, this.size.height);

    // Draw goal info
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Goal: ${this.type}`, x, y - 5);
    ctx.fillText(`Active: ${this.isActive}`, x, y - 15);
  }

  /**
   * Get goal's bounding box for collision detection
   * @returns {Object} - Bounding box with position and size
   */
  getBoundingBox() {
    return {
      position: { x: this.position.x, y: this.position.y },
      size: { width: this.size.width, height: this.size.height },
    };
  }

  /**
   * Set goal position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * Set goal type
   * @param {string} type - Goal type ("flag", "door", "portal")
   */
  setType(type) {
    const validTypes = ["flag", "door", "portal"];
    if (validTypes.includes(type)) {
      this.type = type;
    } else {
      console.warn(`Invalid goal type: ${type}. Using default "flag".`);
      this.type = "flag";
    }
  }

  /**
   * Reset goal to initial state
   */
  reset() {
    this.isActive = true;
    this.isReached = false;
    this.animationTimer = 0;
    this.glowIntensity = 0;
    this.flagWaveOffset = 0;

    console.log("Goal reset to initial state");
  }

  /**
   * Get goal state data
   * @returns {Object} - Current goal state
   */
  getState() {
    return {
      position: { ...this.position },
      size: { ...this.size },
      isActive: this.isActive,
      isReached: this.isReached,
      type: this.type,
      scoreBonus: this.scoreBonus,
    };
  }

  /**
   * Check if goal is within camera view (for optimization)
   * @param {Object} camera - Camera object with position
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @returns {boolean} - True if goal is visible
   */
  isVisible(camera, screenWidth, screenHeight) {
    if (!camera) return true;

    const cameraLeft = camera.x;
    const cameraRight = camera.x + screenWidth;
    const cameraTop = camera.y;
    const cameraBottom = camera.y + screenHeight;

    return !(
      this.position.x > cameraRight ||
      this.position.x + this.size.width < cameraLeft ||
      this.position.y > cameraBottom ||
      this.position.y + this.size.height < cameraTop
    );
  }
}
