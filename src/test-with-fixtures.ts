import { test as base } from "@playwright/test";
import workerFixture, { Callbacks, FixtureSpec } from "./workerFixture";

const skipTeardownWorker = new Set<string>();

export default <
  T extends Record<string, FixtureSpec<U>>,
  U = T extends Record<string, FixtureSpec<infer V>> ? V : unknown,
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
          function getFixtures(f: any) {
            const params = f[Object.getOwnPropertySymbols(f)[0]];
            const fixtureNames = params.filter((p: string) =>
              fixtures.some((f) => f.name === p)
            );
            return fixtureNames;
          }
          if (testInfo.status !== testInfo.expectedStatus) {
            for (const hook of (testInfo as any)._test.parent._hooks) {
              if (hook.type === "beforeEach") {
                const fixtureNames = getFixtures(hook.fn);
                for (const fixtureName of fixtureNames) {
                  skipTeardownWorker.add(fixtureName);
                }
              }
            }
            const fixtureNames = getFixtures(testInfo.fn);
            for (const fixtureName of fixtureNames) {
              skipTeardownWorker.add(fixtureName);
            }
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
            workerFixture(fixture, skipTeardownWorker, callbacks),
            { scope: "worker" },
          ];
          return acc;
        },
        {}
      )
    );
  return test;
};
