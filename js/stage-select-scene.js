/**
 * Stage Select Scene Implementation
 * Handles stage selection UI with unlocked stages and best scores
 */

/**
 * StageSelectScene Class
 * Manages the stage selection screen interface
 */
class StageSelectScene extends Scene {
  constructor(gameEngine) {
    super("stageSelect", gameEngine);

    // Stage selection state
    this.selectedStage = 1;
    this.unlockedStages = [1];
    this.stageData = [];
    this.maxStages = 10; // Total number of stages planned

    // UI elements
    this.stageButtons = [];
    this.hoveredStage = null;
    this.backButton = null;

    // Animation and visual effects
    this.backgroundAnimation = 0;
    this.selectionAnimation = 0;
    this.scrollOffset = 0;
    this.targetScrollOffset = 0;

    // Layout configuration
    this.stagesPerRow = 4;
    this.stageButtonSize = 80;
    this.stageButtonSpacing = 100;
    this.startX = 0;
    this.startY = 150;

    console.log("StageSelectScene initialized");
  }

  /**
   * Initialize the stage select scene
   */
  init(data = {}) {
    super.init(data);

    // Load stage data from save system
    this.loadStageData();

    // Create UI elements
    this.createUIElements();

    // Set up event listeners
    this.setupEventListeners();

    // Set initial selected stage
    this.selectedStage = this.getLastPlayedStage();
  }

  /**
   * Enter the stage select scene
   */
  enter(data = {}) {
    super.enter(data);

    // Refresh stage data
    this.loadStageData();
    this.updateStageButtons();

    // Reset animations
    this.backgroundAnimation = 0;
    this.selectionAnimation = 0;
  }

  /**
   * Load stage data from save system
   */
  loadStageData() {
    const saveSystem = this.gameEngine.getSaveSystem();
    if (saveSystem) {
      this.unlockedStages = saveSystem.getUnlockedStages();

      // Load stage information
      this.stageData = [];
      for (let i = 1; i <= this.maxStages; i++) {
        const isUnlocked = this.unlockedStages.includes(i);
        const bestScore = saveSystem.getBestScore(i);
        const bestTime = saveSystem.getBestTime(i);

        this.stageData.push({
          number: i,
          name: `Stage ${i}`,
          unlocked: isUnlocked,
          bestScore: bestScore,
          bestTime: bestTime,
          completed: bestScore > 0,
        });
      }
    } else {
      // Fallback data
      this.unlockedStages = [1];
      this.stageData = [];
      for (let i = 1; i <= this.maxStages; i++) {
        this.stageData.push({
          number: i,
          name: `Stage ${i}`,
          unlocked: i === 1,
          bestScore: 0,
          bestTime: null,
          completed: false,
        });
      }
    }

    console.log(
      `Loaded ${this.stageData.length} stages, ${this.unlockedStages.length} unlocked`
    );
  }

  /**
   * Get the last played stage
   */
  getLastPlayedStage() {
    const saveSystem = this.gameEngine.getSaveSystem();
    if (saveSystem) {
      const saveData = saveSystem.getSaveData();
      return saveData.gameProgress.lastPlayedStage || 1;
    }
    return 1;
  }

  /**
   * Create UI elements
   */
  createUIElements() {
    const canvas = this.gameEngine.canvas;
    const centerX = canvas.width / 2;

    // Calculate layout
    this.startX =
      centerX -
      (this.stagesPerRow * this.stageButtonSpacing) / 2 +
      this.stageButtonSpacing / 2;

    // Create stage buttons
    this.createStageButtons();

    // Create back button
    this.backButton = {
      x: 50,
      y: canvas.height - 80,
      width: 120,
      height: 40,
      text: "Back to Menu",
    };
  }

  /**
   * Create stage selection buttons
   */
  createStageButtons() {
    this.stageButtons = [];

    for (let i = 0; i < this.stageData.length; i++) {
      const stage = this.stageData[i];
      const row = Math.floor(i / this.stagesPerRow);
      const col = i % this.stagesPerRow;

      const x = this.startX + col * this.stageButtonSpacing;
      const y = this.startY + row * (this.stageButtonSpacing + 20);

      this.stageButtons.push({
        ...stage,
        x: x,
        y: y,
        width: this.stageButtonSize,
        height: this.stageButtonSize,
        index: i,
      });
    }
  }

