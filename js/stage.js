/**
 * Stage System for Mario Style Platformer
 * Manages platform data, rendering, and collision detection
 */

/**
 * Platform Class
 * Represents a single platform in the stage
 */
class Platform {
  constructor(x, y, width, height, type = "solid", color = "#8B4513") {
    this.position = { x, y };
    this.size = { width, height };
    this.type = type; // 'solid', 'passthrough', 'moving', etc.
    this.color = color;
    this.isStatic = true; // Platforms don't move by default
  }

  /**
   * Render the platform
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera position for culling (optional)
   */
  render(ctx, camera = null) {
    if (!ctx) return;

    // Use world position directly (camera transformation is applied at canvas level)
    const renderX = this.position.x;
    const renderY = this.position.y;

    // Set platform color based on type
    let platformColor = this.color;
    switch (this.type) {
      case "passthrough":
        platformColor = "#4ECDC4"; // Teal for passthrough platforms
        break;
      case "moving":
        platformColor = "#FF6B6B"; // Red for moving platforms
        break;
      default:
        platformColor = this.color;
    }

    // Draw platform rectangle
    ctx.fillStyle = platformColor;
    ctx.fillRect(renderX, renderY, this.size.width, this.size.height);

    // Add visual details for different platform types
    if (this.type === "passthrough") {
      // Add dashed line pattern for passthrough platforms
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(renderX, renderY, this.size.width, this.size.height);
      ctx.setLineDash([]); // Reset line dash
    }

    // Draw platform outline for better visibility
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 1;
    ctx.strokeRect(renderX, renderY, this.size.width, this.size.height);
  }

  /**
   * Get platform's bounding box for collision detection
   * @returns {Object} - Bounding box with position and size
   */
  getBoundingBox() {
    return {
      position: { x: this.position.x, y: this.position.y },
      size: { width: this.size.width, height: this.size.height },
    };
  }
}

/**
 * Stage Class
 * Manages platform data, stage layout, and collision detection
 */
class Stage {
  constructor(stageId = 1) {
    this.id = stageId;
    this.name = `Stage ${stageId}`;
    this.width = 2400; // Stage width (3x screen width for scrolling)
    this.height = 600; // Stage height (same as canvas)

    // Platform storage
    this.platforms = [];
    this.staticPlatforms = []; // Platforms that never move
    this.movingPlatforms = []; // Platforms that can move

    // Stage boundaries
    this.bounds = {
      left: 0,
      right: this.width,
      top: 0,
      bottom: this.height,
    };

    // Background properties
    this.backgroundColor = "#5C94FC"; // Sky blue
    this.backgroundElements = []; // Clouds, decorations, etc.

    // Goal system
    this.goal = null;

    // Initialize default stage layout
    this.initializeStage();

    console.log(
      `Stage ${this.id} created with ${this.platforms.length} platforms`
    );
  }

  /**
   * Initialize the stage with default platform layout
   */
  initializeStage() {
    // Clear existing platforms
    this.platforms = [];
    this.staticPlatforms = [];
    this.movingPlatforms = [];

    // Create ground platform (full width)
    const groundPlatform = new Platform(
      0,
      this.height - 100,
      this.width,
      100,
      "solid",
      "#8B4513"
    );
    this.addPlatform(groundPlatform);

    // Create some test platforms for the stage
    const testPlatforms = [
      // Starting area platforms
      new Platform(300, 400, 200, 20, "solid", "#4ECDC4"),
      new Platform(600, 300, 150, 20, "solid", "#45B7D1"),
      new Platform(900, 350, 100, 20, "passthrough", "#4ECDC4"),

      // Middle section platforms
      new Platform(1200, 250, 180, 20, "solid", "#4ECDC4"),
      new Platform(1500, 400, 120, 20, "solid", "#45B7D1"),
      new Platform(1700, 200, 100, 20, "passthrough", "#4ECDC4"),

      // End section platforms
      new Platform(2000, 300, 150, 20, "solid", "#4ECDC4"),
      new Platform(2200, 150, 100, 20, "solid", "#45B7D1"),
    ];

    // Add all test platforms
    testPlatforms.forEach((platform) => this.addPlatform(platform));

    // Initialize background elements
    this.initializeBackground();

    // Create goal at the end of the stage
    this.initializeGoal();
  }

