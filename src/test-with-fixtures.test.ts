import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import fixtureTest from './test-with-fixtures'
import { test as base } from '@playwright/test'
import workerFixture from './workerFixture'

vi.mock("@playwright/test", () => {
    const test = {
        extend: vi.fn().mockImplementation(()=>test),
        describe: vi.fn(),
    }
    return ({
    test,
}) })

vi.mock("./workerFixture")

afterEach(() => {
    vi.clearAllMocks()
})

test('test with fixtures', async () => {
    const myFixture = {
        name: 'myFixture',
        setup: vi.fn(),
        teardown: vi.fn(),
    }
    const fn = async () => {}
    vi.mocked(workerFixture).mockImplementationOnce(() => fn)
    const test = fixtureTest({ myFixture })
    expect(base.extend).toHaveBeenNthCalledWith(2, {myFixture: [fn, {scope: 'worker'}]})
})

test('with callback', async () => {
    const myFixture = {
        name: 'myFixture',
        setup: vi.fn(),
        teardown: vi.fn(),
    }
    const fn = async () => {}
    vi.mocked(workerFixture).mockImplementationOnce(() => fn)
    const callbacks = {unserialize: vi.fn(), serialize: vi.fn()}
    const test = fixtureTest({ myFixture }, callbacks)
    expect(base.extend).toHaveBeenNthCalledWith(2, {myFixture: [fn, {scope: 'worker'}]})
    expect(workerFixture).toHaveBeenLastCalledWith(myFixture, expect.any(Set), callbacks)
})