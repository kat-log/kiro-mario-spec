/**
 * Physics Engine for Mario Style Platformer
 * Handles gravity, collision detection, and entity movement
 */

/**
 * Physics Engine Class
 * Manages gravity system, collision detection (AABB), and entity position/velocity updates
 */
class PhysicsEngine {
  constructor() {
    // Physics constants
    this.gravity = 980; // pixels per second squared (similar to real gravity)
    this.terminalVelocity = 600; // maximum falling speed
    this.friction = 0.8; // ground friction coefficient
    this.airResistance = 0.98; // air resistance coefficient

    console.log("PhysicsEngine initialized");
  }

  /**
   * Apply gravity to an entity
   * @param {Object} entity - Entity with velocity property
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  applyGravity(entity, deltaTime) {
    if (!entity || !entity.velocity) {
      console.warn("Invalid entity passed to applyGravity");
      return;
    }

    // Convert deltaTime from milliseconds to seconds
    const deltaSeconds = deltaTime / 1000;

    // Apply gravity to vertical velocity
    entity.velocity.y += this.gravity * deltaSeconds;

    // Cap at terminal velocity
    if (entity.velocity.y > this.terminalVelocity) {
      entity.velocity.y = this.terminalVelocity;
    }
  }

  /**
   * Apply friction to an entity (typically when on ground)
   * @param {Object} entity - Entity with velocity property
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   * @param {boolean} isOnGround - Whether the entity is on the ground
   */
  applyFriction(entity, deltaTime, isOnGround = false) {
    if (!entity || !entity.velocity) {
      console.warn("Invalid entity passed to applyFriction");
      return;
    }

    // Apply different resistance based on whether entity is on ground or in air
    const resistance = isOnGround ? this.friction : this.airResistance;

    // Apply horizontal friction/air resistance
    entity.velocity.x *= resistance;

    // Stop very small movements to prevent jitter
    if (Math.abs(entity.velocity.x) < 0.1) {
      entity.velocity.x = 0;
    }
  }

  /**
   * Update entity position based on velocity
   * @param {Object} entity - Entity with position and velocity properties
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  updatePosition(entity, deltaTime) {
    if (!entity || !entity.position || !entity.velocity) {
      console.warn("Invalid entity passed to updatePosition");
      return;
    }

    // Convert deltaTime from milliseconds to seconds
    const deltaSeconds = deltaTime / 1000;

    // Update position based on velocity
    entity.position.x += entity.velocity.x * deltaSeconds;
    entity.position.y += entity.velocity.y * deltaSeconds;
  }

  /**
   * Check AABB (Axis-Aligned Bounding Box) collision between two entities
   * @param {Object} entityA - First entity with position and size properties
   * @param {Object} entityB - Second entity with position and size properties
   * @returns {boolean} - True if collision detected
   */
  checkAABBCollision(entityA, entityB) {
    if (!this.isValidEntity(entityA) || !this.isValidEntity(entityB)) {
      return false;
    }

    const aLeft = entityA.position.x;
    const aRight = entityA.position.x + entityA.size.width;
    const aTop = entityA.position.y;
    const aBottom = entityA.position.y + entityA.size.height;

    const bLeft = entityB.position.x;
    const bRight = entityB.position.x + entityB.size.width;
    const bTop = entityB.position.y;
    const bBottom = entityB.position.y + entityB.size.height;

    // Check for overlap on both axes
    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
  }

  /**
   * Check collision between entity and multiple obstacles
   * @param {Object} entity - Entity to check collisions for
   * @param {Array} obstacles - Array of obstacle entities
   * @returns {Array} - Array of colliding obstacles
   */
  checkCollisions(entity, obstacles) {
    if (!this.isValidEntity(entity) || !Array.isArray(obstacles)) {
      return [];
    }

    const collisions = [];

    for (const obstacle of obstacles) {
      if (this.checkAABBCollision(entity, obstacle)) {
        collisions.push(obstacle);
      }
    }

    return collisions;
  }

