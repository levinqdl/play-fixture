import { Browser, TestType } from "@playwright/test";

export interface FixtureSpec<T extends unknown = unknown> {
  name: string;
  init?: () => Promise<T>;
  setup: (...args: any) => Promise<T>;
  teardown: (...args: any) => Promise<T>;
  reserveOnfail?: boolean;
  describe?: (test: TestType<any, any>) => void;
}

const workerFixture = <U>(fixture: FixtureSpec<U>, skipTeardownWorkers: Set<string>) => {
  const fixtureName = fixture.name;
  return async function (
    { browser }: { browser: Browser },
    use: (value: U) => Promise<void>
  ) {
    const page = await browser.newPage();
    let value = await fixture.init?.();
    let setuped = false;
    if (!value) {
      setuped = true;
      value = await fixture.setup({ page });
      console.log(`[fixture setup] ${fixtureName} as ${JSON.stringify(value)}`);
    } else {
      console.log(`[fixture reuse] ${fixtureName} as ${JSON.stringify(value)}`);
    }
    await use(value);
    if (setuped && (!fixture.reserveOnfail && !skipTeardownWorkers.has(fixtureName))) {
      await fixture.teardown({ page, [fixture.name]: value });
      console.log(
        `[fixture teardown] ${fixtureName} as ${JSON.stringify(value)}`
      );
    }
  };
};

export default workerFixture;
