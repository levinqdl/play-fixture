import type { PlaywrightTestConfig } from "@playwright/test";
const config = (pwConfig: PlaywrightTestConfig) => {
    return process.env.VSCODE_PID ? pwConfig : Object.assign({}, pwConfig, { testIgnore: ['**/fixtures.spec.ts'] } )
}

export default config