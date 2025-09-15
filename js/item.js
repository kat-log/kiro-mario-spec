/**
 * Item System for Mario Style Platformer
 * Base Item class and item management functionality
 */

/**
 * Base Item Class
 * Represents collectible items in the game world
 */
class Item {
  constructor(x, y, type = "generic", value = 1) {
    // Position and physics properties
    this.position = { x: x || 0, y: y || 0 };
    this.size = { width: 24, height: 24 };

    // Item properties
    this.type = type; // "coin", "powerup", "invincible", etc.
    this.value = value; // Point value or effect strength
    this.isCollected = false;
    this.isActive = true;

    // Visual properties
    this.color = "#FFD700"; // Gold color by default
    this.animationTimer = 0;
    this.animationSpeed = 2000; // Animation cycle duration in ms

    // Physics properties (items can have simple physics)
    this.velocity = { x: 0, y: 0 };
    this.hasPhysics = false; // Most items are static by default
    this.isOnGround = false;

    console.log(
      `Item created: ${this.type} at (${this.position.x}, ${this.position.y})`
    );
  }

  /**
   * Update item logic
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    if (!this.isActive || this.isCollected) {
      return;
    }

    // Update animation timer
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
    }

    // Update physics if enabled
    if (this.hasPhysics) {
      this.updatePhysics(deltaTime);
    }
  }

  /**
   * Update item physics (for items that move)
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  updatePhysics(deltaTime) {
    // Simple physics update - can be overridden by subclasses
    this.position.x += this.velocity.x * (deltaTime / 1000);
    this.position.y += this.velocity.y * (deltaTime / 1000);
  }

  /**
   * Check collision with another entity
   * @param {Object} entity - Entity to check collision with (player, etc.)
   * @returns {boolean} - True if collision detected
   */
  checkCollision(entity) {
    if (!this.isActive || this.isCollected || !entity) {
      return false;
    }

    // Simple AABB collision detection
    return !(
      this.position.x > entity.position.x + entity.size.width ||
      this.position.x + this.size.width < entity.position.x ||
      this.position.y > entity.position.y + entity.size.height ||
      this.position.y + this.size.height < entity.position.y
    );
  }

  /**
   * Handle item collection
   * @param {Object} collector - Entity that collected the item (usually player)
   * @returns {Object} - Collection result with item data
   */
  collect(collector) {
    if (this.isCollected || !this.isActive) {
      return null;
    }

    this.isCollected = true;
    this.isActive = false;

    console.log(`Item collected: ${this.type} (value: ${this.value})`);

    // Return item data for the collector to process
    return {
      type: this.type,
      value: this.value,
      position: { ...this.position },
      item: this,
    };
  }

  /**
   * Render the item
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (!ctx || !this.isActive || this.isCollected) {
      return;
    }

    // Use world position directly (camera transformation is applied at canvas level)
    const renderX = this.position.x;
    const renderY = this.position.y;

    // Calculate animation effects
    const animationProgress = this.animationTimer / this.animationSpeed;
    const bobOffset = Math.sin(animationProgress * Math.PI * 2) * 3; // Gentle bobbing
    const scale = 1 + Math.sin(animationProgress * Math.PI * 4) * 0.1; // Gentle pulsing

    // Save context for transformations
    ctx.save();

    // Apply animation transformations
    ctx.translate(
      renderX + this.size.width / 2,
      renderY + this.size.height / 2 + bobOffset
    );
    ctx.scale(scale, scale);

    // Draw item based on type
    this.renderItemShape(ctx);

    // Restore context
    ctx.restore();

    // Draw debug info if needed
    this.renderDebugInfo(ctx, renderX, renderY);
  }

  /**
   * Render the item shape (can be overridden by subclasses)
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderItemShape(ctx) {
    // Default item rendering - simple rectangle
    ctx.fillStyle = this.color;
    ctx.fillRect(
      -this.size.width / 2,
      -this.size.height / 2,
      this.size.width,
      this.size.height
    );

    // Add a simple border
    ctx.strokeStyle = "#B8860B"; // Darker gold
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -this.size.width / 2,
      -this.size.height / 2,
      this.size.width,
      this.size.height
    );
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

    // Draw bounding box outline
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.size.width, this.size.height);

    // Draw item type text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.type, x + this.size.width / 2, y - 2);
  }

  /**
   * Get item's bounding box for collision detection
   * @returns {Object} - Bounding box with position and size
   */
  getBoundingBox() {
    return {
      position: { x: this.position.x, y: this.position.y },
      size: { width: this.size.width, height: this.size.height },
    };
  }

