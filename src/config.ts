import type { PlaywrightTestConfig } from "@playwright/test";
const config = (pwConfig: PlaywrightTestConfig) => {
  return process.env.VSCODE_PID
    ? pwConfig
    : Object.assign({}, pwConfig, {
        testIgnore: [pwConfig.testIgnore, "**/fixtures.{test,spec}.{ts,js,mjs}"].flat().filter(Boolean),
      });
};

export default config;
