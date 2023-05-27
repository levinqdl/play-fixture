import { test as base } from "@playwright/test";
import workerFixture, { Callbacks, FixtureSpec } from "./workerFixture";
import { getFixtures } from "./getFixtures";
import skippedTeardowns from "./skipped-teardowns";

type ExtractFixtureNames<T extends Record<string, FixtureSpec>> = {
  [K in keyof T]: T[K] extends FixtureSpec ? T[K]["name"] : never;
}[keyof T];

export default <
  T extends Record<string, FixtureSpec>,
  N extends ExtractFixtureNames<T> = ExtractFixtureNames<T>
>(
  fixtureSpecs: T,
  callbacks?: Callbacks<Record<string, unknown>>
) => {
  const fixtures = Object.values(fixtureSpecs);
  const test = base
    .extend<{ faillingWithFixture: void }>({
      faillingWithFixture: [
        async ({}, use, testInfo) => {
          await use();

          const names = fixtures.map((f) => f.name);
          function markFixturesTeardownSkipped(fn: any) {
            const fixtureNames = getFixtures(fn).filter((p: string) =>
              names.some((n) => n === p)
            );
            for (const fixtureName of fixtureNames) {
              skippedTeardowns.add(fixtureName);
            }
          }
          if (testInfo.status !== testInfo.expectedStatus) {
            for (const hook of (testInfo as any)._test.parent._hooks) {
              if (hook.type === "beforeEach") {
                markFixturesTeardownSkipped(hook.fn);
              }
            }
            markFixturesTeardownSkipped(testInfo.fn);
          }
        },
        { auto: true },
      ],
    })
    .extend(
      fixtures.reduce<{ [key in N]: any }>(
        (acc, fixture) => {
          const fixtureName = fixture.name as N;
          acc[fixtureName] = [
            workerFixture(fixture, skippedTeardowns, callbacks),
            { scope: "worker" },
          ];
          return acc;
        },
        {} as {[ key in N ]: any}
      )
    );
  return test;
};
