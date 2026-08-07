// Change THIS ONE LINE whenever you want to test.

const TEST_TIME = new Date("2026-08-22T09:00:00-04:00");

// Example:
//
// const TEST_TIME = new Date("2026-08-15T15:00:00-04:00");

export function getCurrentTime(): Date {
  return TEST_TIME ?? new Date();
}