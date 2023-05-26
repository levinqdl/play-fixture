import { describe, expect, test, vi } from "vitest";
import warp from "./wrap";
import skippedTeardowns from "./skipped-teardowns";

describe("wrap", () => {
  const setup = ({ page, project }) => {
    return 1;
  };
  setup[Symbol.for('fixture')] = ['page', 'project']
  test("1. hide return; 2. keep destructing signature; 3. flag no tears", async () => {
    const fn = warp(setup);
    const r = await fn({}, {fn: setup});
    expect(fn.toString()).toContain("({ page, project })");
    expect(r).toBe(undefined);
    expect(skippedTeardowns.has('page')).toBe(true)
    expect(skippedTeardowns.has('project')).toBe(true)
  });
  test("may receive callback", async () => {
    const callback = vi.fn();
    const fn = warp(setup, callback);
    await fn({}, {fn: setup});
    expect(callback).toHaveBeenNthCalledWith(1, 1);
  })
});
