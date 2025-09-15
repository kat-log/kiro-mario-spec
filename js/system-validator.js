/**
 * System Validator for Mario Style Platformer
 * Validates system integrity and component interactions
 */

class SystemValidator {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.validationResults = [];
    this.criticalIssues = [];
    this.warnings = [];
    this.recommendations = [];

    console.log("System Validator initialized");
  }

  /**
   * Run complete system validation
   */
  async validateAllSystems() {
    console.log("Starting comprehensive system validation...");

    this.validationResults = [];
    this.criticalIssues = [];
    this.warnings = [];
    this.recommendations = [];

    // Core system validations
    await this.validateGameEngine();
    await this.validateInputSystem();
    await this.validatePhysicsSystem();
    await this.validatePlayerSystem();
    await this.validateStageSystem();
    await this.validateItemSystem();
    await this.validateAudioSystem();
    await this.validateUISystem();
    await this.validateSceneSystem();
    await this.validateCameraSystem();

    // Integration validations
    await this.validateSystemIntegration();
    await this.validateGameFlow();
    await this.validatePerformance();

    // Generate final report
    return this.generateValidationReport();
  }

  /**
   * Validate Game Engine core
   */
  async validateGameEngine() {
    const issues = [];
    const engine = this.gameEngine;

    // Check core properties
    if (!engine.canvas) issues.push("Canvas not initialized");
    if (!engine.ctx) issues.push("Canvas context not available");
    if (!engine.gameState) issues.push("Game state not initialized");

    // Check game loop
    if (typeof engine.update !== "function")
      issues.push("Update method missing");
    if (typeof engine.render !== "function")
      issues.push("Render method missing");
    if (typeof engine.start !== "function") issues.push("Start method missing");
    if (typeof engine.stop !== "function") issues.push("Stop method missing");

    // Check game state structure
    if (engine.gameState) {
      const requiredStateProps = [
        "mode",
        "isRunning",
        "isPaused",
        "currentStage",
        "timeRemaining",
      ];
      for (const prop of requiredStateProps) {
        if (!(prop in engine.gameState)) {
          issues.push(`Game state missing property: ${prop}`);
        }
      }
    }

    this.addValidationResult("GameEngine", issues);
  }

  /**
   * Validate Input System
   */
  async validateInputSystem() {
    const issues = [];
    const inputManager = this.gameEngine.inputManager;

    if (!inputManager) {
      issues.push("Input manager not initialized");
    } else {
      // Check required methods
      const requiredMethods = ["update", "getPlayerInput", "getDebugInfo"];
      for (const method of requiredMethods) {
        if (typeof inputManager[method] !== "function") {
          issues.push(`InputManager missing method: ${method}`);
        }
      }

      // Test input state structure
      try {
        const inputState = inputManager.getPlayerInput();
        const requiredInputs = [
          "moveLeft",
          "moveRight",
          "jump",
          "dash",
          "block",
        ];

        for (const input of requiredInputs) {
          if (!(input in inputState)) {
            issues.push(`Missing input binding: ${input}`);
          }
        }
      } catch (error) {
        issues.push(`Error getting input state: ${error.message}`);
      }
    }

    this.addValidationResult("InputSystem", issues);
  }

  /**
   * Validate Physics System
   */
  async validatePhysicsSystem() {
    const issues = [];
    const physics = this.gameEngine.physicsEngine;

    if (!physics) {
      issues.push("Physics engine not initialized");
    } else {
      // Check required methods
      const requiredMethods = [
        "applyGravity",
        "updatePosition",
        "checkAABBCollision",
        "resolveCollision",
        "applyFriction",
      ];

      for (const method of requiredMethods) {
        if (typeof physics[method] !== "function") {
          issues.push(`PhysicsEngine missing method: ${method}`);
        }
      }

      // Test physics constants
      try {
        const constants = physics.getConstants();
        const requiredConstants = [
          "gravity",
          "terminalVelocity",
          "friction",
          "airResistance",
        ];

        for (const constant of requiredConstants) {
          if (!(constant in constants)) {
            issues.push(`Missing physics constant: ${constant}`);
          } else if (typeof constants[constant] !== "number") {
            issues.push(`Invalid physics constant type: ${constant}`);
          }
        }
      } catch (error) {
        issues.push(`Error getting physics constants: ${error.message}`);
      }
    }

    this.addValidationResult("PhysicsSystem", issues);
  }

  /**
   * Validate Player System
   */
  async validatePlayerSystem() {
    const issues = [];
    const player = this.gameEngine.player;

    if (!player) {
      issues.push("Player not initialized");
    } else {
      // Check required properties
      const requiredProps = ["position", "velocity", "size", "health", "state"];
      for (const prop of requiredProps) {
        if (!(prop in player)) {
          issues.push(`Player missing property: ${prop}`);
        }
      }

      // Check required methods
      const requiredMethods = [
        "update",
        "render",
        "move",
        "jump",
        "collectItem",
      ];
      for (const method of requiredMethods) {
        if (typeof player[method] !== "function") {
          issues.push(`Player missing method: ${method}`);
        }
      }

      // Validate position and velocity structure
      if (player.position) {
        if (
          typeof player.position.x !== "number" ||
          typeof player.position.y !== "number"
        ) {
          issues.push("Invalid player position structure");
        }
      }

      if (player.velocity) {
        if (
          typeof player.velocity.x !== "number" ||
          typeof player.velocity.y !== "number"
        ) {
          issues.push("Invalid player velocity structure");
        }
      }

      // Check health bounds
      if (typeof player.health === "number" && player.health < 0) {
        this.warnings.push("Player health is negative");
      }
    }

    this.addValidationResult("PlayerSystem", issues);
  }

  /**
   * Validate Stage System
   */
  async validateStageSystem() {
    const issues = [];
    const stage = this.gameEngine.currentStage;

    if (!stage) {
      issues.push("Stage not initialized");
    } else {
      // Check required methods
      const requiredMethods = [
        "update",
        "render",
        "checkPlatformCollisions",
        "checkGoalCollision",
      ];
      for (const method of requiredMethods) {
        if (typeof stage[method] !== "function") {
          issues.push(`Stage missing method: ${method}`);
        }
      }

      // Check stage bounds
      try {
        const bounds = stage.getBounds();
        if (
          !bounds ||
          typeof bounds.left !== "number" ||
          typeof bounds.right !== "number"
        ) {
          issues.push("Invalid stage bounds");
        }
      } catch (error) {
        issues.push(`Error getting stage bounds: ${error.message}`);
      }
    }

    this.addValidationResult("StageSystem", issues);
  }

  /**
   * Validate Item System
   */
  async validateItemSystem() {
    const issues = [];
    const itemManager = this.gameEngine.itemManager;

    if (!itemManager) {
      issues.push("Item manager not initialized");
    } else {
      // Check required methods
      const requiredMethods = [
        "update",
        "render",
        "checkCollisions",
        "getActiveItemCount",
      ];
      for (const method of requiredMethods) {
        if (typeof itemManager[method] !== "function") {
          issues.push(`ItemManager missing method: ${method}`);
        }
      }

      // Test item count
      try {
        const itemCount = itemManager.getActiveItemCount();
        if (typeof itemCount !== "number") {
          issues.push("Invalid item count type");
        }
      } catch (error) {
        issues.push(`Error getting item count: ${error.message}`);
      }
    }

    this.addValidationResult("ItemSystem", issues);
  }

  /**
   * Validate Audio System
   */
  async validateAudioSystem() {
    const issues = [];
    const audioManager = this.gameEngine.audioManager;

    if (!audioManager) {
      issues.push("Audio manager not initialized");
    } else {
      // Check required methods
      const requiredMethods = ["playSound", "setVolume", "isLoaded"];
      for (const method of requiredMethods) {
        if (typeof audioManager[method] !== "function") {
          issues.push(`AudioManager missing method: ${method}`);
        }
      }

      // Check critical sounds
      const criticalSounds = ["jump", "coin"];
      for (const sound of criticalSounds) {
        try {
          if (!audioManager.isLoaded(sound)) {
            this.warnings.push(`Critical sound not loaded: ${sound}`);
          }
        } catch (error) {
          issues.push(`Error checking sound: ${sound} - ${error.message}`);
        }
      }
    }

    this.addValidationResult("AudioSystem", issues);
  }

  /**
   * Validate UI System
   */
  async validateUISystem() {
    const issues = [];
    const uiSystem = this.gameEngine.uiSystem;

    if (!uiSystem) {
      issues.push("UI system not initialized");
    } else {
      // Check required methods
      const requiredMethods = ["update", "reset"];
      for (const method of requiredMethods) {
        if (typeof uiSystem[method] !== "function") {
          issues.push(`UISystem missing method: ${method}`);
        }
      }
    }

    this.addValidationResult("UISystem", issues);
  }

  /**
   * Validate Scene System
   */
  async validateSceneSystem() {
    const issues = [];
    const sceneManager = this.gameEngine.sceneManager;

    if (!sceneManager) {
      issues.push("Scene manager not initialized");
    } else {
      // Check required methods
      const requiredMethods = [
        "changeScene",
        "getCurrentScene",
        "update",
        "render",
      ];
      for (const method of requiredMethods) {
        if (typeof sceneManager[method] !== "function") {
          issues.push(`SceneManager missing method: ${method}`);
        }
      }

      // Check if scenes are registered
      try {
        const sceneNames = sceneManager.getSceneNames();
        if (!Array.isArray(sceneNames) || sceneNames.length === 0) {
          this.warnings.push("No scenes registered in scene manager");
        }
      } catch (error) {
        issues.push(`Error getting scene names: ${error.message}`);
      }
    }

    this.addValidationResult("SceneSystem", issues);
  }

  /**
   * Validate Camera System
   */
  async validateCameraSystem() {
    const issues = [];
    const camera = this.gameEngine.camera;

    if (!camera) {
      issues.push("Camera not initialized");
    } else {
      // Check required methods
      const requiredMethods = ["update", "getPosition", "setTarget"];
      for (const method of requiredMethods) {
        if (typeof camera[method] !== "function") {
          issues.push(`Camera missing method: ${method}`);
        }
      }

      // Test camera position
      try {
        const position = camera.getPosition();
        if (
          !position ||
          typeof position.x !== "number" ||
          typeof position.y !== "number"
        ) {
          issues.push("Invalid camera position");
        }
      } catch (error) {
        issues.push(`Error getting camera position: ${error.message}`);
      }
    }

    this.addValidationResult("CameraSystem", issues);
  }

  /**
   * Validate System Integration
   */
  async validateSystemIntegration() {
    const issues = [];

    // Test player-physics integration
    try {
      const player = this.gameEngine.player;
      const physics = this.gameEngine.physicsEngine;

      if (player && physics) {
        // Test if player has required physics properties
        if (!physics.isValidEntity(player)) {
          issues.push("Player not compatible with physics system");
        }
      }
    } catch (error) {
      issues.push(`Player-Physics integration error: ${error.message}`);
    }

    // Test camera-player integration
    try {
      const camera = this.gameEngine.camera;
      const player = this.gameEngine.player;

      if (camera && player) {
        // Camera should be able to follow player
        camera.setTarget(player);
      }
    } catch (error) {
      issues.push(`Camera-Player integration error: ${error.message}`);
    }

    // Test audio-player integration
    try {
      const player = this.gameEngine.player;
      const audio = this.gameEngine.audioManager;

      if (player && audio && player.audioManager !== audio) {
        this.warnings.push("Player audio manager reference may be outdated");
      }
    } catch (error) {
      issues.push(`Audio-Player integration error: ${error.message}`);
    }

    this.addValidationResult("SystemIntegration", issues);
  }

  /**
   * Validate Game Flow
   */
  async validateGameFlow() {
    const issues = [];
    const engine = this.gameEngine;

    // Test game state transitions
    try {
      const initialMode = engine.gameState.mode;

      // Test start game
      engine.startGame();
      if (engine.gameState.mode !== "playing") {
        issues.push("Game not starting correctly");
      }

      // Test pause
      engine.togglePause();
      if (!engine.gameState.isPaused) {
        issues.push("Game pause not working");
      }

      // Test unpause
      engine.togglePause();
      if (engine.gameState.isPaused) {
        issues.push("Game unpause not working");
      }

      // Test stop
      engine.stopGame();
      if (engine.gameState.mode === "playing") {
        issues.push("Game not stopping correctly");
      }
    } catch (error) {
      issues.push(`Game flow error: ${error.message}`);
    }

    this.addValidationResult("GameFlow", issues);
  }

  /**
   * Validate Performance
   */
  async validatePerformance() {
    const issues = [];

    // Check frame rate capability
    const testFrames = 10;
    const frameTimes = [];

    for (let i = 0; i < testFrames; i++) {
      const start = performance.now();

      try {
        this.gameEngine.update(16.67);
        this.gameEngine.render();
      } catch (error) {
        issues.push(`Performance test error: ${error.message}`);
        break;
      }

      const end = performance.now();
      frameTimes.push(end - start);
    }

    if (frameTimes.length > 0) {
      const avgFrameTime =
        frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);

      if (avgFrameTime > 20) {
        this.warnings.push(
          `Average frame time high: ${avgFrameTime.toFixed(2)}ms`
        );
      }

      if (maxFrameTime > 50) {
        this.warnings.push(
          `Maximum frame time very high: ${maxFrameTime.toFixed(2)}ms`
        );
      }
    }

    this.addValidationResult("Performance", issues);
  }

  /**
   * Add validation result
   */
  addValidationResult(systemName, issues) {
    const result = {
      system: systemName,
      passed: issues.length === 0,
      issues: issues,
      timestamp: performance.now(),
    };

    this.validationResults.push(result);

    // Categorize issues
    for (const issue of issues) {
      if (
        issue.toLowerCase().includes("not initialized") ||
        issue.toLowerCase().includes("missing method")
      ) {
        this.criticalIssues.push(`${systemName}: ${issue}`);
      } else {
        this.warnings.push(`${systemName}: ${issue}`);
      }
    }

    console.log(
      `${systemName} validation: ${result.passed ? "PASSED" : "FAILED"}`
    );
    if (!result.passed) {
      console.warn(`  Issues: ${issues.join(", ")}`);
    }
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport() {
    const totalSystems = this.validationResults.length;
    const passedSystems = this.validationResults.filter((r) => r.passed).length;
    const failedSystems = totalSystems - passedSystems;

    // Generate recommendations
    this.generateRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSystems,
        passedSystems,
        failedSystems,
        successRate: (passedSystems / totalSystems) * 100,
        criticalIssues: this.criticalIssues.length,
        warnings: this.warnings.length,
      },
      results: this.validationResults,
      criticalIssues: this.criticalIssues,
      warnings: this.warnings,
      recommendations: this.recommendations,
    };

    this.logValidationReport(report);
    return report;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    this.recommendations = [];

    if (this.criticalIssues.length > 0) {
      this.recommendations.push(
        "Address critical issues immediately - game may not function properly"
      );
    }

    if (this.warnings.length > 5) {
      this.recommendations.push(
        "High number of warnings detected - review system implementations"
      );
    }

    // System-specific recommendations
    const failedSystems = this.validationResults
      .filter((r) => !r.passed)
      .map((r) => r.system);

    if (failedSystems.includes("GameEngine")) {
      this.recommendations.push(
        "Core game engine issues detected - check initialization order"
      );
    }

    if (failedSystems.includes("PhysicsSystem")) {
      this.recommendations.push(
        "Physics system issues may cause gameplay problems"
      );
    }

    if (failedSystems.includes("AudioSystem")) {
      this.recommendations.push(
        "Audio issues detected - check sound file loading"
      );
    }

    if (failedSystems.includes("Performance")) {
      this.recommendations.push(
        "Performance issues detected - consider optimization"
      );
    }

    // Integration recommendations
    if (failedSystems.includes("SystemIntegration")) {
      this.recommendations.push(
        "System integration issues - check component references"
      );
    }
  }

  /**
   * Log validation report to console
   */
  logValidationReport(report) {
    console.log("\n" + "=".repeat(60));
    console.log("SYSTEM VALIDATION REPORT");
    console.log("=".repeat(60));
    console.log(`Total Systems: ${report.summary.totalSystems}`);
    console.log(`Passed: ${report.summary.passedSystems}`);
    console.log(`Failed: ${report.summary.failedSystems}`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log("=".repeat(60));

    // Critical issues
    if (this.criticalIssues.length > 0) {
      console.log("CRITICAL ISSUES:");
      this.criticalIssues.forEach((issue) => console.error(`  ❌ ${issue}`));
      console.log("=".repeat(60));
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log("WARNINGS:");
      this.warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
      console.log("=".repeat(60));
    }

    // Recommendations
    if (this.recommendations.length > 0) {
      console.log("RECOMMENDATIONS:");
      this.recommendations.forEach((rec) => console.log(`  💡 ${rec}`));
      console.log("=".repeat(60));
    }

    // System details
    console.log("SYSTEM DETAILS:");
    this.validationResults.forEach((result) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`  ${status} ${result.system}`);
      if (!result.passed) {
        result.issues.forEach((issue) => console.log(`    - ${issue}`));
      }
    });

    console.log("=".repeat(60));
  }

  /**
   * Quick health check
   */
  quickHealthCheck() {
    const criticalSystems = [
      "gameEngine",
      "inputManager",
      "physicsEngine",
      "player",
    ];
    const issues = [];

    for (const system of criticalSystems) {
      if (!this.gameEngine[system]) {
        issues.push(`Critical system not initialized: ${system}`);
      }
    }

    const isHealthy = issues.length === 0;

    console.log(`System Health: ${isHealthy ? "HEALTHY" : "UNHEALTHY"}`);
    if (!isHealthy) {
      issues.forEach((issue) => console.error(`  ❌ ${issue}`));
    }

    return { healthy: isHealthy, issues };
  }
}

// Export for use in main game
window.SystemValidator = SystemValidator;
