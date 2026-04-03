import { writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const SPEC_URL = "https://www.metabase.com/docs/master/api.json";
const SPEC_PATH = "generated/metabase-api.json";
const OUTPUT_PATH = "generated/metabase-api.d.ts";

// Keys containing these chars break openapi-typescript's JSON pointer / URI parser
const isProblematicKey = (key: string): boolean =>
  key !== "$ref" &&
  !key.startsWith("application/") &&
  (key.includes("/") || key.includes("~") || key.includes("%"));

// Recursively check if an object tree contains problematic keys
const hasProblematicKeys = (obj: unknown): boolean => {
  if (!obj || typeof obj !== "object") return false;
  if (Array.isArray(obj)) return obj.some(hasProblematicKeys);
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (isProblematicKey(key)) return true;
    if (hasProblematicKeys((obj as Record<string, unknown>)[key])) return true;
  }
  return false;
};

// Recursively remove problematic keys from objects (without removing the object itself)
const cleanProblematicKeys = (obj: unknown): unknown => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cleanProblematicKeys);
  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (isProblematicKey(k)) continue; // skip this key entirely
    result[k] = cleanProblematicKeys(v);
  }
  return result;
};

async function main() {
  console.log("Downloading Metabase OpenAPI spec...");
  await mkdir("generated", { recursive: true });

  const res = await fetch(SPEC_URL);
  if (!res.ok) throw new Error(`Failed to download spec: ${res.status}`);
  const spec = (await res.json()) as Record<string, unknown>;

  // Fix double dots in schema names
  const schemas =
    (spec.components as Record<string, unknown>)?.schemas as Record<
      string,
      unknown
    >;
  if (schemas) {
    for (const key of Object.keys(schemas)) {
      if (key.includes("..")) {
        const fixedKey = key.replace(/\.\./g, ".");
        schemas[fixedKey] = schemas[key];
        delete schemas[key];
      }
    }

    // Remove schemas with deeply problematic keys, clean others
    let removed = 0;
    for (const key of Object.keys(schemas)) {
      if (hasProblematicKeys(schemas[key])) {
        // Try cleaning instead of removing entirely
        schemas[key] = cleanProblematicKeys(schemas[key]);
        // If still problematic after cleaning, remove
        if (hasProblematicKeys(schemas[key])) {
          delete schemas[key];
          removed++;
        }
      }
    }
    console.log(`Removed ${removed} unfixable schemas`);
  }

  // Fix all $refs throughout the spec
  const fixRefs = (obj: unknown): unknown => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(fixRefs);
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      if (k === "$ref" && typeof v === "string") {
        let fixed = v.replace(/\.\./g, ".");
        // Remove sub-schema pointer paths
        fixed = fixed.replace(/^(#\/components\/schemas\/[^/]+)\/.*$/, "$1");
        // Check if target schema exists
        const schemaName = fixed.replace("#/components/schemas/", "");
        if (
          fixed.startsWith("#/components/schemas/") &&
          !schemas?.[schemaName]
        ) {
          result["type"] = "object";
          result["additionalProperties"] = true;
          continue;
        }
        result[k] = fixed;
      } else {
        result[k] = fixRefs(v);
      }
    }
    return result;
  };

  const fixedSpec = fixRefs(spec);
  const fixedText = JSON.stringify(fixedSpec, null, 2);
  writeFileSync(SPEC_PATH, fixedText);
  console.log("Spec saved at", SPEC_PATH);

  console.log("Generating TypeScript types...");
  const ast = await openapiTS(JSON.parse(fixedText));
  const contents = astToString(ast);

  writeFileSync(OUTPUT_PATH, contents);
  console.log("Generated types at", OUTPUT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
