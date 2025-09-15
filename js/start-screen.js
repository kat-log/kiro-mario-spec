/**
 * Start Screen Implementation
 * Handles menu screen with start and settings buttons
 */

/**
 * StartScreen Class
 * Manages the main menu interface and navigation
 */
class StartScreen {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;

    // Menu state
    this.isActive = false;
    this.selectedOption = 0; // 0: Start, 1: Stage Select, 2: Settings
    this.menuOptions = ["Start Game", "Stage Select", "Settings"];

    // Button properties
    this.buttons = [];
    this.hoveredButton = -1;

    // Animation properties
    this.titleAnimation = 0;
    this.backgroundAnimation = 0;

    // Initialize menu
    this.init();

    console.log("StartScreen initialized");
  }

  /**
   * Initialize the start screen
   */
  init() {
    // Create button objects
    this.createButtons();

    // Set up mouse event listeners
    this.setupEventListeners();
  }

  /**
   * Create menu buttons
   */
  createButtons() {
    const canvas = this.gameEngine.canvas;
    const centerX = canvas.width / 2;
    const startY = canvas.height / 2 + 50;
    const buttonSpacing = 80;

    this.buttons = [];

    for (let i = 0; i < this.menuOptions.length; i++) {
      this.buttons.push({
        text: this.menuOptions[i],
        x: centerX - 100, // Button width will be 200
        y: startY + i * buttonSpacing,
        width: 200,
        height: 50,
        hovered: false,
        pressed: false,
      });
    }
  }

  /**
   * Set up event listeners for mouse interaction
   */
  setupEventListeners() {
    const canvas = this.gameEngine.canvas;

    // Mouse move handler
    this.mouseMoveHandler = (event) => {
      if (!this.isActive) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.handleMouseMove(mouseX, mouseY);
    };

    // Mouse click handler
    this.mouseClickHandler = (event) => {
      if (!this.isActive) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.handleMouseClick(mouseX, mouseY);
    };

    // Add event listeners
    canvas.addEventListener("mousemove", this.mouseMoveHandler);
    canvas.addEventListener("click", this.mouseClickHandler);
  }

  /**
   * Handle mouse movement
   * @param {number} mouseX - Mouse X coordinate
   * @param {number} mouseY - Mouse Y coordinate
   */
  handleMouseMove(mouseX, mouseY) {
    this.hoveredButton = -1;

    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];

      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
      ) {
        this.hoveredButton = i;
        this.selectedOption = i;
        break;
      }
    }
  }

  /**
   * Handle mouse clicks
   * @param {number} mouseX - Mouse X coordinate
   * @param {number} mouseY - Mouse Y coordinate
   */
  handleMouseClick(mouseX, mouseY) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];

      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
      ) {
        this.selectOption(i);
        break;
      }
    }
  }

  /**
   * Update start screen logic
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update animations
    this.titleAnimation += deltaTime * 0.002;
    this.backgroundAnimation += deltaTime * 0.001;

    // Handle keyboard input
    this.handleKeyboardInput();
  }

  /**
   * Handle keyboard input for menu navigation
   */
  handleKeyboardInput() {
    const inputManager = this.gameEngine.getInputManager();
    if (!inputManager) return;

    const input = inputManager.getPlayerInput();

    // Navigate menu with arrow keys
    if (
      inputManager.isKeyPressed("ArrowUp") ||
      inputManager.isKeyPressed("KeyW")
    ) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
    }

    if (
      inputManager.isKeyPressed("ArrowDown") ||
      inputManager.isKeyPressed("KeyS")
    ) {
      this.selectedOption = Math.min(
        this.menuOptions.length - 1,
        this.selectedOption + 1
      );
    }

    // Select option with Enter or Space
    if (input.jump || input.enter) {
      this.selectOption(this.selectedOption);
    }
  }

  /**
   * Select a menu option
   * @param {number} optionIndex - Index of the selected option
   */
  selectOption(optionIndex) {
    switch (optionIndex) {
      case 0: // Start Game
        this.startGame();
        break;
      case 1: // Stage Select
        this.openStageSelect();
        break;
      case 2: // Settings
        this.openSettings();
        break;
    }
  }

  /**
   * Start the game
   */
  startGame() {
    console.log("Starting game from menu");
    this.isActive = false;

    // Use scene manager if available, otherwise fallback to direct method
    if (this.gameEngine.sceneManager) {
      this.gameEngine.sceneManager.changeScene("game", { newGame: true });
    } else {
      this.gameEngine.startGame();
    }
  }

  /**
   * Open stage select screen
   */
  openStageSelect() {
    console.log("Opening stage select");

    // Use scene manager if available and stage select scene exists
    if (
      this.gameEngine.sceneManager &&
      this.gameEngine.sceneManager.hasScene("stageSelect")
    ) {
      this.gameEngine.sceneManager.changeScene("stageSelect");
    } else {
      // Fallback message for when stage select scene is not implemented
      console.log("Stage select scene not implemented yet");
      if (this.gameEngine.uiSystem) {
        this.gameEngine.uiSystem.showMessage(
          "Stage select coming soon!",
          2000,
          "info"
        );
      }
    }
  }

  /**
   * Open settings screen
   */
  openSettings() {
    console.log("Opening settings");

    // Use scene manager if available and settings scene exists
    if (
      this.gameEngine.sceneManager &&
      this.gameEngine.sceneManager.hasScene("settings")
    ) {
      this.gameEngine.sceneManager.changeScene("settings");
    } else {
      // Fallback message for when settings scene is not implemented
      console.log("Settings scene not implemented yet");
      if (this.gameEngine.uiSystem) {
        this.gameEngine.uiSystem.showMessage(
          "Settings coming soon!",
          2000,
          "info"
        );
      }
    }
  }

  /**
   * Render the start screen
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (!this.isActive) return;

    const canvas = this.gameEngine.canvas;

    // Draw animated background
    this.renderBackground(ctx, canvas);

    // Draw title
    this.renderTitle(ctx, canvas);

    // Draw menu buttons
    this.renderButtons(ctx);

    // Draw instructions
    this.renderInstructions(ctx, canvas);
  }

  /**
   * Render animated background
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  renderBackground(ctx, canvas) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#98FB98");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 5; i++) {
      const x =
        ((i * 200 + this.backgroundAnimation * 20) % (canvas.width + 100)) - 50;
      const y = 100 + Math.sin(this.backgroundAnimation + i) * 20;
      this.drawCloud(ctx, x, y);
    }
  }

  /**
   * Render game title
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  renderTitle(ctx, canvas) {
    // Animated title
    const titleY = 150 + Math.sin(this.titleAnimation) * 5;

    // Title shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Mario Style Platformer", canvas.width / 2 + 3, titleY + 3);

    // Title text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Mario Style Platformer", canvas.width / 2, titleY);

    // Subtitle
    ctx.fillStyle = "#FFD700";
    ctx.font = "20px Arial";
    ctx.fillText("Web Edition", canvas.width / 2, titleY + 40);
  }

  /**
   * Render menu buttons
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderButtons(ctx) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const isSelected = i === this.selectedOption;
      const isHovered = i === this.hoveredButton;

      // Button background
      if (isSelected || isHovered) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
      }

      // Draw button rectangle
      ctx.fillRect(button.x, button.y, button.width, button.height);
      ctx.strokeRect(button.x, button.y, button.width, button.height);

      // Button text
      ctx.fillStyle = isSelected || isHovered ? "#000000" : "#333333";
      ctx.font = isSelected ? "bold 20px Arial" : "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        button.text,
        button.x + button.width / 2,
        button.y + button.height / 2 + 7
      );
    }
  }

  /**
   * Render instructions
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  renderInstructions(ctx, canvas) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    const instructionsY = canvas.height - 80;
    ctx.fillText(
      "Use Arrow Keys or Mouse to Navigate",
      canvas.width / 2,
      instructionsY
    );
    ctx.fillText(
      "Press SPACE or ENTER to Select",
      canvas.width / 2,
      instructionsY + 20
    );
    ctx.fillText("ESC to Exit", canvas.width / 2, instructionsY + 40);
  }

  /**
   * Draw a cloud shape
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawCloud(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 35, y - 15, 18, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Show the start screen
   */
  show() {
    this.isActive = true;
    console.log("Start screen activated");
  }

  /**
   * Hide the start screen
   */
  hide() {
    this.isActive = false;
    console.log("Start screen deactivated");
  }

  /**
   * Check if start screen is active
   * @returns {boolean} - True if active
   */
  isScreenActive() {
    return this.isActive;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    const canvas = this.gameEngine.canvas;
    if (canvas) {
      canvas.removeEventListener("mousemove", this.mouseMoveHandler);
      canvas.removeEventListener("click", this.mouseClickHandler);
    }
  }
}
