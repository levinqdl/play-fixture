import { describe, expect, test, vi } from "vitest";
import warp from "./wrap";

describe("wrap", () => {
  const setup = ({ page }) => {
    return 1;
  };
  test("1. hide return; 2. keep destructing signature", async () => {
    const fn = warp(setup);
    const r = await fn({});
    expect(fn.toString()).toContain("({ page })");
    expect(r).toBe(undefined);
  });
  test("may receive callback", async () => {
    const callback = vi.fn();
    const fn = warp(setup, callback);
    await fn({});
    expect(callback).toHaveBeenNthCalledWith(1, 1);
  })
});