  /**
   * Update stage buttons with current data
   */
  updateStageButtons() {
    for (
      let i = 0;
      i < this.stageButtons.length && i < this.stageData.length;
      i++
    ) {
      const button = this.stageButtons[i];
      const stage = this.stageData[i];

      button.unlocked = stage.unlocked;
      button.bestScore = stage.bestScore;
      button.bestTime = stage.bestTime;
      button.completed = stage.completed;
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
   */
  handleMouseMove(mouseX, mouseY) {
    this.hoveredStage = null;

    // Check stage button hover
    for (const button of this.stageButtons) {
      if (this.isPointInStageButton(mouseX, mouseY, button)) {
        this.hoveredStage = button.number;
        break;
      }
    }

    // Check back button hover
    if (this.isPointInButton(mouseX, mouseY, this.backButton)) {
      this.hoveredStage = "back";
    }
  }

  /**
   * Handle mouse clicks
   */
  handleMouseClick(mouseX, mouseY) {
    // Check stage button clicks
    for (const button of this.stageButtons) {
      if (this.isPointInStageButton(mouseX, mouseY, button)) {
        if (button.unlocked) {
          this.selectStage(button.number);
        } else {
          this.showLockedStageMessage(button.number);
        }
        return;
      }
    }

    // Check back button click
    if (this.isPointInButton(mouseX, mouseY, this.backButton)) {
      this.goBackToMenu();
      return;
    }
  }

  /**
   * Check if point is in stage button
   */
  isPointInStageButton(x, y, button) {
    return (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y + this.scrollOffset &&
      y <= button.y + button.height + this.scrollOffset
    );
  }

  /**
   * Check if point is in button
   */
  isPointInButton(x, y, button) {
    return (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    );
  }

  /**
   * Select a stage and start the game
   */
  selectStage(stageNumber) {
    console.log(`Selected stage ${stageNumber}`);

    this.selectedStage = stageNumber;

    // Play selection sound
    const audioManager = this.gameEngine.getAudioManager();
    if (audioManager) {
      audioManager.playSound("coin"); // Reuse coin sound for selection
    }

    // Start the selected stage
    this.startStage(stageNumber);
  }

  /**
   * Start the selected stage
   */
  startStage(stageNumber) {
    // Update game state
    if (this.gameEngine.gameState) {
      this.gameEngine.gameState.currentStage = stageNumber;
    }

    // Save the selected stage as last played
    const saveSystem = this.gameEngine.getSaveSystem();
    if (saveSystem) {
      const saveData = saveSystem.getSaveData();
      saveData.gameProgress.lastPlayedStage = stageNumber;
      saveSystem.saveSaveData();
    }

    // Transition to game scene
    if (this.gameEngine.sceneManager) {
      this.gameEngine.sceneManager.changeScene("game", {
        newGame: true,
        selectedStage: stageNumber,
      });
    }
  }

  /**
   * Show message for locked stage
   */
  showLockedStageMessage(stageNumber) {
    console.log(`Stage ${stageNumber} is locked`);

    // Play error sound
    const audioManager = this.gameEngine.getAudioManager();
    if (audioManager) {
      audioManager.playSound("error"); // Would need to add this sound
    }

    // Show message (could be implemented with a UI system)
    if (this.gameEngine.uiSystem) {
      this.gameEngine.uiSystem.showMessage(
        `Stage ${stageNumber} is locked!`,
        2000,
        "warning"
      );
    }
  }

  /**
   * Go back to main menu
   */
  goBackToMenu() {
    if (this.gameEngine.sceneManager) {
      this.gameEngine.sceneManager.changeScene("menu");
    }
  }

  /**
   * Update stage select scene
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update animations
    this.backgroundAnimation += deltaTime * 0.001;
    this.selectionAnimation += deltaTime * 0.005;

    // Update scroll offset (smooth scrolling)
    const scrollDiff = this.targetScrollOffset - this.scrollOffset;
    if (Math.abs(scrollDiff) > 1) {
      this.scrollOffset += scrollDiff * 0.1;
    } else {
      this.scrollOffset = this.targetScrollOffset;
    }

    // Handle keyboard input
    this.handleKeyboardInput();
  }

  /**
   * Handle keyboard input
   */
  handleKeyboardInput() {
    const inputManager = this.gameEngine.getInputManager();
    if (!inputManager) return;

    const input = inputManager.getPlayerInput();

    // ESC to go back
    if (input.escape) {
      this.goBackToMenu();
    }

    // Arrow keys for navigation
    if (input.left) {
      this.navigateStage(-1);
    }
    if (input.right) {
      this.navigateStage(1);
    }
    if (input.up) {
      this.navigateStage(-this.stagesPerRow);
    }
    if (input.down) {
      this.navigateStage(this.stagesPerRow);
    }

    // Enter/Space to select stage
    if (input.jump || input.enter) {
      const selectedStageData = this.stageData.find(
        (s) => s.number === this.selectedStage
      );
      if (selectedStageData && selectedStageData.unlocked) {
        this.selectStage(this.selectedStage);
      }
    }
  }

  /**
   * Navigate between stages with keyboard
   */
  navigateStage(direction) {
    const currentIndex = this.selectedStage - 1;
    const newIndex = Math.max(
      0,
      Math.min(this.stageData.length - 1, currentIndex + direction)
    );

    if (newIndex !== currentIndex) {
      this.selectedStage = newIndex + 1;

      // Update scroll if needed
      const row = Math.floor(newIndex / this.stagesPerRow);
      const targetY = this.startY + row * (this.stageButtonSpacing + 20);

      // Simple scroll logic (could be improved)
      if (targetY < -this.scrollOffset + 100) {
        this.targetScrollOffset = -(targetY - 100);
      } else if (
        targetY >
        -this.scrollOffset + this.gameEngine.canvas.height - 200
      ) {
        this.targetScrollOffset = -(
          targetY -
          this.gameEngine.canvas.height +
          200
        );
      }
    }
  }

  /**
   * Render the stage select scene
   */
  render(ctx) {
    if (!this.isActive) return;

    const canvas = this.gameEngine.canvas;

    // Draw background
    this.renderBackground(ctx, canvas);

    // Draw title
    this.renderTitle(ctx, canvas);

    // Save context for scrolling
    ctx.save();
    ctx.translate(0, this.scrollOffset);

    // Draw stage buttons
    this.renderStageButtons(ctx);

    // Restore context
    ctx.restore();

    // Draw UI elements (not affected by scroll)
    this.renderUI(ctx, canvas);

    // Draw instructions
    this.renderInstructions(ctx, canvas);
  }

  /**
   * Render background
   */
  renderBackground(ctx, canvas) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#2E8B57"); // Sea green
    gradient.addColorStop(1, "#4682B4"); // Steel blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 20; i++) {
      const x = (i * 37 + this.backgroundAnimation * 20) % (canvas.width + 50);
      const y = 30 + ((i * 23) % (canvas.height - 60));
      const size = 1 + Math.sin(this.backgroundAnimation + i * 0.5) * 1;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render title
   */
  renderTitle(ctx, canvas) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select Stage", canvas.width / 2, 60);

    // Subtitle
    ctx.font = "18px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(
      `${this.unlockedStages.length} of ${this.maxStages} stages unlocked`,
      canvas.width / 2,
      90
    );
  }

