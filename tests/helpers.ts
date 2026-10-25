import { createMetabaseClient, type MetabaseClient } from "../src/client.js";

const SETUP_STATE_FILE = "/tmp/metabase-mcp-test-setup.json";

interface SetupState {
  metabaseUrl: string;
  apiKey: string;
}

let cachedState: SetupState | null = null;

export const getSetupState = async (): Promise<SetupState> => {
  if (cachedState) return cachedState;
  try {
    const raw = await Bun.file(SETUP_STATE_FILE).text();
    cachedState = JSON.parse(raw) as SetupState;
    return cachedState;
  } catch {
    throw new Error(
      "Test setup state not found. Run 'bun run tests/setup.ts' first or start tests with 'bun test'."
    );
  }
};

let cachedClient: MetabaseClient | null = null;

export const getTestClient = async (): Promise<MetabaseClient> => {
  if (cachedClient) return cachedClient;
  const state = await getSetupState();
  cachedClient = await createMetabaseClient({
    metabaseUrl: state.metabaseUrl,
    apiKey: state.apiKey,
    readOnly: false,
  });
  return cachedClient;
};

// Sample database ID is always 1 in a fresh Metabase install
export const SAMPLE_DB_ID = 1;

// Generate a unique name for test entities to avoid collisions
export const testName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Premium features of the running Metabase (all false on OSS)
let cachedFeatures: Record<string, boolean> | null = null;
export const getTokenFeatures = async (): Promise<Record<string, boolean>> => {
  if (cachedFeatures) return cachedFeatures;
  const state = await getSetupState();
  const res = await fetch(`${state.metabaseUrl}/api/session/properties`);
  const props = (await res.json()) as { "token-features"?: Record<string, boolean> };
  cachedFeatures = props["token-features"] ?? {};
  return cachedFeatures;
};

/**
 * Run `fn`; if it fails with an error matching one of `envErrors` (a known
 * environment limitation such as a paid feature or missing server config),
 * log an explicit SKIP instead of failing. Any other error — including
 * "API endpoint does not exist", which means our route is wrong — fails the test.
 */
export const skipOnEnvError = async (label: string, envErrors: RegExp[], fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (!/API endpoint does not exist/.test(msg) && envErrors.some((re) => re.test(msg))) {
      console.log(`SKIP ${label} (environment): ${msg.slice(0, 200)}`);
      return;
    }
    throw e;
  }
};
