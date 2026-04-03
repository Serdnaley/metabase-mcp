const METABASE_URL = process.env.METABASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = "test@metabase-mcp.dev";
const ADMIN_PASSWORD = "MetabaseMCP123!";
const SETUP_STATE_FILE = "/tmp/metabase-mcp-test-setup.json";

const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${METABASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
};

const getSetupToken = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${METABASE_URL}/api/session/properties`);
    const data = (await res.json()) as Record<string, unknown>;
    return (data["setup-token"] as string) || null;
  } catch {
    return null;
  }
};

const completeSetup = async (setupToken: string): Promise<void> => {
  const res = await fetch(`${METABASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: setupToken,
      user: {
        first_name: "Test",
        last_name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        site_name: "Metabase MCP Test",
      },
      prefs: {
        site_name: "Metabase MCP Test",
        site_locale: "en",
        allow_tracking: false,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Setup failed (${res.status}): ${body}`);
  }
};

const login = async (): Promise<string> => {
  const res = await fetch(`${METABASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Login failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
};

const createApiKey = async (sessionToken: string): Promise<string> => {
  const res = await fetch(`${METABASE_URL}/api/api-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Metabase-Session": sessionToken,
    },
    body: JSON.stringify({
      name: "test-api-key",
      group_id: 2, // Administrators group
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Create API key failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { unmasked_key: string };
  return data.unmasked_key;
};

const main = async () => {
  console.log("Checking Metabase health...");
  const healthy = await checkHealth();
  if (!healthy) {
    console.error(
      "Metabase is not running. Start it with: docker compose up -d"
    );
    process.exit(1);
  }
  console.log("Metabase is healthy");

  // Check if setup is needed
  const setupToken = await getSetupToken();
  if (setupToken) {
    console.log("Completing initial Metabase setup...");
    await completeSetup(setupToken);
    console.log("Setup complete");
  }

  // Login and create API key
  console.log("Logging in and creating API key...");
  const sessionToken = await login();
  const apiKey = await createApiKey(sessionToken);
  console.log("API key created");

  // Write state for tests to read
  const state = { metabaseUrl: METABASE_URL, apiKey };
  await Bun.write(SETUP_STATE_FILE, JSON.stringify(state));
  console.log("Test setup complete");
};

await main();
