/**
 * Player Character Implementation
 * Handles player state, movement, and rendering
 */

/**
 * Player Class
 * Manages player character position, velocity, state, and basic rendering
 */
class Player {
  constructor(x, y, audioManager = null) {
    // Position and physics properties
    this.position = { x: x || 100, y: y || 0 };
    this.velocity = { x: 0, y: 0 };
    this.size = { width: 32, height: 32 };

    // Audio manager reference
    this.audioManager = audioManager;

    // Player state properties
    this.health = 3;
    this.powerLevel = 1;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.coins = 0;
    this.score = 0;
    this.facing = "right"; // "left" or "right"

    // Player state machine
    this.state = "idle"; // "idle", "running", "jumping", "dashing", "blocking"
    this.isOnGround = false;

    // Movement constants
    this.moveSpeed = 200; // pixels per second
    this.jumpPower = 400; // initial jump velocity
    this.dashSpeed = 350; // dash speed multiplier
    this.dashDuration = 200; // dash duration in milliseconds
    this.dashCooldown = 500; // dash cooldown in milliseconds

    // Dash state tracking
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;

    // Block state tracking
    this.isBlocking = false;

    // Power-up effects
    this.activePowerUps = new Map(); // Track active power-ups by type
    this.speedBoost = 1.0; // Speed multiplier
    this.jumpBoost = 1.0; // Jump power multiplier
    this.strengthBoost = 1.0; // Strength multiplier

    // Visual properties
    this.color = "#FF0000"; // Red placeholder color
    this.invincibleFlashTimer = 0;

    console.log(
      `Player created at position (${this.position.x}, ${this.position.y})`
    );
  }

  /**
   * Update player logic
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   * @param {Object} inputState - Current input state from InputManager
   */
  update(deltaTime, inputState) {
    // Update timers
    this.updateTimers(deltaTime);

    // Handle input and update state
    this.handleInput(inputState);

    // Update state-specific behavior
    this.updateState(deltaTime);
  }

  /**
   * Update various timers
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  updateTimers(deltaTime) {
    // Update invincibility timer
    if (this.invincible && this.invincibleTimer > 0) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.invincibleTimer = 0;
      }
    }

    // Update dash timer
    if (this.isDashing && this.dashTimer > 0) {
      this.dashTimer -= deltaTime;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.dashTimer = 0;
        this.state = "idle";
      }
    }

    // Update dash cooldown timer
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= deltaTime;
    }

    // Update invincible flash timer for visual effect
    if (this.invincible) {
      this.invincibleFlashTimer += deltaTime;
    } else {
      this.invincibleFlashTimer = 0;
    }

    // Update power-up timers
    this.updatePowerUpTimers(deltaTime);
  }

  /**
   * Handle player input
   * @param {Object} inputState - Current input state from InputManager
   */
  handleInput(inputState) {
    if (!inputState) return;

    // Handle movement input (left/right)
    if (inputState.moveLeft && !this.isBlocking) {
      this.move("left");
    } else if (inputState.moveRight && !this.isBlocking) {
      this.move("right");
    } else if (!this.isDashing) {
      // Stop horizontal movement if no input and not dashing
      this.velocity.x = 0;
      if (this.isOnGround && this.state === "running") {
        this.state = "idle";
      }
    }

    // Handle jump input with enhanced logging
    if (inputState.jump) {
      const jumpInputTimestamp = performance.now();
      console.log(
        `[INPUT] Jump input detected at ${jumpInputTimestamp.toFixed(2)}ms`,
        {
          inputState: { ...inputState },
          playerState: {
            isOnGround: this.isOnGround,
            isBlocking: this.isBlocking,
            state: this.state,
            position: { ...this.position },
            velocity: { ...this.velocity },
          },
        }
      );

      const jumpResult = this.jump();

      console.log(`[INPUT] Jump input processed`, {
        jumpExecuted: jumpResult,
        processingTime: performance.now() - jumpInputTimestamp,
        resultingState: {
          state: this.state,
          velocity: { ...this.velocity },
          isOnGround: this.isOnGround,
        },
      });
    }

    // Handle dash input
    if (inputState.dash && this.canDash()) {
      this.dash();
    }

    // Handle block input
    if (inputState.block) {
      this.block();
    } else {
      this.isBlocking = false;
    }
  }

