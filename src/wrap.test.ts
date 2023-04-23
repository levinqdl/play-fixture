import { expect, test } from "vitest";
import warp from "./wrap";

test("wrap", async () => {
    const setup = ({page}) => {
        return 1
    }
  const fn = warp(setup)
  const r = await fn({})
  expect(fn.toString()).toContain("({ page })")
  expect(r).toBe(undefined)
})