  /**
   * Resolve collision between two entities
   * @param {Object} entityA - Moving entity
   * @param {Object} entityB - Static entity (platform, obstacle)
   * @returns {Object} - Collision resolution data
   */
  resolveCollision(entityA, entityB) {
    if (!this.isValidEntity(entityA) || !this.isValidEntity(entityB)) {
      return { resolved: false };
    }

    // Calculate overlap on each axis
    const overlapX = this.calculateOverlapX(entityA, entityB);
    const overlapY = this.calculateOverlapY(entityA, entityB);

    // Determine which axis has smaller overlap (primary collision direction)
    const resolution = {
      resolved: true,
      direction: null,
      overlap: { x: overlapX, y: overlapY },
    };

    if (Math.abs(overlapX) < Math.abs(overlapY)) {
      // Horizontal collision (left/right)
      resolution.direction = overlapX > 0 ? "left" : "right";
      entityA.position.x -= overlapX;
      entityA.velocity.x = 0; // Stop horizontal movement
    } else {
      // Vertical collision (top/bottom)
      resolution.direction = overlapY > 0 ? "top" : "bottom";
      entityA.position.y -= overlapY;

      if (resolution.direction === "bottom") {
        // Landing on top of platform
        entityA.velocity.y = 0;
        entityA.isOnGround = true;
      } else if (resolution.direction === "top") {
        // Hitting platform from below
        entityA.velocity.y = 0;
      }
    }

    return resolution;
  }

  /**
   * Calculate horizontal overlap between two entities
   * @param {Object} entityA - First entity
   * @param {Object} entityB - Second entity
   * @returns {number} - Overlap amount (positive = A overlaps B from right)
   */
  calculateOverlapX(entityA, entityB) {
    const aLeft = entityA.position.x;
    const aRight = entityA.position.x + entityA.size.width;
    const bLeft = entityB.position.x;
    const bRight = entityB.position.x + entityB.size.width;

    // Calculate overlap from both directions
    const overlapFromRight = aRight - bLeft; // A overlapping B from the right
    const overlapFromLeft = bRight - aLeft; // A overlapping B from the left

    // Return the smaller overlap (the actual collision direction)
    if (overlapFromRight < overlapFromLeft) {
      return overlapFromRight;
    } else {
      return -overlapFromLeft;
    }
  }

  /**
   * Calculate vertical overlap between two entities
   * @param {Object} entityA - First entity
   * @param {Object} entityB - Second entity
   * @returns {number} - Overlap amount (positive = A overlaps B from bottom)
   */
  calculateOverlapY(entityA, entityB) {
    const aTop = entityA.position.y;
    const aBottom = entityA.position.y + entityA.size.height;
    const bTop = entityB.position.y;
    const bBottom = entityB.position.y + entityB.size.height;

    // Calculate overlap from both directions
    const overlapFromBottom = aBottom - bTop; // A overlapping B from below
    const overlapFromTop = bBottom - aTop; // A overlapping B from above

    // Return the smaller overlap (the actual collision direction)
    if (overlapFromBottom < overlapFromTop) {
      return overlapFromBottom;
    } else {
      return -overlapFromTop;
    }
  }

  /**
   * Check if entity is valid for physics calculations
   * @param {Object} entity - Entity to validate
   * @returns {boolean} - True if entity has required properties
   */
  isValidEntity(entity) {
    return (
      entity &&
      entity.position &&
      typeof entity.position.x === "number" &&
      typeof entity.position.y === "number" &&
      entity.size &&
      typeof entity.size.width === "number" &&
      typeof entity.size.height === "number"
    );
  }

  /**
   * Check if a point is inside an entity's bounding box
   * @param {number} x - Point x coordinate
   * @param {number} y - Point y coordinate
   * @param {Object} entity - Entity to check against
   * @returns {boolean} - True if point is inside entity
   */
  pointInEntity(x, y, entity) {
    if (!this.isValidEntity(entity)) {
      return false;
    }

    return (
      x >= entity.position.x &&
      x <= entity.position.x + entity.size.width &&
      y >= entity.position.y &&
      y <= entity.position.y + entity.size.height
    );
  }

  /**
   * Get physics constants (read-only)
   * @returns {Object} - Physics constants
   */
  getConstants() {
    return {
      gravity: this.gravity,
      terminalVelocity: this.terminalVelocity,
      friction: this.friction,
      airResistance: this.airResistance,
    };
  }

  /**
   * Update physics constants (for tuning)
   * @param {Object} constants - New physics constants
   */
  updateConstants(constants) {
    if (constants.gravity !== undefined) {
      this.gravity = Math.max(0, constants.gravity);
    }
    if (constants.terminalVelocity !== undefined) {
      this.terminalVelocity = Math.max(0, constants.terminalVelocity);
    }
    if (constants.friction !== undefined) {
      this.friction = Math.max(0, Math.min(1, constants.friction));
    }
    if (constants.airResistance !== undefined) {
      this.airResistance = Math.max(0, Math.min(1, constants.airResistance));
    }

    console.log("Physics constants updated:", this.getConstants());
  }
}
