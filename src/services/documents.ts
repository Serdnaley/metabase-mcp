import type { MetabaseClient } from "../client.js";

type ProseMirrorDoc = Record<string, unknown>;

/** Build a minimal ProseMirror doc from plain text: one paragraph per non-empty line block. */
export const textToProseMirror = (text: string): ProseMirrorDoc => ({
  type: "doc",
  content: text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => ({ type: "paragraph", content: [{ type: "text", text: block }] })),
});

const EMPTY_DOC: ProseMirrorDoc = { type: "doc", content: [] };

/** `document` (ProseMirror JSON) wins; `content` is the pre-0.3 alias; `text` is a plain-text shortcut. */
const resolveDocument = (params: {
  document?: ProseMirrorDoc;
  content?: ProseMirrorDoc;
  text?: string;
}): ProseMirrorDoc | undefined =>
  params.document ?? params.content ?? (params.text !== undefined ? textToProseMirror(params.text) : undefined);

export const listDocuments = async (client: MetabaseClient) => {
  const { data, error } = await client.GET("/api/document", {});
  if (error) throw new Error(`List documents failed: ${JSON.stringify(error)}`);
  return data;
};

export const getDocument = async (client: MetabaseClient, id: number) => {
  const { data, error } = await (client as any).GET("/api/document/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Get document failed: ${JSON.stringify(error)}`);
  return data;
};

export const createDocument = async (
  client: MetabaseClient,
  params: {
    name: string;
    collection_id?: number;
    document?: ProseMirrorDoc;
    content?: ProseMirrorDoc;
    text?: string;
  }
) => {
  const body: Record<string, unknown> = {
    name: params.name,
    // Metabase requires `document` (a ProseMirror AST); default to an empty doc
    document: resolveDocument(params) ?? EMPTY_DOC,
  };
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  const { data, error } = await (client as any).POST("/api/document", { body });
  if (error) throw new Error(`Create document failed: ${JSON.stringify(error)}`);
  return data;
};

export const updateDocument = async (
  client: MetabaseClient,
  id: number,
  params: {
    name?: string;
    collection_id?: number;
    document?: ProseMirrorDoc;
    content?: ProseMirrorDoc;
    text?: string;
    archived?: boolean;
  }
) => {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.collection_id !== undefined) body.collection_id = params.collection_id;
  const document = resolveDocument(params);
  if (document !== undefined) body.document = document;
  if (params.archived !== undefined) body.archived = params.archived;
  const { data, error } = await (client as any).PUT("/api/document/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(`Update document failed: ${JSON.stringify(error)}`);
  return data;
};

export const deleteDocument = async (client: MetabaseClient, id: number) => {
  // Metabase only hard-deletes archived documents, so archive first
  await updateDocument(client, id, { archived: true });
  const { error } = await (client as any).DELETE("/api/document/{id}", {
    params: { path: { id } },
  });
  if (error) throw new Error(`Delete document failed: ${JSON.stringify(error)}`);
  return { success: true };
};
