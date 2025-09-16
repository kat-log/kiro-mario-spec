/**
 * Enhanced Debug Display System
 * Provides comprehensive real-time debugging information for the game
 */

class DebugDisplaySystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.isVisible = false;
    this.displayMode = "full"; // 'full', 'minimal', 'physics', 'input'

    // Performance optimization settings
    this.performanceSettings = {
      throttled: false,
      maxUpdateFrequency: 60, // Hz
      minUpdateFrequency: 15, // Hz when throttled
      adaptiveThrottling: true,
      maxRenderOverhead: 3, // ms
    };

    // Display configuration
    this.config = {
      fontSize: 12,
      fontFamily: "monospace",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      textColor: "#00FF00",
      headerColor: "#FFFF00",
      warningColor: "#FF8800",
      errorColor: "#FF0000",
      padding: 10,
      lineHeight: 15,
      maxLines: 40,
      refreshRate: this.shouldEnableDiagnostics()
        ? this.performanceSettings.maxUpdateFrequency
        : this.performanceSettings.minUpdateFrequency,
    };

    // Data collection
    this.frameData = [];
    this.maxFrameData = this.performanceSettings.throttled ? 30 : 60; // Reduce memory usage when throttled
    this.lastUpdateTime = 0;
    this.updateInterval = 1000 / this.config.refreshRate;

    // Physics monitoring
    this.physicsData = {
      lastGroundStateChange: 0,
      groundStateHistory: [],
      jumpAttempts: [],
      collisionEvents: [],
    };

    // Input monitoring
    this.inputData = {
      keyEvents: [],
      actionTriggers: [],
      focusEvents: [],
    };

    console.log("[DEBUG_DISPLAY] Enhanced Debug Display System initialized");
  }

  /**
   * Toggle debug display visibility
   */
  toggle() {
    this.isVisible = !this.isVisible;
    console.log(
      `[DEBUG_DISPLAY] Debug display ${this.isVisible ? "enabled" : "disabled"}`
    );
    return this.isVisible;
  }

  /**
   * Set debug display visibility
   * @param {boolean} visible - Whether to show debug display
   */
  setVisible(visible) {
    this.isVisible = visible;
    console.log(
      `[DEBUG_DISPLAY] Debug display ${this.isVisible ? "enabled" : "disabled"}`
    );
  }

  /**
   * Cycle through display modes
   */
  cycleDisplayMode() {
    const modes = ["full", "minimal", "physics", "input"];
    const currentIndex = modes.indexOf(this.displayMode);
    this.displayMode = modes[(currentIndex + 1) % modes.length];
    console.log(`[DEBUG_DISPLAY] Display mode changed to: ${this.displayMode}`);
    return this.displayMode;
  }

  /**
   * Update debug data collection
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    if (!this.isVisible || !this.shouldEnableDiagnostics()) return;

    const currentTime = performance.now();

    // Throttle updates to configured refresh rate
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return;
    }

    // Performance monitoring for update process
    const updateStart = performance.now();

    this.lastUpdateTime = currentTime;

    // Collect frame data
    this.collectFrameData(deltaTime, currentTime);

    // Collect physics data (throttled when performance is poor)
    if (!this.performanceSettings.throttled || currentTime % 2 === 0) {
      this.collectPhysicsData();
    }

    // Collect input data (throttled when performance is poor)
    if (!this.performanceSettings.throttled || currentTime % 3 === 0) {
      this.collectInputData();
    }

    // Clean up old data (less frequent when throttled)
    const cleanupInterval = this.performanceSettings.throttled ? 5000 : 1000;
    if (currentTime - this.lastCleanupTime > cleanupInterval) {
      this.cleanupOldData(currentTime);
      this.lastCleanupTime = currentTime;
    }

    // Measure update overhead
    const updateEnd = performance.now();
    const updateOverhead = updateEnd - updateStart;

    if (window.performanceMonitor) {
      window.performanceMonitor.measureDiagnosticOverhead(
        () => updateOverhead,
        "debug-display-update"
      );
    }

    // Adaptive throttling based on overhead
    if (
      this.performanceSettings.adaptiveThrottling &&
      updateOverhead > this.performanceSettings.maxRenderOverhead
    ) {
      this.enableThrottling();
    }
  }

  /**
   * Collect frame performance data
   * @param {number} deltaTime - Frame delta time
   * @param {number} timestamp - Current timestamp
   */
  collectFrameData(deltaTime, timestamp) {
    const frameInfo = {
      timestamp,
      deltaTime,
      fps: this.gameEngine.fps || 0,
      gameMode: this.gameEngine.gameState?.mode || "unknown",
      isRunning: this.gameEngine.gameState?.isRunning || false,
      isPaused: this.gameState?.isPaused || false,
    };

    this.frameData.push(frameInfo);

    // Keep only recent frame data
    if (this.frameData.length > this.maxFrameData) {
      this.frameData.shift();
    }
  }

  /**
   * Collect physics engine data
   */
  collectPhysicsData() {
    const player = this.gameEngine.player;
    if (!player) return;

    const currentTime = performance.now();

    // Monitor ground state changes
    const currentGroundState = player.isOnGround;
    const lastGroundState = this.physicsData.lastGroundState;

    if (
      lastGroundState !== undefined &&
      lastGroundState !== currentGroundState
    ) {
      this.physicsData.lastGroundStateChange = currentTime;
      this.physicsData.groundStateHistory.push({
        timestamp: currentTime,
        from: lastGroundState,
        to: currentGroundState,
        position: { ...player.position },
        velocity: { ...player.velocity },
      });

      // Keep only recent history
      if (this.physicsData.groundStateHistory.length > 20) {
        this.physicsData.groundStateHistory.shift();
      }
    }

    this.physicsData.lastGroundState = currentGroundState;

    // Collect enhanced ground check data if available
    if (typeof player.enhancedGroundCheck === "function") {
      this.physicsData.enhancedGroundCheck = player.enhancedGroundCheck();
    }

    // Collect jump validation data if available
    if (typeof player.canJumpEnhanced === "function") {
      this.physicsData.jumpValidation = player.canJumpEnhanced();
    }
  }

  /**
   * Collect input system data
   */
  collectInputData() {
    const inputManager = this.gameEngine.inputManager;
    if (!inputManager) return;

    // Get current input debug info
    const inputDebugInfo = inputManager.getDebugInfo();

    // Store current input state
    this.inputData.currentState = {
      pressedKeys: [...inputDebugInfo.pressedKeys],
      activeActions: [...inputDebugInfo.activeActions],
      focusState: { ...inputDebugInfo.focusState },
      playerInput: inputManager.getPlayerInput(),
    };

    // Monitor jump action specifically
    if (this.inputData.currentState.activeActions.includes("jump")) {
      const currentTime = performance.now();
      this.inputData.actionTriggers.push({
        timestamp: currentTime,
        action: "jump",
        keys: [...this.inputData.currentState.pressedKeys],
      });

      // Keep only recent triggers
      if (this.inputData.actionTriggers.length > 10) {
        this.inputData.actionTriggers.shift();
      }
    }
  }

  /**
   * Clean up old data to prevent memory leaks
   * @param {number} currentTime - Current timestamp
   */
  cleanupOldData(currentTime) {
    const maxAge = 10000; // 10 seconds

    // Clean up physics data
    this.physicsData.groundStateHistory =
      this.physicsData.groundStateHistory.filter(
        (entry) => currentTime - entry.timestamp < maxAge
      );

    this.physicsData.jumpAttempts = this.physicsData.jumpAttempts.filter(
      (entry) => currentTime - entry.timestamp < maxAge
    );

    this.physicsData.collisionEvents = this.physicsData.collisionEvents.filter(
      (entry) => currentTime - entry.timestamp < maxAge
    );

    // Clean up input data
    this.inputData.keyEvents = this.inputData.keyEvents.filter(
      (entry) => currentTime - entry.timestamp < maxAge
    );

    this.inputData.actionTriggers = this.inputData.actionTriggers.filter(
      (entry) => currentTime - entry.timestamp < maxAge
    );

    this.inputData.focusEvents = this.inputData.focusEvents.filter(
      (entry) => currentTime - entry.timestamp < maxAge
    );
  }

  /**
   * Record jump attempt for debugging
   * @param {Object} jumpData - Jump attempt data
   */
  recordJumpAttempt(jumpData) {
    this.physicsData.jumpAttempts.push({
      timestamp: performance.now(),
      ...jumpData,
    });

    // Keep only recent attempts
    if (this.physicsData.jumpAttempts.length > 20) {
      this.physicsData.jumpAttempts.shift();
    }
  }

  /**
   * Record collision event for debugging
   * @param {Object} collisionData - Collision event data
   */
  recordCollisionEvent(collisionData) {
    this.physicsData.collisionEvents.push({
      timestamp: performance.now(),
      ...collisionData,
    });

    // Keep only recent events
    if (this.physicsData.collisionEvents.length > 50) {
      this.physicsData.collisionEvents.shift();
    }
  }

  /**
   * Render debug display
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (!this.isVisible) return;

    switch (this.displayMode) {
      case "full":
        this.renderFullDisplay(ctx);
        break;
      case "minimal":
        this.renderMinimalDisplay(ctx);
        break;
      case "physics":
        this.renderPhysicsDisplay(ctx);
        break;
      case "input":
        this.renderInputDisplay(ctx);
        break;
    }
  }

  /**
   * Render full debug display
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderFullDisplay(ctx) {
    const canvas = ctx.canvas;
    let y = this.config.padding;

    // Draw background
    this.drawBackground(ctx, 0, 0, canvas.width, canvas.height);

    // Header
    y = this.drawHeader(
      ctx,
      "ENHANCED DEBUG DISPLAY (F1: Toggle, F2: Mode)",
      y
    );
    y += this.config.lineHeight;

    // Performance section
    y = this.drawPerformanceSection(ctx, y);
    y += this.config.lineHeight;

    // Player state section
    y = this.drawPlayerStateSection(ctx, y);
    y += this.config.lineHeight;

    // Physics section
    y = this.drawPhysicsSection(ctx, y);
    y += this.config.lineHeight;

    // Input section
    y = this.drawInputSection(ctx, y);
  }

  /**
   * Render minimal debug display
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderMinimalDisplay(ctx) {
    const canvas = ctx.canvas;
    let y = canvas.height - 100;

    // Draw semi-transparent background
    this.drawBackground(ctx, canvas.width - 250, y - 10, 240, 90);

    // Essential info only
    ctx.fillStyle = this.config.textColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.textAlign = "left";

    const player = this.gameEngine.player;
    if (player) {
      ctx.fillText(`FPS: ${this.gameEngine.fps}`, canvas.width - 240, y);
      ctx.fillText(`Ground: ${player.isOnGround}`, canvas.width - 240, y + 15);
      ctx.fillText(`State: ${player.state}`, canvas.width - 240, y + 30);
      ctx.fillText(
        `Pos: ${Math.round(player.position.x)}, ${Math.round(
          player.position.y
        )}`,
        canvas.width - 240,
        y + 45
      );
      ctx.fillText(
        `Vel: ${Math.round(player.velocity.x)}, ${Math.round(
          player.velocity.y
        )}`,
        canvas.width - 240,
        y + 60
      );
    }
  }

  /**
   * Render physics-focused debug display
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderPhysicsDisplay(ctx) {
    const canvas = ctx.canvas;
    let y = this.config.padding;

    // Draw background
    this.drawBackground(ctx, 0, 0, canvas.width * 0.6, canvas.height);

    // Header
    y = this.drawHeader(ctx, "PHYSICS DEBUG (F2: Mode)", y);
    y += this.config.lineHeight;

    // Detailed physics section
    y = this.drawDetailedPhysicsSection(ctx, y);
  }

  /**
   * Render input-focused debug display
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderInputDisplay(ctx) {
    const canvas = ctx.canvas;
    let y = this.config.padding;

    // Draw background
    this.drawBackground(ctx, 0, 0, canvas.width * 0.6, canvas.height);

    // Header
    y = this.drawHeader(ctx, "INPUT DEBUG (F2: Mode)", y);
    y += this.config.lineHeight;

    // Detailed input section
    y = this.drawDetailedInputSection(ctx, y);
  }

  /**
   * Draw background for debug display
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   */
  drawBackground(ctx, x, y, width, height) {
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw header text
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {string} text - Header text
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawHeader(ctx, text, y) {
    ctx.fillStyle = this.config.headerColor;
    ctx.font = `bold ${this.config.fontSize + 2}px ${this.config.fontFamily}`;
    ctx.textAlign = "left";
    ctx.fillText(text, this.config.padding, y + this.config.lineHeight);
    return y + this.config.lineHeight;
  }

  /**
   * Draw performance section
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawPerformanceSection(ctx, y) {
    ctx.fillStyle = this.config.headerColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.fillText("PERFORMANCE:", this.config.padding, y);
    y += this.config.lineHeight;

    ctx.fillStyle = this.config.textColor;
    const avgFps = this.calculateAverageFPS();
    const minFps = this.calculateMinFPS();
    const maxDelta = this.calculateMaxDelta();

    ctx.fillText(
      `FPS: ${this.gameEngine.fps} (avg: ${avgFps.toFixed(
        1
      )}, min: ${minFps.toFixed(1)})`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Delta: ${this.gameEngine.deltaTime?.toFixed(
        2
      )}ms (max: ${maxDelta.toFixed(2)}ms)`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Mode: ${this.gameEngine.gameState?.mode} | Running: ${this.gameEngine.gameState?.isRunning}`,
      this.config.padding + 20,
      y
    );

    return y + this.config.lineHeight;
  }

  /**
   * Draw player state section
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawPlayerStateSection(ctx, y) {
    const player = this.gameEngine.player;
    if (!player) return y;

    ctx.fillStyle = this.config.headerColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.fillText("PLAYER STATE:", this.config.padding, y);
    y += this.config.lineHeight;

    ctx.fillStyle = this.config.textColor;
    ctx.fillText(
      `Position: (${Math.round(player.position.x)}, ${Math.round(
        player.position.y
      )})`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Velocity: (${Math.round(player.velocity.x)}, ${Math.round(
        player.velocity.y
      )})`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `State: ${player.state} | Facing: ${player.facing}`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;

    // Ground state with color coding
    const groundColor = player.isOnGround
      ? this.config.textColor
      : this.config.warningColor;
    ctx.fillStyle = groundColor;
    ctx.fillText(
      `On Ground: ${player.isOnGround}`,
      this.config.padding + 20,
      y
    );

    // Last ground contact time
    if (player.lastGroundContact) {
      const timeSinceGround = performance.now() - player.lastGroundContact;
      ctx.fillStyle = this.config.textColor;
      ctx.fillText(
        `Last Ground Contact: ${timeSinceGround.toFixed(0)}ms ago`,
        this.config.padding + 200,
        y
      );
    }

    return y + this.config.lineHeight;
  }

  /**
   * Draw physics section
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawPhysicsSection(ctx, y) {
    ctx.fillStyle = this.config.headerColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.fillText("PHYSICS ENGINE:", this.config.padding, y);
    y += this.config.lineHeight;

    ctx.fillStyle = this.config.textColor;

    // Enhanced ground check data
    if (this.physicsData.enhancedGroundCheck) {
      const groundCheck = this.physicsData.enhancedGroundCheck;
      ctx.fillText(
        `Enhanced Ground Check: ${groundCheck.isOnGround} (confidence: ${(
          groundCheck.confidence * 100
        ).toFixed(0)}%)`,
        this.config.padding + 20,
        y
      );
      y += this.config.lineHeight;

      if (groundCheck.details) {
        ctx.fillText(
          `  Physics: ${groundCheck.details.physicsGroundCheck} | Position: ${groundCheck.details.positionGroundCheck} | Velocity: ${groundCheck.details.velocityGroundCheck}`,
          this.config.padding + 20,
          y
        );
        y += this.config.lineHeight;
      }
    }

    // Jump validation data
    if (this.physicsData.jumpValidation) {
      const jumpVal = this.physicsData.jumpValidation;
      const jumpColor = jumpVal.canJump
        ? this.config.textColor
        : this.config.warningColor;
      ctx.fillStyle = jumpColor;
      ctx.fillText(
        `Can Jump: ${jumpVal.canJump} - ${jumpVal.reason}`,
        this.config.padding + 20,
        y
      );
      y += this.config.lineHeight;

      if (jumpVal.blockingFactors && jumpVal.blockingFactors.length > 0) {
        ctx.fillStyle = this.config.errorColor;
        ctx.fillText(
          `Blocking: ${jumpVal.blockingFactors.join(", ")}`,
          this.config.padding + 20,
          y
        );
        y += this.config.lineHeight;
      }
    }

    // Recent ground state changes
    ctx.fillStyle = this.config.textColor;
    const recentGroundChanges = this.physicsData.groundStateHistory.slice(-3);
    if (recentGroundChanges.length > 0) {
      ctx.fillText("Recent Ground State Changes:", this.config.padding + 20, y);
      y += this.config.lineHeight;

      recentGroundChanges.forEach((change) => {
        const timeAgo = performance.now() - change.timestamp;
        ctx.fillText(
          `  ${timeAgo.toFixed(0)}ms ago: ${change.from} → ${change.to}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
      });
    }

    return y;
  }

  /**
   * Draw input section
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawInputSection(ctx, y) {
    ctx.fillStyle = this.config.headerColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    ctx.fillText("INPUT SYSTEM:", this.config.padding, y);
    y += this.config.lineHeight;

    ctx.fillStyle = this.config.textColor;

    if (this.inputData.currentState) {
      const inputState = this.inputData.currentState;

      // Current keys and actions
      if (inputState.pressedKeys.length > 0) {
        ctx.fillText(
          `Keys: ${inputState.pressedKeys.join(", ")}`,
          this.config.padding + 20,
          y
        );
        y += this.config.lineHeight;
      }

      if (inputState.activeActions.length > 0) {
        ctx.fillText(
          `Actions: ${inputState.activeActions.join(", ")}`,
          this.config.padding + 20,
          y
        );
        y += this.config.lineHeight;
      }

      // Focus state
      const focusState = inputState.focusState;
      const focusColor = focusState.hasFocus
        ? this.config.textColor
        : this.config.warningColor;
      ctx.fillStyle = focusColor;
      ctx.fillText(
        `Focus: ${focusState.hasFocus} | Active Element: ${focusState.activeElement}`,
        this.config.padding + 20,
        y
      );
      y += this.config.lineHeight;

      // Player input state
      ctx.fillStyle = this.config.textColor;
      const playerInput = inputState.playerInput;
      if (playerInput) {
        const inputFlags = [];
        if (playerInput.moveLeft) inputFlags.push("LEFT");
        if (playerInput.moveRight) inputFlags.push("RIGHT");
        if (playerInput.jump) inputFlags.push("JUMP");
        if (playerInput.jumpHeld) inputFlags.push("JUMP_HELD");
        if (playerInput.dash) inputFlags.push("DASH");
        if (playerInput.block) inputFlags.push("BLOCK");

        if (inputFlags.length > 0) {
          ctx.fillText(
            `Player Input: ${inputFlags.join(", ")}`,
            this.config.padding + 20,
            y
          );
          y += this.config.lineHeight;
        }
      }
    }

    // Recent jump attempts
    const recentJumps = this.inputData.actionTriggers
      .filter((trigger) => trigger.action === "jump")
      .slice(-3);
    if (recentJumps.length > 0) {
      ctx.fillText("Recent Jump Triggers:", this.config.padding + 20, y);
      y += this.config.lineHeight;

      recentJumps.forEach((jump) => {
        const timeAgo = performance.now() - jump.timestamp;
        ctx.fillText(
          `  ${timeAgo.toFixed(0)}ms ago: ${jump.keys.join(", ")}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
      });
    }

    return y;
  }

  /**
   * Draw detailed physics section
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawDetailedPhysicsSection(ctx, y) {
    const player = this.gameEngine.player;
    if (!player) return y;

    ctx.fillStyle = this.config.textColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;

    // Physics constants
    const physicsEngine = this.gameEngine.physicsEngine;
    if (physicsEngine) {
      const constants = physicsEngine.getConstants();
      ctx.fillText(
        `Gravity: ${constants.gravity} | Terminal Velocity: ${constants.terminalVelocity}`,
        this.config.padding + 20,
        y
      );
      y += this.config.lineHeight;
      ctx.fillText(
        `Friction: ${constants.friction} | Air Resistance: ${constants.airResistance}`,
        this.config.padding + 20,
        y
      );
      y += this.config.lineHeight * 2;
    }

    // Detailed player physics
    ctx.fillText(
      `Position: (${player.position.x.toFixed(2)}, ${player.position.y.toFixed(
        2
      )})`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Velocity: (${player.velocity.x.toFixed(2)}, ${player.velocity.y.toFixed(
        2
      )})`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Size: ${player.size.width} x ${player.size.height}`,
      this.config.padding + 20,
      y
    );
    y += this.config.lineHeight * 2;

    // Ground detection details
    if (this.physicsData.enhancedGroundCheck) {
      const groundCheck = this.physicsData.enhancedGroundCheck;
      ctx.fillText("GROUND DETECTION DETAILS:", this.config.padding + 20, y);
      y += this.config.lineHeight;

      ctx.fillText(
        `Overall Result: ${groundCheck.isOnGround} (${(
          groundCheck.confidence * 100
        ).toFixed(1)}% confidence)`,
        this.config.padding + 40,
        y
      );
      y += this.config.lineHeight;

      if (groundCheck.details) {
        ctx.fillText(
          `Physics Check: ${groundCheck.details.physicsGroundCheck}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
        ctx.fillText(
          `Position Check: ${groundCheck.details.positionGroundCheck}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
        ctx.fillText(
          `Velocity Check: ${groundCheck.details.velocityGroundCheck}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
      }

      if (groundCheck.diagnostics) {
        ctx.fillText(
          `Last Ground Contact: ${groundCheck.diagnostics.timeSinceLastContact.toFixed(
            0
          )}ms ago`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
        ctx.fillText(
          `History Length: ${groundCheck.diagnostics.historyLength} entries`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight * 2;
      }
    }

    // Jump validation details
    if (this.physicsData.jumpValidation) {
      const jumpVal = this.physicsData.jumpValidation;
      ctx.fillText("JUMP VALIDATION DETAILS:", this.config.padding + 20, y);
      y += this.config.lineHeight;

      const jumpColor = jumpVal.canJump
        ? this.config.textColor
        : this.config.errorColor;
      ctx.fillStyle = jumpColor;
      ctx.fillText(`Can Jump: ${jumpVal.canJump}`, this.config.padding + 40, y);
      y += this.config.lineHeight;

      ctx.fillStyle = this.config.textColor;
      ctx.fillText(`Reason: ${jumpVal.reason}`, this.config.padding + 40, y);
      y += this.config.lineHeight;

      if (jumpVal.blockingFactors && jumpVal.blockingFactors.length > 0) {
        ctx.fillStyle = this.config.errorColor;
        ctx.fillText(
          `Blocking Factors: ${jumpVal.blockingFactors.join(", ")}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
      }

      if (jumpVal.enhancedChecks) {
        ctx.fillStyle = this.config.textColor;
        const checks = jumpVal.enhancedChecks;
        ctx.fillText(`Enhanced Checks:`, this.config.padding + 40, y);
        y += this.config.lineHeight;
        ctx.fillText(
          `  Is On Ground: ${checks.isOnGround}`,
          this.config.padding + 60,
          y
        );
        y += this.config.lineHeight;
        ctx.fillText(
          `  Enhanced Ground Check: ${checks.enhancedGroundCheck}`,
          this.config.padding + 60,
          y
        );
        y += this.config.lineHeight;
        ctx.fillText(
          `  Recently On Ground: ${
            checks.recentlyOnGround
          } (${checks.timeSinceGroundContact.toFixed(0)}ms ago)`,
          this.config.padding + 60,
          y
        );
        y += this.config.lineHeight;
        ctx.fillText(
          `  Ground Confidence: ${(checks.groundConfidence * 100).toFixed(1)}%`,
          this.config.padding + 60,
          y
        );
        y += this.config.lineHeight;
      }
    }

    return y;
  }

  /**
   * Draw detailed input section
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} y - Y position
   * @returns {number} New Y position
   */
  drawDetailedInputSection(ctx, y) {
    const inputManager = this.gameEngine.inputManager;
    if (!inputManager) return y;

    ctx.fillStyle = this.config.textColor;
    ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;

    // Input manager debug info
    const debugInfo = inputManager.getDebugInfo();

    ctx.fillText("INPUT MANAGER STATUS:", this.config.padding + 20, y);
    y += this.config.lineHeight;

    ctx.fillText(
      `Total Keys Tracked: ${debugInfo.totalKeysTracked}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Event Sequence ID: ${debugInfo.eventSequenceId}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Event History Size: ${debugInfo.eventHistorySize}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Duplicate Event Threshold: ${debugInfo.duplicateEventThreshold}ms`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight * 2;

    // Focus state details
    const focusState = debugInfo.focusState;
    ctx.fillText("FOCUS STATE:", this.config.padding + 20, y);
    y += this.config.lineHeight;

    const focusColor = focusState.hasFocus
      ? this.config.textColor
      : this.config.errorColor;
    ctx.fillStyle = focusColor;
    ctx.fillText(
      `Has Focus: ${focusState.hasFocus}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;

    ctx.fillStyle = this.config.textColor;
    ctx.fillText(
      `Active Element: ${focusState.activeElement}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Document Hidden: ${focusState.documentHidden}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Window Has Focus: ${focusState.windowHasFocus}`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight;
    ctx.fillText(
      `Focus Manager: ${
        debugInfo.focusManager ? "Available" : "Not Available"
      }`,
      this.config.padding + 40,
      y
    );
    y += this.config.lineHeight * 2;

    // Key bindings
    ctx.fillText("KEY BINDINGS:", this.config.padding + 20, y);
    y += this.config.lineHeight;

    const keyBindings = debugInfo.keyBindings;
    for (const [action, keys] of Object.entries(keyBindings)) {
      ctx.fillText(
        `${action}: ${keys.join(", ")}`,
        this.config.padding + 40,
        y
      );
      y += this.config.lineHeight;
    }
    y += this.config.lineHeight;

    // Recent events
    if (debugInfo.recentEvents && debugInfo.recentEvents.length > 0) {
      ctx.fillText("RECENT EVENTS:", this.config.padding + 20, y);
      y += this.config.lineHeight;

      debugInfo.recentEvents.forEach((event) => {
        const timeAgo = performance.now() - event.timestamp;
        ctx.fillText(
          `${timeAgo.toFixed(0)}ms ago: ${event.type} ${event.keyCode}`,
          this.config.padding + 40,
          y
        );
        y += this.config.lineHeight;
      });
    }

    return y;
  }

  /**
   * Calculate average FPS from recent frame data
   * @returns {number} Average FPS
   */
  calculateAverageFPS() {
    if (this.frameData.length === 0) return 0;

    const totalFps = this.frameData.reduce((sum, frame) => sum + frame.fps, 0);
    return totalFps / this.frameData.length;
  }

  /**
   * Calculate minimum FPS from recent frame data
   * @returns {number} Minimum FPS
   */
  calculateMinFPS() {
    if (this.frameData.length === 0) return 0;

    return Math.min(...this.frameData.map((frame) => frame.fps));
  }

  /**
   * Calculate maximum delta time from recent frame data
   * @returns {number} Maximum delta time
   */
  calculateMaxDelta() {
    if (this.frameData.length === 0) return 0;

    return Math.max(...this.frameData.map((frame) => frame.deltaTime));
  }

  /**
   * Check if diagnostics should be enabled based on performance monitor
   */
  shouldEnableDiagnostics() {
    if (window.performanceMonitor) {
      return window.performanceMonitor.shouldEnableDiagnostics("debug-display");
    }
    return true; // Default to enabled if no performance monitor
  }

  /**
   * Enable throttling mode for performance optimization
   */
  enableThrottling() {
    if (!this.performanceSettings.throttled) {
      this.performanceSettings.throttled = true;
      this.config.refreshRate = this.performanceSettings.minUpdateFrequency;
      this.updateInterval = 1000 / this.config.refreshRate;
      this.maxFrameData = 30; // Reduce memory usage

      console.log(
        "[DEBUG_DISPLAY] Throttling enabled due to performance concerns"
      );
    }
  }

  /**
   * Disable throttling mode
   */
  disableThrottling() {
    if (this.performanceSettings.throttled) {
      this.performanceSettings.throttled = false;
      this.config.refreshRate = this.performanceSettings.maxUpdateFrequency;
      this.updateInterval = 1000 / this.config.refreshRate;
      this.maxFrameData = 60;

      console.log("[DEBUG_DISPLAY] Throttling disabled");
    }
  }

  /**
   * Reduce update frequency for performance
   */
  reduceUpdateFrequency() {
    this.config.refreshRate = Math.max(10, this.config.refreshRate * 0.5);
    this.updateInterval = 1000 / this.config.refreshRate;

    console.log(
      `[DEBUG_DISPLAY] Update frequency reduced to ${this.config.refreshRate} Hz`
    );
  }

  /**
   * Cleanup old data and optimize memory usage
   */
  cleanup() {
    // Remove old frame data
    const maxAge = 30000; // 30 seconds
    const now = performance.now();

    this.frameData = this.frameData.filter(
      (frame) => now - frame.timestamp < maxAge
    );

    // Limit array sizes for memory optimization
    if (this.frameData.length > this.maxFrameData) {
      this.frameData = this.frameData.slice(-this.maxFrameData);
    }

    // Clean up physics data
    this.physicsData.groundStateHistory =
      this.physicsData.groundStateHistory.slice(-10);
    this.physicsData.jumpAttempts = this.physicsData.jumpAttempts.slice(-10);
    this.physicsData.collisionEvents =
      this.physicsData.collisionEvents.slice(-20);

    // Clean up input data
    this.inputData.keyEvents = this.inputData.keyEvents.slice(-20);
    this.inputData.actionTriggers = this.inputData.actionTriggers.slice(-10);
    this.inputData.focusEvents = this.inputData.focusEvents.slice(-10);

    console.log(
      `[DEBUG_DISPLAY] Cleanup completed. Frame data: ${this.frameData.length} entries`
    );
  }

  /**
   * Get performance metrics for this debug system
   */
  getPerformanceMetrics() {
    return {
      isThrottled: this.performanceSettings.throttled,
      updateFrequency: this.config.refreshRate,
      frameDataSize: this.frameData.length,
      memoryUsage: this.estimateMemoryUsage(),
      isVisible: this.isVisible,
      displayMode: this.displayMode,
    };
  }

  /**
   * Estimate memory usage of debug data
   */
  estimateMemoryUsage() {
    // Rough estimates in bytes
    const frameDataSize = this.frameData.length * 200; // ~200 bytes per frame
    const physicsDataSize =
      this.physicsData.groundStateHistory.length * 300 +
      this.physicsData.jumpAttempts.length * 400 +
      this.physicsData.collisionEvents.length * 250;
    const inputDataSize =
      this.inputData.keyEvents.length * 150 +
      this.inputData.actionTriggers.length * 200 +
      this.inputData.focusEvents.length * 100;

    const totalSize = frameDataSize + physicsDataSize + inputDataSize;

    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: Math.round((totalSize / 1024 / 1024) * 100) / 100,
    };
  }

  /**
   * Get debug statistics
   * @returns {Object} Debug statistics
   */
  getDebugStats() {
    return {
      isVisible: this.isVisible,
      displayMode: this.displayMode,
      frameDataCount: this.frameData.length,
      physicsDataCount: {
        groundStateHistory: this.physicsData.groundStateHistory.length,
        jumpAttempts: this.physicsData.jumpAttempts.length,
        collisionEvents: this.physicsData.collisionEvents.length,
      },
      inputDataCount: {
        keyEvents: this.inputData.keyEvents.length,
        actionTriggers: this.inputData.actionTriggers.length,
        focusEvents: this.inputData.focusEvents.length,
      },
      performance: {
        averageFPS: this.calculateAverageFPS(),
        minFPS: this.calculateMinFPS(),
        maxDelta: this.calculateMaxDelta(),
      },
    };
  }

  /**
   * Reset all collected data
   */
  reset() {
    this.frameData = [];
    this.physicsData = {
      lastGroundStateChange: 0,
      groundStateHistory: [],
      jumpAttempts: [],
      collisionEvents: [],
    };
    this.inputData = {
      keyEvents: [],
      actionTriggers: [],
      focusEvents: [],
    };

    console.log("[DEBUG_DISPLAY] Debug data reset");
  }

  /**
   * Destroy the debug display system
   */
  destroy() {
    this.reset();
    this.gameEngine = null;
    console.log("[DEBUG_DISPLAY] Debug display system destroyed");
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = DebugDisplaySystem;
}
