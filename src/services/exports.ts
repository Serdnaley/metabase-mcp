import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import type { MetabaseClient } from "../client.js";
import { buildCardParameters } from "./cards.js";
import { apiError } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

export type ExportFormat = "csv" | "json" | "xlsx";

/** Default cap on text returned inline; MCP clients choke on multi-MB tool results. */
export const DEFAULT_MAX_INLINE_CHARS = 100_000;

export type FileOutput = {
  /** Absolute path to write the file to. Required for binary formats (xlsx, pdf). */
  output_path?: string;
  /** Overwrite output_path if it already exists (default false). */
  overwrite?: boolean;
  /** Max characters of csv/json returned inline when output_path is not given. */
  max_inline_chars?: number;
};

const filenameFrom = (response: Response): string | undefined => {
  const disposition = response.headers.get("content-disposition") ?? "";
  return /filename="?([^";]+)"?/.exec(disposition)?.[1];
};

/** Fail fast on a bad output_path before running a possibly slow export. */
const checkOutput = (format: string, output: FileOutput) => {
  if (output.output_path) {
    if (!isAbsolute(output.output_path)) throw new Error(`output_path must be absolute: ${output.output_path}`);
    if (existsSync(output.output_path) && !output.overwrite) {
      throw new Error(`File exists: ${output.output_path} (pass overwrite: true to replace it)`);
    }
  } else if (format === "xlsx" || format === "pdf") {
    throw new Error(`${format} is binary: pass output_path to save it to a file`);
  }
};

/** Write to output_path, or return text inline (truncated) for text formats. */
const deliver = async (
  bytes: ArrayBuffer,
  response: Response,
  format: string,
  output: FileOutput
) => {
  const filename = filenameFrom(response);
  if (output.output_path) {
    await writeFile(output.output_path, new Uint8Array(bytes));
    return { format, path: output.output_path, bytes: bytes.byteLength, suggested_filename: filename };
  }
  const text = new TextDecoder().decode(bytes);
  const max = output.max_inline_chars ?? DEFAULT_MAX_INLINE_CHARS;
  const truncated = text.length > max;
  return {
    format,
    bytes: bytes.byteLength,
    suggested_filename: filename,
    truncated,
    content: truncated ? text.slice(0, max) : text,
    ...(truncated ? { note: `Output truncated to ${max} of ${text.length} characters; pass output_path for the full file.` } : {}),
  };
};

export const exportCardQuery = async (
  client: MetabaseClient,
  cardId: number,
  params: FileOutput & {
    format: ExportFormat;
    parameter_values?: Record<string, unknown>;
    format_rows?: boolean;
  }
) => {
  checkOutput(params.format, params);
  const parameters = await buildCardParameters(client, cardId, params.parameter_values);
  const body: Record<string, unknown> = { format_rows: params.format_rows ?? false };
  if (parameters) body.parameters = parameters;
  const { data, error, response } = await client.POST("/api/card/{card-id}/query/{export-format}", {
    params: { path: { "card-id": cardId, "export-format": params.format } },
    body,
    parseAs: "arrayBuffer",
  });
  if (error) throw await apiError(client, "Export card query", error);
  return deliver(data as ArrayBuffer, response, params.format, params);
};

export const exportQuery = async (
  client: MetabaseClient,
  params: FileOutput & { format: ExportFormat; query: Record<string, unknown>; format_rows?: boolean }
) => {
  checkOutput(params.format, params);
  const { data, error, response } = await anyClient(client).POST("/api/dataset/{export-format}", {
    params: { path: { "export-format": params.format } },
    body: { query: params.query, format_rows: params.format_rows ?? false },
    parseAs: "arrayBuffer",
  });
  if (error) throw await apiError(client, "Export query", error);
  return deliver(data as ArrayBuffer, response, params.format, params);
};

export const exportDashboardPdf = async (
  client: MetabaseClient,
  dashboardId: number,
  params: FileOutput & { paper_size?: "a4" | "letter"; parameters?: unknown[] }
) => {
  checkOutput("pdf", params);
  const body: Record<string, unknown> = {};
  if (params.paper_size) body.paper_size = params.paper_size;
  if (params.parameters) body.parameters = params.parameters;
  const { data, error, response } = await client.POST("/api/dashboard/{id}/pdf", {
    params: { path: { id: dashboardId } },
    body,
    parseAs: "arrayBuffer",
  });
  if (error) throw await apiError(client, "Export dashboard PDF", error, 64);
  return deliver(data as ArrayBuffer, response, "pdf", params);
};
