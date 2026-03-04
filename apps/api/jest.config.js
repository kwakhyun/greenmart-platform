/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
  moduleNameMapper: {
    "^@greenmart/shared$": "<rootDir>/../../packages/shared/src",
    "^@greenmart/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
  },
};