  /**
   * Render stage selection buttons
   */
  renderStageButtons(ctx) {
    for (const button of this.stageButtons) {
      const isHovered = this.hoveredStage === button.number;
      const isSelected = this.selectedStage === button.number;

      // Button background
      let bgColor;
      if (!button.unlocked) {
        bgColor = "rgba(100, 100, 100, 0.5)"; // Locked
      } else if (button.completed) {
        bgColor = isHovered
          ? "rgba(50, 205, 50, 0.9)"
          : "rgba(50, 205, 50, 0.7)"; // Completed
      } else {
        bgColor = isHovered
          ? "rgba(255, 255, 255, 0.9)"
          : "rgba(255, 255, 255, 0.7)"; // Available
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(button.x, button.y, button.width, button.height);

      // Button border
      let borderColor = "#FFFFFF";
      if (isSelected) {
        borderColor = "#FFD700"; // Gold for selected
      } else if (isHovered) {
        borderColor = "#FFA500"; // Orange for hovered
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(button.x, button.y, button.width, button.height);

      // Stage number
      ctx.fillStyle = button.unlocked ? "#000000" : "#666666";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        button.number.toString(),
        button.x + button.width / 2,
        button.y + button.height / 2 + 8
      );

      // Lock icon for locked stages
      if (!button.unlocked) {
        ctx.fillStyle = "#666666";
        ctx.font = "20px Arial";
        ctx.fillText(
          "🔒",
          button.x + button.width / 2,
          button.y + button.height - 15
        );
      }

      // Completion star for completed stages
      if (button.completed) {
        ctx.fillStyle = "#FFD700";
        ctx.font = "16px Arial";
        ctx.fillText("⭐", button.x + button.width - 15, button.y + 15);
      }

      // Best score (if completed)
      if (button.completed && button.bestScore > 0) {
        ctx.fillStyle = "#000000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `Best: ${button.bestScore}`,
          button.x + button.width / 2,
          button.y + button.height + 15
        );
      }
    }
  }

