import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export type HttpOptions = {
  host: string;
  port: number;
  /** Bearer token clients must send; undefined only with allowNoAuth on a loopback host */
  token?: string;
  allowNoAuth: boolean;
  /** Max request body in bytes */
  maxBodyBytes?: number;
};

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

/**
 * Reads MCP_TRANSPORT / MCP_HTTP_* (or `--http` on the command line).
 * Returns null for stdio. Throws on an unsafe or invalid HTTP setup.
 */
export const loadHttpOptions = (
  env: Record<string, string | undefined>,
  argv: string[] = []
): HttpOptions | null => {
  const transport = (argv.includes("--http") ? "http" : env.MCP_TRANSPORT ?? "stdio").toLowerCase();
  if (transport === "stdio") return null;
  if (transport !== "http") throw new Error(`MCP_TRANSPORT must be "stdio" or "http", got "${transport}"`);

  const host = env.MCP_HTTP_HOST || "127.0.0.1";
  const port = Number(env.MCP_HTTP_PORT || env.PORT || 3333);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error(`Invalid MCP_HTTP_PORT: ${port}`);

  const token = env.MCP_HTTP_TOKEN || undefined;
  const allowNoAuth = env.MCP_HTTP_ALLOW_NO_AUTH === "true";
  if (!token) {
    if (!allowNoAuth) {
      throw new Error("HTTP mode needs MCP_HTTP_TOKEN (clients send it as `Authorization: Bearer <token>`)");
    }
    if (!LOOPBACK_HOSTS.has(host)) {
      throw new Error("MCP_HTTP_ALLOW_NO_AUTH=true is only allowed when MCP_HTTP_HOST is a loopback address");
    }
  }
  if (token && token.length < 16) throw new Error("MCP_HTTP_TOKEN must be at least 16 characters");
  return { host, port, token, allowNoAuth, maxBodyBytes: 4 * 1024 * 1024 };
};

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Constant-time bearer check (hashing first makes lengths equal). */
export const checkBearer = (header: string | undefined, token: string): boolean => {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  if (!match) return false;
  return timingSafeEqual(digest(match[1].trim()), digest(token));
};

const sendJson = (res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) => {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};

const readBody = (req: IncomingMessage, limit: number): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (!text) return resolve(undefined);
      try {
        resolve(JSON.parse(text));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });

/**
 * Streamable HTTP endpoint at /mcp (stateless: a fresh MCP server per request,
 * sharing one Metabase client). GET /health is unauthenticated and reveals nothing.
 */
export const startHttpServer = (
  createMcpServer: () => McpServer,
  opts: HttpOptions
): Promise<Server> => {
  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (url.pathname === "/health") {
      return sendJson(res, 200, { status: "ok" });
    }
    if (url.pathname !== "/mcp") {
      return sendJson(res, 404, { error: "Not found" });
    }
    if (opts.token && !checkBearer(req.headers.authorization, opts.token)) {
      return sendJson(res, 401, { error: "Unauthorized" }, { "WWW-Authenticate": 'Bearer realm="metabase-mcp"' });
    }
    if (req.method !== "POST") {
      // Stateless server: no standalone SSE stream, no sessions to delete
      return sendJson(
        res,
        405,
        { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null },
        { Allow: "POST" }
      );
    }

    let body: unknown;
    try {
      body = await readBody(req, opts.maxBodyBytes ?? 4 * 1024 * 1024);
    } catch (err) {
      return sendJson(res, (err as any).status ?? 400, { error: (err as Error).message });
    }

    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      // Without a token, only accept localhost Host headers (blocks DNS rebinding)
      ...(opts.token
        ? {}
        : {
            enableDnsRebindingProtection: true,
            allowedHosts: [`127.0.0.1:${opts.port}`, `localhost:${opts.port}`, `[::1]:${opts.port}`],
          }),
    });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      console.error("HTTP request failed:", err);
      if (!res.headersSent) {
        sendJson(res, 500, { jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
      }
    }
  });

  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(opts.port, opts.host, () => resolve(httpServer));
  });
};
