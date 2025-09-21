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

    // Enhanced ground detection properties
    this.lastGroundContact = 0; // Timestamp of last ground contact
    this.groundDetectionHistory = []; // History of ground detection states
    this.groundTolerance = 5; // Ground detection tolerance in pixels

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

    // Jump diagnostic system reference
    this.jumpDiagnosticSystem = null;

    console.log(
      `Player created at position (${this.position.x}, ${this.position.y})`
    );
  }

  /**
   * Set the jump diagnostic system
   * @param {JumpDiagnosticSystem} diagnosticSystem - The diagnostic system instance
   */
  setJumpDiagnosticSystem(diagnosticSystem) {
    this.jumpDiagnosticSystem = diagnosticSystem;
    console.log("[PLAYER] Jump diagnostic system attached");
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

    // Handle jump input with enhanced validation and logging
    if (inputState.jump) {
      const jumpInputTimestamp = performance.now();

      // Pre-input state verification
      const preInputState = {
        isOnGround: this.isOnGround,
        isBlocking: this.isBlocking,
        state: this.state,
        position: { ...this.position },
        velocity: { ...this.velocity },
        lastGroundContact: this.lastGroundContact,
        timeSinceGroundContact: jumpInputTimestamp - this.lastGroundContact,
      };

      console.log(
        `[INPUT] Jump input detected at ${jumpInputTimestamp.toFixed(2)}ms`,
        {
          inputState: { ...inputState },
          playerState: preInputState,
        }
      );

      // Perform enhanced jump condition check before attempting jump
      const jumpValidation = this.canJumpEnhanced();

      console.log(`[INPUT] Pre-jump validation completed`, {
        canJump: jumpValidation.canJump,
        reason: jumpValidation.reason,
        enhancedChecks: jumpValidation.enhancedChecks,
        blockingFactors: jumpValidation.blockingFactors,
      });

      // Attempt jump execution
      const jumpResult = this.jump();

      // Record jump attempt in diagnostic system
      if (this.jumpDiagnosticSystem) {
        const groundState = this.enhancedGroundCheck();
        const reason = jumpResult ? "Success" : jumpValidation.reason;
        this.jumpDiagnosticSystem.recordJumpAttempt(
          true, // inputDetected
          groundState,
          jumpResult, // jumpExecuted
          reason
        );
      }

      // Record jump attempt in debug display system
      if (this.gameEngine && this.gameEngine.debugDisplaySystem) {
        this.gameEngine.debugDisplaySystem.recordJumpAttempt({
          inputDetected: true,
          jumpExecuted: jumpResult,
          reason: jumpResult ? "Success" : jumpValidation.reason,
          validation: jumpValidation,
          playerState: {
            position: { ...this.position },
            velocity: { ...this.velocity },
            isOnGround: this.isOnGround,
            state: this.state,
          },
        });
      }

      // Post-input state verification
      const postInputState = {
        state: this.state,
        velocity: { ...this.velocity },
        isOnGround: this.isOnGround,
        processingTime: performance.now() - jumpInputTimestamp,
      };

      console.log(`[INPUT] Jump input processed`, {
        jumpExecuted: jumpResult,
        preInputState,
        postInputState,
        validationResult: jumpValidation.canJump,
        stateChanged: preInputState.state !== postInputState.state,
        velocityChanged: preInputState.velocity.y !== postInputState.velocity.y,
      });

      // Additional diagnostics for failed jumps
      if (!jumpResult) {
        console.warn(`[INPUT] Jump execution failed despite input detection`, {
          inputDetected: true,
          validationPassed: jumpValidation.canJump,
          actualExecutionResult: jumpResult,
          possibleCauses: jumpValidation.blockingFactors,
          recommendations:
            this.generateJumpFailureRecommendations(jumpValidation),
        });
      }
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

    // SIMPLIFIED jump validation for debugging
    console.log(`[JUMP] Jump attempt at ${timestamp.toFixed(2)}ms`, {
      isOnGround: this.isOnGround,
      isBlocking: this.isBlocking,
      playerState: this.state,
      position: { ...this.position },
      velocity: { ...this.velocity },
      jumpPower: this.jumpPower,
      jumpBoost: this.jumpBoost,
    });

    // SIMPLIFIED jump condition check - just check if on ground and not blocking
    const canJumpSimple = this.isOnGround && !this.isBlocking;

    console.log(
      `[JUMP] Simple jump check: canJump=${canJumpSimple}, isOnGround=${this.isOnGround}, isBlocking=${this.isBlocking}`
    );

    // Early return with simple reason if jump is not possible
    if (!canJumpSimple) {
      // Simple failure logging
      const reason = !this.isOnGround ? "Not on ground" : "Player is blocking";
      console.warn(`[JUMP] Jump blocked: ${reason}`, {
        isOnGround: this.isOnGround,
        isBlocking: this.isBlocking,
        state: this.state,
        position: { ...this.position },
        velocity: { ...this.velocity },
      });

      return false;
    }

    // Store pre-jump state for verification
    const preJumpState = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      isOnGround: this.isOnGround,
      timestamp: timestamp,
    };

    // Execute jump with enhanced state verification
    const effectiveJumpPower = this.jumpPower * this.jumpBoost;

    // Verify jump execution conditions one more time
    if (effectiveJumpPower <= 0) {
      console.error(
        `[JUMP] Critical error: Invalid jump power ${effectiveJumpPower}`
      );
      return false;
    }

    // Apply jump physics
    this.velocity.y = -effectiveJumpPower;
    this.isOnGround = false;
    this.state = "jumping";

    // Post-jump verification and logging
    const postJumpState = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      isOnGround: this.isOnGround,
      timestamp: performance.now(),
    };

    console.log(`[JUMP] Jump executed successfully!`, {
      effectiveJumpPower,
      newVelocityY: this.velocity.y,
      newState: this.state,
      isOnGround: this.isOnGround,
    });

    // Play jump sound effect
    if (this.audioManager) {
      this.audioManager.playSound("jump", { preventOverlap: true });
    }

    // Trigger jump success callback if available
    if (this.onJumpSuccess) {
      this.onJumpSuccess(jumpExecutionDetails);
    }

    return true;
  }

  /**
   * Generate recommendations for jump failure scenarios
   * @param {Object} jumpValidation - Jump validation result
   * @returns {Array} Array of recommendation strings
   */
  generateJumpFailureRecommendations(jumpValidation) {
    const recommendations = [];

    if (jumpValidation.blockingFactors.includes("not_on_ground_enhanced")) {
      const timeSinceContact =
        jumpValidation.enhancedChecks?.timeSinceGroundContact || 0;
      if (timeSinceContact > 100) {
        recommendations.push(
          "Player has been off ground too long. Check ground detection system."
        );
      } else {
        recommendations.push(
          "Ground detection may be inconsistent. Verify collision system."
        );
      }

      if (jumpValidation.enhancedChecks?.groundConfidence < 0.5) {
        recommendations.push(
          "Low ground detection confidence. Check multiple detection methods."
        );
      }
    }

    if (jumpValidation.blockingFactors.includes("is_blocking")) {
      recommendations.push(
        "Player is blocking. Release block input to allow jumping."
      );
    }

    if (jumpValidation.blockingFactors.includes("is_dashing")) {
      recommendations.push(
        "Player is dashing. Wait for dash to complete before jumping."
      );
    }

    if (jumpValidation.blockingFactors.includes("no_jump_power")) {
      recommendations.push(
        "Jump power is zero or negative. Check jump power configuration."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Unknown jump failure. Check system state and configuration."
      );
    }

    return recommendations;
  }

  /**
   * Enhanced jump condition validation with lenient ground detection
   * @returns {Object} Enhanced validation result with detailed information
   */
  canJumpEnhanced() {
    const timestamp = performance.now();
    const validation = {
      canJump: false,
      reason: "",
      groundCheckDetails: {},
      blockingFactors: [],
      enhancedChecks: {},
      timestamp: timestamp,
    };

    // Perform enhanced ground check
    const groundCheck = this.enhancedGroundCheck();
    validation.groundCheckDetails = groundCheck;

    // Calculate time since last ground contact
    const timeSinceGroundContact = timestamp - this.lastGroundContact;
    const recentlyOnGround = timeSinceGroundContact <= 100; // 100ms tolerance

    validation.enhancedChecks = {
      isOnGround: this.isOnGround,
      enhancedGroundCheck: groundCheck.isOnGround,
      timeSinceGroundContact: timeSinceGroundContact,
      recentlyOnGround: recentlyOnGround,
      groundConfidence: groundCheck.confidence,
    };

    // Enhanced ground validation - more lenient
    const canJumpFromGround =
      this.isOnGround || groundCheck.isOnGround || recentlyOnGround;

    if (!canJumpFromGround) {
      validation.blockingFactors.push("not_on_ground_enhanced");
      validation.reason = `Player is not on ground and was not recently on ground (last contact: ${timeSinceGroundContact.toFixed(
        1
      )}ms ago, tolerance: 100ms)`;
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
      validation.reason = "Enhanced jump conditions satisfied";
      if (recentlyOnGround && !this.isOnGround) {
        validation.reason += ` (coyote time: ${timeSinceGroundContact.toFixed(
          1
        )}ms)`;
      }
    }

    // Log detailed jump validation information
    console.log(
      `[JUMP_VALIDATION] Enhanced jump validation at ${timestamp.toFixed(2)}ms`,
      {
        canJump: validation.canJump,
        reason: validation.reason,
        blockingFactors: validation.blockingFactors,
        enhancedChecks: validation.enhancedChecks,
        groundCheckDetails: validation.groundCheckDetails,
      }
    );

    return validation;
  }

  /**
   * Validate jump conditions with detailed analysis (legacy method for compatibility)
   * @returns {Object} Validation result with detailed information
   */
  validateJumpConditions() {
    // Use the enhanced validation method
    return this.canJumpEnhanced();
  }

  /**
   * Enhanced ground detection check using multiple validation methods
   * @returns {Object} Comprehensive ground check information
   */
  enhancedGroundCheck() {
    const timestamp = performance.now();

    // 1. Physics-based ground detection (existing collision system)
    const physicsGroundCheck = this.isOnGround;

    // 2. Position-based ground detection
    const positionGroundCheck = this.checkGroundByPosition();

    // 3. Velocity-based ground detection
    const velocityGroundCheck = this.checkGroundByVelocity();

    // Combine all detection methods
    const combinedResult = physicsGroundCheck || positionGroundCheck;

    // Calculate confidence level
    const confidence = this.calculateGroundConfidence({
      physicsGroundCheck,
      positionGroundCheck,
      velocityGroundCheck,
    });

    // Record in history
    this.recordGroundDetectionHistory({
      timestamp,
      physicsGroundCheck,
      positionGroundCheck,
      velocityGroundCheck,
      combinedResult,
      confidence,
    });

    // Update last ground contact if on ground
    if (combinedResult) {
      this.lastGroundContact = timestamp;
    }

    const result = {
      isOnGround: combinedResult,
      confidence: confidence,
      timestamp: timestamp,
      details: {
        physicsGroundCheck,
        positionGroundCheck,
        velocityGroundCheck,
      },
      diagnostics: {
        lastGroundContact: this.lastGroundContact,
        timeSinceLastContact: timestamp - this.lastGroundContact,
        historyLength: this.groundDetectionHistory.length,
      },
    };

    // Log detailed ground check information
    console.log(
      `[GROUND_CHECK] Enhanced ground detection at ${timestamp.toFixed(2)}ms`,
      result
    );

    return result;
  }

  /**
   * Check ground state based on player position
   * @returns {boolean} True if player appears to be on ground based on position
   */
  checkGroundByPosition() {
    // Position-based ground detection using multiple heuristics
    const playerBottom = this.position.y + this.size.height;

    // Heuristic 1: Check if player is at a reasonable ground level
    // This assumes the game canvas is 600px high and ground is near the bottom
    const canvasHeight = 600; // Standard game canvas height
    const groundLevel = canvasHeight - 50; // Assume ground is 50px from bottom
    const isNearGroundLevel =
      Math.abs(playerBottom - groundLevel) <= this.groundTolerance;

    // Heuristic 2: Check if player position is stable (not changing rapidly)
    // This would indicate the player is resting on something
    const positionStable = this.velocity.y >= -0.1 && this.velocity.y <= 0.1;

    // Heuristic 3: Check if player is not too high up (reasonable jumping height)
    const maxJumpHeight = 200; // Maximum reasonable jump height
    const notTooHigh = this.position.y >= canvasHeight - maxJumpHeight;

    // Combine heuristics - player is likely on ground if any strong indicator is true
    return isNearGroundLevel || (positionStable && notTooHigh);
  }

  /**
   * Check ground state based on player velocity
   * @returns {boolean} True if velocity indicates ground contact
   */
  checkGroundByVelocity() {
    // If player has zero or very small downward velocity, might be on ground
    const isStationary = Math.abs(this.velocity.y) < 0.1;
    const isNotFalling = this.velocity.y <= 0.1; // Not falling fast

    // Velocity-based ground detection is most reliable when combined with other methods
    return isStationary || (isNotFalling && this.velocity.y >= 0);
  }

  /**
   * Calculate confidence level for ground detection
   * @param {Object} checks - Results from different ground check methods
   * @returns {number} Confidence level between 0 and 1
   */
  calculateGroundConfidence(checks) {
    let confidence = 0;
    let totalChecks = 0;

    // Physics check has highest weight
    if (checks.physicsGroundCheck) {
      confidence += 0.6;
    }
    totalChecks += 0.6;

    // Position check has medium weight
    if (checks.positionGroundCheck) {
      confidence += 0.3;
    }
    totalChecks += 0.3;

    // Velocity check has lower weight
    if (checks.velocityGroundCheck) {
      confidence += 0.1;
    }
    totalChecks += 0.1;

    // Normalize confidence
    return totalChecks > 0 ? confidence / totalChecks : 0;
  }

  /**
   * Record ground detection history for analysis
   * @param {Object} detectionData - Ground detection data to record
   */
  recordGroundDetectionHistory(detectionData) {
    this.groundDetectionHistory.push(detectionData);

    // Keep only the last 50 entries to prevent memory issues
    if (this.groundDetectionHistory.length > 50) {
      this.groundDetectionHistory.shift();
    }
  }

  /**
   * Perform enhanced ground detection check (legacy method name for compatibility)
   * @returns {Object} Detailed ground check information
   */
  performEnhancedGroundCheck() {
    // Delegate to the new enhanced method
    return this.enhancedGroundCheck();
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

    // Reset enhanced ground detection properties
    this.lastGroundContact = 0;
    this.groundDetectionHistory = [];

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
   * Get ground detection diagnostics
   * @returns {Object} Ground detection diagnostic information
   */
  getGroundDetectionDiagnostics() {
    const currentTime = performance.now();
    const recentHistory = this.groundDetectionHistory.slice(-10); // Last 10 entries

    return {
      lastGroundContact: this.lastGroundContact,
      timeSinceLastContact: currentTime - this.lastGroundContact,
      groundTolerance: this.groundTolerance,
      historyLength: this.groundDetectionHistory.length,
      recentHistory: recentHistory,
      currentGroundState: this.isOnGround,
      averageConfidence:
        recentHistory.length > 0
          ? recentHistory.reduce((sum, entry) => sum + entry.confidence, 0) /
            recentHistory.length
          : 0,
    };
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
      // Enhanced ground detection state
      lastGroundContact: this.lastGroundContact,
      groundDetectionHistory: this.groundDetectionHistory.slice(-5), // Last 5 entries
      groundTolerance: this.groundTolerance,
    };
  }
}
