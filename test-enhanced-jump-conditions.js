/**
 * Node.js test for Enhanced Jump Conditions
 * Tests the canJumpEnhanced() method implementation
 */

// Mock performance.now() for Node.js environment
global.performance = {
  now: () => Date.now(),
};

// Mock console methods to capture output
let logOutput = [];
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

console.log = function (...args) {
  logOutput.push(["LOG", ...args]);
  originalConsoleLog.apply(console, args);
};

console.warn = function (...args) {
  logOutput.push(["WARN", ...args]);
  originalConsoleWarn.apply(console, args);
};

// Load the Player class
const fs = require("fs");
const playerCode = fs.readFileSync("js/player.js", "utf8");
eval(playerCode);

// Test suite
function runTests() {
  console.log("=== Enhanced Jump Conditions Test Suite ===\n");

  let testsPassed = 0;
  let testsTotal = 0;

  function test(name, testFn) {
    testsTotal++;
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ ${name}`);
        testsPassed++;
      } else {
        console.log(`❌ ${name}`);
      }
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
    }
  }

  // Test 1: Basic ground detection
  test("Player on ground can jump", () => {
    const player = new Player(100, 500);
    player.isOnGround = true;
    player.lastGroundContact = performance.now();
    const result = player.canJumpEnhanced();
    return (
      result.canJump &&
      result.reason.includes("Enhanced jump conditions satisfied")
    );
  });

  // Test 2: Coyote time - recently off ground
  test("Player can jump within coyote time (50ms)", () => {
    const player = new Player(100, 500);
    player.isOnGround = false;
    player.lastGroundContact = performance.now() - 50; // 50ms ago
    const result = player.canJumpEnhanced();
    return result.canJump && result.reason.includes("coyote time");
  });

  // Test 3: Coyote time - too long off ground
  test("Player cannot jump after coyote time (150ms)", () => {
    const player = new Player(100, 500);
    player.isOnGround = false;
    player.lastGroundContact = performance.now() - 150; // 150ms ago
    const result = player.canJumpEnhanced();
    return (
      !result.canJump &&
      result.blockingFactors.includes("not_on_ground_enhanced")
    );
  });

  // Test 4: Blocking prevents jumping
  test("Blocking state prevents jumping", () => {
    const player = new Player(100, 500);
    player.isOnGround = true;
    player.isBlocking = true;
    player.lastGroundContact = performance.now();
    const result = player.canJumpEnhanced();
    return !result.canJump && result.blockingFactors.includes("is_blocking");
  });

  // Test 5: Dashing prevents jumping
  test("Dashing state prevents jumping", () => {
    const player = new Player(100, 500);
    player.isOnGround = true;
    player.state = "dashing";
    player.lastGroundContact = performance.now();
    const result = player.canJumpEnhanced();
    return !result.canJump && result.blockingFactors.includes("is_dashing");
  });

  // Test 6: Zero jump power prevents jumping
  test("Zero jump power prevents jumping", () => {
    const player = new Player(100, 500);
    player.isOnGround = true;
    player.jumpPower = 0;
    player.lastGroundContact = performance.now();
    const result = player.canJumpEnhanced();
    return !result.canJump && result.blockingFactors.includes("no_jump_power");
  });

  // Test 7: Enhanced ground check method exists and works
  test("Enhanced ground check method works", () => {
    const player = new Player(100, 500);
    player.isOnGround = true;
    const result = player.enhancedGroundCheck();
    return (
      result &&
      typeof result.isOnGround === "boolean" &&
      typeof result.confidence === "number" &&
      result.details &&
      result.timestamp
    );
  });

  // Test 8: Jump execution with enhanced validation
  test("Jump execution uses enhanced validation", () => {
    const player = new Player(100, 500);
    player.isOnGround = true;
    player.lastGroundContact = performance.now();
    const jumpResult = player.jump();
    return jumpResult && player.velocity.y < 0 && player.state === "jumping";
  });

  // Test 9: Jump failure recommendations
  test("Jump failure generates recommendations", () => {
    const player = new Player(100, 500);
    player.isOnGround = false;
    player.lastGroundContact = performance.now() - 200; // Too long ago
    const validation = player.canJumpEnhanced();
    const recommendations =
      player.generateJumpFailureRecommendations(validation);
    return (
      !validation.canJump &&
      Array.isArray(recommendations) &&
      recommendations.length > 0
    );
  });

  // Test 10: Coyote time boundary case
  test("Coyote time boundary case (100ms)", () => {
    const player = new Player(100, 500);
    player.isOnGround = false;
    player.lastGroundContact = performance.now() - 100; // Exactly 100ms ago
    const result = player.canJumpEnhanced();
    // Should be able to jump at exactly 100ms (<=100 condition)
    return result.canJump;
  });

  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${testsPassed}/${testsTotal}`);
  console.log(
    `Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`
  );

  if (testsPassed === testsTotal) {
    console.log("🎉 All tests passed!");
    return true;
  } else {
    console.log("❌ Some tests failed.");
    return false;
  }
}

// Run the tests
const success = runTests();

// Show some log output samples
console.log("\n=== Sample Log Output ===");
logOutput.slice(0, 5).forEach((log) => {
  console.log(`${log[0]}: ${log[1]}`);
});

process.exit(success ? 0 : 1);
