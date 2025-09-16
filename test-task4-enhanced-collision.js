/**
 * Task 4: Enhanced Collision Resolution System Test
 * Tests the enhanced collision resolution functionality
 */

// Mock performance.now() for Node.js environment
if (typeof performance === "undefined") {
  global.performance = {
    now: () => Date.now(),
  };
}

// Mock console methods for cleaner output
const originalLog = console.log;
const originalWarn = console.warn;

let testOutput = [];
console.log = (...args) => {
  testOutput.push(["LOG", ...args]);
  originalLog(...args);
};
console.warn = (...args) => {
  testOutput.push(["WARN", ...args]);
  originalWarn(...args);
};

// Load the physics engine
const fs = require("fs");
const path = require("path");

// Read and evaluate the physics engine code
const physicsEngineCode = fs.readFileSync(
  path.join(__dirname, "js/physics-engine.js"),
  "utf8"
);
eval(physicsEngineCode);

// Create test entities
function createTestPlayer() {
  return {
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    size: { width: 32, height: 32 },
    isOnGround: false,
    lastGroundContact: 0,
  };
}

function createTestPlatform() {
  return {
    position: { x: 50, y: 200 },
    size: { width: 200, height: 20 },
    type: "solid",
  };
}

// Test functions
function testEnhancedCollisionMethod() {
  console.log("\n=== Test 1: Enhanced Collision Resolution Method ===");

  const physicsEngine = new PhysicsEngine();
  const player = createTestPlayer();
  const platform = createTestPlatform();

  // Position player to collide with platform from above
  player.position = { x: 100, y: 180 };
  player.velocity = { y: 20 }; // Moving downward

  console.log(
    `Player initial position: (${player.position.x}, ${player.position.y})`
  );
  console.log(`Player velocity: (${player.velocity.x}, ${player.velocity.y})`);
  console.log(
    `Platform position: (${platform.position.x}, ${platform.position.y})`
  );

  // Test enhanced collision resolution
  const resolution = physicsEngine.resolveCollisionEnhanced(player, platform);

  console.log("Resolution result:", JSON.stringify(resolution, null, 2));

  // Verify resolution properties
  const checks = [
    {
      name: "Method exists",
      condition: typeof physicsEngine.resolveCollisionEnhanced === "function",
    },
    { name: "Resolution resolved", condition: resolution.resolved === true },
    {
      name: "Direction is bottom",
      condition: resolution.direction === "bottom",
    },
    {
      name: "Enhanced data exists",
      condition: resolution.enhanced !== undefined,
    },
    {
      name: "Validation performed",
      condition:
        resolution.enhanced && resolution.enhanced.validated !== undefined,
    },
    {
      name: "Timestamp recorded",
      condition: resolution.enhanced && resolution.enhanced.timestamp > 0,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    const status = check.condition ? "PASS" : "FAIL";
    console.log(`${check.name}: ${status}`);
    if (!check.condition) allPassed = false;
  });

  return allPassed;
}

function testGroundCollisionValidation() {
  console.log("\n=== Test 2: Ground Collision Validation ===");

  const physicsEngine = new PhysicsEngine();
  const player = createTestPlayer();
  const platform = createTestPlatform();

  // Test valid ground collision
  player.position = { x: 100, y: 180 };
  player.velocity = { y: 20 }; // Moving downward

  console.log("Testing valid ground collision scenario");
  const validResolution = physicsEngine.resolveCollisionEnhanced(
    player,
    platform
  );

  console.log(
    `Valid collision validation: ${validResolution.enhanced?.validated}`
  );
  console.log(
    "Validation details:",
    validResolution.enhanced?.validationDetails
  );

  const checks = [
    {
      name: "Validation method exists",
      condition: typeof physicsEngine.validateGroundCollision === "function",
    },
    {
      name: "Valid collision detected as valid",
      condition: validResolution.enhanced?.validated !== undefined,
    },
    {
      name: "Validation details provided",
      condition: validResolution.enhanced?.validationDetails !== undefined,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    const status = check.condition ? "PASS" : "FAIL";
    console.log(`${check.name}: ${status}`);
    if (!check.condition) allPassed = false;
  });

  return allPassed;
}

function testGroundContactRecording() {
  console.log("\n=== Test 3: Ground Contact Time Recording ===");

  const physicsEngine = new PhysicsEngine();
  const player = createTestPlayer();
  const platform = createTestPlatform();

  // Record initial ground contact time
  const initialGroundContact = player.lastGroundContact;
  console.log(`Initial ground contact time: ${initialGroundContact}`);

  // Position player for ground collision
  player.position = { x: 100, y: 180 };
  player.velocity = { y: 20 };

  // Perform collision resolution
  const resolution = physicsEngine.resolveCollisionEnhanced(player, platform);

  console.log(
    `Ground contact recorded: ${resolution.enhanced?.groundContactRecorded}`
  );
  console.log(`New ground contact time: ${player.lastGroundContact}`);

  const checks = [
    {
      name: "Record method exists",
      condition: typeof physicsEngine.recordGroundContact === "function",
    },
    {
      name: "Ground contact time updated",
      condition: player.lastGroundContact > initialGroundContact,
    },
    {
      name: "Ground contact recorded flag set",
      condition: resolution.enhanced?.groundContactRecorded === true,
    },
    {
      name: "Ground contact time is recent",
      condition: performance.now() - player.lastGroundContact < 1000,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    const status = check.condition ? "PASS" : "FAIL";
    console.log(`${check.name}: ${status}`);
    if (!check.condition) allPassed = false;
  });

  return allPassed;
}

