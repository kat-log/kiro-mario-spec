/**
 * Mario Style Platformer - Main Entry Point
 * Game Engine Core Implementation
 */

// Import InputManager (in a real module system, this would be an import)
// For now, we'll assume it's loaded via script tag

// Game configuration
const GAME_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
  },
  targetFPS: 60,
  maxDeltaTime: 1000 / 30, // Cap at 30 FPS minimum to prevent large jumps
};

/**
 * Core Game Engine Class
 * Manages game loop, state, and rendering
 */
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Game loop timing
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;

    // Game state management
    this.gameState = {
      mode: "menu", // 'menu', 'playing', 'paused', 'gameover', 'victory'
      isRunning: false,
      isPaused: false,
      currentStage: 1,
      timeRemaining: 300, // 5 minutes default
    };

    // Scene management
    this.sceneManager = null;

    // Initialize input manager
    this.inputManager = new InputManager();

    // Initialize physics engine
    this.physicsEngine = new PhysicsEngine();

    // Initialize stage system
    this.currentStage = null;

    // Initialize player (will be created in init)
    this.player = null;

    // Initialize camera system
    this.camera = null;

    // Initialize item manager
    this.itemManager = null;

    // Initialize audio manager
    this.audioManager = null;

    // Initialize UI system
    this.uiSystem = null;

    // Initialize save system
    this.saveSystem = null;

    // Initialize start screen
    this.startScreen = null;

    // Stage clear animation data
    this.stageClearData = null;

    // Testing and debugging flags
    this.showPerformanceOverlay = false;

    console.log("GameEngine initialized");
  }

  /**
   * Initialize the game engine
   */
  async init() {
    if (!this.ctx) {
      console.error("Failed to get 2D context from canvas");
      return false;
    }

    // Set canvas size
    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;

    // Ensure canvas can receive focus
    this.canvas.setAttribute("tabindex", "0");
    this.canvas.focus();

    // Initialize with menu scene
    this.gameState.mode = "menu";
    this.gameState.isRunning = false;

    // Initialize stage
    this.initStage();

    // Initialize player
    this.initPlayer();

    // Initialize camera system
    this.initCamera();

    // Initialize item manager
    this.initItemManager();

    // Initialize audio manager
    await this.initAudioManager();

    // Initialize UI system
    this.initUISystem();

    // Initialize save system
    this.initSaveSystem();

    // Initialize scene manager
    this.initSceneManager();

    // Initialize test physics entities for demonstration
    this.initTestEntities();

    // Initialize testing and optimization systems
    this.initTestingSystems();

    // Initialize browser compatibility and bug detection systems
    await this.initCompatibilityAndBugSystems();

    // Start continuous monitoring
    if (this.bugDetector) {
      this.bugDetector.startContinuousMonitoring();
    }

    // Make test runner globally available
    window.TestRunner = new TestRunner(this);

    console.log("GameEngine initialized successfully");
    console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
    console.log(
      "🧪 Testing systems ready! Type 'TestRunner.showHelp()' in console for commands."
    );

    return true;
  }

  /**
   * Start the game engine
   */
  start() {
    if (this.gameState.isRunning) {
      console.warn("Game engine is already running");
      return;
    }

    this.gameState.isRunning = true;
    this.lastFrameTime = performance.now();
    this.fpsUpdateTime = this.lastFrameTime;

    // Start the game loop
    this.gameLoop();

    console.log("Game engine started");
  }

  /**
   * Start the game (transition from menu to playing)
   */
  startGame() {
    if (this.sceneManager) {
      this.sceneManager.changeScene("game", { newGame: true });
    } else {
      // Fallback to old method
      if (this.startScreen) {
        this.startScreen.hide();
      }
      this.changeGameMode("playing");
    }

    if (!this.gameState.isRunning) {
      this.start();
    }
  }

  /**
   * Stop the game and return to menu
   */
  stopGame() {
    if (this.sceneManager) {
      this.sceneManager.changeScene("menu");
    } else {
      // Fallback to old method
      if (this.startScreen) {
        this.startScreen.show();
      }
      this.changeGameMode("menu");
    }

    // Reset UI system
    if (this.uiSystem) {
      this.uiSystem.reset();
    }

    // Keep the engine running to show the menu
  }

  /**
   * Stop the game engine
   */
  stop() {
    this.gameState.isRunning = false;

    // Stop continuous monitoring
    if (this.bugDetector) {
      this.bugDetector.stopContinuousMonitoring();
    }

    console.log("Game engine stopped");
  }

  /**
   * Pause/unpause the game
   */
  togglePause() {
    if (this.gameState.mode === "playing") {
      this.gameState.isPaused = !this.gameState.isPaused;
      console.log(`Game ${this.gameState.isPaused ? "paused" : "unpaused"}`);
    }
  }

  /**
   * Change game state mode
   */
  changeGameMode(newMode) {
    const validModes = ["menu", "playing", "paused", "gameover", "victory"];
    if (!validModes.includes(newMode)) {
      console.error(`Invalid game mode: ${newMode}`);
      return;
    }

    const oldMode = this.gameState.mode;
    this.gameState.mode = newMode;

    // Handle state-specific logic and sound effects
    if (newMode === "playing") {
      this.gameState.isPaused = false;
    } else if (newMode === "paused") {
      this.gameState.isPaused = true;
    } else if (newMode === "victory") {
      // Play victory sound
      if (this.audioManager) {
        this.audioManager.playSound("victory");
      }
    } else if (newMode === "gameover") {
      // Play defeat sound
      if (this.audioManager) {
        this.audioManager.playSound("defeat");
      }
    }

    console.log(`Game mode changed from ${oldMode} to ${newMode}`);
  }

  /**
   * Main game loop
   */
  gameLoop() {
    if (!this.gameState.isRunning) {
      return;
    }

    const currentTime = performance.now();

    // Calculate delta time
    this.deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Cap delta time to prevent large jumps
    if (this.deltaTime > GAME_CONFIG.maxDeltaTime) {
      this.deltaTime = GAME_CONFIG.maxDeltaTime;
    }

    // Update FPS counter
    this.updateFPS(currentTime);

    // Update and render only if not paused
    if (!this.gameState.isPaused) {
      this.update(this.deltaTime);
    }

    this.render();

    // Continue the loop
    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Update FPS counter
   */
  updateFPS(currentTime) {
    this.frameCount++;

    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * Update game logic
   */
  update(deltaTime) {
    // Update performance monitoring
    if (this.performanceOptimizer) {
      this.performanceOptimizer.update(deltaTime);
    }

    // Update input manager first
    this.inputManager.update();

    // Handle global input actions
    this.handleGlobalInput();

    // Update based on current game mode
    switch (this.gameState.mode) {
      case "menu":
        this.updateMenu(deltaTime);
        break;
      case "playing":
        this.updateGameplay(deltaTime);
        break;
      case "gameover":
      case "victory":
        this.updateEndScreen(deltaTime);
        break;
    }
  }

  /**
   * Handle global input actions that work across all game modes
   */
  handleGlobalInput() {
    const input = this.inputManager.getPlayerInput();

    // Handle debug and testing shortcuts (available in all modes)
    this.handleDebugInput();

    // Handle mode-specific input
    switch (this.gameState.mode) {
      case "menu":
        // Input is now handled by the StartScreen class
        // Keep this as fallback for keyboard-only navigation
        if (input.jump || input.enter) {
          console.log("Menu: Jump or Enter pressed"); // デバッグログ追加
          if (!this.startScreen?.isScreenActive()) {
            console.log("Starting game from menu"); // デバッグログ追加
            this.startGame();
          }
        }
        break;

      case "playing":
        if (input.pause) {
          this.togglePause();
        }
        if (input.escape) {
          this.stopGame();
        }
        break;

      case "paused":
        if (input.pause) {
          this.togglePause();
        }
        if (input.escape) {
          this.stopGame();
        }
        break;

      case "gameover":
      case "victory":
        if (input.jump || input.enter) {
          console.log("End screen: Jump or Enter pressed, returning to menu"); // デバッグログ追加
          this.stopGame(); // Return to menu
        }
        if (input.escape) {
          this.stopGame();
        }
        break;
    }
  }

  /**
   * Handle debug and testing input shortcuts
   */
  handleDebugInput() {
    const inputManager = this.inputManager;

    // Check for key presses (not held)
    if (inputManager.isKeyPressed("F1")) {
      // Toggle performance overlay
      this.showPerformanceOverlay = !this.showPerformanceOverlay;
      console.log(
        `Performance overlay: ${this.showPerformanceOverlay ? "ON" : "OFF"}`
      );
    }

    if (inputManager.isKeyPressed("F2")) {
      // Run integration tests
      this.runIntegrationTests().then((results) => {
        console.log("Integration tests completed:", results);
      });
    }

    if (inputManager.isKeyPressed("F3")) {
      // Run system validation
      this.runSystemValidation().then((report) => {
        console.log("System validation completed:", report);
      });
    }

    if (inputManager.isKeyPressed("F4")) {
      // Quick health check
      const health = this.quickHealthCheck();
      console.log("System health check:", health);
    }

    if (inputManager.isKeyPressed("F5")) {
      // Generate performance report
      const report = this.generatePerformanceReport();
      console.log("Performance report:", report);
    }

    if (inputManager.isKeyPressed("F6")) {
      // Reset performance metrics
      if (this.performanceOptimizer) {
        this.performanceOptimizer.reset();
        console.log("Performance metrics reset");
      }
    }

    if (inputManager.isKeyPressed("F7")) {
      // Run browser compatibility check
      this.runBrowserCompatibilityCheck().then((report) => {
        console.log("Browser compatibility check completed:", report);
      });
    }

    if (inputManager.isKeyPressed("F8")) {
      // Run bug detection
      this.runBugDetection().then((report) => {
        console.log("Bug detection completed:", report);
      });
    }

    if (inputManager.isKeyPressed("F9")) {
      // Get comprehensive system status
      this.getSystemStatus().then((status) => {
        console.log("System status:", status);
      });
    }
  }

  /**
   * Update menu state
   */
  updateMenu(deltaTime) {
    // Update scene manager (which handles start screen)
    if (this.sceneManager) {
      this.sceneManager.update(deltaTime);
    } else if (this.startScreen) {
      // Fallback to direct start screen update
      this.startScreen.update(deltaTime);
    }
  }

  /**
   * Update gameplay state
   */
  updateGameplay(deltaTime) {
    // Game time countdown
    if (this.gameState.timeRemaining > 0) {
      this.gameState.timeRemaining -= deltaTime / 1000;
      if (this.gameState.timeRemaining <= 0) {
        this.gameState.timeRemaining = 0;
        this.changeGameMode("gameover");
      }
    }

    // Update current stage
    if (this.currentStage) {
      this.currentStage.update(deltaTime);
    }

    // Get player input for gameplay
    const input = this.inputManager.getPlayerInput();

    // Update player
    if (this.player) {
      this.player.update(deltaTime, input);
    }

    // Update camera to follow player
    if (this.camera) {
      this.camera.update(deltaTime);
    }

    // Update item manager
    if (this.itemManager) {
      this.itemManager.update(deltaTime);

      // Check item collisions with player
      if (this.player) {
        const collectedItems = this.itemManager.checkCollisions(this.player);
        for (const collectionResult of collectedItems) {
          this.player.collectItem(collectionResult);
        }
      }
    }

    // Check goal collision
    if (this.currentStage && this.player) {
      const goalResult = this.currentStage.checkGoalCollision(this.player);
      if (goalResult) {
        this.handleGoalReached(goalResult);
      }
    }

    // Update UI system
    if (this.uiSystem) {
      this.uiSystem.update(deltaTime);
    }

    // Update physics for all entities
    this.updatePhysics(deltaTime);
  }

  /**
   * Update physics for all entities
   */
  updatePhysics(deltaTime) {
    // Update player physics
    if (this.player && this.currentStage) {
      // Reset ground state
      this.player.isOnGround = false;

      // Apply gravity to the player
      this.physicsEngine.applyGravity(this.player, deltaTime);

      // Apply friction/air resistance
      this.physicsEngine.applyFriction(
        this.player,
        deltaTime,
        this.player.isOnGround
      );

      // Update position based on velocity
      this.physicsEngine.updatePosition(this.player, deltaTime);

      // Check collisions with stage platforms
      const collisions = this.currentStage.checkPlatformCollisions(
        this.player,
        this.physicsEngine
      );

      // Process collision results
      for (const collision of collisions) {
        if (
          collision.resolution.resolved &&
          collision.resolution.direction === "bottom"
        ) {
          this.player.isOnGround = true;
        }
      }

      // Keep player within stage bounds
      const stageBounds = this.currentStage.getBounds();
      if (this.player.position.x < stageBounds.left) {
        this.player.position.x = stageBounds.left;
        this.player.velocity.x = 0;
      } else if (
        this.player.position.x + this.player.size.width >
        stageBounds.right
      ) {
        this.player.position.x = stageBounds.right - this.player.size.width;
        this.player.velocity.x = 0;
      }

      // Prevent player from falling through the bottom
      if (this.player.position.y > stageBounds.bottom) {
        this.player.position.y = stageBounds.bottom - this.player.size.height;
        this.player.velocity.y = 0;
        this.player.isOnGround = true;
      }
    }

    // Update test ball physics (keep for demonstration)
    if (this.testBall && this.currentStage) {
      // Reset ground state
      this.testBall.isOnGround = false;

      // Apply gravity to the test ball
      this.physicsEngine.applyGravity(this.testBall, deltaTime);

      // Apply friction/air resistance
      this.physicsEngine.applyFriction(
        this.testBall,
        deltaTime,
        this.testBall.isOnGround
      );

      // Update position based on velocity
      this.physicsEngine.updatePosition(this.testBall, deltaTime);

      // Check collisions with stage platforms
      const ballCollisions = this.currentStage.checkPlatformCollisions(
        this.testBall,
        this.physicsEngine
      );

      // Process collision results
      for (const collision of ballCollisions) {
        if (
          collision.resolution.resolved &&
          collision.resolution.direction === "bottom"
        ) {
          this.testBall.isOnGround = true;
        }
      }

      // Keep ball within stage bounds (horizontal wrapping)
      const stageBounds = this.currentStage.getBounds();
      if (this.testBall.position.x + this.testBall.size.width < 0) {
        this.testBall.position.x = stageBounds.right;
      } else if (this.testBall.position.x > stageBounds.right) {
        this.testBall.position.x = -this.testBall.size.width;
      }

      // Reset ball position if it falls too far
      if (this.testBall.position.y > stageBounds.bottom + 100) {
        this.testBall.position.y = -this.testBall.size.height;
        this.testBall.velocity.y = 0;
      }
    }
  }

  /**
   * Update end screen state
   */
  updateEndScreen(deltaTime) {
    if (this.gameState.mode === "victory" && this.stageClearData) {
      this.updateStageClearAnimation(deltaTime);
    }
  }

  /**
   * Update stage clear animation
   * @param {number} deltaTime - Time elapsed since last frame
   */
  updateStageClearAnimation(deltaTime) {
    if (!this.stageClearData) return;

    this.stageClearData.animationTimer += deltaTime;

    // Show results after 2 seconds of animation
    if (
      this.stageClearData.animationTimer > 2000 &&
      !this.stageClearData.showingResults
    ) {
      this.stageClearData.showingResults = true;

      // Play score counting sound effect
      if (this.audioManager) {
        this.audioManager.playSound("coin"); // Reuse coin sound for score counting
      }
    }

    // Allow proceeding after 4 seconds
    if (
      this.stageClearData.animationTimer > 4000 &&
      !this.stageClearData.canProceed
    ) {
      this.stageClearData.canProceed = true;
    }

    // Handle input for proceeding
    const input = this.inputManager.getPlayerInput();
    if (this.stageClearData.canProceed && (input.jump || input.enter)) {
      console.log("Stage clear: Proceeding to next stage"); // デバッグログ追加
      this.proceedToNextStage();
    }
  }

  /**
   * Proceed to next stage or return to menu
   */
  proceedToNextStage() {
    // For now, return to menu (next stage logic will be implemented later)
    console.log("Proceeding from stage clear...");

    // Reset stage clear data
    this.stageClearData = null;

    // Return to menu
    this.stopGame();
  }

  /**
   * Render the game
   */
  render() {
    // Clear the canvas
    this.ctx.fillStyle = "#5C94FC"; // Sky blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render based on current game mode
    switch (this.gameState.mode) {
      case "menu":
        this.renderMenu();
        break;
      case "playing":
        this.renderGameplay();
        break;
      case "paused":
        this.renderGameplay();
        this.renderPauseOverlay();
        break;
      case "gameover":
      case "victory":
        this.renderEndScreen();
        break;
    }

    // Always render debug info
    this.renderDebugInfo();

    // Render performance overlay if enabled
    if (this.performanceOptimizer && this.showPerformanceOverlay) {
      this.performanceOptimizer.renderOverlay(this.ctx);
    }
  }

  /**
   * Render menu screen
   */
  renderMenu() {
    // Render through scene manager
    if (this.sceneManager) {
      this.sceneManager.render(this.ctx);
    } else if (this.startScreen) {
      // Fallback to direct start screen rendering
      this.startScreen.render(this.ctx);
    }
  }

  /**
   * Render gameplay screen
   */
  renderGameplay() {
    const ctx = this.ctx;
    const cameraPos = this.camera ? this.camera.getPosition() : { x: 0, y: 0 };

    // Save context state for camera transformation
    ctx.save();

    // Apply camera transformation
    ctx.translate(-cameraPos.x, -cameraPos.y);

    // Draw current stage (platforms, background elements)
    if (this.currentStage) {
      this.currentStage.render(ctx, cameraPos);
    }

    // Draw physics test ball (keep for demonstration)
    if (this.testBall) {
      ctx.fillStyle = this.testBall.color;
      ctx.fillRect(
        this.testBall.position.x,
        this.testBall.position.y,
        this.testBall.size.width,
        this.testBall.size.height
      );

      // Draw velocity vector for debugging
      ctx.strokeStyle = "#FFFF00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        this.testBall.position.x + this.testBall.size.width / 2,
        this.testBall.position.y + this.testBall.size.height / 2
      );
      ctx.lineTo(
        this.testBall.position.x +
          this.testBall.size.width / 2 +
          this.testBall.velocity.x * 0.1,
        this.testBall.position.y +
          this.testBall.size.height / 2 +
          this.testBall.velocity.y * 0.1
      );
      ctx.stroke();
    }

    // Draw items
    if (this.itemManager) {
      this.itemManager.render(ctx);
    }

    // Draw player
    if (this.player) {
      this.player.render(ctx);
    }

    // Restore context state (removes camera transformation)
    ctx.restore();

    // Draw UI (not affected by camera)
    this.renderUI();
  }

  /**
   * Render pause overlay
   */
  renderPauseOverlay() {
    const ctx = this.ctx;

    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Pause text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", this.canvas.width / 2, this.canvas.height / 2);

    ctx.font = "18px Arial";
    ctx.fillText(
      "Press P to Resume",
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );
  }

  /**
   * Render end screen
   */
  renderEndScreen() {
    const ctx = this.ctx;

    if (this.gameState.mode === "victory" && this.stageClearData) {
      this.renderStageClearScreen(ctx);
    } else {
      // Game over screen
      const title = "GAME OVER";
      const color = "#FF0000";

      ctx.fillStyle = color;
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "18px Arial";
      ctx.fillText(
        "Press SPACE to Return to Menu",
        this.canvas.width / 2,
        this.canvas.height / 2 + 80
      );
    }
  }

  /**
   * Render stage clear screen with animation
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderStageClearScreen(ctx) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const animationProgress = Math.min(
      this.stageClearData.animationTimer / 2000,
      1
    );

    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Animated "STAGE CLEAR!" text
    ctx.save();
    ctx.textAlign = "center";

    // Main title with scale animation
    const titleScale = 0.5 + animationProgress * 0.5;
    ctx.scale(titleScale, titleScale);

    ctx.fillStyle = "#FFD700"; // Gold color
    ctx.strokeStyle = "#FF6B00"; // Orange outline
    ctx.lineWidth = 3;
    ctx.font = "bold 48px Arial";

    const titleX = centerX / titleScale;
    const titleY = (centerY - 100) / titleScale;

    ctx.strokeText("STAGE CLEAR!", titleX, titleY);
    ctx.fillText("STAGE CLEAR!", titleX, titleY);

    ctx.restore();

    // Show results after animation
    if (this.stageClearData.showingResults) {
      this.renderStageResults(ctx, centerX, centerY);
    }

    // Show continue prompt when ready
    if (this.stageClearData.canProceed) {
      // Blinking continue text
      const blinkAlpha =
        (Math.sin(this.stageClearData.animationTimer * 0.01) + 1) * 0.5;
      ctx.globalAlpha = 0.5 + blinkAlpha * 0.5;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Press SPACE to Continue", centerX, centerY + 200);

      ctx.globalAlpha = 1.0; // Reset alpha
    }
  }

  /**
   * Render stage completion results
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   */
  renderStageResults(ctx, centerX, centerY) {
    const resultY = centerY - 20;
    const lineHeight = 35;
    let currentY = resultY;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";

    // Stage number
    ctx.fillText(`Stage ${this.stageClearData.stageNumber}`, centerX, currentY);
    currentY += lineHeight;

    // Time remaining
    const timeBonus = Math.floor(this.stageClearData.completionTime * 10);
    ctx.font = "20px Arial";
    ctx.fillText(
      `Time Remaining: ${Math.ceil(this.stageClearData.completionTime)}s`,
      centerX,
      currentY
    );
    currentY += 25;

    if (timeBonus > 0) {
      ctx.fillStyle = "#00FF00";
      ctx.fillText(`Time Bonus: +${timeBonus}`, centerX, currentY);
      currentY += 25;
    }

    // Coins collected
    ctx.fillStyle = "#FFD700";
    const coinBonus = this.stageClearData.coinsCollected * 100;
    ctx.fillText(
      `Coins: ${this.stageClearData.coinsCollected} × 100 = ${coinBonus}`,
      centerX,
      currentY
    );
    currentY += 25;

    // Goal bonus
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(
      `Goal Bonus: +${this.stageClearData.scoreBonus}`,
      centerX,
      currentY
    );
    currentY += 35;

    // Final score
    ctx.fillStyle = "#FFFF00";
    ctx.font = "bold 28px Arial";
    const totalScore = this.stageClearData.finalScore + timeBonus;
    ctx.fillText(`Total Score: ${totalScore}`, centerX, currentY);

    // Update final score for display
    if (this.player) {
      this.player.score = totalScore;
    }
  }

  /**
   * Render UI elements
   */
  renderUI() {
    const ctx = this.ctx;

    // Time remaining
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    const timeText = `Time: ${Math.ceil(this.gameState.timeRemaining)}`;
    ctx.fillText(timeText, 20, 30);

    // Stage info
    ctx.fillText(`Stage: ${this.gameState.currentStage}`, 20, 60);

    // Player stats (if player exists)
    if (this.player) {
      ctx.fillText(`Score: ${this.player.score}`, 20, 90);
      ctx.fillText(`Coins: ${this.player.coins}`, 20, 120);
      ctx.fillText(`Health: ${this.player.health}`, 20, 150);

      // Show active power-ups
      const activePowerUps = this.player.getState().activePowerUps;
      if (activePowerUps.length > 0) {
        ctx.fillStyle = "#FF69B4";
        ctx.font = "16px Arial";
        ctx.fillText("Power-ups:", 20, 180);

        activePowerUps.forEach((powerType, index) => {
          const remainingTime = Math.ceil(
            this.player.getPowerUpRemainingTime(powerType) / 1000
          );
          ctx.fillText(`${powerType}: ${remainingTime}s`, 30, 200 + index * 20);
        });
      }
    }

    // Item count (debug info)
    if (this.itemManager) {
      ctx.fillStyle = "#FFFF00";
      ctx.font = "14px Arial";
      const yOffset =
        this.player && this.player.getState().activePowerUps.length > 0
          ? 220 + this.player.getState().activePowerUps.length * 20
          : 180;
      ctx.fillText(
        `Items: ${this.itemManager.getActiveItemCount()}`,
        20,
        yOffset
      );
    }
  }

  /**
   * Render debug information
   */
  renderDebugInfo() {
    const ctx = this.ctx;

    ctx.fillStyle = "#FFFF00";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";

    const debugY = this.canvas.height - 100;
    ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 10, debugY);
    ctx.fillText(
      `Delta: ${this.deltaTime.toFixed(2)}ms`,
      this.canvas.width - 10,
      debugY + 15
    );
    ctx.fillText(
      `Mode: ${this.gameState.mode}`,
      this.canvas.width - 10,
      debugY + 30
    );
    ctx.fillText(
      `Running: ${this.gameState.isRunning}`,
      this.canvas.width - 10,
      debugY + 45
    );

    // Show input debug info
    const inputDebug = this.inputManager.getDebugInfo();
    if (inputDebug.pressedKeys.length > 0) {
      ctx.fillText(
        `Keys: ${inputDebug.pressedKeys.join(", ")}`,
        this.canvas.width - 10,
        debugY + 60
      );
    }
    if (inputDebug.activeActions.length > 0) {
      ctx.fillText(
        `Actions: ${inputDebug.activeActions.join(", ")}`,
        this.canvas.width - 10,
        debugY + 75
      );
    }

    // Show physics debug info for player
    if (this.player && this.gameState.mode === "playing") {
      ctx.fillText(
        `Player Pos: ${Math.round(this.player.position.x)}, ${Math.round(
          this.player.position.y
        )}`,
        10,
        this.canvas.height - 110
      );
      ctx.fillText(
        `Player Vel: ${Math.round(this.player.velocity.x)}, ${Math.round(
          this.player.velocity.y
        )}`,
        10,
        this.canvas.height - 95
      );
      ctx.fillText(`State: ${this.player.state}`, 10, this.canvas.height - 80);
      ctx.fillText(
        `On Ground: ${this.player.isOnGround}`,
        10,
        this.canvas.height - 65
      );
      ctx.fillText(
        `Health: ${this.player.health} | Coins: ${this.player.coins}`,
        10,
        this.canvas.height - 50
      );

      const physicsConstants = this.physicsEngine.getConstants();
      ctx.fillText(
        `Gravity: ${physicsConstants.gravity}`,
        10,
        this.canvas.height - 35
      );

      // Show camera debug info
      if (this.camera) {
        const cameraDebug = this.camera.getDebugInfo();
        ctx.fillText(
          `Camera: ${cameraDebug.position.x}, ${cameraDebug.position.y}`,
          10,
          this.canvas.height - 20
        );
      }
    }
  }

  /**
   * Draw a simple cloud shape
   */
  drawCloud(x, y) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 35, y - 15, 18, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Get current game state (read-only)
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get save system instance
   */
  getSaveSystem() {
    return this.saveSystem;
  }

  /**
   * Get audio manager instance
   */
  getAudioManager() {
    return this.audioManager;
  }

  /**
   * Get input manager instance
   */
  getInputManager() {
    return this.inputManager;
  }

  /**
   * Initialize player character
   */
  initPlayer() {
    // Create player at starting position
    const startX = 100;
    const startY = this.canvas.height - 200; // Above the ground
    this.player = new Player(startX, startY, this.audioManager);

    console.log("Player initialized");
  }

  /**
   * Initialize test entities for physics demonstration
   */
  initTestEntities() {
    // Create a test bouncing ball
    this.testBall = {
      position: { x: 200, y: 100 },
      velocity: { x: 150, y: 0 },
      size: { width: 20, height: 20 },
      isOnGround: false,
      color: "#FF6B6B",
    };
  }

  /**
   * Initialize browser compatibility and bug detection systems
   */
  async initCompatibilityAndBugSystems() {
    // Initialize browser compatibility checker
    this.browserCompatibilityChecker = new BrowserCompatibilityChecker();

    // Initialize bug detector
    this.bugDetector = new BugDetector(this);

    // Initialize usability improvements
    this.usabilityImprovements = new UsabilityImprovements(this);

    // Run initial compatibility check
    console.log("ブラウザ互換性チェックを実行中...");
    const compatibilityReport =
      await this.browserCompatibilityChecker.runCompatibilityCheck();

    // Apply automatic fixes if needed
    if (!compatibilityReport.compatibility.isCompatible) {
      console.warn("互換性の問題が検出されました。自動修正を試行します...");
      await this.applyCompatibilityFixes(compatibilityReport);
    }

    // Run initial bug detection
    console.log("バグ検出を実行中...");
    const bugReport = await this.bugDetector.runBugDetection();

    // Apply automatic bug fixes
    if (bugReport.summary.autoFixable > 0) {
      console.log("自動修正可能なバグが見つかりました。修正を適用します...");
      await this.bugDetector.applyAutoFixes();
    }

    // Apply usability improvements
    console.log("ユーザビリティ改善を適用中...");
    this.usabilityImprovements.applyImprovements();

    console.log("ブラウザ互換性とバグ修正システムが初期化されました");
  }

  /**
   * Apply compatibility fixes based on detected issues
   */
  async applyCompatibilityFixes(compatibilityReport) {
    const fixes = [];

    for (const issue of compatibilityReport.issues) {
      switch (issue.feature) {
        case "requestAnimationFrame":
          // Fallback for older browsers
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.setTimeout;
            window.cancelAnimationFrame = window.clearTimeout;
            fixes.push("requestAnimationFrame polyfill applied");
          }
          break;

        case "Performance.now()":
          // Fallback for performance.now
          if (!performance.now) {
            performance.now = () => Date.now();
            fixes.push("Performance.now() polyfill applied");
          }
          break;

        case "HTML5 Audio":
          // Disable audio if not supported
          if (this.audioManager) {
            this.audioManager.setEnabled(false);
            fixes.push("Audio disabled due to compatibility issues");
          }
          break;

        case "Local Storage":
          // Use memory storage fallback
          if (!window.localStorage) {
            window.localStorage = {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
              clear: () => {},
            };
            fixes.push("LocalStorage fallback applied");
          }
          break;
      }
    }

    if (fixes.length > 0) {
      console.log("適用された互換性修正:", fixes);
    }

    return fixes;
  }

  /**
   * Run comprehensive browser compatibility check
   */
  async runBrowserCompatibilityCheck() {
    if (!this.browserCompatibilityChecker) {
      console.error("Browser compatibility checker not initialized");
      return null;
    }

    console.log("包括的なブラウザ互換性チェックを実行中...");
    const report =
      await this.browserCompatibilityChecker.runCompatibilityCheck();

    // Test game performance in current browser
    const performanceTest =
      await this.browserCompatibilityChecker.testGamePerformance();
    report.performanceTest = performanceTest;

    // Get browser-specific optimizations
    const optimizations =
      this.browserCompatibilityChecker.getBrowserOptimizations();
    report.optimizations = optimizations;

    return report;
  }

  /**
   * Run comprehensive bug detection
   */
  async runBugDetection() {
    if (!this.bugDetector) {
      console.error("Bug detector not initialized");
      return null;
    }

    console.log("包括的なバグ検出を実行中...");
    const report = await this.bugDetector.runBugDetection();

    // Apply automatic fixes if enabled
    if (this.bugDetector.autoFixEnabled && report.summary.autoFixable > 0) {
      await this.bugDetector.applyAutoFixes();
    }

    return report;
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      gameEngine: {
        running: this.gameState.isRunning,
        mode: this.gameState.mode,
        fps: this.fps,
        deltaTime: this.deltaTime,
      },
      compatibility: null,
      bugs: null,
      usability: null,
      performance: null,
    };

    // Get compatibility status
    if (this.browserCompatibilityChecker) {
      status.compatibility =
        await this.browserCompatibilityChecker.runCompatibilityCheck();
    }

    // Get bug detection status
    if (this.bugDetector) {
      status.bugs = this.bugDetector.getStatistics();
    }

    // Get usability status
    if (this.usabilityImprovements) {
      status.usability = this.usabilityImprovements.getStatistics();
    }

    // Get performance status
    if (this.performanceOptimizer) {
      status.performance = this.performanceOptimizer.getMetrics();
    }

    console.log("システム状態レポート:", status);
    return status;
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      fps: this.fps,
      averageFrameTime: this.deltaTime,
      gameState: this.gameState,
      systemHealth: "unknown",
    };

    // Add performance optimizer metrics if available
    if (this.performanceOptimizer) {
      const metrics = this.performanceOptimizer.getMetrics();
      report.performanceMetrics = metrics;

      // Determine system health based on performance
      if (metrics.averageFrameTime < 16.67) {
        report.systemHealth = "excellent";
      } else if (metrics.averageFrameTime < 33.33) {
        report.systemHealth = "good";
      } else if (metrics.averageFrameTime < 50) {
        report.systemHealth = "fair";
      } else {
        report.systemHealth = "poor";
      }
    }

    // Add browser compatibility info
    if (this.browserCompatibilityChecker) {
      report.browserInfo = this.browserCompatibilityChecker.browserInfo;
    }

    console.log("パフォーマンスレポート:", report);
    return report;
  }

  /**
   * Quick system health check
   */
  quickHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      overall: "healthy",
      issues: [],
      warnings: [],
    };

    // Check critical systems
    const criticalSystems = [
      { name: "canvas", component: this.canvas },
      { name: "ctx", component: this.ctx },
      { name: "inputManager", component: this.inputManager },
      { name: "physicsEngine", component: this.physicsEngine },
      { name: "player", component: this.player },
    ];

    for (const system of criticalSystems) {
      if (!system.component) {
        health.issues.push(`Critical system missing: ${system.name}`);
        health.overall = "unhealthy";
      }
    }

    // Check performance
    if (this.fps < 30) {
      health.warnings.push(`Low FPS detected: ${this.fps}`);
      if (health.overall === "healthy") {
        health.overall = "degraded";
      }
    }

    // Check for errors
    if (this.bugDetector) {
      const bugStats = this.bugDetector.getStatistics();
      if (bugStats.totalErrors > 0) {
        health.warnings.push(`${bugStats.totalErrors} errors detected`);
      }
    }

    console.log(`システムヘルス: ${health.overall}`);
    if (health.issues.length > 0) {
      console.error("重大な問題:", health.issues);
    }
    if (health.warnings.length > 0) {
      console.warn("警告:", health.warnings);
    }

    return health;
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log("統合テストを実行中...");

    const tests = [];

    // Test game engine initialization
    tests.push({
      name: "Game Engine Initialization",
      passed: !!(this.canvas && this.ctx && this.gameState),
      details: "Core game engine components",
    });

    // Test input system
    tests.push({
      name: "Input System",
      passed: !!(
        this.inputManager && typeof this.inputManager.update === "function"
      ),
      details: "Input manager functionality",
    });

    // Test physics system
    tests.push({
      name: "Physics System",
      passed: !!(
        this.physicsEngine &&
        typeof this.physicsEngine.applyGravity === "function"
      ),
      details: "Physics engine functionality",
    });

    // Test player system
    tests.push({
      name: "Player System",
      passed: !!(this.player && typeof this.player.update === "function"),
      details: "Player character functionality",
    });

    // Test rendering system
    let renderTest = false;
    try {
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(0, 0, 1, 1);
      renderTest = true;
    } catch (error) {
      console.error("Render test failed:", error);
    }

    tests.push({
      name: "Rendering System",
      passed: renderTest,
      details: "Canvas rendering functionality",
    });

    // Test compatibility systems
    tests.push({
      name: "Compatibility Systems",
      passed: !!(this.browserCompatibilityChecker && this.bugDetector),
      details: "Browser compatibility and bug detection",
    });

    const results = {
      timestamp: new Date().toISOString(),
      totalTests: tests.length,
      passedTests: tests.filter((t) => t.passed).length,
      failedTests: tests.filter((t) => !t.passed).length,
      tests: tests,
    };

    console.log("統合テスト結果:", results);
    return results;
  }

  /**
   * Run system validation
   */
  async runSystemValidation() {
    if (!this.systemValidator) {
      // Create system validator if not exists
      this.systemValidator = new SystemValidator(this);
    }

    console.log("システム検証を実行中...");
    const report = await this.systemValidator.validateAllSystems();

    return report;
  }

  /**
   * Get the input manager instance
   */
  getInputManager() {
    return this.inputManager;
  }

  /**
   * Get the physics engine instance
   */
  getPhysicsEngine() {
    return this.physicsEngine;
  }

  /**
   * Get the audio manager instance
   */
  getAudioManager() {
    return this.audioManager;
  }

  /**
   * Initialize testing and optimization systems
   */
  initTestingSystems() {
    // Initialize integration test suite
    this.integrationTestSuite = new IntegrationTestSuite(this);

    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer(this);
    this.performanceOptimizer.startMonitoring();

    // Initialize system validator
    this.systemValidator = new SystemValidator(this);

    // Initialize browser compatibility checker
    this.browserCompatibilityChecker = new BrowserCompatibilityChecker();

    // Initialize bug detector
    this.bugDetector = new BugDetector(this);

    // Initialize usability improvements
    this.usabilityImprovements = new UsabilityImprovements(this);

    console.log("Testing and optimization systems initialized");
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    if (!this.integrationTestSuite) {
      console.error("Integration test suite not initialized");
      return null;
    }

    console.log("Running integration tests...");
    const results = await this.integrationTestSuite.runAllTests();

    // Also run performance benchmarks
    const benchmarks =
      await this.integrationTestSuite.runPerformanceBenchmarks();

    return { testResults: results, benchmarks };
  }

  /**
   * Run system validation
   */
  async runSystemValidation() {
    if (!this.systemValidator) {
      console.error("System validator not initialized");
      return null;
    }

    console.log("Running system validation...");
    return await this.systemValidator.validateAllSystems();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    if (!this.performanceOptimizer) {
      console.warn("Performance optimizer not initialized");
      return null;
    }

    return this.performanceOptimizer.getMetrics();
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    if (!this.performanceOptimizer) {
      console.warn("Performance optimizer not initialized");
      return null;
    }

    return this.performanceOptimizer.generateReport();
  }

  /**
   * Quick system health check
   */
  quickHealthCheck() {
    if (!this.systemValidator) {
      console.warn("System validator not initialized");
      return { healthy: false, issues: ["System validator not available"] };
    }

    return this.systemValidator.quickHealthCheck();
  }

  /**
   * Run browser compatibility check
   */
  async runBrowserCompatibilityCheck() {
    if (!this.browserCompatibilityChecker) {
      console.error("Browser compatibility checker not initialized");
      return null;
    }

    console.log("Running browser compatibility check...");
    return await this.browserCompatibilityChecker.runCompatibilityCheck();
  }

  /**
   * Run bug detection
   */
  async runBugDetection() {
    if (!this.bugDetector) {
      console.error("Bug detector not initialized");
      return null;
    }

    console.log("Running bug detection...");
    const report = await this.bugDetector.runBugDetection();

    // Apply auto-fixes if enabled
    await this.bugDetector.applyAutoFixes();

    return report;
  }

  /**
   * Test game performance in current browser
   */
  async testBrowserPerformance() {
    if (!this.browserCompatibilityChecker) {
      console.error("Browser compatibility checker not initialized");
      return null;
    }

    return await this.browserCompatibilityChecker.testGamePerformance();
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      health: this.quickHealthCheck(),
      performance: this.getPerformanceMetrics(),
      compatibility: null,
      bugs: null,
    };

    try {
      status.compatibility = await this.runBrowserCompatibilityCheck();
    } catch (error) {
      console.warn("Failed to get compatibility status:", error);
    }

    try {
      status.bugs = await this.runBugDetection();
    } catch (error) {
      console.warn("Failed to get bug status:", error);
    }

    return status;
  }

  /**
   * Play enemy defeat sound (for future enemy system)
   */
  playEnemyDefeatSound() {
    if (this.audioManager) {
      this.audioManager.playSound("enemy_defeat");
    }
  }

  /**
   * Handle goal reached event
   * @param {Object} goalResult - Goal completion data
   */
  handleGoalReached(goalResult) {
    if (!goalResult) return;

    console.log("Stage completed!", goalResult);

    // Initialize stage clear data
    this.stageClearData = {
      stageNumber: this.gameState.currentStage,
      completionTime: this.gameState.timeRemaining,
      scoreBonus: goalResult.scoreBonus,
      coinsCollected: this.player ? this.player.coins : 0,
      finalScore: 0,
      animationTimer: 0,
      showingResults: false,
      canProceed: false,
    };

    // Add score bonus to player
    if (this.player && goalResult.scoreBonus) {
      this.player.score += goalResult.scoreBonus;
      this.stageClearData.finalScore = this.player.score;
    }

    // Play stage clear sound
    if (this.audioManager) {
      this.audioManager.playSound("stage_clear");
    }

    // Start stage clear animation
    this.startStageClearAnimation();

    // Save stage completion to save system
    if (this.saveSystem && this.player) {
      this.saveSystem.saveStageCompletion(
        this.gameState.currentStage,
        this.player.score,
        this.gameState.timeRemaining,
        this.player.coins
      );
    }

    // Change to victory state
    this.changeGameMode("victory");

    // Log completion details
    console.log(`Stage ${this.gameState.currentStage} completed!`);
    console.log(`Score bonus: ${goalResult.scoreBonus}`);
    console.log(`Final score: ${this.player ? this.player.score : 0}`);
  }

  /**
   * Start stage clear animation sequence
   */
  startStageClearAnimation() {
    // Reset animation timer
    if (this.stageClearData) {
      this.stageClearData.animationTimer = 0;
      this.stageClearData.showingResults = false;
      this.stageClearData.canProceed = false;
    }

    // Stop player movement
    if (this.player) {
      this.player.velocity.x = 0;
      this.player.state = "idle";
    }

    console.log("Stage clear animation started");
  }

  /**
   * Initialize stage system
   */
  initStage() {
    // Create the first stage
    this.currentStage = new Stage(this.gameState.currentStage);
    console.log("Stage initialized");
  }

  /**
   * Initialize camera system
   */
  initCamera() {
    if (!this.currentStage) {
      console.warn("Cannot initialize camera without stage");
      return;
    }

    // Create camera with canvas and stage dimensions
    this.camera = new Camera(
      this.canvas.width,
      this.canvas.height,
      this.currentStage.width,
      this.currentStage.height
    );

    // Set player as follow target if available
    if (this.player) {
      this.camera.setFollowTarget(this.player);
    }

    console.log("Camera initialized");
  }

  /**
   * Initialize audio manager
   */
  async initAudioManager() {
    this.audioManager = new AudioManager();

    try {
      await this.audioManager.init();

      // Load sound effects (using placeholder URLs for now)
      // In a real implementation, these would be actual audio files
      await this.loadGameSounds();

      console.log("AudioManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error);
    }
  }

  /**
   * Load game sound effects
   */
  async loadGameSounds() {
    try {
      // Create placeholder audio data URLs for testing
      // In production, these would be actual audio file paths
      const silentAudio = this.createSilentAudio();

      // Load sound effects with placeholder audio
      const soundPromises = [
        this.audioManager.loadSound("jump", silentAudio),
        this.audioManager.loadSound("dash", silentAudio),
        this.audioManager.loadSound("coin", silentAudio),
        this.audioManager.loadSound("powerup", silentAudio),
        this.audioManager.loadSound("invincible", silentAudio),
        this.audioManager.loadSound("item", silentAudio),
        this.audioManager.loadSound("damage", silentAudio),
        this.audioManager.loadSound("defeat", silentAudio),
        this.audioManager.loadSound("victory", silentAudio),
        this.audioManager.loadSound("enemy_defeat", silentAudio),
        this.audioManager.loadSound("stage_clear", silentAudio),
      ];

      await Promise.all(soundPromises);
      console.log("Game sounds loaded successfully");
    } catch (error) {
      console.warn("Failed to load some game sounds:", error);
    }
  }

  /**
   * Create a silent audio data URL for placeholder sounds
   */
  createSilentAudio() {
    // Create a very short silent audio data URL
    // This is a minimal WAV file with 0.1 seconds of silence at 44.1kHz
    return "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  }

  /**
   * Initialize UI system
   */
  initUISystem() {
    this.uiSystem = new UISystem(this);
    console.log("UI system initialized");
  }

  /**
   * Initialize scene manager
   */
  initSceneManager() {
    this.sceneManager = new SceneManager(this);

    // Register scenes
    const menuScene = new MenuScene(this);
    const gameScene = new GameScene(this);
    const settingsScene = new SettingsScene(this);
    const stageSelectScene = new StageSelectScene(this);

    this.sceneManager.registerScene("menu", menuScene);
    this.sceneManager.registerScene("game", gameScene);
    this.sceneManager.registerScene("settings", settingsScene);
    this.sceneManager.registerScene("stageSelect", stageSelectScene);

    // Start with menu scene
    this.sceneManager.changeScene("menu", {}, true);

    console.log("Scene manager initialized");
  }

  /**
   * Initialize save system
   */
  initSaveSystem() {
    this.saveSystem = new SaveSystem(this);
    this.saveSystem.init();

    // Load saved settings and apply them
    const savedSettings = this.saveSystem.loadSettings();
    if (this.audioManager) {
      this.audioManager.setMasterVolume(savedSettings.masterVolume || 0.7);
      this.audioManager.setMusicVolume(savedSettings.musicVolume || 0.8);
      this.audioManager.setSFXVolume(savedSettings.sfxVolume || 0.9);
    }

    console.log("Save system initialized");
  }

  /**
   * Initialize start screen (legacy method for fallback)
   */
  initStartScreen() {
    this.startScreen = new StartScreen(this);
    // Show start screen initially
    this.startScreen.show();
    console.log("Start screen initialized");
  }

  /**
   * Initialize item manager and create test items
   */
  initItemManager() {
    this.itemManager = new ItemManager();

    // Create coins throughout the stage
    const coins = [
      new Coin(350, 370, 1),
      new Coin(380, 370, 1),
      new Coin(410, 370, 1),
      new Coin(620, 270, 1),
      new Coin(650, 270, 1),
      new Coin(920, 320, 2), // Higher value coin
      new Coin(1220, 220, 1),
      new Coin(1250, 220, 1),
      new Coin(1280, 220, 1),
      new Coin(1520, 370, 1),
      new Coin(2020, 270, 2), // Higher value coin
      new Coin(2050, 270, 1),
      new Coin(2080, 270, 1),
    ];

    // Create power-up items
    const powerUps = [
      new PowerUp(500, 350, "speed", 8000), // Speed boost for 8 seconds
      new PowerUp(800, 300, "invincible", 5000), // Invincibility for 5 seconds
      new PowerUp(1400, 200, "jump", 10000), // Jump boost for 10 seconds
      new PowerUp(1750, 170, "strength", 6000), // Strength boost for 6 seconds
    ];

    // Create some generic test items
    const testItems = [
      new Item(700, 350, "generic", 100),
      new Item(1100, 300, "generic", 200),
      new Item(1600, 200, "generic", 300),
    ];

    // Add all items to the manager
    coins.forEach((coin) => this.itemManager.addItem(coin));
    powerUps.forEach((powerUp) => this.itemManager.addItem(powerUp));
    testItems.forEach((item) => this.itemManager.addItem(item));

    console.log("ItemManager initialized with coins and test items");
  }
}

// Global game engine instance
let gameEngine = null;

/**
 * Initialize the game
 */
async function initGame() {
  console.log("Initializing Mario Style Platformer...");

  // Get canvas element
  const canvas = document.getElementById("game-canvas");
  if (!canvas) {
    console.error("Canvas element 'game-canvas' not found");
    return;
  }

  // Create game engine instance
  gameEngine = new GameEngine(canvas);

  // Initialize the game engine
  try {
    const success = await gameEngine.init();
    if (!success) {
      console.error("Failed to initialize game engine");
      return;
    }
  } catch (error) {
    console.error("Failed to initialize game engine:", error);
    return;
  }

  // Start rendering the initial menu screen
  gameEngine.render();

  console.log("Game initialized successfully");
}

/**
 * Get the input manager instance
 */
function getInputManager() {
  return gameEngine ? gameEngine.inputManager : null;
}

/**
 * Get current player input state (for external access)
 */
function getPlayerInput() {
  return gameEngine ? gameEngine.inputManager.getPlayerInput() : null;
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await initGame();

  // Start the game engine to show the menu
  if (gameEngine) {
    gameEngine.start();
  }

  console.log("Game Controls:");
  console.log("Movement:");
  console.log("- Arrow Keys or WASD: Move left/right, jump, block");
  console.log("- Shift: Dash while moving");
  console.log("Game Controls:");
  console.log("- SPACE or ENTER: Start game / Return to menu / Confirm");
  console.log("- P: Pause/Unpause (during gameplay)");
  console.log("- ESC: Stop game and return to menu");
  console.log("- F1: Debug info toggle (future feature)");
});