  /**
   * Initialize background decorative elements
   */
  initializeBackground() {
    this.backgroundElements = [
      // Clouds at different positions
      { type: "cloud", x: 150, y: 100, size: 1.0 },
      { type: "cloud", x: 400, y: 80, size: 1.2 },
      { type: "cloud", x: 650, y: 120, size: 0.8 },
      { type: "cloud", x: 1000, y: 90, size: 1.1 },
      { type: "cloud", x: 1400, y: 110, size: 0.9 },
      { type: "cloud", x: 1800, y: 85, size: 1.3 },
      { type: "cloud", x: 2100, y: 105, size: 1.0 },
    ];
  }

  /**
   * Initialize goal object
   */
  initializeGoal() {
    // Place goal near the end of the stage, on the ground platform
    const goalX = this.width - 150; // 150 pixels from the right edge
    const goalY = this.height - 180; // On top of the ground platform

    this.goal = new Goal(goalX, goalY, 60, 80);
    this.goal.setType("flag"); // Use flag type for classic platformer feel

    console.log(`Goal initialized at position (${goalX}, ${goalY})`);
  }

  /**
   * Add a platform to the stage
   * @param {Platform} platform - Platform to add
   */
  addPlatform(platform) {
    if (!(platform instanceof Platform)) {
      console.warn("Invalid platform object passed to addPlatform");
      return;
    }

    this.platforms.push(platform);

    // Categorize platform by type
    if (platform.type === "moving") {
      this.movingPlatforms.push(platform);
    } else {
      this.staticPlatforms.push(platform);
    }
  }

  /**
   * Remove a platform from the stage
   * @param {Platform} platform - Platform to remove
   */
  removePlatform(platform) {
    const index = this.platforms.indexOf(platform);
    if (index > -1) {
      this.platforms.splice(index, 1);

      // Remove from categorized arrays
      const staticIndex = this.staticPlatforms.indexOf(platform);
      if (staticIndex > -1) {
        this.staticPlatforms.splice(staticIndex, 1);
      }

      const movingIndex = this.movingPlatforms.indexOf(platform);
      if (movingIndex > -1) {
        this.movingPlatforms.splice(movingIndex, 1);
      }
    }
  }

  /**
   * Update stage logic (for moving platforms, etc.)
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    // Update moving platforms (future implementation)
    for (const platform of this.movingPlatforms) {
      // Moving platform logic will be implemented in future tasks
    }

    // Update goal
    if (this.goal) {
      this.goal.update(deltaTime);
    }
  }

  /**
   * Check collisions between an entity and all platforms
   * @param {Object} entity - Entity to check collisions for
   * @param {Object} physicsEngine - Physics engine instance for collision resolution
   * @returns {Array} - Array of collision results
   */
  checkPlatformCollisions(entity, physicsEngine) {
    if (!entity || !physicsEngine) {
      return [];
    }

    const collisions = [];

    // Check collisions with all platforms
    for (const platform of this.platforms) {
      if (physicsEngine.checkAABBCollision(entity, platform)) {
        // Handle different platform types
        if (platform.type === "passthrough") {
          // Only collide if entity is falling and coming from above
          if (
            entity.velocity.y > 0 &&
            entity.position.y < platform.position.y
          ) {
            const resolution = physicsEngine.resolveCollision(entity, platform);
            collisions.push({ platform, resolution });
          }
        } else {
          // Normal solid platform collision
          const resolution = physicsEngine.resolveCollision(entity, platform);
          collisions.push({ platform, resolution });
        }
      }
    }

    return collisions;
  }

  /**
   * Check collision between player and goal
   * @param {Object} player - Player object to check collision with
   * @returns {Object|null} - Goal completion data if goal is reached, null otherwise
   */
  checkGoalCollision(player) {
    if (!this.goal || !player) {
      return null;
    }

    if (this.goal.checkCollision(player)) {
      return this.goal.onGoalReached(player);
    }

    return null;
  }

