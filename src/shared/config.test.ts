function load(dev: boolean) {
  const g = globalThis as unknown as { __DEV__: boolean };
  const prev = g.__DEV__;
  g.__DEV__ = dev;
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://x';
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'k';
  process.env.EXPO_PUBLIC_ENABLE_TEST_LOGIN = 'true';
  try {
    let c: { enableTestLogin: boolean } | undefined;
    jest.isolateModules(() => {
      c = require('./config').config;
    });
    return c!.enableTestLogin;
  } finally {
    g.__DEV__ = prev;
  }
}

test('test login is on when the flag is set and __DEV__ is true', () => {
  expect(load(true)).toBe(true);
});

test('production config (__DEV__ false) cannot enable test login even with the flag set', () => {
  expect(load(false)).toBe(false);
});
