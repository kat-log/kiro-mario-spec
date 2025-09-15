/**
 * Audio Manager for Mario Style Platformer
 * Handles sound effects, background music, and volume control
 */

class AudioManager {
  constructor() {
    // Audio context for better control (optional, fallback to HTML5 Audio)
    this.audioContext = null;
    this.masterGain = null;

    // Sound storage
    this.sounds = new Map();
    this.music = new Map();

    // Volume settings (0.0 to 1.0)
    this.volumes = {
      master: 1.0,
      sfx: 0.7,
      music: 0.5,
    };

    // Current background music
    this.currentBGM = null;
    this.bgmFadeInterval = null;

    // Sound instance pools for better performance
    this.soundPools = new Map();
    this.maxPoolSize = 5;

    // Loading state
    this.isInitialized = false;
    this.loadingPromises = new Map();

    console.log("AudioManager created");
  }

  /**
   * Initialize the audio manager
   * Sets up Web Audio API if available
   */
  async init() {
    try {
      // Try to initialize Web Audio API
      if (
        typeof AudioContext !== "undefined" ||
        typeof webkitAudioContext !== "undefined"
      ) {
        const AudioContextClass = AudioContext || webkitAudioContext;
        this.audioContext = new AudioContextClass();

        // Create master gain node for volume control
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volumes.master;

        console.log("Web Audio API initialized");
      } else {
        console.log("Web Audio API not available, using HTML5 Audio");
      }

      this.isInitialized = true;
      console.log("AudioManager initialized successfully");
    } catch (error) {
      console.warn("Failed to initialize Web Audio API:", error);
      console.log("Falling back to HTML5 Audio");
      this.isInitialized = true;
    }
  }

