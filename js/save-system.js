/**
 * Save System Implementation
 * Handles local storage of game progress, settings, and player data
 */

/**
 * SaveSystem Class
 * Manages saving and loading game data using localStorage
 */
class SaveSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.storagePrefix = "mario-platformer-";

    // Default save data structure
    this.defaultSaveData = {
      version: "1.0.0",
      playerId: this.generatePlayerId(),
      unlockedStages: [1], // Stage 1 is always unlocked
      bestScores: {},
      totalCoins: 0,
      achievements: [],
      settings: {
        masterVolume: 0.7,
        musicVolume: 0.8,
        sfxVolume: 0.9,
        showFPS: false,
        enableParticles: true,
      },
      gameProgress: {
        currentStage: 1,
        lastPlayedStage: 1,
        totalPlayTime: 0,
        gamesPlayed: 0,
        stagesCompleted: 0,
      },
      statistics: {
        totalJumps: 0,
        totalCoinsCollected: 0,
        totalEnemiesDefeated: 0,
        totalDeaths: 0,
        bestTime: {},
        fastestCompletion: null,
      },
    };

    // Current save data
    this.saveData = null;

    // Auto-save settings
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 30000; // 30 seconds
    this.lastAutoSave = 0;

    console.log("SaveSystem initialized");
  }

  /**
   * Initialize the save system
   */
  init() {
    // Load existing save data or create new
    this.loadSaveData();

    // Start auto-save timer if enabled
    if (this.autoSaveEnabled) {
      this.startAutoSave();
    }

    console.log("SaveSystem ready");
    return true;
  }

  /**
   * Generate a unique player ID
   */
  generatePlayerId() {
    return (
      "player_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Load save data from localStorage
   */
  loadSaveData() {
    try {
      const savedData = localStorage.getItem(this.storagePrefix + "saveData");

      if (savedData) {
        const parsed = JSON.parse(savedData);

        // Validate and merge with defaults
        this.saveData = this.validateAndMergeSaveData(parsed);

        console.log("Save data loaded successfully");
        console.log("Player ID:", this.saveData.playerId);
        console.log("Unlocked stages:", this.saveData.unlockedStages);
      } else {
        // Create new save data
        this.saveData = { ...this.defaultSaveData };
        this.saveData.playerId = this.generatePlayerId();

        console.log("New save data created");
        console.log("New Player ID:", this.saveData.playerId);
      }

      return this.saveData;
    } catch (error) {
      console.error("Failed to load save data:", error);

      // Fallback to default save data
      this.saveData = { ...this.defaultSaveData };
      this.saveData.playerId = this.generatePlayerId();

      return this.saveData;
    }
  }

  /**
   * Validate and merge save data with defaults
   */
  validateAndMergeSaveData(loadedData) {
    // Deep merge with defaults to ensure all properties exist
    const merged = JSON.parse(JSON.stringify(this.defaultSaveData));

    // Recursively merge objects
    const mergeObjects = (target, source) => {
      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          if (!target[key]) target[key] = {};
          mergeObjects(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    mergeObjects(merged, loadedData);

    // Validate critical data
    if (!merged.playerId) {
      merged.playerId = this.generatePlayerId();
    }

    if (
      !Array.isArray(merged.unlockedStages) ||
      merged.unlockedStages.length === 0
    ) {
      merged.unlockedStages = [1];
    }

    return merged;
  }

  /**
   * Save data to localStorage
   */
  saveSaveData() {
    try {
      const dataToSave = JSON.stringify(this.saveData);
      localStorage.setItem(this.storagePrefix + "saveData", dataToSave);

      console.log("Save data saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save data:", error);
      return false;
    }
  }

  /**
   * Save game settings separately
   */
  saveSettings(settings) {
    try {
      if (!this.saveData) {
        this.loadSaveData();
      }

      // Update settings in save data
      this.saveData.settings = { ...this.saveData.settings, ...settings };

      // Also save settings separately for quick access
      localStorage.setItem(
        this.storagePrefix + "settings",
        JSON.stringify(this.saveData.settings)
      );

      // Save complete data
      this.saveSaveData();

      console.log("Settings saved");
      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      return false;
    }
  }

  /**
   * Load game settings
   */
  loadSettings() {
    try {
      // Try to load from separate settings first
      const settingsData = localStorage.getItem(
        this.storagePrefix + "settings"
      );

      if (settingsData) {
        return JSON.parse(settingsData);
      }

      // Fallback to save data settings
      if (this.saveData && this.saveData.settings) {
        return this.saveData.settings;
      }

      // Return default settings
      return this.defaultSaveData.settings;
    } catch (error) {
      console.error("Failed to load settings:", error);
      return this.defaultSaveData.settings;
    }
  }

  /**
   * Save stage completion
   */
  saveStageCompletion(stageNumber, score, completionTime, coinsCollected) {
    try {
      if (!this.saveData) {
        this.loadSaveData();
      }

      // Update best score for this stage
      const currentBest = this.saveData.bestScores[stageNumber] || 0;
      if (score > currentBest) {
        this.saveData.bestScores[stageNumber] = score;
      }

      // Update best time for this stage
      if (
        !this.saveData.statistics.bestTime[stageNumber] ||
        completionTime < this.saveData.statistics.bestTime[stageNumber]
      ) {
        this.saveData.statistics.bestTime[stageNumber] = completionTime;
      }

      // Unlock next stage
      const nextStage = stageNumber + 1;
      if (!this.saveData.unlockedStages.includes(nextStage)) {
        this.saveData.unlockedStages.push(nextStage);
        this.saveData.unlockedStages.sort((a, b) => a - b);
      }

      // Update statistics
      this.saveData.totalCoins += coinsCollected;
      this.saveData.statistics.totalCoinsCollected += coinsCollected;
      this.saveData.gameProgress.stagesCompleted++;
      this.saveData.gameProgress.lastPlayedStage = stageNumber;

      // Update fastest completion
      if (
        !this.saveData.statistics.fastestCompletion ||
        completionTime < this.saveData.statistics.fastestCompletion
      ) {
        this.saveData.statistics.fastestCompletion = completionTime;
      }

      // Save the data
      this.saveSaveData();

      console.log(`Stage ${stageNumber} completion saved`);
      console.log(
        `Score: ${score}, Time: ${completionTime}s, Coins: ${coinsCollected}`
      );
      console.log(
        `Unlocked stages: ${this.saveData.unlockedStages.join(", ")}`
      );

      return true;
    } catch (error) {
      console.error("Failed to save stage completion:", error);
      return false;
    }
  }

  /**
   * Save game progress (current state)
   */
  saveGameProgress(gameState) {
    try {
      if (!this.saveData) {
        this.loadSaveData();
      }

      // Update game progress
      this.saveData.gameProgress.currentStage = gameState.currentStage || 1;
      this.saveData.gameProgress.gamesPlayed++;

      // Update player statistics if player exists
      if (this.gameEngine.player) {
        const playerState = this.gameEngine.player.getState();
        this.saveData.statistics.totalJumps += playerState.jumpCount || 0;
        this.saveData.statistics.totalDeaths += playerState.deathCount || 0;
      }

      // Save the data
      this.saveSaveData();

      console.log("Game progress saved");
      return true;
    } catch (error) {
      console.error("Failed to save game progress:", error);
      return false;
    }
  }

  /**
   * Get save data
   */
  getSaveData() {
    if (!this.saveData) {
      this.loadSaveData();
    }
    return { ...this.saveData };
  }

  /**
   * Get unlocked stages
   */
  getUnlockedStages() {
    if (!this.saveData) {
      this.loadSaveData();
    }
    return [...this.saveData.unlockedStages];
  }

  /**
   * Check if stage is unlocked
   */
  isStageUnlocked(stageNumber) {
    if (!this.saveData) {
      this.loadSaveData();
    }
    return this.saveData.unlockedStages.includes(stageNumber);
  }

  /**
   * Get best score for stage
   */
  getBestScore(stageNumber) {
    if (!this.saveData) {
      this.loadSaveData();
    }
    return this.saveData.bestScores[stageNumber] || 0;
  }

  /**
   * Get best time for stage
   */
  getBestTime(stageNumber) {
    if (!this.saveData) {
      this.loadSaveData();
    }
    return this.saveData.statistics.bestTime[stageNumber] || null;
  }

  /**
   * Reset save data (new game)
   */
  resetSaveData() {
    try {
      // Keep player ID and settings, reset everything else
      const playerId = this.saveData
        ? this.saveData.playerId
        : this.generatePlayerId();
      const settings = this.saveData
        ? this.saveData.settings
        : this.defaultSaveData.settings;

      this.saveData = { ...this.defaultSaveData };
      this.saveData.playerId = playerId;
      this.saveData.settings = settings;

      this.saveSaveData();

      console.log("Save data reset");
      return true;
    } catch (error) {
      console.error("Failed to reset save data:", error);
      return false;
    }
  }

  /**
   * Delete all save data
   */
  deleteSaveData() {
    try {
      localStorage.removeItem(this.storagePrefix + "saveData");
      localStorage.removeItem(this.storagePrefix + "settings");

      this.saveData = null;

      console.log("All save data deleted");
      return true;
    } catch (error) {
      console.error("Failed to delete save data:", error);
      return false;
    }
  }

  /**
   * Export save data as JSON string
   */
  exportSaveData() {
    try {
      if (!this.saveData) {
        this.loadSaveData();
      }

      const exportData = {
        ...this.saveData,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export save data:", error);
      return null;
    }
  }

  /**
   * Import save data from JSON string
   */
  importSaveData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);

      // Validate imported data
      this.saveData = this.validateAndMergeSaveData(importedData);

      // Save the imported data
      this.saveSaveData();

      console.log("Save data imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import save data:", error);
      return false;
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      if (
        this.gameEngine.gameState &&
        this.gameEngine.gameState.mode === "playing"
      ) {
        this.autoSave();
      }
    }, this.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Perform auto-save
   */
  autoSave() {
    const now = Date.now();
    if (now - this.lastAutoSave >= this.autoSaveInterval) {
      this.saveGameProgress(this.gameEngine.gameState);
      this.lastAutoSave = now;
      console.log("Auto-save completed");
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    try {
      const saveDataSize =
        localStorage.getItem(this.storagePrefix + "saveData")?.length || 0;
      const settingsSize =
        localStorage.getItem(this.storagePrefix + "settings")?.length || 0;

      return {
        totalSize: saveDataSize + settingsSize,
        saveDataSize,
        settingsSize,
        available: true,
      };
    } catch (error) {
      return {
        totalSize: 0,
        saveDataSize: 0,
        settingsSize: 0,
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if localStorage is available
   */
  isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopAutoSave();

    // Final save before cleanup
    if (this.saveData) {
      this.saveSaveData();
    }

    console.log("SaveSystem destroyed");
  }
}