  /**
   * Get platforms within a specific area (for optimization)
   * @param {number} x - Area x coordinate
   * @param {number} y - Area y coordinate
   * @param {number} width - Area width
   * @param {number} height - Area height
   * @returns {Array} - Array of platforms in the area
   */
  getPlatformsInArea(x, y, width, height) {
    return this.platforms.filter((platform) => {
      return !(
        platform.position.x > x + width ||
        platform.position.x + platform.size.width < x ||
        platform.position.y > y + height ||
        platform.position.y + platform.size.height < y
      );
    });
  }

  /**
   * Render the stage
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera object for offset calculations
   */
  render(ctx, camera = null) {
    if (!ctx) return;

    // Draw background
    this.renderBackground(ctx, camera);

    // Draw all platforms
    for (const platform of this.platforms) {
      platform.render(ctx, camera);
    }

    // Draw goal
    if (this.goal && this.goal.isVisible(camera, 800, 600)) {
      this.goal.render(ctx);
    }

    // Draw stage boundaries (debug)
    this.renderDebugInfo(ctx, camera);
  }

  /**
   * Render stage background
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera position for parallax calculations
   */
  renderBackground(ctx, camera = null) {
    // Background is handled by the main game engine
    // This method can be used for stage-specific background elements

    const cameraOffsetX = camera ? camera.x : 0;

    // Draw background elements (clouds, etc.)
    ctx.fillStyle = "#FFFFFF";
    for (const element of this.backgroundElements) {
      if (element.type === "cloud") {
        // Simple parallax effect for clouds (move slower than camera)
        const parallaxX = element.x - cameraOffsetX * 0.3;
        this.drawCloud(ctx, parallaxX, element.y, element.size);
      }
    }
  }

  /**
   * Draw a simple cloud shape
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Cloud x position
   * @param {number} y - Cloud y position
   * @param {number} scale - Cloud scale factor
   */
  drawCloud(ctx, x, y, scale = 1.0) {
    const size = 20 * scale;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y, size * 1.25, 0, Math.PI * 2);
    ctx.arc(x + 50 * scale, y, size, 0, Math.PI * 2);
    ctx.arc(x + 35 * scale, y - 15 * scale, size * 0.9, 0, Math.PI * 2);
    ctx.arc(x + 15 * scale, y - 10 * scale, size * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render debug information
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera position for debug info positioning
   */
  renderDebugInfo(ctx, camera = null) {
    // This can be enabled/disabled via a debug flag
    const showDebug = false; // Set to true for debugging

    if (!showDebug) return;

    // Draw stage boundaries (world coordinates)
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, this.height);

    // Draw platform count info (world coordinates)
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Platforms: ${this.platforms.length}`, 10, 20);
  }

  /**
   * Get stage boundaries
   * @returns {Object} - Stage boundary coordinates
   */
  getBounds() {
    return { ...this.bounds };
  }

  /**
   * Check if a position is within stage bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - True if position is within bounds
   */
  isWithinBounds(x, y) {
    return (
      x >= this.bounds.left &&
      x <= this.bounds.right &&
      y >= this.bounds.top &&
      y <= this.bounds.bottom
    );
  }

  /**
   * Get stage data for saving/loading
   * @returns {Object} - Serializable stage data
   */
  getStageData() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      platforms: this.platforms.map((platform) => ({
        position: platform.position,
        size: platform.size,
        type: platform.type,
        color: platform.color,
      })),
      bounds: this.bounds,
    };
  }

  /**
   * Load stage from data
   * @param {Object} stageData - Stage data to load
   */
  loadStageData(stageData) {
    if (!stageData) return;

    this.id = stageData.id || this.id;
    this.name = stageData.name || this.name;
    this.width = stageData.width || this.width;
    this.height = stageData.height || this.height;
    this.bounds = stageData.bounds || this.bounds;

    // Clear existing platforms
    this.platforms = [];
    this.staticPlatforms = [];
    this.movingPlatforms = [];

    // Load platforms from data
    if (stageData.platforms) {
      stageData.platforms.forEach((platformData) => {
        const platform = new Platform(
          platformData.position.x,
          platformData.position.y,
          platformData.size.width,
          platformData.size.height,
          platformData.type,
          platformData.color
        );
        this.addPlatform(platform);
      });
    }

    console.log(`Stage ${this.id} loaded from data`);
  }
}
