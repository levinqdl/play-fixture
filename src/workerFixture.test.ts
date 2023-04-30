import { beforeEach, describe, expect, test, vi } from "vitest";
import workerFixture from "./workerFixture";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("worker fixture", () => {
  const fixture = {
    name: "myFixture",
    setup: vi.fn().mockImplementation(async () => "setup value"),
    teardown: vi.fn().mockImplementation(async () => "teardown value"),
  };
  const skipTeardownWorker = new Set<string>();
  const use = vi.fn();
  const browser: any = {
    newPage: vi.fn().mockImplementation(async () => ({})),
  };
  test("basic use", async () => {
    const fixtureFu = workerFixture(fixture, skipTeardownWorker);
    await fixtureFu({ browser }, use);
    expect(fixture.setup).toHaveBeenCalled();
    expect(use).toHaveBeenCalledWith("setup value");
    expect(fixture.teardown).toHaveBeenCalled();
  });
  describe("callbacks", () => {
    test("teardown & serialize on unserialize return falsy value", async () => {
      const callbacks = {
        unserialize: vi.fn().mockImplementation(async () => ""),
        serialize: vi.fn(),
      };
      const fixtureFu = workerFixture(fixture, skipTeardownWorker, callbacks);
      await fixtureFu({ browser }, use);
      expect(callbacks.unserialize).toHaveBeenCalledWith("myFixture");
      expect(fixture.setup).toHaveBeenCalled();
      expect(use).toHaveBeenCalledWith("setup value");
      expect(fixture.teardown).toHaveBeenCalled();
      expect(callbacks.serialize).toHaveBeenCalledWith(
        "myFixture",
        "teardown value"
      );
    });
    test("reuse without teardown & serialize if unserialize return turthy value", async () => {
      const callbacks = {
        unserialize: vi.fn().mockImplementation(async () => "value"),
        serialize: vi.fn(),
      };
      const fixtureFu = workerFixture(fixture, skipTeardownWorker, callbacks);
      await fixtureFu({ browser }, use);
      expect(callbacks.unserialize).toHaveBeenCalledWith("myFixture");
      expect(fixture.setup).not.toHaveBeenCalled();
      expect(use).toHaveBeenCalledWith("value");
      expect(fixture.teardown).not.toHaveBeenCalled();
    });
  });
});
