
import type { Config } from "jest";
import base from "./jest.config";

const config: Config = {
  ...base,
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/integration/setup.ts"],
  setupFilesAfterEnv: [],
  coverageThreshold: undefined,
  testTimeout: 30000,
};

export default config;