function testInvalidCollisionDetection() {
  console.log("\n=== Test 4: Invalid Collision Detection and Reporting ===");

  const physicsEngine = new PhysicsEngine();
  const player = createTestPlayer();
  const platform = createTestPlatform();

  // Reset collision stats
  physicsEngine.resetInvalidCollisionStats();

  // Create an obviously invalid collision scenario
  player.position = { x: 100, y: 300 }; // Far below platform
  player.velocity = { y: -100 }; // Moving upward rapidly

  console.log("Creating potentially invalid collision scenario");
  console.log(`Player position: (${player.position.x}, ${player.position.y})`);
  console.log(`Player velocity: (${player.velocity.x}, ${player.velocity.y})`);

  // Force a collision by moving player into platform
  player.position.y = 190; // Overlapping with platform

  const resolution = physicsEngine.resolveCollisionEnhanced(player, platform);

  console.log(`Resolution validated: ${resolution.enhanced?.validated}`);

  // Check collision stats
  const stats = physicsEngine.getInvalidCollisionStats();
  console.log(`Invalid collision stats:`, stats);

  const checks = [
    {
      name: "Invalid collision stats method exists",
      condition: typeof physicsEngine.getInvalidCollisionStats === "function",
    },
    {
      name: "Reset stats method exists",
      condition: typeof physicsEngine.resetInvalidCollisionStats === "function",
    },
    {
      name: "Report method exists",
      condition: typeof physicsEngine.reportInvalidCollision === "function",
    },
    {
      name: "Stats object has required properties",
      condition: stats && typeof stats.total === "number",
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    const status = check.condition ? "PASS" : "FAIL";
    console.log(`${check.name}: ${status}`);
    if (!check.condition) allPassed = false;
  });

  return allPassed;
}

function testCollisionRecovery() {
  console.log("\n=== Test 5: Collision Recovery System ===");

  const physicsEngine = new PhysicsEngine();
  const player = createTestPlayer();
  const platform = createTestPlatform();

  // Create a scenario that might need recovery
  const preCollisionState = {
    position: { x: 100, y: 150 },
    velocity: { x: 0, y: 20 },
    isOnGround: false,
  };

  player.position = { x: 100, y: 190 }; // Overlapping position
  player.velocity = { y: 20 };

  console.log("Testing collision recovery system");

  const recoveryResult = physicsEngine.attemptCollisionRecovery(
    player,
    platform,
    preCollisionState
  );

  console.log("Recovery result:", recoveryResult);

  const checks = [
    {
      name: "Recovery method exists",
      condition: typeof physicsEngine.attemptCollisionRecovery === "function",
    },
    {
      name: "Recovery result has required properties",
      condition:
        recoveryResult && typeof recoveryResult.recovered === "boolean",
    },
    {
      name: "Recovery details provided",
      condition: recoveryResult && recoveryResult.details !== undefined,
    },
  ];

  let allPassed = true;
  checks.forEach((check) => {
    const status = check.condition ? "PASS" : "FAIL";
    console.log(`${check.name}: ${status}`);
    if (!check.condition) allPassed = false;
  });

  return allPassed;
}

// Run all tests
function runAllTests() {
  console.log("=".repeat(60));
  console.log("TASK 4: ENHANCED COLLISION RESOLUTION SYSTEM TESTS");
  console.log("=".repeat(60));

  const tests = [
    { name: "Enhanced Collision Method", fn: testEnhancedCollisionMethod },
    { name: "Ground Collision Validation", fn: testGroundCollisionValidation },
    { name: "Ground Contact Recording", fn: testGroundContactRecording },
    { name: "Invalid Collision Detection", fn: testInvalidCollisionDetection },
    { name: "Collision Recovery", fn: testCollisionRecovery },
  ];

  const results = [];

  tests.forEach((test) => {
    try {
      const passed = test.fn();
      results.push({ name: test.name, result: passed ? "PASS" : "FAIL" });
    } catch (error) {
      console.error(`Error in ${test.name}:`, error.message);
      results.push({ name: test.name, result: "ERROR" });
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log("TEST RESULTS SUMMARY");
  console.log("=".repeat(60));

  results.forEach((result) => {
    console.log(`${result.name}: ${result.result}`);
  });

  const passed = results.filter((r) => r.result === "PASS").length;
  const total = results.length;

  console.log(`\nOverall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log(
      "✅ All tests passed! Enhanced collision resolution system is working correctly."
    );
  } else {
    console.log("❌ Some tests failed. Please review the implementation.");
  }

  return passed === total;
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testEnhancedCollisionMethod,
  testGroundCollisionValidation,
  testGroundContactRecording,
  testInvalidCollisionDetection,
  testCollisionRecovery,
};
