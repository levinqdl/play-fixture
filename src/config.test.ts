import {beforeEach, describe, expect, test, vi} from 'vitest'
import config from './config'

describe('config', () => {
    beforeEach(() => {
        vi.unstubAllEnvs()
    })
    test('fixture tests are not ignored by VSCode extension', () => {
        const pwConfig = {}
        vi.stubEnv("VSCODE_PID", "1")
        expect(config(pwConfig)).toEqual(pwConfig)
    })
    test('fixture tests are ignored', () => {
        const pwConfig = {}
        expect(config(pwConfig)).toEqual(Object.assign({}, pwConfig, { testIgnore: [ "**/fixtures.{test,spec}.{ts,js,mjs}"] } ))
    })
})