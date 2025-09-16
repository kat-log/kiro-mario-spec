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

    // Record collision event in debug display system if available
    if (
      typeof window !== "undefined" &&
      window.gameEngine &&
      window.gameEngine.debugDisplaySystem
    ) {
      window.gameEngine.debugDisplaySystem.recordCollisionEvent({
        entityA: {
          position: { ...entityA.position },
          velocity: { ...entityA.velocity },
          size: { ...entityA.size },
        },
        entityB: {
          position: { ...entityB.position },
          size: { ...entityB.size },
        },
        resolution: { ...resolution },
      });
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

  /**
   * Enhanced collision resolution with validation and ground contact tracking
   * @param {Object} entityA - Moving entity (typically the player)
   * @param {Object} entityB - Static entity (platform, obstacle)
   * @returns {Object} - Enhanced collision resolution data
   */
  resolveCollisionEnhanced(entityA, entityB) {
    if (!this.isValidEntity(entityA) || !this.isValidEntity(entityB)) {
      console.warn(
        "[PHYSICS] Invalid entities passed to resolveCollisionEnhanced",
        {
          entityA: !!entityA,
          entityB: !!entityB,
          entityAValid: this.isValidEntity(entityA),
          entityBValid: this.isValidEntity(entityB),
        }
      );
      return { resolved: false, reason: "invalid_entities" };
    }

    // Store pre-collision state for validation
    const preCollisionState = {
      position: { ...entityA.position },
      velocity: { ...entityA.velocity },
      isOnGround: entityA.isOnGround,
    };

    // Perform standard collision resolution
    const resolution = this.resolveCollision(entityA, entityB);

    if (!resolution.resolved) {
      return resolution;
    }

    // Enhanced validation and ground contact tracking for bottom collisions
    if (resolution.direction === "bottom") {
      const validationResult = this.validateGroundCollision(
        entityA,
        entityB,
        resolution,
        preCollisionState
      );

      if (validationResult.isValid) {
        // Record ground contact time
        this.recordGroundContact(entityA);

        // Enhanced resolution data
        resolution.enhanced = {
          validated: true,
          groundContactRecorded: true,
          validationDetails: validationResult.details,
          timestamp: performance.now(),
        };

        console.log("[PHYSICS] Enhanced ground collision resolved", {
          direction: resolution.direction,
          overlap: resolution.overlap,
          entityPosition: entityA.position,
          platformPosition: entityB.position,
          validation: validationResult.details,
        });
      } else {
        // Invalid collision detected - report and attempt recovery
        this.reportInvalidCollision(
          entityA,
          entityB,
          resolution,
          validationResult
        );

        // Attempt to recover from invalid collision
        const recoveryResult = this.attemptCollisionRecovery(
          entityA,
          entityB,
          preCollisionState
        );

        resolution.enhanced = {
          validated: false,
          recovered: recoveryResult.recovered,
          validationDetails: validationResult.details,
          recoveryDetails: recoveryResult.details,
          timestamp: performance.now(),
        };
      }
    } else {
      // For non-ground collisions, just add basic enhanced data
      resolution.enhanced = {
        validated: true,
        groundContactRecorded: false,
        validationDetails: { type: "non_ground_collision" },
        timestamp: performance.now(),
      };
    }

    return resolution;
  }

  /**
   * Validate ground collision for correctness
   * @param {Object} entity - The moving entity
   * @param {Object} platform - The platform entity
   * @param {Object} resolution - The collision resolution data
   * @param {Object} preCollisionState - Entity state before collision
   * @returns {Object} - Validation result
   */
  validateGroundCollision(entity, platform, resolution, preCollisionState) {
    const validationChecks = {
      velocityCheck: false,
      overlapCheck: false,
      positionCheck: false,
      movementCheck: false,
    };

    const details = {
      velocity: { ...entity.velocity },
      preVelocity: { ...preCollisionState.velocity },
      overlap: { ...resolution.overlap },
      entityBottom: entity.position.y + entity.size.height,
      platformTop: platform.position.y,
      movementDirection:
        preCollisionState.velocity.y >= 0 ? "downward" : "upward",
    };

    // Check 1: Entity should have been moving downward or stationary
    validationChecks.velocityCheck = preCollisionState.velocity.y >= -10; // Allow small upward velocity for edge cases

    // Check 2: Overlap should be reasonable (not excessive)
    validationChecks.overlapCheck =
      resolution.overlap.y > 0 &&
      resolution.overlap.y <= entity.size.height &&
      resolution.overlap.y <= platform.size.height;

    // Check 3: Entity bottom should be near platform top after resolution
    const distanceFromPlatform = Math.abs(
      entity.position.y + entity.size.height - platform.position.y
    );
    validationChecks.positionCheck = distanceFromPlatform <= 2; // Allow 2 pixel tolerance

    // Check 4: Entity should have moved since last frame (unless already on ground)
    const positionChanged =
      Math.abs(entity.position.x - preCollisionState.position.x) > 0.1 ||
      Math.abs(entity.position.y - preCollisionState.position.y) > 0.1;
    validationChecks.movementCheck =
      positionChanged || preCollisionState.isOnGround;

    const isValid = Object.values(validationChecks).every((check) => check);

    return {
      isValid,
      details: {
        ...details,
        checks: validationChecks,
        overallValid: isValid,
      },
    };
  }

  /**
   * Record ground contact time for an entity
   * @param {Object} entity - Entity that made ground contact
   */
  recordGroundContact(entity) {
    if (entity && typeof entity.lastGroundContact !== "undefined") {
      const currentTime = performance.now();
      entity.lastGroundContact = currentTime;

      console.log("[PHYSICS] Ground contact recorded", {
        entityType: entity.constructor.name || "Unknown",
        timestamp: currentTime,
        position: { ...entity.position },
      });
    }
  }

  /**
   * Report invalid collision resolution
   * @param {Object} entity - The moving entity
   * @param {Object} platform - The platform entity
   * @param {Object} resolution - The collision resolution data
   * @param {Object} validationResult - The validation result
   */
  reportInvalidCollision(entity, platform, resolution, validationResult) {
    console.warn("[PHYSICS] Invalid collision resolution detected", {
      timestamp: performance.now(),
      resolution: {
        direction: resolution.direction,
        overlap: resolution.overlap,
      },
      entity: {
        position: { ...entity.position },
        velocity: { ...entity.velocity },
        size: { ...entity.size },
      },
      platform: {
        position: { ...platform.position },
        size: { ...platform.size },
      },
      validation: validationResult.details,
      failedChecks: Object.entries(validationResult.details.checks)
        .filter(([key, value]) => !value)
        .map(([key]) => key),
    });

    // Track invalid collision statistics
    if (!this.invalidCollisionStats) {
      this.invalidCollisionStats = {
        total: 0,
        byType: {},
        lastReported: 0,
      };
    }

    this.invalidCollisionStats.total++;
    this.invalidCollisionStats.lastReported = performance.now();

    const failedChecks = Object.entries(validationResult.details.checks)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    failedChecks.forEach((checkType) => {
      this.invalidCollisionStats.byType[checkType] =
        (this.invalidCollisionStats.byType[checkType] || 0) + 1;
    });
  }

  /**
   * Attempt to recover from invalid collision resolution
   * @param {Object} entity - The moving entity
   * @param {Object} platform - The platform entity
   * @param {Object} preCollisionState - Entity state before collision
   * @returns {Object} - Recovery result
   */
  attemptCollisionRecovery(entity, platform, preCollisionState) {
    console.log("[PHYSICS] Attempting collision recovery", {
      entityPosition: { ...entity.position },
      preCollisionPosition: { ...preCollisionState.position },
    });

    // Strategy 1: Restore to pre-collision position and stop movement
    entity.position.x = preCollisionState.position.x;
    entity.position.y = preCollisionState.position.y;
    entity.velocity.y = 0;

    // Strategy 2: Try to place entity just above the platform
    const platformTop = platform.position.y;
    const entityBottom = entity.position.y + entity.size.height;

    if (entityBottom > platformTop) {
      entity.position.y = platformTop - entity.size.height;
      entity.isOnGround = true;
    }

    // Verify recovery was successful
    const stillColliding = this.checkAABBCollision(entity, platform);
    const recovered = !stillColliding;

    console.log("[PHYSICS] Collision recovery result", {
      recovered,
      stillColliding,
      finalPosition: { ...entity.position },
      finalVelocity: { ...entity.velocity },
    });

    return {
      recovered,
      details: {
        strategy: "position_restore_and_placement",
        stillColliding,
        finalPosition: { ...entity.position },
        finalVelocity: { ...entity.velocity },
      },
    };
  }

  /**
   * Get invalid collision statistics
   * @returns {Object} - Statistics about invalid collisions
   */
  getInvalidCollisionStats() {
    return (
      this.invalidCollisionStats || {
        total: 0,
        byType: {},
        lastReported: 0,
      }
    );
  }

  /**
   * Reset invalid collision statistics
   */
  resetInvalidCollisionStats() {
    this.invalidCollisionStats = {
      total: 0,
      byType: {},
      lastReported: 0,
    };
    console.log("[PHYSICS] Invalid collision statistics reset");
  }
}
