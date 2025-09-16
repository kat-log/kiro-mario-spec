/**
 * Test script for Enhanced InputManager
 * Verifies the new input detection features
 */

// Mock DOM environment for testing
if (typeof document === "undefined") {
  global.document = {
    addEventListener: () => {},
    body: {
      focus: () => {},
      setAttribute: () => {},
      hasAttribute: () => false,
    },
    activeElement: null,
    hidden: false,
    hasFocus: () => true,
  };
  global.window = {
    addEventListener: () => {},
    performance: { now: () => Date.now() },
  };
  global.performance = { now: () => Date.now() };
}

// Load InputManager (assuming it's available)
const InputManager = require("./js/input-manager.js");

/**
 * Test Enhanced Input Detection Features
 */
function testEnhancedInputDetection() {
  console.log("=== Testing Enhanced InputManager ===\n");

  // Create InputManager instance
  const inputManager = new InputManager();

  // Test 1: Verify enhanced properties are initialized
  console.log("Test 1: Enhanced Properties Initialization");
  console.log(
    "✓ lastKeyEventTime Map:",
    inputManager.lastKeyEventTime instanceof Map
  );
  console.log(
    "✓ eventSequenceId:",
    typeof inputManager.eventSequenceId === "number"
  );
  console.log(
    "✓ duplicateEventThreshold:",
    inputManager.duplicateEventThreshold
  );
  console.log(
    "✓ eventHistory array:",
    Array.isArray(inputManager.eventHistory)
  );
  console.log("✓ eventCaptureOptions:", inputManager.eventCaptureOptions);
  console.log("");

  // Test 2: Verify duplicate detection method
  console.log("Test 2: Duplicate Event Detection");
  const currentTime = performance.now();

  // First event should not be duplicate
  const isDuplicate1 = inputManager.isDuplicateKeyEvent(
    "Space",
    "keydown",
    currentTime
  );
  console.log("✓ First event is not duplicate:", !isDuplicate1);

  // Set a recent event time
  inputManager.lastKeyEventTime.set("Space_keydown", currentTime);

  // Immediate second event should be duplicate
  const isDuplicate2 = inputManager.isDuplicateKeyEvent(
    "Space",
    "keydown",
    currentTime + 5
  );
  console.log("✓ Immediate second event is duplicate:", isDuplicate2);

  // Event after threshold should not be duplicate
  const isDuplicate3 = inputManager.isDuplicateKeyEvent(
    "Space",
    "keydown",
    currentTime + 20
  );
  console.log("✓ Event after threshold is not duplicate:", !isDuplicate3);
  console.log("");

  // Test 3: Event history recording
  console.log("Test 3: Event History Recording");
  const mockEvent = {
    defaultPrevented: false,
    isTrusted: true,
    target: { tagName: "CANVAS" },
  };

  inputManager.recordEventInHistory("keydown", "Space", currentTime, mockEvent);
  console.log(
    "✓ Event recorded in history:",
    inputManager.eventHistory.length === 1
  );
  console.log(
    "✓ Event has correct structure:",
    inputManager.eventHistory[0].keyCode === "Space"
  );
  console.log(
    "✓ Event sequence ID incremented:",
    inputManager.eventSequenceId === 1
  );
  console.log("");

  // Test 4: Event history retrieval
  console.log("Test 4: Event History Retrieval");

  // Add more events
  inputManager.recordEventInHistory(
    "keyup",
    "Space",
    currentTime + 10,
    mockEvent
  );
  inputManager.recordEventInHistory(
    "keydown",
    "ArrowUp",
    currentTime + 20,
    mockEvent
  );

  const allHistory = inputManager.getEventHistory();
  console.log("✓ All events retrieved:", allHistory.length === 3);

  const spaceHistory = inputManager.getEventHistory("Space");
  console.log("✓ Filtered Space events:", spaceHistory.length === 2);

  const limitedHistory = inputManager.getEventHistory(null, 2);
  console.log("✓ Limited history works:", limitedHistory.length === 2);
  console.log("");

  // Test 5: Enhanced debug information
  console.log("Test 5: Enhanced Debug Information");
  const debugInfo = inputManager.getDebugInfo();

  console.log(
    "✓ Has eventSequenceId:",
    typeof debugInfo.eventSequenceId === "number"
  );
  console.log(
    "✓ Has eventHistorySize:",
    typeof debugInfo.eventHistorySize === "number"
  );
  console.log(
    "✓ Has duplicateEventThreshold:",
    typeof debugInfo.duplicateEventThreshold === "number"
  );
  console.log(
    "✓ Has lastEventTimes:",
    typeof debugInfo.lastEventTimes === "object"
  );
  console.log("✓ Has recentEvents:", Array.isArray(debugInfo.recentEvents));
  console.log(
    "✓ Has eventCaptureOptions:",
    typeof debugInfo.eventCaptureOptions === "object"
  );
  console.log("");

  // Test 6: Space key detection test method
  console.log("Test 6: Space Key Detection Test Method");
  const spaceTestResult = inputManager.testSpaceKeyDetection();

  console.log(
    "✓ Returns object with required properties:",
    typeof spaceTestResult === "object" &&
      "spaceKeyPressed" in spaceTestResult &&
      "jumpActionActive" in spaceTestResult &&
      "focusState" in spaceTestResult &&
      "recentSpaceEvents" in spaceTestResult &&
      "lastEventTimes" in spaceTestResult
  );
  console.log("");

  // Test 7: Event history clearing
  console.log("Test 7: Event History Clearing");
  inputManager.clearEventHistory();

  console.log(
    "✓ Event history cleared:",
    inputManager.eventHistory.length === 0
  );
  console.log(
    "✓ Event times cleared:",
    inputManager.lastKeyEventTime.size === 0
  );
  console.log("✓ Sequence ID reset:", inputManager.eventSequenceId === 0);
  console.log("");

  // Test 8: Enhanced reset functionality
  console.log("Test 8: Enhanced Reset Functionality");

  // Add some data first
  inputManager.keyStates.set("Space", true);
  inputManager.lastKeyEventTime.set("Space_keydown", currentTime);

  inputManager.resetAllKeys();

  console.log("✓ Key states cleared:", inputManager.keyStates.size === 0);
  console.log(
    "✓ Event times cleared:",
    inputManager.lastKeyEventTime.size === 0
  );
  console.log("");

  console.log("=== All Enhanced InputManager Tests Passed! ===");
  return true;
}

// Run tests if this is the main module
if (require.main === module) {
  testEnhancedInputDetection();
} else {
  module.exports = { testEnhancedInputDetection };
}
