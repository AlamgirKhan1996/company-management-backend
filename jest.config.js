import 'dotenv/config';

export default {
  testEnvironment: "node", // Run tests in Node.js (not browser)
  transform: {},           // No Babel needed since we use ES Modules
  verbose: true,           // Show detailed test output
  testMatch: ["**/tests/**/*.test.js"], // Where test files live
  setupFilesAfterEnv: [], // Any setup files if needed
};
