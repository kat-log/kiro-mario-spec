/**
 * Camera System for Mario Style Platformer
 * Handles player following, smooth movement, and scroll boundaries
 */

/**
 * Camera Class
 * Manages viewport positioning and player following with smooth movement
 */
class Camera {
  constructor(canvasWidth, canvasHeight, stageWidth, stageHeight) {
    // Camera position (top-left corner of viewport)
    this.x = 0;
    this.y = 0;

    // Viewport dimensions
    this.width = canvasWidth;
    this.height = canvasHeight;

    // Stage dimensions for boundary calculations
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    // Camera follow settings
    this.followTarget = null; // Target to follow (usually player)
    this.followOffset = {
      x: canvasWidth / 3, // Keep player at 1/3 from left edge
      y: canvasHeight / 2, // Keep player vertically centered
    };

    // Smooth movement settings
    this.smoothing = 0.1; // Lower = smoother, higher = more responsive
    this.deadZone = {
      width: 100, // Horizontal dead zone around follow point
      height: 50, // Vertical dead zone around follow point
    };

    // Boundary limits
    this.bounds = {
      left: 0,
      right: Math.max(0, stageWidth - canvasWidth),
      top: 0,
      bottom: Math.max(0, stageHeight - canvasHeight),
    };

    // Camera shake effect (for future use)
    this.shake = {
      intensity: 0,
      duration: 0,
      timer: 0,
      offsetX: 0,
      offsetY: 0,
    };

    console.log(
      `Camera initialized: viewport ${this.width}x${this.height}, stage ${this.stageWidth}x${this.stageHeight}`
    );
  }

  /**
   * Set the target for the camera to follow
   * @param {Object} target - Target object with position property
   */
  setFollowTarget(target) {
    this.followTarget = target;
    console.log("Camera follow target set");
  }

  /**
   * Update camera position
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    // Update camera shake if active
    this.updateShake(deltaTime);

    // Follow target if set
    if (this.followTarget) {
      this.followTargetSmooth(deltaTime);
    }

    // Apply boundary constraints
    this.applyBoundaryConstraints();
  }

  /**
   * Follow target with smooth movement and dead zone
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  followTargetSmooth(deltaTime) {
    if (!this.followTarget || !this.followTarget.position) return;

    const target = this.followTarget.position;

    // Calculate desired camera position
    const desiredX = target.x - this.followOffset.x;
    const desiredY = target.y - this.followOffset.y;

    // Calculate current follow point on screen
    const currentFollowX = this.x + this.followOffset.x;
    const currentFollowY = this.y + this.followOffset.y;

    // Check if target is outside dead zone
    const deltaX = target.x - currentFollowX;
    const deltaY = target.y - currentFollowY;

    let newX = this.x;
    let newY = this.y;

    // Horizontal movement with dead zone
    if (Math.abs(deltaX) > this.deadZone.width / 2) {
      const targetX = desiredX;
      newX = this.lerp(this.x, targetX, this.smoothing);
    }

    // Vertical movement with dead zone (optional, can be disabled for platformers)
    if (Math.abs(deltaY) > this.deadZone.height / 2) {
      const targetY = desiredY;
      newY = this.lerp(this.y, targetY, this.smoothing * 0.5); // Slower vertical following
    }

    // Update camera position
    this.x = newX;
    this.y = newY;
  }

  /**
   * Apply boundary constraints to keep camera within stage bounds
   */
  applyBoundaryConstraints() {
    // Horizontal boundaries
    if (this.x < this.bounds.left) {
      this.x = this.bounds.left;
    } else if (this.x > this.bounds.right) {
      this.x = this.bounds.right;
    }

    // Vertical boundaries
    if (this.y < this.bounds.top) {
      this.y = this.bounds.top;
    } else if (this.y > this.bounds.bottom) {
      this.y = this.bounds.bottom;
    }
  }

  /**
   * Update camera shake effect
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  updateShake(deltaTime) {
    if (this.shake.timer > 0) {
      this.shake.timer -= deltaTime;

      // Calculate shake offset
      const shakeAmount =
        this.shake.intensity * (this.shake.timer / this.shake.duration);
      this.shake.offsetX = (Math.random() - 0.5) * shakeAmount;
      this.shake.offsetY = (Math.random() - 0.5) * shakeAmount;

      if (this.shake.timer <= 0) {
        this.shake.timer = 0;
        this.shake.offsetX = 0;
        this.shake.offsetY = 0;
      }
    }
  }

  /**
   * Get camera position with shake offset applied
   * @returns {Object} - Camera position with shake
   */
  getPosition() {
    return {
      x: this.x + this.shake.offsetX,
      y: this.y + this.shake.offsetY,
    };
  }

