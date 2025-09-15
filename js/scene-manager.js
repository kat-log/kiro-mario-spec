/**
 * Scene Manager Implementation
 * Handles scene switching, initialization, and data passing between scenes
 */

/**
 * Base Scene Class
 * All scenes should extend this class
 */
class Scene {
  constructor(name, gameEngine) {
    this.name = name;
    this.gameEngine = gameEngine;
    this.isActive = false;
    this.isInitialized = false;
    this.sceneData = {};
  }

  /**
   * Initialize the scene
   * Called when scene is first created or when entering the scene
   */
  init(data = {}) {
    this.sceneData = { ...data };
    this.isInitialized = true;
    console.log(`Scene '${this.name}' initialized`);
  }

  /**
   * Enter the scene
   * Called when switching to this scene
   */
  enter(data = {}) {
    this.isActive = true;
    this.sceneData = { ...this.sceneData, ...data };
    console.log(`Entered scene '${this.name}'`);
  }

  /**
   * Exit the scene
   * Called when switching away from this scene
   */
  exit() {
    this.isActive = false;
    console.log(`Exited scene '${this.name}'`);
  }

  /**
   * Update scene logic
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    // Override in subclasses
  }

  /**
   * Render the scene
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    // Override in subclasses
  }

  /**
   * Handle input for this scene
   * @param {Object} input - Input state from InputManager
   */
  handleInput(input) {
    // Override in subclasses
  }

  /**
   * Clean up scene resources
   */
  destroy() {
    this.isActive = false;
    this.isInitialized = false;
    console.log(`Scene '${this.name}' destroyed`);
  }

  /**
   * Get scene data
   */
  getData() {
    return { ...this.sceneData };
  }

  /**
   * Set scene data
   */
  setData(data) {
    this.sceneData = { ...this.sceneData, ...data };
  }
}

/**
 * SceneManager Class
 * Manages scene transitions, initialization, and data passing
 */
class SceneManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.scenes = new Map();
    this.currentScene = null;
    this.previousScene = null;
    this.transitionData = {};
    this.isTransitioning = false;
    this.transitionDuration = 300; // milliseconds
    this.transitionStartTime = 0;

    console.log("SceneManager initialized");
  }

  /**
   * Register a scene with the manager
   * @param {string} name - Scene name/identifier
   * @param {Scene} scene - Scene instance
   */
  registerScene(name, scene) {
    if (this.scenes.has(name)) {
      console.warn(`Scene '${name}' is already registered`);
      return;
    }

    this.scenes.set(name, scene);
    console.log(`Scene '${name}' registered`);
  }

  /**
   * Unregister a scene
   * @param {string} name - Scene name to unregister
   */
  unregisterScene(name) {
    const scene = this.scenes.get(name);
    if (scene) {
      scene.destroy();
      this.scenes.delete(name);
      console.log(`Scene '${name}' unregistered`);
    }
  }

  /**
   * Change to a different scene
   * @param {string} sceneName - Name of the scene to switch to
   * @param {Object} data - Data to pass to the new scene
   * @param {boolean} immediate - Whether to skip transition animation
   */
  changeScene(sceneName, data = {}, immediate = false) {
    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      console.error(`Scene '${sceneName}' not found`);
      return false;
    }

    // If already in the target scene, just update data
    if (this.currentScene && this.currentScene.name === sceneName) {
      this.currentScene.setData(data);
      return true;
    }

    // Store transition data
    this.transitionData = data;

    if (immediate) {
      this.performSceneChange(sceneName);
    } else {
      this.startTransition(sceneName);
    }

    return true;
  }

  /**
   * Start scene transition
   * @param {string} sceneName - Target scene name
   */
  startTransition(sceneName) {
    this.isTransitioning = true;
    this.transitionStartTime = performance.now();

    // Perform the actual scene change after a brief delay
    setTimeout(() => {
      this.performSceneChange(sceneName);
    }, this.transitionDuration / 2);
  }

  /**
   * Perform the actual scene change
   * @param {string} sceneName - Target scene name
   */
  performSceneChange(sceneName) {
    const newScene = this.scenes.get(sceneName);

    // Exit current scene
    if (this.currentScene) {
      this.currentScene.exit();
      this.previousScene = this.currentScene;
    }

    // Initialize new scene if needed
    if (!newScene.isInitialized) {
      newScene.init(this.transitionData);
    }

    // Enter new scene
    newScene.enter(this.transitionData);
    this.currentScene = newScene;

    // Update game engine state to match scene
    this.updateGameEngineState(sceneName);

    console.log(`Scene changed to '${sceneName}'`);
  }

  /**
   * Update game engine state based on current scene
   * @param {string} sceneName - Current scene name
   */
  updateGameEngineState(sceneName) {
    // Map scene names to game engine modes
    const sceneToModeMap = {
      menu: "menu",
      game: "playing",
      settings: "menu",
      stageSelect: "menu",
      pause: "paused",
      gameover: "gameover",
      victory: "victory",
    };

    const gameMode = sceneToModeMap[sceneName] || "menu";

    // Update game engine mode if it has the method
    if (this.gameEngine.changeGameMode) {
      this.gameEngine.changeGameMode(gameMode);
    } else if (this.gameEngine.gameState) {
      this.gameEngine.gameState.mode = gameMode;
    }
  }

  /**
   * Go back to the previous scene
   * @param {Object} data - Data to pass to the previous scene
   */
  goBack(data = {}) {
    if (!this.previousScene) {
      console.warn("No previous scene to go back to");
      return false;
    }

    return this.changeScene(this.previousScene.name, data);
  }

  /**
   * Update current scene
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    // Update transition state
    if (this.isTransitioning) {
      const elapsed = performance.now() - this.transitionStartTime;
      if (elapsed >= this.transitionDuration) {
        this.isTransitioning = false;
      }
    }

    // Update current scene
    if (this.currentScene && this.currentScene.isActive) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Render current scene
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    // Render current scene
    if (this.currentScene && this.currentScene.isActive) {
      this.currentScene.render(ctx);
    }

    // Render transition effect if transitioning
    if (this.isTransitioning) {
      this.renderTransition(ctx);
    }
  }

  /**
   * Render transition effect
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderTransition(ctx) {
    const elapsed = performance.now() - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1);

    // Simple fade transition
    let alpha;
    if (progress < 0.5) {
      // Fade out
      alpha = progress * 2;
    } else {
      // Fade in
      alpha = (1 - progress) * 2;
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * Handle input for current scene
   * @param {Object} input - Input state from InputManager
   */
  handleInput(input) {
    if (
      this.currentScene &&
      this.currentScene.isActive &&
      !this.isTransitioning
    ) {
      this.currentScene.handleInput(input);
    }
  }

  /**
   * Get current scene
   * @returns {Scene|null} - Current active scene
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * Get scene by name
   * @param {string} name - Scene name
   * @returns {Scene|null} - Scene instance or null if not found
   */
  getScene(name) {
    return this.scenes.get(name) || null;
  }

  /**
   * Check if a scene exists
   * @param {string} name - Scene name
   * @returns {boolean} - True if scene exists
   */
  hasScene(name) {
    return this.scenes.has(name);
  }

  /**
   * Get all registered scene names
   * @returns {string[]} - Array of scene names
   */
  getSceneNames() {
    return Array.from(this.scenes.keys());
  }

  /**
   * Check if currently transitioning
   * @returns {boolean} - True if transitioning
   */
  isInTransition() {
    return this.isTransitioning;
  }

  /**
   * Set transition duration
   * @param {number} duration - Duration in milliseconds
   */
  setTransitionDuration(duration) {
    this.transitionDuration = Math.max(0, duration);
  }

  /**
   * Get transition progress (0-1)
   * @returns {number} - Transition progress
   */
  getTransitionProgress() {
    if (!this.isTransitioning) return 0;

    const elapsed = performance.now() - this.transitionStartTime;
    return Math.min(elapsed / this.transitionDuration, 1);
  }

  /**
   * Clean up all scenes and resources
   */
  destroy() {
    // Destroy all scenes
    for (const [name, scene] of this.scenes) {
      scene.destroy();
    }

    this.scenes.clear();
    this.currentScene = null;
    this.previousScene = null;
    this.isTransitioning = false;

    console.log("SceneManager destroyed");
  }
}