  /**
   * Move the player in a direction
   * @param {string} direction - "left" or "right"
   */
  move(direction) {
    if (this.isBlocking) return;

    this.facing = direction;

    if (this.isDashing) {
      // Maintain dash speed
      const dashSpeedValue =
        this.facing === "right" ? this.dashSpeed : -this.dashSpeed;
      this.velocity.x = dashSpeedValue;
    } else {
      // Normal movement with speed boost
      const baseSpeed = this.moveSpeed * this.speedBoost;
      const moveSpeedValue = this.facing === "right" ? baseSpeed : -baseSpeed;
      this.velocity.x = moveSpeedValue;

      // Update state
      if (this.isOnGround) {
        this.state = "running";
      }
    }
  }

  /**
   * Make the player jump with enhanced logging and validation
   */
  jump() {
    const timestamp = performance.now();

    // Detailed pre-jump validation with logging
    const jumpValidation = this.validateJumpConditions();

    console.log(`[JUMP] Jump attempt at ${timestamp.toFixed(2)}ms`, {
      canJump: jumpValidation.canJump,
      isOnGround: this.isOnGround,
      isBlocking: this.isBlocking,
      playerState: this.state,
      position: { ...this.position },
      velocity: { ...this.velocity },
      jumpPower: this.jumpPower,
      jumpBoost: this.jumpBoost,
      validation: jumpValidation,
    });

    // Early return with detailed reason if jump is not possible
    if (!jumpValidation.canJump) {
      console.warn(`[JUMP] Jump blocked: ${jumpValidation.reason}`, {
        isOnGround: this.isOnGround,
        isBlocking: this.isBlocking,
        state: this.state,
        groundCheckDetails: jumpValidation.groundCheckDetails,
      });
      return false;
    }

    // Store pre-jump state for verification
    const preJumpState = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      isOnGround: this.isOnGround,
    };

    // Execute jump
    const effectiveJumpPower = this.jumpPower * this.jumpBoost;
    this.velocity.y = -effectiveJumpPower;
    this.isOnGround = false;
    this.state = "jumping";

