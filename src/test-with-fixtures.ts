import { test as base } from "@playwright/test";
import workerFixture, { Callbacks, FixtureSpec } from "./workerFixture";
import { getFixtures } from "./getFixtures";
import skippedTeardowns from "./skipped-teardowns";

export default <
  T extends Record<string, FixtureSpec<U>>,
  U = T extends Record<string, FixtureSpec<infer V>> ? V : unknown
>(
  fixtureSpecs: T,
  callbacks?: Callbacks<U>
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
      fixtures.reduce<{ [key in FixtureSpec<U>["name"]]: any }>(
        (acc, fixture) => {
          const fixtureName = fixture.name;
          acc[fixtureName] = [
            workerFixture(fixture, skippedTeardowns, callbacks),
            { scope: "worker" },
          ];
          return acc;
        },
        {}
      )
    );
  return test;
};