  /**
   * Render UI elements
   */
  renderUI(ctx, canvas) {
    // Back button
    const isBackHovered = this.hoveredStage === "back";

    ctx.fillStyle = isBackHovered
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(
      this.backButton.x,
      this.backButton.y,
      this.backButton.width,
      this.backButton.height
    );

    ctx.strokeStyle = isBackHovered ? "#FFD700" : "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.backButton.x,
      this.backButton.y,
      this.backButton.width,
      this.backButton.height
    );

    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      this.backButton.text,
      this.backButton.x + this.backButton.width / 2,
      this.backButton.y + this.backButton.height / 2 + 5
    );

    // Selected stage info
    if (this.selectedStage) {
      const selectedStageData = this.stageData.find(
        (s) => s.number === this.selectedStage
      );
      if (selectedStageData) {
        this.renderStageInfo(ctx, canvas, selectedStageData);
      }
    }
  }

  /**
   * Render selected stage information
   */
  renderStageInfo(ctx, canvas, stageData) {
    const infoX = canvas.width - 250;
    const infoY = 150;
    const infoWidth = 200;
    const infoHeight = 150;

    // Info panel background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(infoX, infoY, infoWidth, infoHeight);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);

    // Stage info text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";

    let textY = infoY + 25;
    ctx.fillText(stageData.name, infoX + 10, textY);

    textY += 25;
    ctx.font = "14px Arial";
    ctx.fillText(
      `Status: ${
        stageData.unlocked
          ? stageData.completed
            ? "Completed"
            : "Available"
          : "Locked"
      }`,
      infoX + 10,
      textY
    );

    if (stageData.completed) {
      textY += 20;
      ctx.fillText(`Best Score: ${stageData.bestScore}`, infoX + 10, textY);

      if (stageData.bestTime) {
        textY += 20;
        ctx.fillText(
          `Best Time: ${Math.ceil(stageData.bestTime)}s`,
          infoX + 10,
          textY
        );
      }
    }

    if (stageData.unlocked) {
      textY += 30;
      ctx.fillStyle = "#00FF00";
      ctx.fillText("Press ENTER to play", infoX + 10, textY);
    }
  }

  /**
   * Render instructions
   */
  renderInstructions(ctx, canvas) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    const instructionsY = canvas.height - 20;
    ctx.fillText(
      "Arrow keys to navigate • ENTER to select • ESC to go back",
      canvas.width / 2,
      instructionsY
    );
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

    super.destroy();
  }
}