    // Post-jump verification
    const postJumpState = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      isOnGround: this.isOnGround,
    };

    console.log(`[JUMP] Jump executed successfully`, {
      preJumpState,
      postJumpState,
      effectiveJumpPower,
      velocityChange: this.velocity.y - preJumpState.velocity.y,
      executionTime: performance.now() - timestamp,
    });

    // Play jump sound effect
    if (this.audioManager) {
      this.audioManager.playSound("jump", { preventOverlap: true });
    }

    // Trigger jump success callback if available
    if (this.onJumpSuccess) {
      this.onJumpSuccess({
        timestamp,
        preJumpState,
        postJumpState,
        effectiveJumpPower,
      });
    }

    return true;
  }

  /**
   * Validate jump conditions with detailed analysis
   * @returns {Object} Validation result with detailed information
   */
  validateJumpConditions() {
    const validation = {
      canJump: false,
      reason: "",
      groundCheckDetails: {},
      blockingFactors: [],
    };

    // Check ground state with enhanced validation
    const groundCheck = this.performEnhancedGroundCheck();
    validation.groundCheckDetails = groundCheck;

    if (!this.isOnGround) {
      validation.blockingFactors.push("not_on_ground");
      validation.reason = `Player is not on ground (isOnGround: ${this.isOnGround})`;
    }

    if (this.isBlocking) {
      validation.blockingFactors.push("is_blocking");
      validation.reason +=
        (validation.reason ? " and " : "") + "Player is blocking";
    }

    // Additional state checks
    if (this.state === "dashing") {
      validation.blockingFactors.push("is_dashing");
      validation.reason +=
        (validation.reason ? " and " : "") + "Player is dashing";
    }

    // Check if player has sufficient jump power
    const effectiveJumpPower = this.jumpPower * this.jumpBoost;
    if (effectiveJumpPower <= 0) {
      validation.blockingFactors.push("no_jump_power");
      validation.reason +=
        (validation.reason ? " and " : "") + "No jump power available";
    }

    // Determine if jump is possible
    validation.canJump = validation.blockingFactors.length === 0;

    if (validation.canJump) {
      validation.reason = "Jump conditions satisfied";
    }

    return validation;
  }

  /**
   * Perform enhanced ground detection check
   * @returns {Object} Detailed ground check information
   */
  performEnhancedGroundCheck() {
    const groundCheck = {
      isOnGround: this.isOnGround,
      verticalVelocity: this.velocity.y,
      position: { ...this.position },
      groundCheckMethod: "physics_engine_collision",
      additionalChecks: {},
    };

    // Additional ground validation checks
    groundCheck.additionalChecks.velocityCheck = {
      isMovingDown: this.velocity.y > 0,
      isStationary: Math.abs(this.velocity.y) < 0.1,
      velocityValue: this.velocity.y,
    };

    // Position-based ground check (fallback validation)
    groundCheck.additionalChecks.positionCheck = {
      nearBottomBound: false,
      estimatedGroundY: null,
    };

    return groundCheck;
  }

  /**
   * Activate dash ability
   */
  dash() {
    if (!this.canDash()) return;

    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashCooldownTimer = this.dashCooldown;
    this.state = "dashing";

    // Set dash velocity based on facing direction
    const dashSpeedValue =
      this.facing === "right" ? this.dashSpeed : -this.dashSpeed;
    this.velocity.x = dashSpeedValue;

    // Play dash sound effect
    if (this.audioManager) {
      this.audioManager.playSound("dash", { preventOverlap: true });
    }

    console.log(`Player dashed ${this.facing}`);
  }

  /**
   * Activate block state
   */
  block() {
    this.isBlocking = true;
    this.state = "blocking";
    this.velocity.x = 0; // Stop horizontal movement when blocking
  }

  /**
   * Check if player can dash
   * @returns {boolean} - True if dash is available
   */
  canDash() {
    return !this.isDashing && this.dashCooldownTimer <= 0 && !this.isBlocking;
  }

  /**
   * Update state-specific behavior
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  updateState(deltaTime) {
    // Update state based on current conditions
    if (!this.isOnGround && !this.isDashing) {
      this.state = "jumping";
    } else if (this.isBlocking) {
      this.state = "blocking";
    } else if (this.isDashing) {
      this.state = "dashing";
    } else if (Math.abs(this.velocity.x) > 0 && this.isOnGround) {
      this.state = "running";
    } else if (this.isOnGround) {
      this.state = "idle";
    }
  }

  /**
   * Take damage
   * @param {number} damage - Amount of damage to take
   */
  takeDamage(damage = 1) {
    if (this.invincible) return;

    this.health -= damage;
    this.invincible = true;
    this.invincibleTimer = 2000; // 2 seconds of invincibility

    // Play damage sound effect
    if (this.audioManager) {
      this.audioManager.playSound("damage");
    }

    console.log(`Player took ${damage} damage. Health: ${this.health}`);

    if (this.health <= 0) {
      this.health = 0;
      // Play defeat sound effect
      if (this.audioManager) {
        this.audioManager.playSound("defeat");
      }
      console.log("Player defeated!");
      // Game over logic will be handled by the game engine
    }
  }

  /**
   * Collect an item
   * @param {Object} item - Item object with type and value properties
   */
  collectItem(item) {
    if (!item) return;

    switch (item.type) {
      case "coin":
        this.coins += item.coinValue || item.value || 1;
        this.score += item.scoreBonus || (item.value || 1) * 100;

        // Play coin collection sound
        if (this.audioManager) {
          this.audioManager.playSound("coin");
        }

        console.log(
          `Collected coin! Coins: ${this.coins}, Score: ${this.score}`
        );
        break;

      case "powerup":
        this.activatePowerUp(item.powerType, item.duration);
        this.score += item.scoreBonus || 1000;

        // Play power-up collection sound
        if (this.audioManager) {
          this.audioManager.playSound("powerup");
        }

        console.log(`Power up activated! Type: ${item.powerType}`);
        break;

      case "invincible":
        this.invincible = true;
        this.invincibleTimer = item.duration || 5000; // 5 seconds default
        this.score += 500;

        // Play invincibility sound
        if (this.audioManager) {
          this.audioManager.playSound("invincible");
        }

        console.log("Invincibility activated!");
        break;

      case "generic":
        this.score += item.value || 100;

        // Play generic item collection sound
        if (this.audioManager) {
          this.audioManager.playSound("item");
        }

        console.log(`Collected item! Score: ${this.score}`);
        break;

      default:
        console.log(`Collected unknown item: ${item.type}`);
    }
  }

  /**
   * Render the player (basic rectangle placeholder)
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (!ctx) return;

    // Use world position directly (camera transformation is applied at canvas level)
    const renderX = this.position.x;
    const renderY = this.position.y;

    // Handle invincibility flashing effect
    let shouldRender = true;
    if (this.invincible) {
      // Flash every 100ms during invincibility
      shouldRender = Math.floor(this.invincibleFlashTimer / 100) % 2 === 0;
    }

    if (shouldRender) {
      // Set color based on state and power-ups
      let playerColor = this.color;

      // Power-up visual effects take priority
      if (this.hasPowerUp("speed")) {
        playerColor = "#00FF88"; // Green tint for speed
      } else if (this.hasPowerUp("jump")) {
        playerColor = "#0088FF"; // Blue tint for jump
      } else if (this.hasPowerUp("strength")) {
        playerColor = "#FF8800"; // Orange tint for strength
      } else {
        // Normal state colors
        switch (this.state) {
          case "dashing":
            playerColor = "#FF8800"; // Orange for dash
            break;
          case "blocking":
            playerColor = "#0088FF"; // Blue for block
            break;
          case "jumping":
            playerColor = "#FF0088"; // Pink for jump
            break;
          default:
            playerColor = this.color; // Default red
        }
      }

      // Draw player rectangle
      ctx.fillStyle = playerColor;
      ctx.fillRect(renderX, renderY, this.size.width, this.size.height);

      // Draw facing direction indicator (small triangle)
      ctx.fillStyle = "#FFFFFF";
      const centerX = renderX + this.size.width / 2;
      const centerY = renderY + this.size.height / 2;

      ctx.beginPath();
      if (this.facing === "right") {
        ctx.moveTo(centerX + 8, centerY);
        ctx.lineTo(centerX + 2, centerY - 4);
        ctx.lineTo(centerX + 2, centerY + 4);
      } else {
        ctx.moveTo(centerX - 8, centerY);
        ctx.lineTo(centerX - 2, centerY - 4);
        ctx.lineTo(centerX - 2, centerY + 4);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Always draw debug info if needed
    this.renderDebugInfo(ctx, renderX, renderY);
  }

  /**
   * Render debug information
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - Render x position
   * @param {number} y - Render y position
   */
  renderDebugInfo(ctx, x, y) {
    // Draw bounding box outline
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.size.width, this.size.height);

    // Draw state text above player
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.state, x + this.size.width / 2, y - 5);

    // Draw dash cooldown indicator
    if (this.dashCooldownTimer > 0) {
      const cooldownPercent = this.dashCooldownTimer / this.dashCooldown;
      const barWidth = this.size.width;
      const barHeight = 3;

      ctx.fillStyle = "#FF0000";
      ctx.fillRect(x, y - 15, barWidth, barHeight);

      ctx.fillStyle = "#00FF00";
      ctx.fillRect(x, y - 15, barWidth * (1 - cooldownPercent), barHeight);
    }
  }

  /**
   * Get player's bounding box for collision detection
   * @returns {Object} - Bounding box with position and size
   */
  getBoundingBox() {
    return {
      position: { x: this.position.x, y: this.position.y },
      size: { width: this.size.width, height: this.size.height },
    };
  }

  /**
   * Set player position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * Reset player to initial state
   */
  reset() {
    this.velocity = { x: 0, y: 0 };
    this.health = 3;
    this.powerLevel = 1;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.coins = 0;
    this.score = 0;
    this.facing = "right";
    this.state = "idle";
    this.isOnGround = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.isBlocking = false;
    this.invincibleFlashTimer = 0;

    // Reset power-ups
    this.activePowerUps.clear();
    this.speedBoost = 1.0;
    this.jumpBoost = 1.0;
    this.strengthBoost = 1.0;

    console.log("Player reset to initial state");
  }

  /**
   * Update power-up timers and effects
   * @param {number} deltaTime - Time elapsed since last frame (in milliseconds)
   */
  updatePowerUpTimers(deltaTime) {
    for (const [powerType, powerData] of this.activePowerUps) {
      powerData.remainingTime -= deltaTime;

      if (powerData.remainingTime <= 0) {
        this.deactivatePowerUp(powerType);
      }
    }
  }

  /**
   * Activate a power-up effect
   * @param {string} powerType - Type of power-up to activate
   * @param {number} duration - Duration of the effect in milliseconds
   */
  activatePowerUp(powerType, duration) {
    // Store the power-up data
    this.activePowerUps.set(powerType, {
      remainingTime: duration,
      totalDuration: duration,
    });

    // Apply the power-up effect
    switch (powerType) {
      case "invincible":
        this.invincible = true;
        this.invincibleTimer = duration;
        break;
      case "speed":
        this.speedBoost = 1.5; // 50% speed increase
        break;
      case "jump":
        this.jumpBoost = 1.3; // 30% jump power increase
        break;
      case "strength":
        this.strengthBoost = 2.0; // Double strength
        break;
    }

    console.log(`PowerUp activated: ${powerType} for ${duration}ms`);
  }

  /**
   * Deactivate a power-up effect
   * @param {string} powerType - Type of power-up to deactivate
   */
  deactivatePowerUp(powerType) {
    if (!this.activePowerUps.has(powerType)) {
      return;
    }

    // Remove the power-up data
    this.activePowerUps.delete(powerType);

    // Remove the power-up effect
    switch (powerType) {
      case "invincible":
        // Invincibility is handled by the existing timer system
        break;
      case "speed":
        this.speedBoost = 1.0;
        break;
      case "jump":
        this.jumpBoost = 1.0;
        break;
      case "strength":
        this.strengthBoost = 1.0;
        break;
    }

    console.log(`PowerUp deactivated: ${powerType}`);
  }

  /**
   * Check if a specific power-up is active
   * @param {string} powerType - Type of power-up to check
   * @returns {boolean} - True if the power-up is active
   */
  hasPowerUp(powerType) {
    return this.activePowerUps.has(powerType);
  }

  /**
   * Get remaining time for a power-up
   * @param {string} powerType - Type of power-up to check
   * @returns {number} - Remaining time in milliseconds, or 0 if not active
   */
  getPowerUpRemainingTime(powerType) {
    const powerData = this.activePowerUps.get(powerType);
    return powerData ? powerData.remainingTime : 0;
  }

  /**
   * Get current player state (read-only)
   * @returns {Object} - Current player state
   */
  getState() {
    return {
      position: { ...this.position },
      velocity: { ...this.velocity },
      health: this.health,
      powerLevel: this.powerLevel,
      invincible: this.invincible,
      coins: this.coins,
      score: this.score,
      facing: this.facing,
      state: this.state,
      isOnGround: this.isOnGround,
      isDashing: this.isDashing,
      isBlocking: this.isBlocking,
      canDash: this.canDash(),
      activePowerUps: Array.from(this.activePowerUps.keys()),
      speedBoost: this.speedBoost,
      jumpBoost: this.jumpBoost,
      strengthBoost: this.strengthBoost,
    };
  }
}
