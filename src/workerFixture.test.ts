import { beforeEach, describe, expect, test, vi } from "vitest";
import workerFixture from "./workerFixture";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("worker fixture", () => {
  const setup = async ({ page, project }) => ({ myFixture: "setup value" });
  const fixture = {
    name: "myFixture",
    setup: vi
      .fn()
      .mockImplementation(setup),
    teardown: vi
      .fn()
      .mockImplementation(async ({page, project}) => ({ myFixture: "teardown value" })),
  };
  fixture.setup.toString = () => setup.toString();
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
    expect(fixtureFu.toString()).contains("{ page, project }")
  });
  describe("callbacks", () => {
    test("teardown & serialize on unserialize return falsy value", async () => {
      const callbacks = {
        unserialize: vi
          .fn()
          .mockImplementation(async () => ({ myFixture: "" })),
        serialize: vi.fn(),
      };
      const fixtureFu = workerFixture(fixture, skipTeardownWorker, callbacks);
      await fixtureFu({ browser }, use);
      expect(callbacks.unserialize).toHaveBeenCalledWith();
      expect(fixture.setup).toHaveBeenCalled();
      expect(use).toHaveBeenCalledWith("setup value");
      expect(fixture.teardown).toHaveBeenCalled();
      expect(callbacks.serialize).toHaveBeenCalledWith({
        myFixture: "teardown value",
      });
    });
    test("reuse without teardown & serialize if unserialize return turthy value", async () => {
      const callbacks = {
        unserialize: vi
          .fn()
          .mockImplementation(async () => ({ myFixture: "value" })),
        serialize: vi.fn(),
      };
      const fixtureFu = workerFixture(fixture, skipTeardownWorker, callbacks);
      await fixtureFu({ browser }, use);
      expect(callbacks.unserialize).toHaveBeenCalledWith();
      expect(fixture.setup).not.toHaveBeenCalled();
      expect(use).toHaveBeenCalledWith("value");
      expect(fixture.teardown).not.toHaveBeenCalled();
    });
  });
});
