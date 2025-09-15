/**
 * Settings Scene Implementation
 * Handles game settings UI with volume controls and save/load functionality
 */

/**
 * SettingsScene Class
 * Manages the settings screen interface
 */
class SettingsScene extends Scene {
  constructor(gameEngine) {
    super("settings", gameEngine);

    // Settings state
    this.settings = {
      masterVolume: 0.7,
      musicVolume: 0.8,
      sfxVolume: 0.9,
      showFPS: false,
      enableParticles: true,
    };

    // UI elements
    this.sliders = [];
    this.buttons = [];
    this.checkboxes = [];
    this.hoveredElement = null;
    this.draggedSlider = null;

    // Animation
    this.backgroundAnimation = 0;

    console.log("SettingsScene initialized");
  }

  /**
   * Initialize the settings scene
   */
  init(data = {}) {
    super.init(data);

    // Load saved settings
    this.loadSettings();

    // Create UI elements
    this.createUIElements();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Enter the settings scene
   */
  enter(data = {}) {
    super.enter(data);

    // Refresh settings from audio manager
    this.syncWithAudioManager();
  }

  /**
   * Create UI elements (sliders, buttons, checkboxes)
   */
  createUIElements() {
    const canvas = this.gameEngine.canvas;
    const centerX = canvas.width / 2;
    const startY = 150;
    const spacing = 80;

    // Clear existing elements
    this.sliders = [];
    this.buttons = [];
    this.checkboxes = [];

    // Volume sliders
    this.sliders.push({
      id: "masterVolume",
      label: "Master Volume",
      x: centerX - 150,
      y: startY,
      width: 200,
      height: 20,
      value: this.settings.masterVolume,
      min: 0,
      max: 1,
    });

    this.sliders.push({
      id: "musicVolume",
      label: "Music Volume",
      x: centerX - 150,
      y: startY + spacing,
      width: 200,
      height: 20,
      value: this.settings.musicVolume,
      min: 0,
      max: 1,
    });

    this.sliders.push({
      id: "sfxVolume",
      label: "SFX Volume",
      x: centerX - 150,
      y: startY + spacing * 2,
      width: 200,
      height: 20,
      value: this.settings.sfxVolume,
      min: 0,
      max: 1,
    });

    // Checkboxes
    this.checkboxes.push({
      id: "showFPS",
      label: "Show FPS",
      x: centerX - 150,
      y: startY + spacing * 3,
      width: 20,
      height: 20,
      checked: this.settings.showFPS,
    });

    this.checkboxes.push({
      id: "enableParticles",
      label: "Enable Particles",
      x: centerX - 150,
      y: startY + spacing * 4,
      width: 20,
      height: 20,
      checked: this.settings.enableParticles,
    });

    // Buttons
    this.buttons.push({
      id: "save",
      text: "Save Settings",
      x: centerX - 200,
      y: startY + spacing * 5.5,
      width: 120,
      height: 40,
    });

    this.buttons.push({
      id: "reset",
      text: "Reset to Default",
      x: centerX - 60,
      y: startY + spacing * 5.5,
      width: 120,
      height: 40,
    });

    this.buttons.push({
      id: "back",
      text: "Back to Menu",
      x: centerX + 80,
      y: startY + spacing * 5.5,
      width: 120,
      height: 40,
    });
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

    // Mouse down handler
    this.mouseDownHandler = (event) => {
      if (!this.isActive) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.handleMouseDown(mouseX, mouseY);
    };

    // Mouse up handler
    this.mouseUpHandler = (event) => {
      if (!this.isActive) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.handleMouseUp(mouseX, mouseY);
    };

    // Add event listeners
    canvas.addEventListener("mousemove", this.mouseMoveHandler);
    canvas.addEventListener("mousedown", this.mouseDownHandler);
    canvas.addEventListener("mouseup", this.mouseUpHandler);
  }

  /**
   * Handle mouse movement
   */
  handleMouseMove(mouseX, mouseY) {
    this.hoveredElement = null;

    // Check slider hover
    for (const slider of this.sliders) {
      if (this.isPointInSlider(mouseX, mouseY, slider)) {
        this.hoveredElement = { type: "slider", element: slider };
        break;
      }
    }

    // Check button hover
    if (!this.hoveredElement) {
      for (const button of this.buttons) {
        if (this.isPointInButton(mouseX, mouseY, button)) {
          this.hoveredElement = { type: "button", element: button };
          break;
        }
      }
    }

    // Check checkbox hover
    if (!this.hoveredElement) {
      for (const checkbox of this.checkboxes) {
        if (this.isPointInCheckbox(mouseX, mouseY, checkbox)) {
          this.hoveredElement = { type: "checkbox", element: checkbox };
          break;
        }
      }
    }

    // Handle slider dragging
    if (this.draggedSlider) {
      this.updateSliderValue(this.draggedSlider, mouseX);
    }
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(mouseX, mouseY) {
    // Check slider interaction
    for (const slider of this.sliders) {
      if (this.isPointInSlider(mouseX, mouseY, slider)) {
        this.draggedSlider = slider;
        this.updateSliderValue(slider, mouseX);
        return;
      }
    }

    // Check button interaction
    for (const button of this.buttons) {
      if (this.isPointInButton(mouseX, mouseY, button)) {
        this.handleButtonClick(button);
        return;
      }
    }

    // Check checkbox interaction
    for (const checkbox of this.checkboxes) {
      if (this.isPointInCheckbox(mouseX, mouseY, checkbox)) {
        this.toggleCheckbox(checkbox);
        return;
      }
    }
  }

  /**
   * Handle mouse up
   */
  handleMouseUp(mouseX, mouseY) {
    this.draggedSlider = null;
  }

  /**
   * Check if point is in slider area
   */
  isPointInSlider(x, y, slider) {
    return (
      x >= slider.x &&
      x <= slider.x + slider.width &&
      y >= slider.y &&
      y <= slider.y + slider.height
    );
  }

  /**
   * Check if point is in button area
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
   * Check if point is in checkbox area (including label)
   */
  isPointInCheckbox(x, y, checkbox) {
    return (
      x >= checkbox.x &&
      x <= checkbox.x + 200 &&
      y >= checkbox.y &&
      y <= checkbox.y + checkbox.height
    );
  }

  /**
   * Update slider value based on mouse position
   */
  updateSliderValue(slider, mouseX) {
    const relativeX = mouseX - slider.x;
    const percentage = Math.max(0, Math.min(1, relativeX / slider.width));
    const newValue = slider.min + (slider.max - slider.min) * percentage;

    slider.value = newValue;
    this.settings[slider.id] = newValue;

    // Apply setting immediately
    this.applySettingChange(slider.id, newValue);
  }

  /**
   * Toggle checkbox state
   */
  toggleCheckbox(checkbox) {
    checkbox.checked = !checkbox.checked;
    this.settings[checkbox.id] = checkbox.checked;

    // Apply setting immediately
    this.applySettingChange(checkbox.id, checkbox.checked);
  }

  /**
   * Handle button clicks
   */
  handleButtonClick(button) {
    switch (button.id) {
      case "save":
        this.saveSettings();
        this.showMessage("Settings saved!", "success");
        break;
      case "reset":
        this.resetToDefaults();
        this.showMessage("Settings reset to defaults", "info");
        break;
      case "back":
        this.goBackToMenu();
        break;
    }
  }

  /**
   * Apply setting change immediately
   */
  applySettingChange(settingId, value) {
    const audioManager = this.gameEngine.getAudioManager();

    switch (settingId) {
      case "masterVolume":
        if (audioManager) {
          audioManager.setMasterVolume(value);
        }
        break;
      case "musicVolume":
        if (audioManager) {
          audioManager.setMusicVolume(value);
        }
        break;
      case "sfxVolume":
        if (audioManager) {
          audioManager.setSFXVolume(value);
        }
        break;
      case "showFPS":
        // This would be handled by the game engine's debug system
        console.log(`FPS display ${value ? "enabled" : "disabled"}`);
        break;
      case "enableParticles":
        // This would be handled by a particle system
        console.log(`Particles ${value ? "enabled" : "disabled"}`);
        break;
    }
  }

  /**
   * Sync settings with audio manager
   */
  syncWithAudioManager() {
    const audioManager = this.gameEngine.getAudioManager();
    if (!audioManager) return;

    // Get current volumes from audio manager
    this.settings.masterVolume = audioManager.getMasterVolume() || 0.7;
    this.settings.musicVolume = audioManager.getMusicVolume() || 0.8;
    this.settings.sfxVolume = audioManager.getSFXVolume() || 0.9;

    // Update slider values
    for (const slider of this.sliders) {
      if (this.settings.hasOwnProperty(slider.id)) {
        slider.value = this.settings[slider.id];
      }
    }
  }

  /**
   * Reset settings to defaults
   */
  resetToDefaults() {
    this.settings = {
      masterVolume: 0.7,
      musicVolume: 0.8,
      sfxVolume: 0.9,
      showFPS: false,
      enableParticles: true,
    };

    // Update UI elements
    for (const slider of this.sliders) {
      if (this.settings.hasOwnProperty(slider.id)) {
        slider.value = this.settings[slider.id];
        this.applySettingChange(slider.id, slider.value);
      }
    }

    for (const checkbox of this.checkboxes) {
      if (this.settings.hasOwnProperty(checkbox.id)) {
        checkbox.checked = this.settings[checkbox.id];
        this.applySettingChange(checkbox.id, checkbox.checked);
      }
    }
  }

  /**
   * Save settings using save system
   */
  saveSettings() {
    try {
      const saveSystem = this.gameEngine.getSaveSystem();
      if (saveSystem) {
        saveSystem.saveSettings(this.settings);
        console.log("Settings saved via save system");
      } else {
        // Fallback to localStorage
        localStorage.setItem("gameSettings", JSON.stringify(this.settings));
        console.log("Settings saved to localStorage (fallback)");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  /**
   * Load settings using save system
   */
  loadSettings() {
    try {
      const saveSystem = this.gameEngine.getSaveSystem();
      if (saveSystem) {
        const savedSettings = saveSystem.loadSettings();
        this.settings = { ...this.settings, ...savedSettings };
        console.log("Settings loaded via save system");
      } else {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem("gameSettings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          this.settings = { ...this.settings, ...parsed };
          console.log("Settings loaded from localStorage (fallback)");
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * Go back to menu
   */
  goBackToMenu() {
    if (this.gameEngine.sceneManager) {
      this.gameEngine.sceneManager.changeScene("menu");
    }
  }

  /**
   * Show a temporary message
   */
  showMessage(text, type = "info") {
    if (this.gameEngine.uiSystem) {
      this.gameEngine.uiSystem.showMessage(text, 2000, type);
    } else {
      console.log(`Settings: ${text}`);
    }
  }

  /**
   * Update settings scene
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update background animation
    this.backgroundAnimation += deltaTime * 0.001;

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
  }

  /**
   * Render the settings scene
   */
  render(ctx) {
    if (!this.isActive) return;

    const canvas = this.gameEngine.canvas;

    // Draw background
    this.renderBackground(ctx, canvas);

    // Draw title
    this.renderTitle(ctx, canvas);

    // Draw sliders
    this.renderSliders(ctx);

    // Draw checkboxes
    this.renderCheckboxes(ctx);

    // Draw buttons
    this.renderButtons(ctx);

    // Draw instructions
    this.renderInstructions(ctx, canvas);
  }

  /**
   * Render background
   */
  renderBackground(ctx, canvas) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#4A90E2");
    gradient.addColorStop(1, "#7B68EE");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 10; i++) {
      const x =
        (i * 100 + this.backgroundAnimation * 50) % (canvas.width + 100);
      const y = 50 + Math.sin(this.backgroundAnimation + i * 0.5) * 30;
      ctx.fillRect(x, y, 2, canvas.height);
    }
  }

  /**
   * Render title
   */
  renderTitle(ctx, canvas) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Settings", canvas.width / 2, 80);
  }

  /**
   * Render volume sliders
   */
  renderSliders(ctx) {
    for (const slider of this.sliders) {
      const isHovered =
        this.hoveredElement &&
        this.hoveredElement.type === "slider" &&
        this.hoveredElement.element === slider;

      // Label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "18px Arial";
      ctx.textAlign = "left";
      ctx.fillText(slider.label, slider.x, slider.y - 10);

      // Slider track
      ctx.fillStyle = isHovered ? "#CCCCCC" : "#999999";
      ctx.fillRect(slider.x, slider.y, slider.width, slider.height);

      // Slider fill
      const fillWidth =
        slider.width *
        ((slider.value - slider.min) / (slider.max - slider.min));
      ctx.fillStyle = isHovered ? "#FFD700" : "#4CAF50";
      ctx.fillRect(slider.x, slider.y, fillWidth, slider.height);

      // Slider handle
      const handleX = slider.x + fillWidth - 5;
      ctx.fillStyle = isHovered ? "#FFA500" : "#FFFFFF";
      ctx.fillRect(handleX, slider.y - 2, 10, slider.height + 4);

      // Value display
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "14px Arial";
      ctx.textAlign = "right";
      ctx.fillText(
        Math.round(slider.value * 100) + "%",
        slider.x + slider.width + 50,
        slider.y + 15
      );
    }
  }

  /**
   * Render checkboxes
   */
  renderCheckboxes(ctx) {
    for (const checkbox of this.checkboxes) {
      const isHovered =
        this.hoveredElement &&
        this.hoveredElement.type === "checkbox" &&
        this.hoveredElement.element === checkbox;

      // Checkbox box
      ctx.fillStyle = isHovered ? "#CCCCCC" : "#FFFFFF";
      ctx.fillRect(checkbox.x, checkbox.y, checkbox.width, checkbox.height);

      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;
      ctx.strokeRect(checkbox.x, checkbox.y, checkbox.width, checkbox.height);

      // Checkmark
      if (checkbox.checked) {
        ctx.strokeStyle = "#4CAF50";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(checkbox.x + 4, checkbox.y + 10);
        ctx.lineTo(checkbox.x + 8, checkbox.y + 14);
        ctx.lineTo(checkbox.x + 16, checkbox.y + 6);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isHovered ? "#FFD700" : "#FFFFFF";
      ctx.font = "18px Arial";
      ctx.textAlign = "left";
      ctx.fillText(checkbox.label, checkbox.x + 30, checkbox.y + 15);
    }
  }

  /**
   * Render buttons
   */
  renderButtons(ctx) {
    for (const button of this.buttons) {
      const isHovered =
        this.hoveredElement &&
        this.hoveredElement.type === "button" &&
        this.hoveredElement.element === button;

      // Button background
      ctx.fillStyle = isHovered
        ? "rgba(255, 255, 255, 0.9)"
        : "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(button.x, button.y, button.width, button.height);

      // Button border
      ctx.strokeStyle = isHovered ? "#FFD700" : "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(button.x, button.y, button.width, button.height);

      // Button text
      ctx.fillStyle = isHovered ? "#000000" : "#333333";
      ctx.font = isHovered ? "bold 16px Arial" : "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        button.text,
        button.x + button.width / 2,
        button.y + button.height / 2 + 5
      );
    }
  }

  /**
   * Render instructions
   */
  renderInstructions(ctx, canvas) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    const instructionsY = canvas.height - 40;
    ctx.fillText("ESC to go back to menu", canvas.width / 2, instructionsY);
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    const canvas = this.gameEngine.canvas;
    if (canvas) {
      canvas.removeEventListener("mousemove", this.mouseMoveHandler);
      canvas.removeEventListener("mousedown", this.mouseDownHandler);
      canvas.removeEventListener("mouseup", this.mouseUpHandler);
    }

    super.destroy();
  }
}