  /**
   * Set item position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * Activate/deactivate the item
   * @param {boolean} active - Whether the item should be active
   */
  setActive(active) {
    this.isActive = active;
  }

  /**
   * Reset item to initial state (for object pooling)
   */
  reset() {
    this.isCollected = false;
    this.isActive = true;
    this.animationTimer = 0;
    this.velocity = { x: 0, y: 0 };
    this.isOnGround = false;
  }

  /**
   * Get item data for serialization
   * @returns {Object} - Serializable item data
   */
  getItemData() {
    return {
      position: { ...this.position },
      type: this.type,
      value: this.value,
      isCollected: this.isCollected,
      isActive: this.isActive,
    };
  }
}

/**
 * Coin Class
 * Represents collectible coins that increase score
 */
class Coin extends Item {
  constructor(x, y, value = 1) {
    super(x, y, "coin", value);

    // Coin-specific properties
    this.size = { width: 20, height: 20 };
    this.color = "#FFD700"; // Gold color
    this.animationSpeed = 1500; // Faster animation for coins

    // Coin visual effects
    this.sparkleTimer = 0;
    this.sparkleInterval = 300; // Sparkle every 300ms
  }

  /**
   * Update coin-specific logic
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    super.update(deltaTime);

    if (!this.isActive || this.isCollected) {
      return;
    }

    // Update sparkle effect timer
    this.sparkleTimer += deltaTime;
    if (this.sparkleTimer >= this.sparkleInterval) {
      this.sparkleTimer = 0;
    }
  }

  /**
   * Render the coin with special effects
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderItemShape(ctx) {
    // Calculate animation effects
    const animationProgress = this.animationTimer / this.animationSpeed;
    const rotation = animationProgress * Math.PI * 2;

    // Save context for rotation
    ctx.save();
    ctx.rotate(rotation);

    // Draw coin as a circle with inner detail
    const radius = this.size.width / 2 - 2;

    // Outer circle (gold)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle (darker gold)
    ctx.fillStyle = "#B8860B";
    ctx.beginPath();
    ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
    ctx.fill();

    // Center symbol (¥ for yen or $ for dollar)
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("¥", 0, 0);

    // Sparkle effect
    if (this.sparkleTimer < this.sparkleInterval / 2) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(radius * 0.6, -radius * 0.6, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Handle coin collection with special effects
   * @param {Object} collector - Entity that collected the coin
   * @returns {Object} - Collection result with coin data
   */
  collect(collector) {
    const result = super.collect(collector);

    if (result) {
      // Add coin-specific collection data
      result.scoreBonus = this.value * 100;
      result.coinValue = this.value;

      console.log(
        `Coin collected! Value: ${this.value}, Score bonus: ${result.scoreBonus}`
      );
    }

    return result;
  }
}

/**
 * PowerUp Class
 * Represents power-up items that enhance player abilities
 */
class PowerUp extends Item {
  constructor(x, y, powerType = "invincible", duration = 5000) {
    super(x, y, "powerup", 1);

    // PowerUp-specific properties
    this.powerType = powerType; // "invincible", "speed", "jump", "strength"
    this.duration = duration; // Effect duration in milliseconds
    this.size = { width: 28, height: 28 };

    // Set color based on power type
    switch (this.powerType) {
      case "invincible":
        this.color = "#FF69B4"; // Hot pink for invincibility
        break;
      case "speed":
        this.color = "#00FF00"; // Green for speed boost
        break;
      case "jump":
        this.color = "#00BFFF"; // Deep sky blue for jump boost
        break;
      case "strength":
        this.color = "#FF4500"; // Orange red for strength
        break;
      default:
        this.color = "#9370DB"; // Medium purple for generic
    }

    this.animationSpeed = 2500; // Slower, more majestic animation
    this.pulseTimer = 0;
    this.pulseSpeed = 800; // Pulsing effect speed
  }

