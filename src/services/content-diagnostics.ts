import type { MetabaseClient } from "../client.js";
import { apiError, getMetabaseVersion } from "./version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyClient = (client: MetabaseClient): any => client;

// Content diagnostics (Metabase 0.65+, paid plans): background checkers flag stale, slow,
// duplicated and empty/sparse/crowded content. Lists are permission-filtered for the caller.

export const FINDING_KINDS = ["stale", "slow", "duplicated", "imbalanced"] as const;
export type FindingKind = (typeof FINDING_KINDS)[number];

export const ENTITY_TYPES = ["question", "model", "metric", "card", "dashboard", "document", "collection", "transform"] as const;

export type FindingQuery = {
  entity_types?: (typeof ENTITY_TYPES)[number][];
  /** Free-text filter on names */
  query?: string;
  include_personal_collections?: boolean;
  sort_column?: string;
  sort_direction?: "asc" | "desc";
  /** stale: only items inactive at least this many days */
  threshold_days?: number;
  /** slow: only items slower than this */
  min_duration_ms?: number;
  /** duplicated: only items with at least this many duplicates */
  min_duplicate_count?: number;
  /** imbalanced: which checks (empty, sparse, crowded) */
  finding_types?: ("empty" | "sparse" | "crowded")[];
};

const isMissingEndpoint = (error: unknown) => JSON.stringify(error ?? "").includes("API endpoint does not exist");

const diagnosticsError = async (client: MetabaseClient, action: string, error: unknown, status?: number) => {
  if (status === 402 || isMissingEndpoint(error)) {
    const version = await getMetabaseVersion(client);
    if (!version || version.major >= 65) {
      return new Error(
        `${action} failed: content diagnostics is a paid feature (Metabase Pro or Enterprise, 0.65+); this instance does not provide it`
      );
    }
  }
  return apiError(client, action, error, 65);
};

// API query params are kebab-case (sort-column, threshold-days, ...)
const toQuery = (q: FindingQuery) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined) continue;
    out[k.replace(/_/g, "-")] = v;
  }
  return out;
};

/** Findings of one kind: the latest valid finding per entity. */
export const listContentFindings = async (client: MetabaseClient, kind: FindingKind, q: FindingQuery = {}) => {
  const { data, error, response } = await anyClient(client).GET(`/api/ee/content-diagnostics/${kind}`, {
    params: { query: toQuery(q) },
  });
  if (error) throw await diagnosticsError(client, `List ${kind} content`, error, response?.status);
  return data;
};

/** Dismiss findings by id (soft and global: they leave every user's lists). */
export const dismissContentFindings = async (client: MetabaseClient, ids: number[]) => {
  const { data, error, response } = await anyClient(client).POST("/api/ee/content-diagnostics/invalidate", {
    body: { ids },
  });
  if (error) throw await diagnosticsError(client, "Dismiss content findings", error, response?.status);
  return data;
};
