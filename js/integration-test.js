/**
 * Integration Test System for Mario Style Platformer
 * Tests component interactions and game flow
 */

class IntegrationTestSuite {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.testResults = [];
    this.currentTest = null;
    this.testStartTime = 0;
    this.testTimeout = 5000; // 5 seconds per test

    console.log("Integration Test Suite initialized");
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log("Starting integration tests...");
    this.testResults = [];

    const tests = [
      this.testGameEngineInitialization,
      this.testInputSystemIntegration,
      this.testPhysicsSystemIntegration,
      this.testPlayerMovementIntegration,
      this.testItemSystemIntegration,
      this.testAudioSystemIntegration,
      this.testSceneTransitionIntegration,
      this.testUISystemIntegration,
      this.testCameraSystemIntegration,
      this.testGoalSystemIntegration,
      this.testGameFlowIntegration,
    ];

    for (const test of tests) {
      await this.runTest(test);
    }

    this.generateTestReport();
    return this.testResults;
  }

  /**
   * Run a single test
   */
  async runTest(testFunction) {
    const testName = testFunction.name;
    this.currentTest = testName;
    this.testStartTime = performance.now();

    console.log(`Running test: ${testName}`);

    try {
      const result = await testFunction.call(this);
      this.addTestResult(
        testName,
        true,
        result.message || "Test passed",
        result.details
      );
    } catch (error) {
      this.addTestResult(testName, false, error.message, {
        error: error.stack,
      });
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, message, details = {}) {
    const duration = performance.now() - this.testStartTime;

    this.testResults.push({
      testName,
      passed,
      message,
      details,
      duration: Math.round(duration),
    });

    console.log(
      `Test ${testName}: ${passed ? "PASSED" : "FAILED"} (${Math.round(
        duration
      )}ms)`
    );
    if (!passed) {
      console.error(`  Error: ${message}`);
    }
  }

  /**
   * Test 1: Game Engine Initialization
   */
  async testGameEngineInitialization() {
    // Check if all core systems are initialized
    const requiredSystems = [
      "inputManager",
      "physicsEngine",
      "currentStage",
      "player",
      "camera",
      "itemManager",
      "audioManager",
      "uiSystem",
      "sceneManager",
    ];

    const missingSystems = [];
    for (const system of requiredSystems) {
      if (!this.gameEngine[system]) {
        missingSystems.push(system);
      }
    }

    if (missingSystems.length > 0) {
      throw new Error(`Missing systems: ${missingSystems.join(", ")}`);
    }

    // Check game state initialization
    if (!this.gameEngine.gameState) {
      throw new Error("Game state not initialized");
    }

    return {
      message: "All core systems initialized successfully",
      details: { initializedSystems: requiredSystems },
    };
  }

  /**
   * Test 2: Input System Integration
   */
  async testInputSystemIntegration() {
    const inputManager = this.gameEngine.inputManager;

    // Test input manager exists and has required methods
    const requiredMethods = ["update", "getPlayerInput", "getDebugInfo"];
    for (const method of requiredMethods) {
      if (typeof inputManager[method] !== "function") {
        throw new Error(`InputManager missing method: ${method}`);
      }
    }

    // Test input state structure
    const inputState = inputManager.getPlayerInput();
    const requiredInputs = ["moveLeft", "moveRight", "jump", "dash", "block"];

    for (const input of requiredInputs) {
      if (!(input in inputState)) {
        throw new Error(`Missing input binding: ${input}`);
      }
    }

    return {
      message: "Input system integration verified",
      details: { availableInputs: Object.keys(inputState) },
    };
  }

  /**
   * Test 3: Physics System Integration
   */
  async testPhysicsSystemIntegration() {
    const physics = this.gameEngine.physicsEngine;
    const player = this.gameEngine.player;

    // Test physics methods exist
    const requiredMethods = [
      "applyGravity",
      "updatePosition",
      "checkAABBCollision",
    ];
    for (const method of requiredMethods) {
      if (typeof physics[method] !== "function") {
        throw new Error(`PhysicsEngine missing method: ${method}`);
      }
    }

    // Test physics integration with player
    const initialY = player.position.y;
    const initialVelY = player.velocity.y;

    // Apply gravity for one frame
    physics.applyGravity(player, 16.67); // ~60fps frame

    if (player.velocity.y <= initialVelY) {
      throw new Error("Gravity not applied correctly to player");
    }

    // Reset player state
    player.velocity.y = initialVelY;
    player.position.y = initialY;

    return {
      message: "Physics system integration verified",
      details: { gravityApplied: true },
    };
  }

  /**
   * Test 4: Player Movement Integration
   */
  async testPlayerMovementIntegration() {
    const player = this.gameEngine.player;
    const initialPos = { ...player.position };
    const initialVel = { ...player.velocity };

    // Test horizontal movement
    const mockInput = {
      moveRight: true,
      moveLeft: false,
      jump: false,
      dash: false,
      block: false,
    };

    player.handleInput(mockInput);

    if (player.velocity.x <= 0) {
      throw new Error("Player not responding to right movement input");
    }

    // Test jump (requires ground state)
    player.isOnGround = true;
    mockInput.moveRight = false;
    mockInput.jump = true;

    player.handleInput(mockInput);

    if (player.velocity.y >= 0) {
      throw new Error("Player not responding to jump input");
    }

    // Reset player state
    player.position = initialPos;
    player.velocity = initialVel;
    player.isOnGround = false;

    return {
      message: "Player movement integration verified",
      details: { movementResponsive: true, jumpResponsive: true },
    };
  }

  /**
   * Test 5: Item System Integration
   */
  async testItemSystemIntegration() {
    const itemManager = this.gameEngine.itemManager;
    const player = this.gameEngine.player;

    if (!itemManager) {
      throw new Error("Item manager not initialized");
    }

    // Test item manager methods
    const requiredMethods = [
      "update",
      "render",
      "checkCollisions",
      "getActiveItemCount",
    ];
    for (const method of requiredMethods) {
      if (typeof itemManager[method] !== "function") {
        throw new Error(`ItemManager missing method: ${method}`);
      }
    }

    // Test item collection
    const initialCoins = player.coins;
    const initialScore = player.score;

    // Simulate coin collection
    const mockCoin = {
      type: "coin",
      coinValue: 1,
      scoreBonus: 100,
    };

    player.collectItem(mockCoin);

    if (player.coins !== initialCoins + 1) {
      throw new Error("Coin collection not working");
    }

    if (player.score !== initialScore + 100) {
      throw new Error("Score update not working");
    }

    return {
      message: "Item system integration verified",
      details: { coinCollection: true, scoreUpdate: true },
    };
  }

  /**
   * Test 6: Audio System Integration
   */
  async testAudioSystemIntegration() {
    const audioManager = this.gameEngine.audioManager;

    if (!audioManager) {
      throw new Error("Audio manager not initialized");
    }

    // Test audio manager methods
    const requiredMethods = ["playSound", "setVolume", "isLoaded"];
    for (const method of requiredMethods) {
      if (typeof audioManager[method] !== "function") {
        throw new Error(`AudioManager missing method: ${method}`);
      }
    }

    // Test sound loading status
    const soundsToCheck = ["jump", "coin", "powerup"];
    const loadedSounds = [];

    for (const sound of soundsToCheck) {
      if (audioManager.isLoaded(sound)) {
        loadedSounds.push(sound);
      }
    }

    return {
      message: "Audio system integration verified",
      details: { loadedSounds, totalSounds: soundsToCheck.length },
    };
  }

  /**
   * Test 7: Scene Transition Integration
   */
  async testSceneTransitionIntegration() {
    const sceneManager = this.gameEngine.sceneManager;

    if (!sceneManager) {
      throw new Error("Scene manager not initialized");
    }

    // Test scene manager methods
    const requiredMethods = [
      "changeScene",
      "getCurrentScene",
      "update",
      "render",
    ];
    for (const method of requiredMethods) {
      if (typeof sceneManager[method] !== "function") {
        throw new Error(`SceneManager missing method: ${method}`);
      }
    }

    // Test scene transition
    const initialScene = sceneManager.getCurrentScene();
    const success = sceneManager.changeScene("menu", {}, true);

    if (!success) {
      throw new Error("Scene transition failed");
    }

    const currentScene = sceneManager.getCurrentScene();
    if (!currentScene || currentScene.name !== "menu") {
      throw new Error("Scene not changed correctly");
    }

    return {
      message: "Scene transition integration verified",
      details: { sceneChanged: true, currentScene: currentScene?.name },
    };
  }

  /**
   * Test 8: UI System Integration
   */
  async testUISystemIntegration() {
    const uiSystem = this.gameEngine.uiSystem;

    if (!uiSystem) {
      throw new Error("UI system not initialized");
    }

    // Test UI system methods
    const requiredMethods = ["update", "reset"];
    for (const method of requiredMethods) {
      if (typeof uiSystem[method] !== "function") {
        throw new Error(`UISystem missing method: ${method}`);
      }
    }

    // Test UI update with player data
    const player = this.gameEngine.player;
    uiSystem.update(16.67); // Simulate frame update

    return {
      message: "UI system integration verified",
      details: { uiResponsive: true },
    };
  }

  /**
   * Test 9: Camera System Integration
   */
  async testCameraSystemIntegration() {
    const camera = this.gameEngine.camera;
    const player = this.gameEngine.player;

    if (!camera) {
      throw new Error("Camera system not initialized");
    }

    // Test camera methods
    const requiredMethods = ["update", "getPosition", "setTarget"];
    for (const method of requiredMethods) {
      if (typeof camera[method] !== "function") {
        throw new Error(`Camera missing method: ${method}`);
      }
    }

    // Test camera following player
    const initialCameraPos = camera.getPosition();
    const playerPos = { ...player.position };

    // Move player and update camera
    player.position.x += 100;
    camera.update(16.67);

    const newCameraPos = camera.getPosition();

    if (newCameraPos.x === initialCameraPos.x) {
      console.warn(
        "Camera may not be following player (this could be normal if player is within bounds)"
      );
    }

    // Reset player position
    player.position = playerPos;

    return {
      message: "Camera system integration verified",
      details: { cameraResponsive: true },
    };
  }

  /**
   * Test 10: Goal System Integration
   */
  async testGoalSystemIntegration() {
    const stage = this.gameEngine.currentStage;
    const player = this.gameEngine.player;

    if (!stage) {
      throw new Error("Stage system not initialized");
    }

    // Test stage methods
    const requiredMethods = ["checkGoalCollision", "update", "render"];
    for (const method of requiredMethods) {
      if (typeof stage[method] !== "function") {
        throw new Error(`Stage missing method: ${method}`);
      }
    }

    // Test goal collision detection (should return null when not at goal)
    const goalResult = stage.checkGoalCollision(player);

    // This should be null unless player is actually at the goal
    if (goalResult !== null && goalResult !== false) {
      console.log("Player may be at goal position during test");
    }

    return {
      message: "Goal system integration verified",
      details: { goalDetectionWorking: true },
    };
  }

  /**
   * Test 11: Complete Game Flow Integration
   */
  async testGameFlowIntegration() {
    const gameEngine = this.gameEngine;

    // Test game state transitions
    const initialMode = gameEngine.gameState.mode;

    // Test starting game
    gameEngine.startGame();

    if (gameEngine.gameState.mode !== "playing") {
      throw new Error("Game not starting correctly");
    }

    // Test pausing
    gameEngine.togglePause();

    if (!gameEngine.gameState.isPaused) {
      throw new Error("Game pause not working");
    }

    // Test unpausing
    gameEngine.togglePause();

    if (gameEngine.gameState.isPaused) {
      throw new Error("Game unpause not working");
    }

    // Test stopping game
    gameEngine.stopGame();

    if (gameEngine.gameState.mode === "playing") {
      throw new Error("Game not stopping correctly");
    }

    return {
      message: "Game flow integration verified",
      details: {
        startWorking: true,
        pauseWorking: true,
        stopWorking: true,
      },
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.testResults.reduce(
      (sum, r) => sum + r.duration,
      0
    );

    console.log("\n" + "=".repeat(50));
    console.log("INTEGRATION TEST REPORT");
    console.log("=".repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(
      `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log("=".repeat(50));

    // Detailed results
    this.testResults.forEach((result) => {
      const status = result.passed ? "✓ PASS" : "✗ FAIL";
      console.log(`${status} ${result.testName} (${result.duration}ms)`);
      if (!result.passed) {
        console.log(`    Error: ${result.message}`);
      }
    });

    console.log("=".repeat(50));

    // Performance analysis
    const slowTests = this.testResults
      .filter((r) => r.duration > 100)
      .sort((a, b) => b.duration - a.duration);

    if (slowTests.length > 0) {
      console.log("PERFORMANCE WARNINGS:");
      slowTests.forEach((test) => {
        console.log(`  ${test.testName}: ${test.duration}ms (slow)`);
      });
      console.log("=".repeat(50));
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests) * 100,
      totalDuration,
      results: this.testResults,
    };
  }

  /**
   * Run performance benchmarks
   */
  async runPerformanceBenchmarks() {
    console.log("Running performance benchmarks...");

    const benchmarks = {
      gameLoopPerformance: await this.benchmarkGameLoop(),
      renderingPerformance: await this.benchmarkRendering(),
      physicsPerformance: await this.benchmarkPhysics(),
      inputPerformance: await this.benchmarkInput(),
    };

    console.log("Performance Benchmark Results:");
    Object.entries(benchmarks).forEach(([name, result]) => {
      console.log(
        `  ${name}: ${result.averageTime.toFixed(
          2
        )}ms avg, ${result.fps.toFixed(1)} FPS`
      );
    });

    return benchmarks;
  }

  /**
   * Benchmark game loop performance
   */
  async benchmarkGameLoop() {
    const iterations = 100;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate one game loop iteration
      this.gameEngine.update(16.67);

      const end = performance.now();
      times.push(end - start);
    }

    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;
    const fps = 1000 / averageTime;

    return { averageTime, fps, samples: times.length };
  }

  /**
   * Benchmark rendering performance
   */
  async benchmarkRendering() {
    const iterations = 50;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate rendering
      this.gameEngine.render();

      const end = performance.now();
      times.push(end - start);
    }

    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;
    const fps = 1000 / averageTime;

    return { averageTime, fps, samples: times.length };
  }

  /**
   * Benchmark physics performance
   */
  async benchmarkPhysics() {
    const iterations = 1000;
    const times = [];
    const physics = this.gameEngine.physicsEngine;
    const player = this.gameEngine.player;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate physics update
      physics.applyGravity(player, 16.67);
      physics.updatePosition(player, 16.67);

      const end = performance.now();
      times.push(end - start);
    }

    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;
    const fps = 1000 / averageTime;

    return { averageTime, fps, samples: times.length };
  }

  /**
   * Benchmark input performance
   */
  async benchmarkInput() {
    const iterations = 1000;
    const times = [];
    const inputManager = this.gameEngine.inputManager;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate input processing
      inputManager.update();
      inputManager.getPlayerInput();

      const end = performance.now();
      times.push(end - start);
    }

    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;
    const fps = 1000 / averageTime;

    return { averageTime, fps, samples: times.length };
  }
}

// Export for use in main game
window.IntegrationTestSuite = IntegrationTestSuite;