  /**
   * Update power-up specific logic
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    super.update(deltaTime);

    if (!this.isActive || this.isCollected) {
      return;
    }

    // Update pulse effect timer
    this.pulseTimer += deltaTime;
    if (this.pulseTimer >= this.pulseSpeed) {
      this.pulseTimer = 0;
    }
  }

  /**
   * Render the power-up with special effects
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderItemShape(ctx) {
    // Calculate animation effects
    const animationProgress = this.animationTimer / this.animationSpeed;
    const pulseProgress = this.pulseTimer / this.pulseSpeed;
    const rotation = animationProgress * Math.PI * 2;
    const pulse = 1 + Math.sin(pulseProgress * Math.PI * 2) * 0.2;

    // Save context for transformations
    ctx.save();
    ctx.rotate(rotation);
    ctx.scale(pulse, pulse);

    const size = this.size.width / 2 - 2;

    // Draw outer glow effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size + 8);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.7, this.color + "80"); // Semi-transparent
    gradient.addColorStop(1, this.color + "00"); // Fully transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size + 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw main power-up shape (diamond/star)
    ctx.fillStyle = this.color;
    ctx.beginPath();

    // Draw a star shape
    const spikes = 8;
    const outerRadius = size;
    const innerRadius = size * 0.5;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();

    // Add inner highlight
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Draw power type symbol
    ctx.fillStyle = "#000000";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let symbol = "?";
    switch (this.powerType) {
      case "invincible":
        symbol = "★";
        break;
      case "speed":
        symbol = "→";
        break;
      case "jump":
        symbol = "↑";
        break;
      case "strength":
        symbol = "💪";
        break;
    }

    ctx.fillText(symbol, 0, 0);

    ctx.restore();
  }

  /**
   * Handle power-up collection
   * @param {Object} collector - Entity that collected the power-up
   * @returns {Object} - Collection result with power-up data
   */
  collect(collector) {
    const result = super.collect(collector);

    if (result) {
      // Add power-up specific collection data
      result.powerType = this.powerType;
      result.duration = this.duration;
      result.scoreBonus = 1000;

      console.log(
        `PowerUp collected! Type: ${this.powerType}, Duration: ${this.duration}ms`
      );
    }

    return result;
  }
}

/**
 * ItemManager Class
 * Manages all items in the game world
 */
class ItemManager {
  constructor() {
    this.items = [];
    this.collectedItems = [];

    console.log("ItemManager initialized");
  }

  /**
   * Add an item to the manager
   * @param {Item} item - Item to add
   */
  addItem(item) {
    if (!(item instanceof Item)) {
      console.warn("Invalid item object passed to addItem");
      return;
    }

    this.items.push(item);
  }

  /**
   * Remove an item from the manager
   * @param {Item} item - Item to remove
   */
  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }

  /**
   * Update all items
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  update(deltaTime) {
    for (const item of this.items) {
      item.update(deltaTime);
    }

    // Remove collected items from active list
    this.items = this.items.filter((item) => !item.isCollected);
  }

  /**
   * Check collisions between items and an entity
   * @param {Object} entity - Entity to check collisions with
   * @returns {Array} - Array of collected items
   */
  checkCollisions(entity) {
    const collectedItems = [];

    for (const item of this.items) {
      if (item.checkCollision(entity)) {
        const collectionResult = item.collect(entity);
        if (collectionResult) {
          collectedItems.push(collectionResult);
          this.collectedItems.push(item);
        }
      }
    }

    return collectedItems;
  }

  /**
   * Render all active items
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    for (const item of this.items) {
      item.render(ctx);
    }
  }

  /**
   * Get items within a specific area (for optimization)
   * @param {number} x - Area x coordinate
   * @param {number} y - Area y coordinate
   * @param {number} width - Area width
   * @param {number} height - Area height
   * @returns {Array} - Array of items in the area
   */
  getItemsInArea(x, y, width, height) {
    return this.items.filter((item) => {
      return !(
        item.position.x > x + width ||
        item.position.x + item.size.width < x ||
        item.position.y > y + height ||
        item.position.y + item.size.height < y
      );
    });
  }

  /**
   * Clear all items
   */
  clearItems() {
    this.items = [];
    this.collectedItems = [];
  }

  /**
   * Get count of active items
   * @returns {number} - Number of active items
   */
  getActiveItemCount() {
    return this.items.length;
  }

  /**
   * Get count of collected items
   * @returns {number} - Number of collected items
   */
  getCollectedItemCount() {
    return this.collectedItems.length;
  }
}