  /**
   * Load a sound effect
   * @param {string} name - Unique identifier for the sound
   * @param {string} url - Path to the audio file
   * @param {Object} options - Loading options
   */
  async loadSound(name, url, options = {}) {
    if (this.sounds.has(name)) {
      console.warn(`Sound '${name}' already loaded`);
      return this.sounds.get(name);
    }

    // Check if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const loadPromise = this._loadAudioFile(url, "sfx", options);
    this.loadingPromises.set(name, loadPromise);

    try {
      const audioData = await loadPromise;
      this.sounds.set(name, audioData);

      // Create sound pool for frequently used sounds
      if (options.pooled !== false) {
        this._createSoundPool(name, audioData);
      }

      console.log(`Sound '${name}' loaded successfully`);
      return audioData;
    } catch (error) {
      console.error(`Failed to load sound '${name}':`, error);
      throw error;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  /**
   * Load background music
   * @param {string} name - Unique identifier for the music
   * @param {string} url - Path to the audio file
   * @param {Object} options - Loading options
   */
  async loadMusic(name, url, options = {}) {
    if (this.music.has(name)) {
      console.warn(`Music '${name}' already loaded`);
      return this.music.get(name);
    }

    // Check if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const loadPromise = this._loadAudioFile(url, "music", {
      ...options,
      loop: true,
    });
    this.loadingPromises.set(name, loadPromise);

    try {
      const audioData = await loadPromise;
      this.music.set(name, audioData);
      console.log(`Music '${name}' loaded successfully`);
      return audioData;
    } catch (error) {
      console.error(`Failed to load music '${name}':`, error);
      throw error;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  /**
   * Play a sound effect
   * @param {string} name - Name of the sound to play
   * @param {Object} options - Playback options
   */
  playSound(name, options = {}) {
    if (!this.isInitialized) {
      console.warn("AudioManager not initialized");
      return null;
    }

    const soundData = this.sounds.get(name);
    if (!soundData) {
      console.warn(`Sound '${name}' not found`);
      return null;
    }

    // Check for overlap prevention
    if (options.preventOverlap && this._isSoundPlaying(name)) {
      console.log(`Sound '${name}' already playing, skipping overlap`);
      return null;
    }

    try {
      // Try to get from pool first
      const pooledInstance = this._getPooledSound(name);
      if (pooledInstance) {
        return this._playAudioInstance(pooledInstance, "sfx", options);
      }

      // Create new instance if no pooled available
      return this._playAudioData(soundData, "sfx", options);
    } catch (error) {
      console.error(`Failed to play sound '${name}':`, error);
      return null;
    }
  }

  /**
   * Play background music
   * @param {string} name - Name of the music to play
   * @param {Object} options - Playback options
   */
  playMusic(name, options = {}) {
    if (!this.isInitialized) {
      console.warn("AudioManager not initialized");
      return null;
    }

    const musicData = this.music.get(name);
    if (!musicData) {
      console.warn(`Music '${name}' not found`);
      return null;
    }

    // Stop current BGM if playing
    if (this.currentBGM && !this.currentBGM.paused) {
      this.stopMusic();
    }

    try {
      this.currentBGM = this._playAudioData(musicData, "music", {
        ...options,
        loop: true,
      });

      console.log(`Playing music: ${name}`);
      return this.currentBGM;
    } catch (error) {
      console.error(`Failed to play music '${name}':`, error);
      return null;
    }
  }

  /**
   * Stop current background music
   */
  stopMusic() {
    if (this.currentBGM) {
      try {
        this.currentBGM.pause();
        this.currentBGM.currentTime = 0;
        this.currentBGM = null;
        console.log("Background music stopped");
      } catch (error) {
        console.error("Failed to stop music:", error);
      }
    }
  }

  /**
   * Pause current background music
   */
  pauseMusic() {
    if (this.currentBGM && !this.currentBGM.paused) {
      try {
        this.currentBGM.pause();
        console.log("Background music paused");
      } catch (error) {
        console.error("Failed to pause music:", error);
      }
    }
  }

  /**
   * Resume paused background music
   */
  resumeMusic() {
    if (this.currentBGM && this.currentBGM.paused) {
      try {
        this.currentBGM.play();
        console.log("Background music resumed");
      } catch (error) {
        console.error("Failed to resume music:", error);
      }
    }
  }

  /**
   * Set volume for different audio types
   * @param {string} type - 'master', 'sfx', or 'music'
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(type, volume) {
    // Clamp volume between 0 and 1
    volume = Math.max(0, Math.min(1, volume));

    if (!["master", "sfx", "music"].includes(type)) {
      console.error(`Invalid volume type: ${type}`);
      return;
    }

    this.volumes[type] = volume;

    // Apply volume changes
    if (type === "master" && this.masterGain) {
      this.masterGain.gain.value = volume;
    }

    // Update current BGM volume if it's playing
    if (type === "music" || type === "master") {
      if (this.currentBGM) {
        this.currentBGM.volume = this._calculateVolume("music");
      }
    }

    console.log(`${type} volume set to ${(volume * 100).toFixed(0)}%`);
  }

  /**
   * Get current volume for a type
   * @param {string} type - 'master', 'sfx', or 'music'
   */
  getVolume(type) {
    return this.volumes[type] || 0;
  }

  /**
   * Set master volume (convenience method)
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume) {
    this.setVolume("master", volume);
  }

  /**
   * Set sound effects volume (convenience method)
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setSoundVolume(volume) {
    this.setVolume("sfx", volume);
  }

  /**
   * Set music volume (convenience method)
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    this.setVolume("music", volume);
  }

  /**
   * Set SFX volume (convenience method)
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setSFXVolume(volume) {
    this.setVolume("sfx", volume);
  }

  /**
   * Get master volume
   * @returns {number} - Volume level (0.0 to 1.0)
   */
  getMasterVolume() {
    return this.getVolume("master");
  }

  /**
   * Get music volume
   * @returns {number} - Volume level (0.0 to 1.0)
   */
  getMusicVolume() {
    return this.getVolume("music");
  }

  /**
   * Get SFX volume
   * @returns {number} - Volume level (0.0 to 1.0)
   */
  getSFXVolume() {
    return this.getVolume("sfx");
  }

  /**
   * Mute/unmute all audio
   * @param {boolean} muted - Whether to mute
   */
  setMuted(muted) {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volumes.master;
    }

    // Also mute current BGM
    if (this.currentBGM) {
      this.currentBGM.volume = muted ? 0 : this._calculateVolume("music");
    }

    console.log(`Audio ${muted ? "muted" : "unmuted"}`);
  }

  /**
   * Check if a sound is loaded
   * @param {string} name - Sound name
   */
  isSoundLoaded(name) {
    return this.sounds.has(name);
  }

  /**
   * Check if music is loaded
   * @param {string} name - Music name
   */
  isMusicLoaded(name) {
    return this.music.has(name);
  }

  /**
   * Get loading status
   */
  isLoading() {
    return this.loadingPromises.size > 0;
  }

  /**
   * Get list of loaded sounds
   */
  getLoadedSounds() {
    return Array.from(this.sounds.keys());
  }

  /**
   * Get list of loaded music
   */
  getLoadedMusic() {
    return Array.from(this.music.keys());
  }

  /**
   * Private method to load audio file
   * @private
   */
  async _loadAudioFile(url, type, options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener("canplaythrough", () => {
        // Configure audio properties
        audio.loop = options.loop || false;
        audio.volume = this._calculateVolume(type);

        resolve(audio);
      });

      audio.addEventListener("error", (e) => {
        reject(new Error(`Failed to load audio: ${url}`));
      });

      // Set source and start loading
      audio.src = url;
      audio.preload = "auto";
    });
  }

  /**
   * Private method to play audio data
   * @private
   */
  _playAudioData(audioData, type, options = {}) {
    // Clone the audio for concurrent playback
    const audio = audioData.cloneNode();
    return this._playAudioInstance(audio, type, options);
  }

  /**
   * Private method to play audio instance
   * @private
   */
  _playAudioInstance(audio, type, options = {}) {
    // Set volume
    audio.volume = this._calculateVolume(type);

    // Set loop if specified
    if (options.loop !== undefined) {
      audio.loop = options.loop;
    }

    // Set playback rate if specified
    if (options.rate) {
      audio.playbackRate = options.rate;
    }

    // Play the audio
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Audio play failed:", error);
      });
    }

    return audio;
  }

  /**
   * Private method to calculate effective volume
   * @private
   */
  _calculateVolume(type) {
    return this.volumes.master * (this.volumes[type] || 1.0);
  }

  /**
   * Private method to create sound pool
   * @private
   */
  _createSoundPool(name, audioData) {
    const pool = [];
    for (let i = 0; i < this.maxPoolSize; i++) {
      const instance = audioData.cloneNode();
      instance.volume = this._calculateVolume("sfx");
      pool.push({
        audio: instance,
        inUse: false,
      });
    }
    this.soundPools.set(name, pool);
  }

  /**
   * Private method to get pooled sound instance
   * @private
   */
  _getPooledSound(name) {
    const pool = this.soundPools.get(name);
    if (!pool) return null;

    // Find available instance
    for (const item of pool) {
      if (!item.inUse && (item.audio.paused || item.audio.ended)) {
        item.inUse = true;

        // Reset audio
        item.audio.currentTime = 0;

        // Mark as available when finished
        const onEnded = () => {
          item.inUse = false;
          item.audio.removeEventListener("ended", onEnded);
        };
        item.audio.addEventListener("ended", onEnded);

        return item.audio;
      }
    }

    return null;
  }

  /**
   * Private method to check if a sound is currently playing
   * @private
   */
  _isSoundPlaying(name) {
    const pool = this.soundPools.get(name);
    if (!pool) return false;

    // Check if any instance in the pool is currently playing
    for (const item of pool) {
      if (item.inUse && !item.audio.paused && !item.audio.ended) {
        return true;
      }
    }

    return false;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Stop all audio
    this.stopMusic();

    // Clear pools
    this.soundPools.clear();

    // Clear audio maps
    this.sounds.clear();
    this.music.clear();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    console.log("AudioManager destroyed");
  }
}
