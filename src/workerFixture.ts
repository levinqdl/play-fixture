import { Browser, TestType } from "@playwright/test";

type FixtureValues = Record<string, unknown>;

export interface FixtureSpec<
  N extends string = string,
  V = unknown,
  T extends { [key in N]: V } = { [key in N]: V }
> {
  name: N;
  init?: () => Promise<T>;
  setup: (...args: any[]) => Promise<T>;
  teardown: (...args: any[]) => Promise<T>;
  reserveOnFail?: boolean;
}

export interface Callbacks<U extends FixtureValues> {
  unserialize: () => Promise<U> | U;
  serialize: (d: U) => void | Promise<void>;
}

const workerFixture = <N extends string, V, T extends { [key in N]: V }>(
  fixture: FixtureSpec<N, V, T>,
  skipTeardownWorkers: Set<string>,
  callbacks?: Callbacks<T>
) => {
  const fixtureName = fixture.name;
  async function fn(
    fixtures: any,
    use: (value: V) => Promise<void>
  ) {
    let values = await callbacks?.unserialize();
    let setuped = false;
    let value: V | undefined = values?.[fixture.name];
    if (!value) {
      setuped = true;
      values = await fixture.setup(fixtures);
      value = values?.[fixture.name];
      console.log(`[fixture setup] ${fixtureName} as ${JSON.stringify(value)}`);
    } else {
      console.log(`[fixture reuse] ${fixtureName} as ${JSON.stringify(value)}`);
    }
    await use(value);
    if (
      setuped &&
      !fixture.reserveOnFail &&
      !skipTeardownWorkers.has(fixtureName)
    ) {
      values = await fixture.teardown({ ...fixtures, [fixture.name]: value });
      await callbacks?.serialize(values);
      console.log(
        `[fixture teardown] ${fixtureName} as ${JSON.stringify(value)}`
      );
    }
  };
  fn.toString = () => fixture.setup.toString()
  return fn
};

export default workerFixture;