  /**
   * Get camera viewport bounds
   * @returns {Object} - Viewport boundaries
   */
  getViewport() {
    const pos = this.getPosition();
    return {
      left: pos.x,
      right: pos.x + this.width,
      top: pos.y,
      bottom: pos.y + this.height,
    };
  }

  /**
   * Check if a point is visible in the camera viewport
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - True if point is visible
   */
  isPointVisible(x, y) {
    const viewport = this.getViewport();
    return (
      x >= viewport.left &&
      x <= viewport.right &&
      y >= viewport.top &&
      y <= viewport.bottom
    );
  }

  /**
   * Check if a rectangle is visible in the camera viewport
   * @param {number} x - Rectangle x position
   * @param {number} y - Rectangle y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {boolean} - True if rectangle is visible
   */
  isRectVisible(x, y, width, height) {
    const viewport = this.getViewport();
    return !(
      x + width < viewport.left ||
      x > viewport.right ||
      y + height < viewport.top ||
      y > viewport.bottom
    );
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - World x coordinate
   * @param {number} worldY - World y coordinate
   * @returns {Object} - Screen coordinates
   */
  worldToScreen(worldX, worldY) {
    const pos = this.getPosition();
    return {
      x: worldX - pos.x,
      y: worldY - pos.y,
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - Screen x coordinate
   * @param {number} screenY - Screen y coordinate
   * @returns {Object} - World coordinates
   */
  screenToWorld(screenX, screenY) {
    const pos = this.getPosition();
    return {
      x: screenX + pos.x,
      y: screenY + pos.y,
    };
  }

  /**
   * Set camera position directly
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.applyBoundaryConstraints();
  }

  /**
   * Move camera by offset
   * @param {number} deltaX - X offset
   * @param {number} deltaY - Y offset
   */
  move(deltaX, deltaY) {
    this.x += deltaX;
    this.y += deltaY;
    this.applyBoundaryConstraints();
  }

  /**
   * Start camera shake effect
   * @param {number} intensity - Shake intensity
   * @param {number} duration - Shake duration in milliseconds
   */
  startShake(intensity, duration) {
    this.shake.intensity = intensity;
    this.shake.duration = duration;
    this.shake.timer = duration;
  }

  /**
   * Update camera bounds when stage size changes
   * @param {number} stageWidth - New stage width
   * @param {number} stageHeight - New stage height
   */
  updateStageBounds(stageWidth, stageHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    this.bounds = {
      left: 0,
      right: Math.max(0, stageWidth - this.width),
      top: 0,
      bottom: Math.max(0, stageHeight - this.height),
    };

    // Reapply constraints with new bounds
    this.applyBoundaryConstraints();
  }

  /**
   * Set camera smoothing factor
   * @param {number} smoothing - Smoothing factor (0-1)
   */
  setSmoothing(smoothing) {
    this.smoothing = Math.max(0, Math.min(1, smoothing));
  }

  /**
   * Set dead zone size
   * @param {number} width - Dead zone width
   * @param {number} height - Dead zone height
   */
  setDeadZone(width, height) {
    this.deadZone.width = width;
    this.deadZone.height = height;
  }

  /**
   * Linear interpolation helper function
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {number} - Interpolated value
   */
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Reset camera to initial position
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.shake.timer = 0;
    this.shake.offsetX = 0;
    this.shake.offsetY = 0;
  }

  /**
   * Get camera debug information
   * @returns {Object} - Debug information
   */
  getDebugInfo() {
    const pos = this.getPosition();
    return {
      position: { x: Math.round(pos.x), y: Math.round(pos.y) },
      bounds: this.bounds,
      followTarget: this.followTarget ? "Set" : "None",
      smoothing: this.smoothing,
      deadZone: this.deadZone,
      shake: {
        active: this.shake.timer > 0,
        intensity: this.shake.intensity,
        timer: Math.round(this.shake.timer),
      },
    };
  }
}