/**
 * Menu Scene Implementation
 * Wraps the existing StartScreen functionality
 */
class MenuScene extends Scene {
  constructor(gameEngine) {
    super("menu", gameEngine);
    this.startScreen = null;
  }

  init(data = {}) {
    super.init(data);

    // Initialize start screen if not already done
    if (!this.startScreen) {
      this.startScreen = new StartScreen(this.gameEngine);
    }
  }

  enter(data = {}) {
    super.enter(data);

    if (this.startScreen) {
      this.startScreen.show();
    }
  }

  exit() {
    super.exit();

    if (this.startScreen) {
      this.startScreen.hide();
    }
  }

  update(deltaTime) {
    if (this.startScreen && this.isActive) {
      this.startScreen.update(deltaTime);
    }
  }

  render(ctx) {
    if (this.startScreen && this.isActive) {
      this.startScreen.render(ctx);
    }
  }

  handleInput(input) {
    // Input is handled by the StartScreen class
  }

  destroy() {
    if (this.startScreen) {
      this.startScreen.destroy();
      this.startScreen = null;
    }
    super.destroy();
  }
}

/**
 * Game Scene Implementation
 * Handles the main gameplay
 */
class GameScene extends Scene {
  constructor(gameEngine) {
    super("game", gameEngine);
  }

  init(data = {}) {
    super.init(data);

    // Initialize game components if needed
    // This is handled by the existing GameEngine initialization
  }

  enter(data = {}) {
    super.enter(data);

    // Reset game state for new game
    if (data.newGame) {
      this.resetGameState();
    }
  }

  exit() {
    super.exit();

    // Pause the game when leaving
    if (this.gameEngine.gameState) {
      this.gameEngine.gameState.isPaused = true;
    }
  }

  update(deltaTime) {
    // Game update logic is handled by GameEngine.updateGameplay()
    // This is called from the main game loop
  }

  render(ctx) {
    // Game rendering is handled by GameEngine.renderGameplay()
    // This is called from the main game loop
  }

  handleInput(input) {
    // Game input is handled by GameEngine.handleGlobalInput()
    // and individual component input handlers
  }

  resetGameState() {
    // Reset player position and stats
    if (this.gameEngine.player) {
      this.gameEngine.player.reset();
    }

    // Reset game timer
    if (this.gameEngine.gameState) {
      this.gameEngine.gameState.timeRemaining = 300; // 5 minutes
      this.gameEngine.gameState.currentStage = 1;
    }

    // Reset UI
    if (this.gameEngine.uiSystem) {
      this.gameEngine.uiSystem.reset();
    }

    console.log("Game state reset for new game");
  }
}
