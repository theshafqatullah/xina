import { Client, Databases, ID } from "node-appwrite";

type Config = {
  endpoint: string;
  projectId: string;
  apiKey: string;
};

type Payload = {
  action: string;
  config?: Partial<Config>;
  data?: Record<string, any>;
};

function getEnvConfig(): Partial<Config> {
  return {
    endpoint: process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "",
    projectId: process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
    apiKey: process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY || "",
  };
}

function buildClient(config: Config) {
  const client = new Client();
  client.setEndpoint(config.endpoint).setProject(config.projectId).setKey(config.apiKey);
  return client;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? Number(value) : value
  ), { status, headers: { "Content-Type": "application/json" } });
}

function ok(data: unknown) {
  return json({ ok: true, data });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    if (!body?.action) return json({ error: "Missing action" }, 400);

    const { action, config: rc, data: d } = body;
    const env = getEnvConfig();
    const cfg: Config = {
      endpoint: rc?.endpoint || env.endpoint || "",
      projectId: rc?.projectId || env.projectId || "",
      apiKey: rc?.apiKey || env.apiKey || "",
    };

    if (!cfg.endpoint || !cfg.projectId || !cfg.apiKey) {
      return json({ error: "Missing Appwrite connection details (endpoint/projectId/apiKey)." }, 400);
    }

    const db = new Databases(buildClient(cfg));
    const p = d ?? {};

    switch (action) {
      /* ─── Databases ─── */
      case "listDatabases":
        return ok(await db.list(p.queries, p.search));
      case "getDatabase":
        return ok(await db.get(p.databaseId));
      case "createDatabase":
        return ok(await db.create(p.databaseId || ID.unique(), p.name, p.enabled));
      case "updateDatabase":
        return ok(await db.update(p.databaseId, p.name, p.enabled));
      case "deleteDatabase":
        return ok(await db.delete(p.databaseId));

      /* ─── Collections ─── */
      case "listCollections":
        return ok(await db.listCollections(p.databaseId, p.queries, p.search));
      case "getCollection":
        return ok(await db.getCollection(p.databaseId, p.collectionId));
      case "createCollection":
        return ok(await db.createCollection({
          databaseId: p.databaseId,
          collectionId: p.collectionId || ID.unique(),
          name: p.name,
          permissions: p.permissions,
          documentSecurity: p.documentSecurity,
          enabled: p.enabled,
        }));
      case "updateCollection":
        return ok(await db.updateCollection({
          databaseId: p.databaseId,
          collectionId: p.collectionId,
          name: p.name,
          permissions: p.permissions,
          documentSecurity: p.documentSecurity,
          enabled: p.enabled,
        }));
      case "deleteCollection":
        return ok(await db.deleteCollection(p.databaseId, p.collectionId));

      /* ─── Attributes ─── */
      case "listAttributes":
        return ok(await db.listAttributes(p.databaseId, p.collectionId, p.queries));
      case "getAttribute":
        return ok(await db.getAttribute(p.databaseId, p.collectionId, p.key));
      case "deleteAttribute":
        return ok(await db.deleteAttribute(p.databaseId, p.collectionId, p.key));

      case "createStringAttribute":
        return ok(await db.createStringAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, size: p.size ?? 255, required: p.required ?? false,
          xdefault: p.xdefault, array: p.array, encrypt: p.encrypt,
        }));
      case "updateStringAttribute":
        return ok(await db.updateStringAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, size: p.size, required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createIntegerAttribute":
        return ok(await db.createIntegerAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          min: p.min, max: p.max, xdefault: p.xdefault, array: p.array,
        }));
      case "updateIntegerAttribute":
        return ok(await db.updateIntegerAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          min: p.min, max: p.max, xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createFloatAttribute":
        return ok(await db.createFloatAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          min: p.min, max: p.max, xdefault: p.xdefault, array: p.array,
        }));
      case "updateFloatAttribute":
        return ok(await db.updateFloatAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          min: p.min, max: p.max, xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createBooleanAttribute":
        return ok(await db.createBooleanAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, array: p.array,
        }));
      case "updateBooleanAttribute":
        return ok(await db.updateBooleanAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createEmailAttribute":
        return ok(await db.createEmailAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, array: p.array,
        }));
      case "updateEmailAttribute":
        return ok(await db.updateEmailAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createUrlAttribute":
        return ok(await db.createUrlAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, array: p.array,
        }));
      case "updateUrlAttribute":
        return ok(await db.updateUrlAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createIpAttribute":
        return ok(await db.createIpAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, array: p.array,
        }));
      case "updateIpAttribute":
        return ok(await db.updateIpAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createDatetimeAttribute":
        return ok(await db.createDatetimeAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, array: p.array,
        }));
      case "updateDatetimeAttribute":
        return ok(await db.updateDatetimeAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createEnumAttribute":
        return ok(await db.createEnumAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, elements: p.elements ?? [], required: p.required ?? false,
          xdefault: p.xdefault, array: p.array,
        }));
      case "updateEnumAttribute":
        return ok(await db.updateEnumAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, elements: p.elements ?? [], required: p.required ?? false,
          xdefault: p.xdefault, newKey: p.newKey,
        }));
      case "createRelationshipAttribute":
        return ok(await db.createRelationshipAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          relatedCollectionId: p.relatedCollectionId, type: p.type,
          twoWay: p.twoWay, key: p.key, twoWayKey: p.twoWayKey, onDelete: p.onDelete,
        }));
      case "updateRelationshipAttribute":
        return ok(await db.updateRelationshipAttribute({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, onDelete: p.onDelete, newKey: p.newKey,
        }));

      /* ─── Documents ─── */
      case "listDocuments":
        return ok(await db.listDocuments(p.databaseId, p.collectionId, p.queries));
      case "getDocument":
        return ok(await db.getDocument(p.databaseId, p.collectionId, p.documentId, p.queries));
      case "createDocument":
        return ok(await db.createDocument({
          databaseId: p.databaseId, collectionId: p.collectionId,
          documentId: p.documentId || ID.unique(),
          data: p.data ?? {}, permissions: p.permissions,
        }));
      case "updateDocument":
        return ok(await db.updateDocument({
          databaseId: p.databaseId, collectionId: p.collectionId,
          documentId: p.documentId,
          data: p.data, permissions: p.permissions,
        }));
      case "deleteDocument":
        return ok(await db.deleteDocument(p.databaseId, p.collectionId, p.documentId));

      /* ─── Indexes ─── */
      case "listIndexes":
        return ok(await db.listIndexes(p.databaseId, p.collectionId, p.queries));
      case "getIndex":
        return ok(await db.getIndex(p.databaseId, p.collectionId, p.key));
      case "createIndex":
        return ok(await db.createIndex({
          databaseId: p.databaseId, collectionId: p.collectionId,
          key: p.key, type: p.type, attributes: p.attributes,
          orders: p.orders,
        }));
      case "deleteIndex":
        return ok(await db.deleteIndex(p.databaseId, p.collectionId, p.key));

      default:
        return json({ error: `Unrecognized action: ${action}` }, 400);
    }
  } catch (error: any) {
    const msg = error?.message ?? String(error);
    const code = error?.code;
    const type = error?.type;
    return json({ error: msg, code, type }, error?.code >= 400 && error?.code < 600 ? error.code : 500);
  }
}
