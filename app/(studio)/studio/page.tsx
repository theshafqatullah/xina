"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Database as DatabaseIcon,
  Table2,
  Type,
  Hash,
  ToggleLeft,
  AtSign,
  Link2,
  Globe,
  Calendar,
  ListOrdered,
  GitBranch,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  Search,
  Settings,
  Plug,
  LayoutGrid,
  FileText,
  Key,
  Pencil,
  ArrowLeft,
  GripVertical,
  Loader2,
  Check,
  AlertCircle,
  Layers,
  Columns3,
  Moon,
  Sun,
} from "lucide-react";

/* ─── Types ─── */
type AppwriteConfig = { endpoint: string; projectId: string; apiKey: string };
type DatabaseT = { $id: string; name: string };
type Collection = { $id: string; name: string; permissions?: string[]; $permissions?: string[] };
type Attribute = {
  key: string;
  type: string;
  required?: boolean;
  size?: number;
  twoWay?: boolean;
  two_way?: boolean;
  twoWayKey?: string;
  two_way_key?: string;
  relationType?: string;
  relation_type?: string;
  relatedCollectionId?: string;
  relatedCollection?: string | { $id?: string; id?: string; key?: string };
  related_collection_id?: string;
  related_collection?: string;
  elements?: string[];
  min?: number;
  max?: number;
  xdefault?: any;
};
type DocumentT = { $id: string; [key: string]: any };
type IndexDef = { key: string; type: string; attributes: string[]; orders?: string[] };
type CanvasNode = { id: string; x: number; y: number; label: string; dbId: string };
type Rel = { id: string; from: string; to: string; fromAttrKey: string; toAttrKey?: string };
type ThemeMode = "light" | "dark";

type ModalState =
  | null
  | { kind: "createDb" }
  | { kind: "createCol"; pos?: { x: number; y: number } }
  | { kind: "createAttr"; colId: string; attrType: AttrType }
  | { kind: "createDoc" }
  | { kind: "editDoc"; docId: string; json: string }
  | { kind: "createIndex" }
  | { kind: "permissionRule" }
  | { kind: "typesPreview"; colId: string }
  | { kind: "confirm"; title: string; message: string; onConfirm: () => void };

type LanguageOpt = {
  id: string;
  label: string;
  ext: string;
};

type LoadOpts = { silent?: boolean };

type PermissionAction = "read" | "create" | "update" | "delete";
type PermissionSubject = "any" | "guests" | "users" | "user" | "team" | "teamRole" | "member" | "label";
type PermissionGrant = {
  id: string;
  subject: PermissionSubject;
  value: string;
  teamRole: string;
  actions: PermissionAction[];
};

const PERMISSION_ACTIONS: PermissionAction[] = ["read", "create", "update", "delete"];
const PERMISSION_SUBJECTS: Array<{ value: PermissionSubject; label: string }> = [
  { value: "any", label: "Anyone" },
  { value: "users", label: "Authenticated Users" },
  { value: "guests", label: "Guests" },
  { value: "user", label: "Specific User" },
  { value: "team", label: "Team" },
  { value: "teamRole", label: "Team Role" },
  { value: "member", label: "Membership" },
  { value: "label", label: "Label" },
];

function makePermissionGrant(overrides?: Partial<PermissionGrant>): PermissionGrant {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subject: "any",
    value: "",
    teamRole: "",
    actions: ["read"],
    ...overrides,
  };
}

function permissionToEntry(permission: string): Omit<PermissionGrant, "id" | "actions"> & { actions: PermissionAction[] } | null {
  const m = permission.match(/^([a-z]+)\("([^"]+)"\)$/i);
  if (!m) return null;

  const actionRaw = m[1];
  const role = m[2];

  // Normalize Appwrite alias `write` into explicit CRUD actions.
  const actions: PermissionAction[] = actionRaw === "write"
    ? ["create", "update", "delete"]
    : PERMISSION_ACTIONS.includes(actionRaw as PermissionAction)
      ? [actionRaw as PermissionAction]
      : [];
  if (!actions.length) return null;

  if (role === "any") return { actions, subject: "any", value: "", teamRole: "" };
  if (role === "users") return { actions, subject: "users", value: "", teamRole: "" };
  if (role === "guests") return { actions, subject: "guests", value: "", teamRole: "" };
  if (role.startsWith("user:")) return { actions, subject: "user", value: role.slice(5), teamRole: "" };
  if (role.startsWith("member:")) return { actions, subject: "member", value: role.slice(7), teamRole: "" };
  if (role.startsWith("label:")) return { actions, subject: "label", value: role.slice(6), teamRole: "" };
  if (role.startsWith("team:")) {
    const payload = role.slice(5);
    const slash = payload.indexOf("/");
    if (slash > -1) {
      return {
        actions,
        subject: "teamRole",
        value: payload.slice(0, slash),
        teamRole: payload.slice(slash + 1),
      };
    }
    return { actions, subject: "team", value: payload, teamRole: "" };
  }

  return null;
}

function roleKey(subject: PermissionSubject, value: string, teamRole: string) {
  return `${subject}::${value.trim()}::${teamRole.trim()}`;
}

function parsePermissionsToGrants(permissions: string[]): PermissionGrant[] {
  const grouped = new Map<string, PermissionGrant>();

  for (const permission of permissions) {
    const entry = permissionToEntry(permission);
    if (!entry) continue;
    const key = roleKey(entry.subject, entry.value, entry.teamRole);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(
        key,
        makePermissionGrant({
          subject: entry.subject,
          value: entry.value,
          teamRole: entry.teamRole,
          actions: [...entry.actions],
        })
      );
      continue;
    }

    for (const action of entry.actions) {
      if (!existing.actions.includes(action)) existing.actions.push(action);
    }
  }

  return Array.from(grouped.values());
}

function grantToPermission(action: PermissionAction, grant: PermissionGrant): string | null {
  const v = grant.value.trim();
  const r = grant.teamRole.trim();

  if (grant.subject === "any") return `${action}("any")`;
  if (grant.subject === "users") return `${action}("users")`;
  if (grant.subject === "guests") return `${action}("guests")`;
  if (grant.subject === "user") return v ? `${action}("user:${v}")` : null;
  if (grant.subject === "member") return v ? `${action}("member:${v}")` : null;
  if (grant.subject === "label") return v ? `${action}("label:${v}")` : null;
  if (grant.subject === "team") return v ? `${action}("team:${v}")` : null;
  if (grant.subject === "teamRole") return v && r ? `${action}("team:${v}/${r}")` : null;
  return null;
}

function grantsToPermissions(grants: PermissionGrant[]): string[] {
  const permissions: string[] = [];
  for (const grant of grants) {
    for (const action of grant.actions) {
      const p = grantToPermission(action, grant);
      if (p) permissions.push(p);
    }
  }
  return permissions;
}

const TYPE_LANGS: LanguageOpt[] = [
  { id: "typescript", label: "TypeScript", ext: "ts" },
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "python", label: "Python", ext: "py" },
  { id: "dart", label: "Dart", ext: "dart" },
  { id: "go", label: "Go", ext: "go" },
  { id: "php", label: "PHP", ext: "php" },
  { id: "ruby", label: "Ruby", ext: "rb" },
  { id: "kotlin", label: "Kotlin", ext: "kt" },
  { id: "swift", label: "Swift", ext: "swift" },
  { id: "java", label: "Java", ext: "java" },
  { id: "csharp", label: "C#", ext: "cs" },
];

const ATTR_TYPES = ["string", "integer", "float", "boolean", "email", "url", "ip", "datetime", "enum", "relationship"] as const;
type AttrType = (typeof ATTR_TYPES)[number];

/* ─── Attribute type visuals ─── */
function typeColor(t: string): string {
  const colors: Record<string, string> = {
    string: "#06b6d4", integer: "#8b5cf6", float: "#a78bfa", boolean: "#10b981",
    email: "#f97316", url: "#3b82f6", ip: "#ec4899", datetime: "#eab308",
    enum: "#14b8a6", relationship: "#6366f1",
  };
  return colors[t] ?? "#6b7280";
}

function TypeIcon({ type, size = 14 }: { type: string; size?: number }) {
  const props = { size, strokeWidth: 2 };
  switch (type) {
    case "string": return <Type {...props} />;
    case "integer": return <Hash {...props} />;
    case "float": return <Hash {...props} />;
    case "boolean": return <ToggleLeft {...props} />;
    case "email": return <AtSign {...props} />;
    case "url": return <Link2 {...props} />;
    case "ip": return <Globe {...props} />;
    case "datetime": return <Calendar {...props} />;
    case "enum": return <ListOrdered {...props} />;
    case "relationship": return <GitBranch {...props} />;
    default: return <Type {...props} />;
  }
}

function DialogSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={S.switchRow}
    >
      <span style={S.switchLabel}>{label}</span>
      <span style={{ ...S.switchTrack, background: checked ? "#6366f1" : "#cbd5e1" }}>
        <span
          style={{
            ...S.switchThumb,
            transform: checked ? "translateX(14px)" : "translateX(0)",
          }}
        />
      </span>
    </button>
  );
}

function pascalCase(input: string) {
  return input
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") || "Model";
}

function safeFieldName(input: string) {
  return input.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^\d/, "_$&");
}

function parseCreateDefault(attrType: AttrType, raw: string): unknown {
  const v = raw.trim();
  if (!v) return undefined;

  if (attrType === "integer") {
    const n = Number(v);
    if (!Number.isInteger(n)) throw new Error("Default must be an integer");
    return n;
  }
  if (attrType === "float") {
    const n = Number(v);
    if (Number.isNaN(n)) throw new Error("Default must be a number");
    return n;
  }
  if (attrType === "boolean") {
    const low = v.toLowerCase();
    if (low === "true") return true;
    if (low === "false") return false;
    throw new Error("Default must be true or false");
  }

  // Appwrite expects datetime defaults as ISO 8601 strings.
  return v;
}

function relationshipTargetId(attr: Attribute): string | null {
  const raw = attr as Record<string, unknown>;
  const directCandidates = [
    attr.relatedCollectionId,
    typeof attr.relatedCollection === "string" ? attr.relatedCollection : undefined,
    typeof attr.related_collection_id === "string" ? attr.related_collection_id : undefined,
    typeof attr.related_collection === "string" ? attr.related_collection : undefined,
    typeof raw.relatedCollectionID === "string" ? (raw.relatedCollectionID as string) : undefined,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  const relatedObj = typeof attr.relatedCollection === "object" && attr.relatedCollection
    ? attr.relatedCollection
    : null;
  const nestedCandidates = relatedObj
    ? [relatedObj.$id, relatedObj.id, relatedObj.key]
    : [];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  return null;
}

function relationshipIsTwoWay(attr: Attribute): boolean {
  const raw = attr as Record<string, unknown>;
  const v = raw.twoWay ?? raw.two_way;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
}

function relationshipTwoWayKey(attr: Attribute): string | null {
  const raw = attr as Record<string, unknown>;
  const key = raw.twoWayKey ?? raw.two_way_key;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

function relationshipMirrorId(from: string, to: string, key: string, twoWayKey: string): string {
  const a = `${from}.${key}`;
  const b = `${to}.${twoWayKey}`;
  return [a, b].sort().join("↔");
}

function relationRowCenterY(nodeY: number, attrs: Attribute[], wantedKey: string): number | null {
  const idx = attrs.findIndex((a) => a.type === "relationship" && a.key === wantedKey);
  if (idx < 0) return null;
  return nodeY + NODE_HEADER + SYS_ATTR_TOP.length * ATTR_ROW + (idx * ATTR_ROW) + ATTR_ROW / 2;
}

function extractRelationshipEdges(all: Record<string, Attribute[]>): Rel[] {
  const edges: Rel[] = [];
  const seen = new Set<string>();
  const seenMirror = new Set<string>();

  for (const [from, attrs] of Object.entries(all)) {
    for (const attr of attrs) {
      if (attr.type !== "relationship") continue;
      const to = relationshipTargetId(attr);
      if (!to) continue;

      // Stable per-attribute edge identity.
      const edgeId = `${from}→${to}→${attr.key}`;
      if (seen.has(edgeId)) continue;

      // Deduplicate only mirrored sides of a declared two-way relationship.
      const twoWayKey = relationshipTwoWayKey(attr);
      if (relationshipIsTwoWay(attr) && twoWayKey) {
        const mirrorId = relationshipMirrorId(from, to, attr.key, twoWayKey);
        if (seenMirror.has(mirrorId)) continue;
        seenMirror.add(mirrorId);
      }

      seen.add(edgeId);
      edges.push({ id: edgeId, from, to, fromAttrKey: attr.key, toAttrKey: twoWayKey ?? undefined });
    }
  }

  return edges;
}

function mapType(attrType: string, langId: string) {
  const map: Record<string, Record<string, string>> = {
    string: {
      typescript: "string",
      javascript: "string",
      python: "str",
      dart: "String",
      go: "string",
      php: "string",
      ruby: "String",
      kotlin: "String",
      swift: "String",
      java: "String",
      csharp: "string",
    },
    integer: {
      typescript: "number",
      javascript: "number",
      python: "int",
      dart: "int",
      go: "int",
      php: "int",
      ruby: "Integer",
      kotlin: "Int",
      swift: "Int",
      java: "int",
      csharp: "int",
    },
    float: {
      typescript: "number",
      javascript: "number",
      python: "float",
      dart: "double",
      go: "float64",
      php: "float",
      ruby: "Float",
      kotlin: "Double",
      swift: "Double",
      java: "double",
      csharp: "double",
    },
    boolean: {
      typescript: "boolean",
      javascript: "boolean",
      python: "bool",
      dart: "bool",
      go: "bool",
      php: "bool",
      ruby: "Boolean",
      kotlin: "Boolean",
      swift: "Bool",
      java: "boolean",
      csharp: "bool",
    },
    datetime: {
      typescript: "string",
      javascript: "string",
      python: "str",
      dart: "DateTime",
      go: "time.Time",
      php: "string",
      ruby: "String",
      kotlin: "String",
      swift: "String",
      java: "String",
      csharp: "string",
    },
    enum: {
      typescript: "string",
      javascript: "string",
      python: "str",
      dart: "String",
      go: "string",
      php: "string",
      ruby: "String",
      kotlin: "String",
      swift: "String",
      java: "String",
      csharp: "string",
    },
    relationship: {
      typescript: "string",
      javascript: "string",
      python: "str",
      dart: "String",
      go: "string",
      php: "string",
      ruby: "String",
      kotlin: "String",
      swift: "String",
      java: "String",
      csharp: "string",
    },
  };

  const fallback = map.string[langId] ?? "string";
  return map[attrType]?.[langId] ?? fallback;
}

function generateTypeCode(collection: Collection, attrs: Attribute[], langId: string) {
  const className = pascalCase(collection.name || collection.$id);
  const fields = attrs.map((a) => ({ name: safeFieldName(a.key), type: mapType(a.type, langId), required: !!a.required }));

  if (langId === "typescript") {
    const body = fields.map((f) => `  ${f.name}${f.required ? "" : "?"}: ${f.type};`).join("\n");
    return `import { type Models } from "appwrite";

// Appwrite docs style: extend Models.Row for table row types
export interface ${className} extends Models.Row {
${body || "  // no custom attributes yet"}
}

// Example usage
// const rows = await tablesDB.listRows<${className}>({
//   databaseId: "<DATABASE_ID>",
//   tableId: "<TABLE_ID>",
// });`;
  }

  if (langId === "javascript") {
    const body = fields.map((f) => ` * @property {${f.type}} ${f.name}`).join("\n");
    return `/**
 * @typedef {Object} ${className}
${body || " * no custom attributes yet"}
 */

// Example usage (Web SDK)
// const rows = await tablesDB.listRows({
//   databaseId: "<DATABASE_ID>",
//   tableId: "<TABLE_ID>",
// });`;
  }

  if (langId === "python") {
    const body = fields.map((f) => `    ${f.name}: ${f.type}${f.required ? "" : " | None = None"}`).join("\n");
    return `from dataclasses import dataclass\n\n@dataclass\nclass ${className}:\n${body || "    pass"}`;
  }

  if (langId === "dart") {
    const body = fields.map((f) => `  final ${f.type}${f.required ? "" : "?"} ${f.name};`).join("\n");
    const ctor = fields.length
      ? `  const ${className}({\n${fields.map((f) => `    ${f.required ? "required " : ""}this.${f.name},`).join("\n")}\n  });`
      : `  const ${className}();`;
    return `class ${className} {\n${body || "  // no custom attributes yet"}\n\n${ctor}\n}`;
  }

  if (langId === "go") {
    const body = fields.map((f) => `\t${pascalCase(f.name)} ${f.type} \`json:"${f.name}"\``).join("\n");
    return `type ${className} struct {\n${body || "\t// no custom attributes yet"}\n}`;
  }

  if (langId === "php") {
    const body = fields.map((f) => `    public ${f.type} $${f.name};`).join("\n");
    return `class ${className} {\n${body || "    // no custom attributes yet"}\n}`;
  }

  if (langId === "ruby") {
    const body = fields.map((f) => `  attr_accessor :${f.name}`).join("\n");
    return `class ${className}\n${body || "  # no custom attributes yet"}\nend`;
  }

  if (langId === "kotlin") {
    const body = fields.map((f) => `    val ${f.name}: ${f.type}${f.required ? "" : "?"}`).join(",\n");
    return `data class ${className}(
${body || "    // no custom attributes yet"}
)

// Appwrite docs style: nestedType for type-safe responses
// val rows = tablesDB.listRows(
//   databaseId = "<DATABASE_ID>",
//   tableId = "<TABLE_ID>",
//   nestedType = ${className}::class.java
// )`;
  }

  if (langId === "swift") {
    const body = fields.map((f) => `    let ${f.name}: ${f.type}${f.required ? "" : "?"}`).join("\n");
    return `struct ${className}: Codable {
${body || "    // no custom attributes yet"}
}

// Appwrite docs style: nestedType for type-safe responses
// let rows = try await tablesDB.listRows(
//   databaseId: "<DATABASE_ID>",
//   tableId: "<TABLE_ID>",
//   nestedType: ${className}.self
// )`;
  }

  if (langId === "java") {
    const body = fields.map((f) => `    public ${f.type} ${f.name};`).join("\n");
    return `public class ${className} {\n${body || "    // no custom attributes yet"}\n}`;
  }

  if (langId === "csharp") {
    const body = fields.map((f) => `    public ${f.type}${f.required ? "" : "?"} ${pascalCase(f.name)} { get; set; }`).join("\n");
    return `public class ${className}\n{\n${body || "    // no custom attributes yet"}\n}`;
  }

  return "// Unsupported language";
}

/* ─── Appwrite system attributes ─── */
const SYS_ATTR_TOP: Attribute[] = [
  { key: "$id", type: "string", required: true },
];
const SYS_ATTR_BOTTOM: Attribute[] = [
  { key: "$createdAt", type: "datetime", required: true },
  { key: "$updatedAt", type: "datetime", required: true },
];

/* ─── Layout constants ─── */
const NODE_W = 290;
const NODE_HEADER = 44;
const ATTR_ROW = 32;
const GRID = 20;
const PANEL_MARGIN = 10;
const LEFT_PANEL_WIDTH = 280;
const RIGHT_PANEL_WIDTH = 320;
const nodeH = (n: number) => NODE_HEADER + SYS_ATTR_TOP.length * ATTR_ROW + Math.max(1, n) * ATTR_ROW + SYS_ATTR_BOTTOM.length * ATTR_ROW;

function filled(v: unknown): v is string { return typeof v === "string" && v.trim().length > 0; }
function cfgReady(c: AppwriteConfig) { return filled(c.endpoint) && filled(c.projectId) && filled(c.apiKey); }

function normalizeCollection(raw: any): Collection {
  return {
    $id: raw?.$id,
    name: raw?.name,
    permissions: Array.isArray(raw?.permissions)
      ? raw.permissions
      : Array.isArray(raw?.$permissions)
        ? raw.$permissions
        : [],
    $permissions: Array.isArray(raw?.$permissions) ? raw.$permissions : undefined,
  };
}

const envCfg: AppwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  apiKey: process.env.NEXT_PUBLIC_APPWRITE_API_KEY ?? "",
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function StudioPage() {
  const [cfg, setCfg] = useState<AppwriteConfig>({ endpoint: "", projectId: "", apiKey: "" });
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  const [databases, setDatabases] = useState<DatabaseT[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [documents, setDocuments] = useState<DocumentT[]>([]);
  const [indexes, setIndexes] = useState<IndexDef[]>([]);
  const [allAttrs, setAllAttrs] = useState<Record<string, Attribute[]>>({});

  const [selDb, setSelDb] = useState<DatabaseT | null>(null);
  const [selCol, setSelCol] = useState<Collection | null>(null);
  const [selAttr, setSelAttr] = useState<Attribute | null>(null);
  const [selDoc, setSelDoc] = useState<DocumentT | null>(null);
  const [tab, setTab] = useState<"schema" | "permissions" | "indexes">("schema");

  const [nodes, setNodes] = useState<Record<string, CanvasNode>>({});
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const [editName, setEditName] = useState("");
  const [permissionGrants, setPermissionGrants] = useState<PermissionGrant[]>([]);
  const [permissionEditingId, setPermissionEditingId] = useState<string | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<PermissionGrant>(makePermissionGrant());
  const [editReq, setEditReq] = useState(false);
  const [editSize, setEditSize] = useState<number | undefined>();
  const [editDef, setEditDef] = useState("");

  const [modal, setModal] = useState<ModalState>(null);
  const [mf, setMf] = useState<Record<string, string>>({});
  const closeModal = () => { setModal(null); setMf({}); };

  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const activeDbIdRef = useRef<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  /* ─── Persist config ─── */
  const saveCfg = (c: AppwriteConfig) => {
    setCfg(c);
    try { localStorage.setItem("xinaAppwriteConfig", JSON.stringify(c)); } catch {}
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xinaAppwriteConfig");
      const saved = raw ? JSON.parse(raw) : null;
      const merged = { ...envCfg, ...(saved ?? {}) };
      setCfg(merged);
      if (cfgReady(merged)) setConnected(true);
    } catch {}
  }, []);

  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("xinaTheme") : null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(media.matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("xinaTheme", theme);
    } catch {}
  }, [theme]);

  const themeVars = useMemo<React.CSSProperties>(() => {
    if (theme === "dark") {
      return {
        ["--bg" as string]: "#0c0f1a",
        ["--text" as string]: "#e2e8f0",
        ["--text-dim" as string]: "#94a3b8",
        ["--muted" as string]: "#6b7280",
        ["--muted-2" as string]: "#475569",
        ["--panel-bg" as string]: "#0f1220",
        ["--panel-float" as string]: "rgba(15,18,32,0.78)",
        ["--panel-elev" as string]: "#111827",
        ["--panel-border" as string]: "#1e293b",
        ["--line" as string]: "#1a1f35",
        ["--surface" as string]: "#0c0f1a",
        ["--glass" as string]: "rgba(15,18,32,0.85)",
        ["--glass-strong" as string]: "rgba(15,18,32,0.9)",
        ["--accent-soft" as string]: "#818cf8",
        ["--accent-soft-bg" as string]: "rgba(99,102,241,0.1)",
        ["--accent-soft-border" as string]: "rgba(99,102,241,0.2)",
        ["--canvas-bg" as string]: "#0c0f1a",
        ["--canvas-dot" as string]: "#1a1f35",
        ["--toast-bg" as string]: "#1e293b",
        ["--toast-text" as string]: "#e2e8f0",
        ["--toast-border" as string]: "#334155",
      };
    }

    return {
      ["--bg" as string]: "#f4f7fb",
      ["--text" as string]: "#0f172a",
      ["--text-dim" as string]: "#334155",
      ["--muted" as string]: "#64748b",
      ["--muted-2" as string]: "#475569",
      ["--panel-bg" as string]: "#ffffff",
      ["--panel-float" as string]: "rgba(255,255,255,0.78)",
      ["--panel-elev" as string]: "#ffffff",
      ["--panel-border" as string]: "#d9e1ec",
      ["--line" as string]: "#e8edf3",
      ["--surface" as string]: "#f8fafc",
      ["--glass" as string]: "rgba(255,255,255,0.82)",
      ["--glass-strong" as string]: "rgba(255,255,255,0.9)",
      ["--accent-soft" as string]: "#4f46e5",
      ["--accent-soft-bg" as string]: "rgba(79,70,229,0.08)",
      ["--accent-soft-border" as string]: "rgba(79,70,229,0.25)",
      ["--canvas-bg" as string]: "#eef2f7",
      ["--canvas-dot" as string]: "#d8dee9",
      ["--toast-bg" as string]: "#ffffff",
      ["--toast-text" as string]: "#0f172a",
      ["--toast-border" as string]: "#d9e1ec",
    };
  }, [theme]);

  /* ─── API ─── */
  const api = useCallback(async (action: string, data?: Record<string, unknown>) => {
    const r = await fetch("/api/appwrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, config: cfg, data }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Unknown error");
    return j.data;
  }, [cfg]);

  /* ─── Data loaders ─── */
  const loadDatabases = useCallback(async (opts?: LoadOpts) => {
    const silent = !!opts?.silent;
    if (!silent) setBusy(true);
    try {
      const d = await api("listDatabases");
      const list: DatabaseT[] = d?.databases ?? [];
      setDatabases(list);
      setSelDb((prev) => {
        if (!list.length) return null;
        if (prev) return list.find((db) => db.$id === prev.$id) ?? list[0];
        return list[0];
      });
      return list;
    } catch (e: any) { toast.error(e.message); }
    finally { if (!silent) setBusy(false); }
  }, [api, selDb]);

  const loadCollections = useCallback(async (dbId: string, opts?: LoadOpts) => {
    const silent = !!opts?.silent;
    if (!silent) setBusy(true);
    try {
      const d = await api("listCollections", { databaseId: dbId });
      if (activeDbIdRef.current !== dbId) {
        return [];
      }

      const list: Collection[] = (d?.collections ?? []).map((c: any) => normalizeCollection(c));
      setCollections(list);
      setSelCol((prev) => {
        if (!prev) {
          return null;
        }
        return list.find((c) => c.$id === prev.$id) ?? null;
      });

      setNodes((prev) => {
        const next: Record<string, CanvasNode> = {};
        list.forEach((c, index) => {
          const existing = prev[c.$id];
          if (existing?.dbId === dbId) {
            next[c.$id] = { ...existing, label: c.name };
            return;
          }
          next[c.$id] = {
            id: c.$id,
            label: c.name,
            dbId,
            x: 80 + (index % 4) * 300,
            y: 80 + Math.floor(index / 4) * 220,
          };
        });
        return next;
      });
      return list;
    } catch (e: any) { toast.error(e.message); }
    finally { if (!silent) setBusy(false); }
  }, [api]);

  const loadAttributes = useCallback(async (dbId: string, colId: string, opts?: LoadOpts) => {
    const silent = !!opts?.silent;
    if (!silent) setBusy(true);
    try {
      const d = await api("listAttributes", { databaseId: dbId, collectionId: colId });
      const list: Attribute[] = d?.attributes ?? [];
      setAttributes(list);
      setAllAttrs(prev => ({ ...prev, [colId]: list }));
      return list;
    } catch (e: any) { toast.error(e.message); }
    finally { if (!silent) setBusy(false); }
  }, [api]);

  const loadDocuments = useCallback(async (dbId: string, colId: string, opts?: LoadOpts) => {
    const silent = !!opts?.silent;
    if (!silent) setBusy(true);
    try {
      const d = await api("listDocuments", { databaseId: dbId, collectionId: colId });
      setDocuments(d?.documents ?? []);
    } catch (e: any) { toast.error(e.message); }
    finally { if (!silent) setBusy(false); }
  }, [api]);

  const loadIndexes = useCallback(async (dbId: string, colId: string, opts?: LoadOpts) => {
    const silent = !!opts?.silent;
    if (!silent) setBusy(true);
    try {
      const d = await api("listIndexes", { databaseId: dbId, collectionId: colId });
      setIndexes(d?.indexes ?? []);
    } catch (e: any) { toast.error(e.message); }
    finally { if (!silent) setBusy(false); }
  }, [api]);

  const loadAllAttributes = useCallback(async (dbId: string, cols: Collection[]) => {
    const result: Record<string, Attribute[]> = {};
    await Promise.all(cols.map(async (col) => {
      try {
        const d = await api("listAttributes", { databaseId: dbId, collectionId: col.$id });
        const list: Attribute[] = d?.attributes ?? [];
        result[col.$id] = list;
      } catch { result[col.$id] = []; }
    }));
    setAllAttrs(result);
  }, [api]);

  const refreshSchemaSilent = useCallback(async () => {
    const dbList = (await loadDatabases({ silent: true })) ?? [];
    if (!dbList.length) return;

    const activeDbId = (selDb && dbList.some((db) => db.$id === selDb.$id)) ? selDb.$id : dbList[0].$id;
    activeDbIdRef.current = activeDbId;

    const cols = (await loadCollections(activeDbId, { silent: true })) ?? [];
    await loadAllAttributes(activeDbId, cols);

    const selectedColId = selCol && cols.some((c) => c.$id === selCol.$id)
      ? selCol.$id
      : (cols[0]?.$id ?? null);

    if (selectedColId) {
      await loadAttributes(activeDbId, selectedColId, { silent: true });
      if (tab === "indexes") await loadIndexes(activeDbId, selectedColId, { silent: true });
    }
  }, [
    loadDatabases,
    loadCollections,
    loadAllAttributes,
    loadAttributes,
    loadIndexes,
    selDb,
    selCol,
    tab,
  ]);

  /* ─── Effects ─── */
  useEffect(() => { if (connected) loadDatabases({ silent: true }); }, [connected]);
  useEffect(() => {
    if (!selDb) {
      activeDbIdRef.current = null;
      return;
    }

    activeDbIdRef.current = selDb.$id;
    setSelCol(null);
    setSelAttr(null);
    setSelDoc(null);
    loadCollections(selDb.$id, { silent: true });
  }, [selDb?.$id, loadCollections]);
  useEffect(() => {
    if (selDb && selCol) {
      loadAttributes(selDb.$id, selCol.$id, { silent: true });
      if (tab === "indexes") loadIndexes(selDb.$id, selCol.$id, { silent: true });
    }
  }, [selDb?.$id, selCol?.$id, tab]);
  useEffect(() => {
    if (selDb && collections.length > 0) loadAllAttributes(selDb.$id, collections);
  }, [selDb?.$id, collections.length]);
  useEffect(() => {
    if (selCol) setEditName(selCol.name);
    else if (selDb) setEditName(selDb.name);
    else setEditName("");
  }, [selDb, selCol]);
  useEffect(() => {
    if (!selCol) {
      setPermissionGrants([]);
      return;
    }
    setPermissionGrants(parsePermissionsToGrants(selCol.permissions ?? []));
  }, [selCol?.$id, selCol?.permissions]);

  const openNewPermissionDialog = () => {
    setPermissionEditingId(null);
    setPermissionDraft(makePermissionGrant());
    setModal({ kind: "permissionRule" });
  };

  const openEditPermissionDialog = (grant: PermissionGrant) => {
    setPermissionEditingId(grant.id);
    setPermissionDraft({ ...grant, actions: [...grant.actions] });
    setModal({ kind: "permissionRule" });
  };

  const savePermissionDialog = () => {
    const draft = {
      ...permissionDraft,
      value: permissionDraft.value.trim(),
      teamRole: permissionDraft.teamRole.trim(),
      actions: permissionDraft.actions,
    };

    if (draft.subject === "user" || draft.subject === "team" || draft.subject === "teamRole" || draft.subject === "member" || draft.subject === "label") {
      if (!draft.value) { toast.error("Role identifier is required"); return; }
    }
    if (draft.subject === "teamRole" && !draft.teamRole) {
      toast.error("Team role is required");
      return;
    }
    if (!draft.actions.length) {
      toast.error("Select at least one action");
      return;
    }

    if (permissionEditingId) {
      setPermissionGrants((prev) => prev.map((g) => (g.id === permissionEditingId ? { ...draft, id: g.id } : g)));
    } else {
      setPermissionGrants((prev) => [...prev, { ...draft, id: makePermissionGrant().id }]);
    }
    closeModal();
  };
  useEffect(() => {
    if (selAttr) { setEditReq(!!selAttr.required); setEditSize(selAttr.size); setEditDef(""); }
    else { setEditReq(false); setEditSize(undefined); setEditDef(""); }
  }, [selAttr]);

  /* ─── Actions ─── */
  const handleConnect = async () => {
    if (!cfgReady(cfg)) { toast.error("Fill all connection fields"); return; }
    setConnected(true);
    toast.success("Connected to Appwrite");
  };

  const doCreateDatabase = async () => {
    const id = mf.dbId?.trim();
    const name = mf.dbName?.trim();
    if (!id || !name) { toast.error("ID and name required"); return; }
    closeModal();
    try {
      await api("createDatabase", { databaseId: id, name });
      toast.success(`Database "${name}" created`);
      await refreshSchemaSilent();
    }
    catch (e: any) { toast.error(e.message); }
  };

  const doDeleteDatabase = async (dbId: string) => {
    try {
      await api("deleteDatabase", { databaseId: dbId });
      toast.success("Database deleted");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doCreateCollection = async (pos?: { x: number; y: number }) => {
    if (!selDb) { toast.error("Select a database first"); return; }
    const id = mf.colId?.trim();
    const name = mf.colName?.trim();
    if (!id || !name) { toast.error("ID and name required"); return; }
    closeModal();
    try {
      await api("createCollection", { databaseId: selDb.$id, collectionId: id, name });
      toast.success(`Collection "${name}" created`);
      await refreshSchemaSilent();
      setSelCol({ $id: id, name });
    } catch (e: any) { toast.error(e.message); }
  };

  const doDeleteCollection = async (colId: string) => {
    if (!selDb) return;
    try {
      await api("deleteCollection", { databaseId: selDb.$id, collectionId: colId });
      if (selCol?.$id === colId) { setSelCol(null); setSelAttr(null); setSelDoc(null); }
      toast.success("Collection deleted");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doCreateAttributeFromForm = async (targetColId?: string) => {
    if (!selDb) return;
    const colId = targetColId || selCol?.$id;
    if (!colId) return;
    const m = modal;
    if (!m || m.kind !== "createAttr") return;
    const key = mf.attrKey?.trim();
    if (!key) { toast.error("Key is required"); return; }
    const required = mf.attrRequired === "true";
    const isArray = mf.attrArray === "true";
    const defaultRaw = mf.attrDefault ?? "";
    if (required && defaultRaw.trim()) {
      toast.error("Default cannot be set when required is enabled");
      return;
    }

    let parsedDefault: unknown;
    try {
      parsedDefault = parseCreateDefault(m.attrType, defaultRaw);
    } catch (err: any) {
      toast.error(err?.message ?? "Invalid default value");
      return;
    }

    closeModal();
    try {
      const base = { databaseId: selDb.$id, collectionId: colId, key, required };
      switch (m.attrType) {
        case "string":
          await api("createStringAttribute", {
            ...base,
            size: Number(mf.attrSize || 255),
            xdefault: parsedDefault,
            array: isArray,
            encrypt: mf.attrEncrypt === "true",
          });
          break;
        case "integer":
          await api("createIntegerAttribute", {
            ...base,
            min: mf.attrMin ? +mf.attrMin : undefined,
            max: mf.attrMax ? +mf.attrMax : undefined,
            xdefault: parsedDefault,
            array: isArray,
          });
          break;
        case "float":
          await api("createFloatAttribute", {
            ...base,
            min: mf.attrMin ? +mf.attrMin : undefined,
            max: mf.attrMax ? +mf.attrMax : undefined,
            xdefault: parsedDefault,
            array: isArray,
          });
          break;
        case "boolean":
          await api("createBooleanAttribute", { ...base, xdefault: parsedDefault, array: isArray });
          break;
        case "email":
          await api("createEmailAttribute", { ...base, xdefault: parsedDefault, array: isArray });
          break;
        case "url":
          await api("createUrlAttribute", { ...base, xdefault: parsedDefault, array: isArray });
          break;
        case "ip":
          await api("createIpAttribute", { ...base, xdefault: parsedDefault, array: isArray });
          break;
        case "datetime":
          await api("createDatetimeAttribute", { ...base, xdefault: parsedDefault, array: isArray });
          break;
        case "enum": {
          const elems = mf.attrEnumValues?.split(",").map(s => s.trim()).filter(Boolean);
          if (!elems?.length) { toast.error("Provide enum values"); return; }
          await api("createEnumAttribute", { ...base, elements: elems, xdefault: parsedDefault, array: isArray });
          break;
        }
        case "relationship": {
          const target = mf.attrRelTarget;
          if (!target) { toast.error("Select a related collection"); return; }
          const twoWay = mf.attrRelTwoWay === "true";
          const twoWayKey = (mf.attrRelTwoWayKey ?? "").trim();
          if (twoWay && !twoWayKey) { toast.error("Two-way key is required when two-way is enabled"); return; }
          await api("createRelationshipAttribute", {
            ...base,
            relatedCollectionId: target,
            type: mf.attrRelType || "manyToOne",
            twoWay,
            twoWayKey: twoWay ? twoWayKey : undefined,
            onDelete: mf.attrRelOnDelete || "restrict",
          });
          break;
        }
      }
      toast.success(`Attribute "${key}" created`);
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doDeleteAttribute = async (key: string) => {
    if (!selDb || !selCol) return;
    try {
      await api("deleteAttribute", { databaseId: selDb.$id, collectionId: selCol.$id, key });
      if (selAttr?.key === key) setSelAttr(null);
      toast.success("Attribute deleted");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doSaveDbName = async () => {
    if (!selDb) return;
    try {
      await api("updateDatabase", { databaseId: selDb.$id, name: editName });
      setSelDb(p => p ? { ...p, name: editName } : p);
      toast.success("Database renamed");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doSaveColName = async () => {
    if (!selDb || !selCol) return;
    try {
      await api("updateCollection", { databaseId: selDb.$id, collectionId: selCol.$id, name: editName });
      setSelCol(p => p ? { ...p, name: editName } : p);
      setNodes(prev => prev[selCol.$id] ? { ...prev, [selCol.$id]: { ...prev[selCol.$id], label: editName } } : prev);
      toast.success("Collection renamed");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doSaveColPermissions = async () => {
    if (!selDb || !selCol) return;
    const permissions = grantsToPermissions(permissionGrants);

    try {
      await api("updateCollection", {
        databaseId: selDb.$id,
        collectionId: selCol.$id,
        permissions,
      });

      // Read back from Appwrite so UI reflects exactly what server stored.
      const updatedRaw = await api("getCollection", {
        databaseId: selDb.$id,
        collectionId: selCol.$id,
      });
      const updated = normalizeCollection(updatedRaw);

      setCollections((prev) => prev.map((c) => (c.$id === updated.$id ? { ...c, ...updated } : c)));
      setSelCol((prev) => (prev && prev.$id === updated.$id ? { ...prev, ...updated } : prev));
      setPermissionGrants(parsePermissionsToGrants(updated.permissions ?? []));
      toast.success("Collection permissions updated");
      await refreshSchemaSilent();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const doSaveAttr = async () => {
    if (!selDb || !selCol || !selAttr) return;
    try {
      const base = { databaseId: selDb.$id, collectionId: selCol.$id, key: selAttr.key, required: editReq, xdefault: editDef || undefined, newKey: selAttr.key };
      const t = selAttr.type;
      if (t === "string") await api("updateStringAttribute", { ...base, size: editSize ?? selAttr.size ?? 255 });
      else if (t === "integer") await api("updateIntegerAttribute", base);
      else if (t === "float") await api("updateFloatAttribute", base);
      else if (t === "boolean") await api("updateBooleanAttribute", base);
      else if (t === "email") await api("updateEmailAttribute", base);
      else if (t === "url") await api("updateUrlAttribute", base);
      else if (t === "ip") await api("updateIpAttribute", base);
      else if (t === "datetime") await api("updateDatetimeAttribute", base);
      else if (t === "enum") await api("updateEnumAttribute", { ...base, elements: selAttr.elements ?? [] });
      else if (t === "relationship") await api("updateRelationshipAttribute", { databaseId: selDb.$id, collectionId: selCol.$id, key: selAttr.key });
      else await api("updateStringAttribute", { ...base, size: editSize ?? 255 });
      toast.success("Attribute updated");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doCreateDocument = async () => {
    if (!selDb || !selCol) return;
    const raw = mf.docJson?.trim();
    if (!raw) { toast.error("Provide JSON data"); return; }
    let data: Record<string, any>;
    try { data = JSON.parse(raw); } catch { toast.error("Invalid JSON"); return; }
    closeModal();
    try {
      await api("createDocument", { databaseId: selDb.$id, collectionId: selCol.$id, data });
      toast.success("Document created");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doUpdateDocument = async () => {
    if (!selDb || !selCol || !modal || modal.kind !== "editDoc") return;
    const raw = mf.docJson?.trim();
    if (!raw) { toast.error("Provide JSON data"); return; }
    let data: Record<string, any>;
    try { data = JSON.parse(raw); } catch { toast.error("Invalid JSON"); return; }
    const docId = modal.docId;
    closeModal();
    try {
      await api("updateDocument", { databaseId: selDb.$id, collectionId: selCol.$id, documentId: docId, data });
      toast.success("Document updated");
      await refreshSchemaSilent();
      setSelDoc(null);
    } catch (e: any) { toast.error(e.message); }
  };

  const doDeleteDocument = async (docId: string) => {
    if (!selDb || !selCol) return;
    try {
      await api("deleteDocument", { databaseId: selDb.$id, collectionId: selCol.$id, documentId: docId });
      if (selDoc?.$id === docId) setSelDoc(null);
      toast.success("Document deleted");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doCreateIndex = async () => {
    if (!selDb || !selCol) return;
    const key = mf.idxKey?.trim();
    const type = mf.idxType?.trim() || "key";
    const attrs = mf.idxAttrs?.split(",").map(s => s.trim()).filter(Boolean);
    if (!key || !attrs?.length) { toast.error("Key and attributes required"); return; }
    closeModal();
    try {
      await api("createIndex", { databaseId: selDb.$id, collectionId: selCol.$id, key, type, attributes: attrs });
      toast.success("Index created");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doDeleteIndex = async (key: string) => {
    if (!selDb || !selCol) return;
    try {
      await api("deleteIndex", { databaseId: selDb.$id, collectionId: selCol.$id, key });
      toast.success("Index deleted");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const doCreateRelationship = async (targetId: string) => {
    if (!selDb || !selCol) return;
    try {
      await api("createRelationshipAttribute", {
        databaseId: selDb.$id, collectionId: selCol.$id, relatedCollectionId: targetId,
        type: "manyToOne", twoWay: false, key: `rel_${selCol.$id}_${targetId}`, onDelete: "restrict",
      });
      toast.success("Relationship created");
      await refreshSchemaSilent();
    } catch (e: any) { toast.error(e.message); }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Types copied to clipboard");
    } catch {
      toast.error("Could not copy types");
    }
  };

  /* ─── Canvas interactions ─── */
  const onCanvasDragOver = (e: React.DragEvent) => e.preventDefault();

  const onCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    const raw = e.dataTransfer.getData("application/x-xina");
    if (!raw) return;
    const payload = JSON.parse(raw);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (payload.type === "new-collection") {
      setMf({}); setModal({ kind: "createCol", pos: { x, y } });
    } else if (payload.type === "new-database") {
      setMf({}); setModal({ kind: "createDb" });
    } else if (payload.type === "collection" && payload.id) {
      setNodes(prev => ({ ...prev, [payload.id]: { ...prev[payload.id], x, y } }));
      setSelCol({ $id: payload.id, name: payload.name });
    } else if (payload.type === "attr-type" && payload.attrType) {
      const targetNode = nodeArr.find(n => {
        const attrs = allAttrs[n.id] ?? [];
        const h = nodeH(attrs.length);
        return x >= n.x && x <= n.x + NODE_W && y >= n.y && y <= n.y + h;
      });
      if (targetNode) {
        setMf({}); setModal({ kind: "createAttr", colId: targetNode.id, attrType: payload.attrType });
      }
    }
  };

  const startPaletteDrag = (e: React.DragEvent, payload: object) => {
    e.dataTransfer.setData("application/x-xina", JSON.stringify(payload));
  };

  const onNodeDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(nodeId);
  };
  const onNodeDragLeave = (e: React.DragEvent) => { e.stopPropagation(); setDropTarget(null); };
  const onNodeDrop = async (e: React.DragEvent, nodeId: string) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    const raw = e.dataTransfer.getData("application/x-xina");
    if (!raw) return;
    const payload = JSON.parse(raw);
    if (payload.type === "attr-type" && payload.attrType) {
      setMf({}); setModal({ kind: "createAttr", colId: nodeId, attrType: payload.attrType });
    }
  };

  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const n = nodes[id];
    if (!n) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrag({ id, ox: (e.clientX - rect.left - pan.x) / zoom - n.x, oy: (e.clientY - rect.top - pan.y) / zoom - n.y });
    const col = collections.find(c => c.$id === id);
    if (col) { setSelCol(col); setSelAttr(null); }
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setNodes(prev => ({ ...prev, [drag.id]: { ...prev[drag.id], x: (e.clientX - rect.left - pan.x) / zoom - drag.ox, y: (e.clientY - rect.top - pan.y) / zoom - drag.oy } }));
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [drag, pan, zoom]);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    setSelCol(null); setSelAttr(null);
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setPanning({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
    }
  };

  useEffect(() => {
    if (!panning) return;
    const move = (e: PointerEvent) => { setPan({ x: panning.px + (e.clientX - panning.sx), y: panning.py + (e.clientY - panning.sy) }); };
    const up = () => setPanning(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [panning]);

  const onCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.2, z * (e.deltaY > 0 ? 0.9 : 1.1))));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable='true']");

      if (e.key === "Escape" && modal) {
        setModal(null);
        return;
      }

      if (typing) return;

      if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(3, z * 1.15));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(0.2, z * 0.85));
      } else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  /* ─── Relationship line geometry ─── */
  const edgeAnchor = (
    from: CanvasNode,
    to: CanvasNode,
    fromAttrs: Attribute[],
    toAttrs: Attribute[],
    fromAttrKey: string,
    toAttrKey?: string
  ) => {
    const fallbackSourceY = from.y + nodeH(fromAttrs.length) / 2;
    const sourceY = relationRowCenterY(from.y, fromAttrs, fromAttrKey) ?? fallbackSourceY;

    const fromCenterX = from.x + NODE_W / 2;
    const fromCenterY = sourceY;
    const toCenterX = to.x + NODE_W / 2;

    // Source stays on fixed side port aligned with relationship row.
    const toRight = toCenterX >= fromCenterX;
    const ax = toRight ? from.x + NODE_W : from.x;
    const ay = sourceY;

    // If target has a matching inverse relationship row, snap to that row side port.
    const targetRowY = toAttrKey ? relationRowCenterY(to.y, toAttrs, toAttrKey) : null;

    let bx: number;
    let by: number;
    if (targetRowY !== null) {
      bx = toRight ? to.x : to.x + NODE_W;
      by = targetRowY;
    } else {
      // One-way: snap to target collection's $id row.
      const idRowY = to.y + NODE_HEADER + ATTR_ROW / 2;
      bx = toRight ? to.x : to.x + NODE_W;
      by = idRowY;
    }

    return { ax, ay, bx, by };
  };

  const roundedPathFromPoints = (points: Array<{ x: number; y: number }>) => {
    const cornerRadius = 10;
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const next = points[i + 1];

      const v1x = cur.x - prev.x;
      const v1y = cur.y - prev.y;
      const v2x = next.x - cur.x;
      const v2y = next.y - cur.y;
      const l1 = Math.hypot(v1x, v1y);
      const l2 = Math.hypot(v2x, v2y);

      if (l1 < 0.01 || l2 < 0.01) {
        d += ` L ${cur.x} ${cur.y}`;
        continue;
      }

      const ux1 = v1x / l1;
      const uy1 = v1y / l1;
      const ux2 = v2x / l2;
      const uy2 = v2y / l2;

      // Skip rounding for near-collinear segments.
      if (Math.abs(ux1 - ux2) < 0.001 && Math.abs(uy1 - uy2) < 0.001) {
        d += ` L ${cur.x} ${cur.y}`;
        continue;
      }

      const r = Math.min(cornerRadius, l1 / 2, l2 / 2);
      const enterX = cur.x - ux1 * r;
      const enterY = cur.y - uy1 * r;
      const exitX = cur.x + ux2 * r;
      const exitY = cur.y + uy2 * r;

      d += ` L ${enterX} ${enterY} Q ${cur.x} ${cur.y} ${exitX} ${exitY}`;
    }

    d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return d;
  };

  const orthogonalEdgePath = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    from: CanvasNode,
    to: CanvasNode,
    fromId: string,
    toId: string,
    offsetLeft: number,
    offsetTop: number
  ) => {
    const PORT_STUB = 18;
    const CLEARANCE = 14;
    const SCAN_STEP = 20;

    // Normalize into local SVG coordinate space.
    const fromX = from.x - offsetLeft;
    const toX = to.x - offsetLeft;

    const fromSide = Math.abs(ax - fromX) < 0.5 ? "left" : "right";
    const toSide = Math.abs(bx - toX) < 0.5
      ? "left"
      : Math.abs(bx - (toX + NODE_W)) < 0.5
        ? "right"
        : "top";

    const startOut = {
      x: fromSide === "left" ? ax - PORT_STUB : ax + PORT_STUB,
      y: ay,
    };

    const endOut = toSide === "top"
      ? { x: bx, y: by - PORT_STUB }
      : {
          x: toSide === "left" ? bx - PORT_STUB : bx + PORT_STUB,
          y: by,
        };

    // Collect obstacle rectangles (with clearance) in local coords.
    const rects: Array<{ l: number; r: number; t: number; b: number }> = [];
    const nodeValues = Object.values(nodes);
    for (let ni = 0; ni < nodeValues.length; ni++) {
      const n = nodeValues[ni];
      if (n.id === fromId || n.id === toId) continue;
      const attrs = allAttrs[n.id] ?? [];
      const h = nodeH(attrs.length);
      rects.push({
        l: (n.x - offsetLeft) - CLEARANCE,
        r: (n.x - offsetLeft) + NODE_W + CLEARANCE,
        t: (n.y - offsetTop) - CLEARANCE,
        b: (n.y - offsetTop) + h + CLEARANCE,
      });
    }

    // Fast segment-obstacle intersection checks.
    const hHit = (y: number, x1: number, x2: number) => {
      const lo = Math.min(x1, x2), hi = Math.max(x1, x2);
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        if (y > r.t && y < r.b && hi > r.l && lo < r.r) return true;
      }
      return false;
    };
    const vHit = (x: number, y1: number, y2: number) => {
      const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        if (x > r.l && x < r.r && hi > r.t && lo < r.b) return true;
      }
      return false;
    };

    const sx = startOut.x, sy = startOut.y;
    const ex = endOut.x, ey = endOut.y;

    // Strategy 1: single L-bend (2 segments, 1 corner) — cheapest.
    // Option A: H then V (corner at ex, sy)
    if (!hHit(sy, sx, ex) && !vHit(ex, sy, ey)) {
      return roundedPathFromPoints([
        { x: ax, y: ay }, { x: sx, y: sy },
        { x: ex, y: sy },
        { x: ex, y: ey }, { x: bx, y: by },
      ]);
    }
    // Option B: V then H (corner at sx, ey)
    if (!vHit(sx, sy, ey) && !hHit(ey, sx, ex)) {
      return roundedPathFromPoints([
        { x: ax, y: ay }, { x: sx, y: sy },
        { x: sx, y: ey },
        { x: ex, y: ey }, { x: bx, y: by },
      ]);
    }

    // Strategy 2: Z/U route with a vertical corridor (H → V → H, 3 segments).
    // Collect candidate X values: obstacle edges + midpoints.
    const xCands: number[] = [sx, ex, (sx + ex) / 2];
    for (let i = 0; i < rects.length; i++) {
      xCands.push(rects[i].l - SCAN_STEP, rects[i].r + SCAN_STEP);
    }
    // Sort by distance to midpoint for shorter paths first.
    const midX = (sx + ex) / 2;
    xCands.sort((a, b) => Math.abs(a - midX) - Math.abs(b - midX));

    for (let i = 0; i < xCands.length; i++) {
      const cx = xCands[i];
      if (!hHit(sy, sx, cx) && !vHit(cx, sy, ey) && !hHit(ey, cx, ex)) {
        return roundedPathFromPoints([
          { x: ax, y: ay }, { x: sx, y: sy },
          { x: cx, y: sy }, { x: cx, y: ey },
          { x: ex, y: ey }, { x: bx, y: by },
        ]);
      }
    }

    // Strategy 3: Z/U route with a horizontal corridor (V → H → V, 3 segments).
    const yCands: number[] = [sy, ey, (sy + ey) / 2];
    for (let i = 0; i < rects.length; i++) {
      yCands.push(rects[i].t - SCAN_STEP, rects[i].b + SCAN_STEP);
    }
    const midY = (sy + ey) / 2;
    yCands.sort((a, b) => Math.abs(a - midY) - Math.abs(b - midY));

    for (let i = 0; i < yCands.length; i++) {
      const cy = yCands[i];
      if (!vHit(sx, sy, cy) && !hHit(cy, sx, ex) && !vHit(ex, cy, ey)) {
        return roundedPathFromPoints([
          { x: ax, y: ay }, { x: sx, y: sy },
          { x: sx, y: cy }, { x: ex, y: cy },
          { x: ex, y: ey }, { x: bx, y: by },
        ]);
      }
    }

    // Strategy 4: 5-segment S-route (H → V → H → V → H).
    // Try combining an X corridor with a Y corridor.
    for (let xi = 0; xi < xCands.length; xi++) {
      const cx = xCands[xi];
      if (hHit(sy, sx, cx)) continue;
      for (let yi = 0; yi < yCands.length; yi++) {
        const cy = yCands[yi];
        if (!vHit(cx, sy, cy) && !hHit(cy, cx, ex) && !vHit(ex, cy, ey)) {
          return roundedPathFromPoints([
            { x: ax, y: ay }, { x: sx, y: sy },
            { x: cx, y: sy }, { x: cx, y: cy },
            { x: ex, y: cy }, { x: ex, y: ey },
            { x: bx, y: by },
          ]);
        }
      }
    }

    // Fallback: simple midpoint route (may cross obstacles but never hangs).
    const mx = (sx + ex) / 2;
    return roundedPathFromPoints([
      { x: ax, y: ay }, { x: sx, y: sy },
      { x: mx, y: sy }, { x: mx, y: ey },
      { x: ex, y: ey }, { x: bx, y: by },
    ]);
  };

  const nodeArr = Object.values(nodes);
  const selNodeId = selCol?.$id ?? null;

  const allRels = useMemo(() => extractRelationshipEdges(allAttrs), [allAttrs]);

  const edgeBounds = useMemo(() => {
    if (!nodeArr.length) {
      return { left: 0, top: 0, width: 1, height: 1 };
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const node of nodeArr) {
      const attrs = allAttrs[node.id] ?? [];
      const h = nodeH(attrs.length);
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + NODE_W);
      maxY = Math.max(maxY, node.y + h);
    }

    const pad = 480;
    return {
      left: minX - pad,
      top: minY - pad,
      width: Math.max(1, maxX - minX + pad * 2),
      height: Math.max(1, maxY - minY + pad * 2),
    };
  }, [nodeArr, allAttrs]);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div style={{ ...S.root, ...themeVars }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1e293b" : "#ffffff",
            color: theme === "dark" ? "#e2e8f0" : "#0f172a",
            border: theme === "dark" ? "1px solid #334155" : "1px solid #d9e1ec",
            borderRadius: 12,
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          },
        }}
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* ═══ MODAL ═══ */}
      <AnimatePresence>
        {modal && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={S.overlay}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              style={{
                ...S.modal,
                ...(modal.kind === "typesPreview" ? S.modalWide : {}),
                ...(modal.kind === "permissionRule" ? { width: 520 } : {}),
              }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={closeModal} style={S.modalClose}><X size={16} /></button>

              {modal.kind === "createDb" && (
                <>
                  <p style={S.modalH}>Create Database</p>
                  <label style={S.label}>Database ID</label>
                  <input autoFocus style={S.input} value={mf.dbId ?? ""} onChange={e => setMf(p => ({ ...p, dbId: e.target.value }))} placeholder="unique-id" />
                  <label style={S.label}>Name</label>
                  <input style={S.input} value={mf.dbName ?? ""} onChange={e => setMf(p => ({ ...p, dbName: e.target.value }))} placeholder="My Database" />
                  <button onClick={doCreateDatabase} disabled={busy} style={S.modalBtnPrimary}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create
                  </button>
                </>
              )}

              {modal.kind === "createCol" && (
                <>
                  <p style={S.modalH}>Create Collection</p>
                  <label style={S.label}>Collection ID</label>
                  <input autoFocus style={S.input} value={mf.colId ?? ""} onChange={e => setMf(p => ({ ...p, colId: e.target.value }))} placeholder="unique-id" />
                  <label style={S.label}>Name</label>
                  <input style={S.input} value={mf.colName ?? ""} onChange={e => setMf(p => ({ ...p, colName: e.target.value }))} placeholder="Users" />
                  <button onClick={() => doCreateCollection(modal.pos)} disabled={busy} style={S.modalBtnPrimary}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create
                  </button>
                </>
              )}

              {modal.kind === "createAttr" && (
                <>
                  <p style={S.modalH}>
                    Add <span style={{ color: typeColor(modal.attrType) }}>{modal.attrType}</span> Attribute
                  </p>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    To: <strong>{collections.find(c => c.$id === modal.colId)?.name ?? modal.colId}</strong>
                  </div>
                  <label style={S.label}>Key</label>
                  <input autoFocus style={S.input} value={mf.attrKey ?? ""} onChange={e => setMf(p => ({ ...p, attrKey: e.target.value }))} placeholder="attribute_key" />
                  <DialogSwitch
                    label="Required"
                    checked={mf.attrRequired === "true"}
                    onChange={(next) => setMf((p) => ({ ...p, attrRequired: next ? "true" : "false" }))}
                  />
                  {modal.attrType !== "relationship" && (
                    <DialogSwitch
                      label="Array"
                      checked={mf.attrArray === "true"}
                      onChange={(next) => setMf((p) => ({ ...p, attrArray: next ? "true" : "false" }))}
                    />
                  )}
                  {modal.attrType === "string" && (
                    <>
                      <label style={S.label}>Max Length</label>
                      <input type="number" style={S.input} value={mf.attrSize ?? "255"} onChange={e => setMf(p => ({ ...p, attrSize: e.target.value }))} />
                      <DialogSwitch
                        label="Encrypt"
                        checked={mf.attrEncrypt === "true"}
                        onChange={(next) => setMf((p) => ({ ...p, attrEncrypt: next ? "true" : "false" }))}
                      />
                    </>
                  )}
                  {(modal.attrType === "integer" || modal.attrType === "float") && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={S.label}>Min</label>
                        <input type="number" style={S.input} value={mf.attrMin ?? ""} onChange={e => setMf(p => ({ ...p, attrMin: e.target.value }))} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={S.label}>Max</label>
                        <input type="number" style={S.input} value={mf.attrMax ?? ""} onChange={e => setMf(p => ({ ...p, attrMax: e.target.value }))} />
                      </div>
                    </div>
                  )}
                  {modal.attrType === "enum" && (
                    <>
                      <label style={S.label}>Values (comma-separated)</label>
                      <input style={S.input} value={mf.attrEnumValues ?? ""} onChange={e => setMf(p => ({ ...p, attrEnumValues: e.target.value }))} placeholder="active, inactive" />
                    </>
                  )}
                  {modal.attrType !== "relationship" && (
                    <>
                      <label style={S.label}>Default</label>
                      <input
                        style={S.input}
                        value={mf.attrDefault ?? ""}
                        onChange={e => setMf(p => ({ ...p, attrDefault: e.target.value }))}
                        placeholder={
                          modal.attrType === "boolean"
                            ? "true or false"
                            : modal.attrType === "datetime"
                              ? "2026-01-01T00:00:00.000Z"
                              : "optional"
                        }
                      />
                    </>
                  )}
                  {modal.attrType === "relationship" && (
                    <>
                      <label style={S.label}>Related Collection</label>
                      <select style={S.select} value={mf.attrRelTarget ?? ""} onChange={e => setMf(p => ({ ...p, attrRelTarget: e.target.value }))}>
                        <option value="">Select...</option>
                        {collections.filter(c => c.$id !== modal.colId).map(c => (
                          <option key={c.$id} value={c.$id}>{c.name}</option>
                        ))}
                      </select>
                      <label style={S.label}>Type</label>
                      <select style={S.select} value={mf.attrRelType ?? "manyToOne"} onChange={e => setMf(p => ({ ...p, attrRelType: e.target.value }))}>
                        <option value="oneToOne">One to One</option>
                        <option value="oneToMany">One to Many</option>
                        <option value="manyToOne">Many to One</option>
                        <option value="manyToMany">Many to Many</option>
                      </select>
                      <DialogSwitch
                        label="Two-way relationship"
                        checked={mf.attrRelTwoWay === "true"}
                        onChange={(next) => setMf((p) => ({ ...p, attrRelTwoWay: next ? "true" : "false" }))}
                      />
                      {mf.attrRelTwoWay === "true" && (
                        <>
                          <label style={S.label}>Two-way Key</label>
                          <input style={S.input} value={mf.attrRelTwoWayKey ?? ""} onChange={e => setMf(p => ({ ...p, attrRelTwoWayKey: e.target.value }))} placeholder="inverse_relation_key" />
                        </>
                      )}
                      <label style={S.label}>On Delete</label>
                      <select style={S.select} value={mf.attrRelOnDelete ?? "restrict"} onChange={e => setMf(p => ({ ...p, attrRelOnDelete: e.target.value }))}>
                        <option value="restrict">Restrict</option>
                        <option value="cascade">Cascade</option>
                        <option value="setNull">Set null</option>
                      </select>
                    </>
                  )}
                  <button onClick={() => doCreateAttributeFromForm(modal.colId)} disabled={busy} style={S.modalBtnPrimary}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create Attribute
                  </button>
                </>
              )}

              {modal.kind === "createDoc" && (
                <>
                  <p style={S.modalH}>Create Document</p>
                  <label style={S.label}>JSON Data</label>
                  <textarea style={{ ...S.input, height: 140, fontFamily: "monospace", resize: "vertical" }} value={mf.docJson ?? "{}"} onChange={e => setMf(p => ({ ...p, docJson: e.target.value }))} />
                  <button onClick={doCreateDocument} disabled={busy} style={S.modalBtnPrimary}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create
                  </button>
                </>
              )}

              {modal.kind === "editDoc" && (
                <>
                  <p style={S.modalH}>Edit Document</p>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontFamily: "monospace" }}>{modal.docId}</div>
                  <label style={S.label}>JSON Data</label>
                  <textarea style={{ ...S.input, height: 180, fontFamily: "monospace", resize: "vertical" }} value={mf.docJson ?? modal.json} onChange={e => setMf(p => ({ ...p, docJson: e.target.value }))} />
                  <button onClick={doUpdateDocument} disabled={busy} style={S.modalBtnPrimary}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Check size={14} />} Save
                  </button>
                </>
              )}

              {modal.kind === "createIndex" && (
                <>
                  <p style={S.modalH}>Create Index</p>
                  <label style={S.label}>Key</label>
                  <input autoFocus style={S.input} value={mf.idxKey ?? ""} onChange={e => setMf(p => ({ ...p, idxKey: e.target.value }))} placeholder="idx_name" />
                  <label style={S.label}>Type</label>
                  <select style={S.select} value={mf.idxType ?? "key"} onChange={e => setMf(p => ({ ...p, idxType: e.target.value }))}>
                    <option value="key">Key</option>
                    <option value="fulltext">Fulltext</option>
                    <option value="unique">Unique</option>
                  </select>
                  <label style={S.label}>Attributes (comma-separated)</label>
                  <input style={S.input} value={mf.idxAttrs ?? ""} onChange={e => setMf(p => ({ ...p, idxAttrs: e.target.value }))} placeholder="name, email" />
                  <button onClick={doCreateIndex} disabled={busy} style={S.modalBtnPrimary}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create
                  </button>
                </>
              )}

              {modal.kind === "confirm" && (
                <>
                  <p style={S.modalH}>{modal.title}</p>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>{modal.message}</p>
                  <div style={S.modalActionCol}>
                    <button onClick={() => { closeModal(); modal.onConfirm(); }} style={S.modalBtnDanger}>
                      <Trash2 size={14} /> Delete
                    </button>
                    <button onClick={closeModal} style={S.modalBtnSecondary}>Cancel</button>
                  </div>
                </>
              )}

              {modal.kind === "typesPreview" && (() => {
                const col = collections.find((c) => c.$id === modal.colId) ?? selCol;
                const langId = mf.typesLang ?? "typescript";
                const lang = TYPE_LANGS.find((l) => l.id === langId) ?? TYPE_LANGS[0];
                const attrs = allAttrs[modal.colId] ?? attributes;
                const code = col ? generateTypeCode(col, attrs, lang.id) : "// Collection not found";

                return (
                  <>
                    <p style={S.modalH}>Collection Types</p>
                    <div style={{ fontSize: 12, color: "var(--muted-2)", marginBottom: 10 }}>
                      {col?.name ?? modal.colId} ({modal.colId})
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <label style={{ ...S.label, marginBottom: 0 }}>Language</label>
                      <select
                        style={{ ...S.select, marginBottom: 0, width: 240 }}
                        value={lang.id}
                        onChange={(e) => setMf((prev) => ({ ...prev, typesLang: e.target.value }))}
                      >
                        {TYPE_LANGS.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={S.codeShell}>
                      <div style={S.codeHeader}>
                        <span>{col ? `${pascalCase(col.name || col.$id)}.${lang.ext}` : `types.${lang.ext}`}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{attrs.length} attrs</span>
                          <button onClick={() => copyText(code)} style={S.codeCopyBtn}>Copy</button>
                        </div>
                      </div>
                      <pre style={S.codePre}>{code}</pre>
                    </div>
                  </>
                );
              })()}

              {modal.kind === "permissionRule" && (
                <>
                  <p style={S.modalH}>{permissionEditingId ? "Edit Permission Rule" : "Add Permission Rule"}</p>
                  <label style={S.label}>Role Type</label>
                  <select
                    value={permissionDraft.subject}
                    onChange={(e) => setPermissionDraft((p) => ({ ...p, subject: e.target.value as PermissionSubject, value: "", teamRole: "" }))}
                    style={S.select}
                  >
                    {PERMISSION_SUBJECTS.map((subject) => (
                      <option key={subject.value} value={subject.value}>{subject.label}</option>
                    ))}
                  </select>

                  {(permissionDraft.subject === "user" || permissionDraft.subject === "team" || permissionDraft.subject === "member" || permissionDraft.subject === "label" || permissionDraft.subject === "teamRole") && (
                    <>
                      <label style={S.label}>Identifier</label>
                      <input
                        value={permissionDraft.value}
                        onChange={(e) => setPermissionDraft((p) => ({ ...p, value: e.target.value }))}
                        placeholder={permissionDraft.subject === "user" ? "userId" : permissionDraft.subject === "team" || permissionDraft.subject === "teamRole" ? "teamId" : permissionDraft.subject === "member" ? "membershipId" : "labelId"}
                        style={S.input}
                      />
                    </>
                  )}

                  {permissionDraft.subject === "teamRole" && (
                    <>
                      <label style={S.label}>Team Role</label>
                      <input
                        value={permissionDraft.teamRole}
                        onChange={(e) => setPermissionDraft((p) => ({ ...p, teamRole: e.target.value }))}
                        placeholder="owner"
                        style={S.input}
                      />
                    </>
                  )}

                  <label style={S.label}>Actions</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6, marginBottom: 12 }}>
                    {PERMISSION_ACTIONS.map((action) => {
                      const selected = permissionDraft.actions.includes(action);
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => setPermissionDraft((p) => ({
                            ...p,
                            actions: selected ? p.actions.filter((a) => a !== action) : [...p.actions, action],
                          }))}
                          style={{
                            ...S.btnGhost,
                            flex: "unset",
                            borderColor: selected ? "#6366f1" : "var(--panel-border)",
                            background: selected ? "rgba(99,102,241,0.12)" : "transparent",
                            color: selected ? "#6366f1" : "var(--muted)",
                            padding: "6px 8px",
                            fontSize: 11,
                          }}
                        >
                          {action}
                        </button>
                      );
                    })}
                  </div>

                  <div style={S.modalActionCol}>
                    <button onClick={savePermissionDialog} style={S.modalBtnPrimary}><Check size={14} /> Save Rule</button>
                    <button onClick={closeModal} style={S.modalBtnSecondary}>Cancel</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ LEFT PANEL ═══════════ */}
      <motion.aside
        initial={{ opacity: 0, x: -10 }}
        animate={{ width: LEFT_PANEL_WIDTH, opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        style={S.leftPanel}
      >
        <div style={S.leftInner}>
          {/* Logo */}
          <div style={S.logo}>
            <Layers size={18} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1.5 }}>XINA</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Connection */}
            {!connected ? (
              <section>
                <div style={S.secH}><Plug size={12} /> Connection</div>
                <input value={cfg.endpoint} onChange={e => saveCfg({ ...cfg, endpoint: e.target.value })} placeholder="Endpoint URL" style={S.input} />
                <input value={cfg.projectId} onChange={e => saveCfg({ ...cfg, projectId: e.target.value })} placeholder="Project ID" style={S.input} />
                <input value={cfg.apiKey} onChange={e => saveCfg({ ...cfg, apiKey: e.target.value })} placeholder="API Key" type="password" style={S.input} />
                <button onClick={handleConnect} disabled={busy} style={{ ...S.btnAccent, width: "100%" }}>
                  {busy ? <Loader2 size={14} className="spin" /> : <Plug size={14} />} Connect
                </button>
              </section>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#10b981" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                Connected
              </div>
            )}

           

            {/* Databases */}
            {connected && (
              <section>
                <div style={{ ...S.secH, justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><DatabaseIcon size={12} /> Databases</span>
                  <button onClick={() => { setMf({}); setModal({ kind: "createDb" }); }} style={S.addBtn}><Plus size={12} /></button>
                </div>
                {databases.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#475569", padding: "4px 0" }}>No databases</div>
                ) : databases.map(db => (
                  <div key={db.$id} style={S.listRow}>
                    <button onClick={() => setSelDb(db)} style={{
                      ...S.listBtn,
                      background: selDb?.$id === db.$id ? "rgba(99,102,241,0.1)" : "transparent",
                      color: selDb?.$id === db.$id ? "#a5b4fc" : "#94a3b8",
                    }}>
                      <DatabaseIcon size={14} /> {db.name}
                    </button>
                    <button onClick={() => setModal({ kind: "confirm", title: "Delete Database", message: `Delete "${db.name}"? All data will be lost.`, onConfirm: () => doDeleteDatabase(db.$id) })} style={S.delBtn}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </section>
            )}

            {/* Collections */}
            {selDb && (
              <section>
                <div style={{ ...S.secH, justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Table2 size={12} /> Collections</span>
                  <button onClick={() => { setMf({}); setModal({ kind: "createCol" }); }} style={S.addBtn}><Plus size={12} /></button>
                </div>
                {collections.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#475569", padding: "4px 0" }}>No collections</div>
                ) : collections.map(col => (
                  <div key={col.$id} style={S.listRow}>
                    <button
                      onClick={() => { setSelCol(col); setSelAttr(null); setSelDoc(null); }}
                      style={{
                        ...S.listBtn,
                        background: selCol?.$id === col.$id ? "rgba(99,102,241,0.1)" : "transparent",
                        color: selCol?.$id === col.$id ? "#a5b4fc" : "#94a3b8",
                      }}
                    >
                      <Table2 size={14} /> {col.name}
                    </button>
                    <button onClick={() => setModal({ kind: "confirm", title: "Delete Collection", message: `Delete "${col.name}"?`, onConfirm: () => doDeleteCollection(col.$id) })} style={S.delBtn}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ═══════════ CANVAS ═══════════ */}
      <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Floating breadcrumb bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={S.breadcrumb}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {selDb && (
              <>
                <DatabaseIcon size={13} style={{ color: "#6366f1" }} />
                <span style={{ color: "var(--accent-soft)", fontWeight: 600 }}>{selDb.name}</span>
              </>
            )}
            {selCol && (
              <>
                <span style={{ color: "var(--muted-2)" }}>/</span>
                <Table2 size={13} style={{ color: "#6366f1" }} />
                <span style={{ color: "var(--accent-soft)", fontWeight: 600 }}>{selCol.name}</span>
              </>
            )}
            {!selDb && <span style={{ color: "var(--muted-2)" }}>No database selected</span>}
          </div>
          {connected && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={S.headerToolbelt}>
                <Tooltip>
                  <TooltipTrigger
                    title="New database"
                    draggable
                    onDragStart={e => startPaletteDrag(e, { type: "new-database" })}
                    style={S.headerToolBtn}
                  >
                    <DatabaseIcon size={14} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={12} className="rounded-xl px-4 py-2 text-sm font-semibold">
                    Database
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    title="New collection"
                    draggable
                    onDragStart={e => startPaletteDrag(e, { type: "new-collection" })}
                    style={S.headerToolBtn}
                    disabled={!selDb}
                  >
                    <Table2 size={14} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={12} className="rounded-xl px-4 py-2 text-sm font-semibold">
                    Collection
                  </TooltipContent>
                </Tooltip>
                <div style={S.headerToolDivider} />
                {ATTR_TYPES.map((at) => (
                  <Tooltip key={at}>
                    <TooltipTrigger
                      title={`Attribute: ${at}`}
                      draggable
                      onDragStart={e => startPaletteDrag(e, { type: "attr-type", attrType: at })}
                      style={{ ...S.headerToolBtn, color: typeColor(at) }}
                    >
                      <TypeIcon type={at} size={13} />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={12} className="rounded-xl px-4 py-2 text-sm font-semibold">
                      {at.charAt(0).toUpperCase() + at.slice(1)}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                  style={S.headerThemeBtn}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={12} className="rounded-xl px-4 py-2 text-sm font-semibold">
                  Theme
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {busy && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#eab308", fontSize: 12 }}>
              <Loader2 size={13} className="spin" /> Loading
            </div>
          )}
        </motion.div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onPointerDown={onCanvasPointerDown}
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
          onWheel={onCanvasWheel}
          style={{
            position: "absolute", inset: 0, overflow: "hidden",
            background: "transparent",
            cursor: panning ? "grabbing" : drag ? "grabbing" : "default",
          }}
        >
          {/* Zoom/pan layer */}
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            position: "absolute", inset: 0,
          }}>

            {/* Relationship lines */}
            <svg style={{ position: "absolute", left: edgeBounds.left, top: edgeBounds.top, width: edgeBounds.width, height: edgeBounds.height, pointerEvents: "none", zIndex: 1 }}>
              <defs>
                {/* Crow's foot (many) marker — points right */}
                <marker id="crowfoot-right" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
                  <line x1="10" y1="6" x2="2" y2="1" stroke="var(--accent-soft)" strokeWidth="1.5" />
                  <line x1="10" y1="6" x2="2" y2="6" stroke="var(--accent-soft)" strokeWidth="1.5" />
                  <line x1="10" y1="6" x2="2" y2="11" stroke="var(--accent-soft)" strokeWidth="1.5" />
                </marker>
                {/* Crow's foot (many) marker — points left (for markerStart) */}
                <marker id="crowfoot-left" markerWidth="12" markerHeight="12" refX="2" refY="6" orient="auto-start-reverse" markerUnits="strokeWidth">
                  <line x1="2" y1="6" x2="10" y2="1" stroke="var(--accent-soft)" strokeWidth="1.5" />
                  <line x1="2" y1="6" x2="10" y2="6" stroke="var(--accent-soft)" strokeWidth="1.5" />
                  <line x1="2" y1="6" x2="10" y2="11" stroke="var(--accent-soft)" strokeWidth="1.5" />
                </marker>
                {/* Simple arrow for one-way */}
                <marker id="arrow-end" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
                  <path d="M1,1 L9,4 L1,7" fill="none" stroke="var(--accent-soft)" strokeWidth="1.5" />
                </marker>
              </defs>
              {allRels.map((rel, i) => {
                const from = nodes[rel.from], to = nodes[rel.to];
                if (!from || !to) return null;
                const fA = allAttrs[rel.from] ?? [], tA = allAttrs[rel.to] ?? [];
                const { ax, ay, bx, by } = edgeAnchor(from, to, fA, tA, rel.fromAttrKey, rel.toAttrKey);
                const lax = ax - edgeBounds.left;
                const lay = ay - edgeBounds.top;
                const lbx = bx - edgeBounds.left;
                const lby = by - edgeBounds.top;
                const pathD = orthogonalEdgePath(
                  lax,
                  lay,
                  lbx,
                  lby,
                  from,
                  to,
                  rel.from,
                  rel.to,
                  edgeBounds.left,
                  edgeBounds.top
                );
                const isTwoWay = !!rel.toAttrKey;
                return (
                  <motion.path
                    key={rel.id}
                    d={pathD}
                    fill="none"
                    stroke="var(--accent-soft)"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.85}
                    markerStart={isTwoWay ? "url(#crowfoot-left)" : undefined}
                    markerEnd={isTwoWay ? "url(#crowfoot-right)" : "url(#arrow-end)"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.18), ease: "easeOut" }}
                  />
                );
              })}
            </svg>

            {/* Empty state */}
            {nodeArr.length === 0 && !busy && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  zIndex: 2,
                  pointerEvents: "none",
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    maxWidth: 460,
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                    <Layers size={48} style={{ color: "var(--panel-border)" }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dim)" }}>
                    {connected ? "Your canvas is empty" : "Connect to Appwrite"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.7, maxWidth: 420 }}>
                    {connected
                      ? "Drag schema icons from the top bar onto canvas or collection cards to start building your schema."
                      : "Enter your Appwrite credentials in the sidebar to begin."}
                  </div>
                </div>
              </div>
            )}

            {/* ERD Nodes */}
            {nodeArr.map(node => {
              const isSel = selNodeId === node.id;
              const isDrop = dropTarget === node.id;
              const attrs = allAttrs[node.id] ?? [];
              const h = nodeH(attrs.length);
              return (
                <motion.div
                  key={node.id}
                  onPointerDown={e => onNodePointerDown(e, node.id)}
                  onDragOver={e => onNodeDragOver(e, node.id)}
                  onDragLeave={onNodeDragLeave}
                  onDrop={e => onNodeDrop(e, node.id)}
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  whileHover={{ y: -1 }}
                  style={{
                    position: "absolute", left: node.x, top: node.y, width: NODE_W, minHeight: h,
                    background: "var(--panel-elev)",
                    border: `1px solid ${isDrop ? "#10b981" : isSel ? "#6366f1" : "var(--panel-border)"}`,
                    borderRadius: 16,
                    boxShadow: "none",
                    cursor: "grab", touchAction: "none", zIndex: isSel ? 10 : 5,
                    userSelect: "none", transition: "border-color 0.15s, box-shadow 0.2s",
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <div style={{
                    position: "relative",
                    height: NODE_HEADER,
                    boxSizing: "border-box",
                    padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                    background: isDrop ? "rgba(16,185,129,0.08)" : isSel ? "rgba(99,102,241,0.08)" : "var(--accent-soft-bg)",
                    borderBottom: "1px solid var(--panel-border)",
                  }}>
                    <Table2 size={14} style={{ color: isDrop ? "#10b981" : isSel ? "var(--accent-soft)" : "var(--muted-2)", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
                    <span style={{ fontSize: 10, color: "var(--muted-2)", fontFamily: "monospace", background: "var(--surface)", padding: "1px 6px", borderRadius: 4 }}>{attrs.length}</span>
                  </div>
                  {/* $id row */}
                  <div style={{ padding: 0, borderBottom: "1px solid var(--panel-border)" }}>
                    {SYS_ATTR_TOP.map((sa, sIdx) => (
                      <div
                        key={sa.key}
                        style={{
                          position: "relative",
                          height: ATTR_ROW,
                          boxSizing: "border-box",
                          display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 12,
                          color: "var(--muted-2)",
                          background: sIdx % 2 === 0 ? "transparent" : "rgba(107,114,128,0.08)",
                          opacity: 0.55,
                        }}
                      >
                        <Key size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sa.key}</span>
                        <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", opacity: 0.7 }}>{sa.type.substring(0, 4)}</span>
                        {/* Port dots for $id — one-way relationships connect here */}
                        <span
                          style={{
                            position: "absolute",
                            left: -4,
                            top: "50%",
                            width: 8,
                            height: 8,
                            transform: "translateY(-50%)",
                            borderRadius: "50%",
                            background: "#6b7280",
                            border: "1px solid var(--panel-elev)",
                            boxShadow: "0 0 0 1px rgba(107,114,128,0.15)",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: -4,
                            top: "50%",
                            width: 8,
                            height: 8,
                            transform: "translateY(-50%)",
                            borderRadius: "50%",
                            background: "#6b7280",
                            border: "1px solid var(--panel-elev)",
                            boxShadow: "0 0 0 1px rgba(107,114,128,0.15)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {/* User attributes */}
                  <div style={{ padding: 0 }}>
                    {attrs.length === 0 ? (
                      <div style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>
                        {isDrop ? "Drop to add" : "No attributes"}
                      </div>
                    ) : attrs.map((a, idx) => {
                      const globalIdx = SYS_ATTR_TOP.length + idx;
                      return (
                      <div
                        key={a.key}
                        onClick={e => { e.stopPropagation(); setSelCol(collections.find(c => c.$id === node.id) ?? null); setSelAttr(a); }}
                        style={{
                          position: "relative",
                          height: ATTR_ROW,
                          boxSizing: "border-box",
                          display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 12,
                          color: selAttr?.key === a.key && selCol?.$id === node.id ? "var(--text)" : "var(--muted)",
                          background: selAttr?.key === a.key && selCol?.$id === node.id
                            ? "rgba(99,102,241,0.1)"
                            : globalIdx % 2 === 0 ? "transparent" : "rgba(107,114,128,0.08)",
                          cursor: "pointer", transition: "background 0.1s",
                        }}
                      >
                        <TypeIcon type={a.type} size={12} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.key}</span>
                        <span style={{ fontSize: 9, color: typeColor(a.type), fontFamily: "monospace", textTransform: "uppercase", opacity: 0.7 }}>{a.type.substring(0, 4)}</span>
                        {a.required && <span style={{ fontSize: 8, color: "#eab308", fontWeight: 700 }}>REQ</span>}
                        {a.type === "relationship" && (
                          <>
                            <span
                              style={{
                                position: "absolute",
                                left: -4,
                                top: "50%",
                                width: 8,
                                height: 8,
                                transform: "translateY(-50%)",
                                borderRadius: "50%",
                                background: "var(--accent-soft)",
                                border: "1px solid var(--panel-elev)",
                                boxShadow: "0 0 0 1px var(--accent-soft-bg)",
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                right: -4,
                                top: "50%",
                                width: 8,
                                height: 8,
                                transform: "translateY(-50%)",
                                borderRadius: "50%",
                                background: "var(--accent-soft)",
                                border: "1px solid var(--panel-elev)",
                                boxShadow: "0 0 0 1px var(--accent-soft-bg)",
                              }}
                            />
                          </>
                        )}
                      </div>
                      );
                    })}
                  </div>
                  {/* $createdAt / $updatedAt rows */}
                  <div style={{ padding: 0, borderTop: "1px solid var(--panel-border)" }}>
                    {SYS_ATTR_BOTTOM.map((sa, sIdx) => {
                      const globalIdx = SYS_ATTR_TOP.length + Math.max(1, attrs.length) + sIdx;
                      return (
                      <div
                        key={sa.key}
                        style={{
                          height: ATTR_ROW,
                          boxSizing: "border-box",
                          display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 12,
                          color: "var(--muted-2)",
                          background: globalIdx % 2 === 0 ? "transparent" : "rgba(107,114,128,0.08)",
                          opacity: 0.55,
                        }}
                      >
                        <Key size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sa.key}</span>
                        <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", opacity: 0.7 }}>{sa.type.substring(0, 4)}</span>
                      </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>{/* end zoom wrapper */}

          {/* Floating zoom controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={S.zoomBar}
          >
            <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} style={S.zoomBtn}><ZoomIn size={14} /></button>
            <button onClick={() => setZoom(1)} style={{ ...S.zoomBtn, width: 44, fontSize: 11 }}>{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(z => Math.max(0.2, z * 0.8))} style={S.zoomBtn}><ZoomOut size={14} /></button>
            <div style={{ width: 1, height: 16, background: "var(--panel-border)" }} />
            <button onClick={() => setPan({ x: 0, y: 0 })} style={S.zoomBtn}><Maximize2 size={14} /></button>
          </motion.div>
        </div>
      </main>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <motion.aside
        initial={{ opacity: 0, x: 10 }}
        animate={{ width: RIGHT_PANEL_WIDTH, opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        style={S.rightPanel}
      >
        <div style={S.rightInner}>
          <div style={S.rightHeader}>
            <Settings size={14} style={{ color: "#6366f1" }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Properties</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {selAttr ? (
              /* ── Attribute detail ── */
              <section>
                <div style={S.secH}><TypeIcon type={selAttr.type} size={12} /> Attribute: {selAttr.key}</div>
                <div style={S.card}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <TypeIcon type={selAttr.type} size={14} />
                    <span style={{ color: typeColor(selAttr.type), fontWeight: 600, textTransform: "capitalize" }}>{selAttr.type}</span>
                  </div>
                  <DialogSwitch
                    label="Required"
                    checked={editReq}
                    onChange={(next) => setEditReq(next)}
                  />
                  {typeof selAttr.size === "number" && (
                    <div>
                      <label style={S.label}>Size</label>
                      <input type="number" value={editSize ?? selAttr.size} onChange={e => setEditSize(+e.target.value)} style={S.input} />
                    </div>
                  )}
                  <div>
                    <label style={S.label}>Default</label>
                    <input value={editDef} onChange={e => setEditDef(e.target.value)} placeholder="(optional)" style={S.input} />
                  </div>
                </div>
                <button onClick={doSaveAttr} disabled={busy} style={{ ...S.btnAccent, width: "100%" }}>
                  <Check size={14} /> Save
                </button>
                <button onClick={() => setModal({ kind: "confirm", title: "Delete Attribute", message: `Delete "${selAttr.key}"?`, onConfirm: () => doDeleteAttribute(selAttr.key) })} style={{ ...S.btnDanger, width: "100%", marginTop: 6 }}>
                  <Trash2 size={14} /> Delete
                </button>
                <button onClick={() => setSelAttr(null)} style={{ ...S.btnGhost, width: "100%", marginTop: 6 }}>
                  <ArrowLeft size={14} /> Back
                </button>
              </section>

            ) : selDoc ? (
              /* ── Document detail ── */
              <section>
                <div style={S.secH}><FileText size={12} /> Document</div>
                <div style={S.card}>
                  <pre style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 280, overflow: "auto", margin: 0 }}>
                    {JSON.stringify(selDoc, null, 2)}
                  </pre>
                </div>
                <button onClick={() => {
                  const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...rest } = selDoc;
                  setMf({ docJson: JSON.stringify(rest, null, 2) });
                  setModal({ kind: "editDoc", docId: selDoc.$id, json: JSON.stringify(rest, null, 2) });
                }} style={{ ...S.btnAccent, width: "100%" }}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => setModal({ kind: "confirm", title: "Delete Document", message: `Delete "${selDoc.$id}"?`, onConfirm: () => doDeleteDocument(selDoc.$id) })} style={{ ...S.btnDanger, width: "100%", marginTop: 6 }}>
                  <Trash2 size={14} /> Delete
                </button>
                <button onClick={() => setSelDoc(null)} style={{ ...S.btnGhost, width: "100%", marginTop: 6 }}>
                  <ArrowLeft size={14} /> Back
                </button>
              </section>

            ) : selCol ? (
              /* ── Collection detail ── */
              <section>
                <div style={S.secH}><Table2 size={12} /> Collection</div>
                <div style={S.card}>
                  <label style={S.label}>Name</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...S.input, flex: 1, marginBottom: 0 }} />
                    <button onClick={doSaveColName} disabled={busy} style={{ ...S.btnAccent, padding: "6px 12px" }}><Check size={14} /></button>
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 6, fontFamily: "monospace" }}>{selCol.$id}</div>
                </div>
                <button onClick={() => setModal({ kind: "confirm", title: "Delete Collection", message: `Delete "${selCol.name}"?`, onConfirm: () => doDeleteCollection(selCol.$id) })} style={{ ...S.btnDanger, width: "100%", marginTop: 6 }}>
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  onClick={() => {
                    setMf((prev) => ({ ...prev, typesLang: prev.typesLang ?? "typescript" }));
                    setModal({ kind: "typesPreview", colId: selCol.$id });
                  }}
                  style={{ ...S.btnGhost, width: "100%", marginTop: 6 }}
                >
                  <FileText size={14} /> Types
                </button>

                {/* Tabs */}
                <div style={S.tabBar}>
                  {(["schema", "permissions", "indexes"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      ...S.tabBtn,
                      background: tab === t ? "rgba(99,102,241,0.1)" : "transparent",
                      color: tab === t ? "#a5b4fc" : "#475569",
                      borderBottom: "none",
                    }}>
                      {t === "schema" ? <Columns3 size={12} /> : t === "permissions" ? <Key size={12} /> : <Key size={12} />}
                      {t === "permissions" ? "Perms" : t === "indexes" ? "Idx" : "Schema"}
                    </button>
                  ))}
                </div>

                {tab === "schema" && (
                  <>
                    {/* Relationships */}
                    <div style={{ ...S.secH, marginTop: 12 }}><GitBranch size={12} /> Relations</div>
                    <div style={S.card}>
                      <select style={S.select} value="" onChange={e => { if (e.target.value) doCreateRelationship(e.target.value); }}>
                        <option value="">Link to collection...</option>
                        {collections.filter(c => c.$id !== selCol.$id).map(c => (
                          <option key={c.$id} value={c.$id}>{c.name}</option>
                        ))}
                      </select>
                      {allRels.filter(r => r.from === selCol.$id || r.to === selCol.$id).map((r, i) => {
                        const otherId = r.from === selCol.$id ? r.to : r.from;
                        const other = collections.find(c => c.$id === otherId);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(99,102,241,0.05)", borderRadius: 6, fontSize: 12, marginTop: 4, color: "#a5b4fc" }}>
                            <GitBranch size={12} />
                            {r.from === selCol.$id ? "→" : "←"} {other?.name ?? otherId}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ ...S.secH, marginTop: 12 }}>Attributes</div>
                    {attributes.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#334155" }}>No attributes</div>
                    ) : attributes.map(a => (
                      <div key={a.key} style={S.listRow}>
                        <button onClick={() => setSelAttr(a)} style={{ ...S.listBtn, flex: 1 }}>
                          <TypeIcon type={a.type} size={13} />
                          <span style={{ flex: 1 }}>{a.key}</span>
                          <span style={{ fontSize: 10, color: typeColor(a.type), fontFamily: "monospace" }}>{a.type}</span>
                        </button>
                        <button onClick={() => setModal({ kind: "confirm", title: "Delete", message: `Delete "${a.key}"?`, onConfirm: () => doDeleteAttribute(a.key) })} style={S.delBtn}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {tab === "permissions" && (
                  <>
                    <div style={{ ...S.secH, marginTop: 12, justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Key size={12} /> Permissions Builder</span>
                      <button
                        onClick={openNewPermissionDialog}
                        style={S.addBtn}
                        title="Add permission rule"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div style={S.card}>
                      <label style={S.label}>Rules</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                        {permissionGrants.length === 0 && (
                          <div style={{ fontSize: 12, color: "var(--muted-2)" }}>No rules yet. Add a permission rule.</div>
                        )}
                        {permissionGrants.map((grant) => {
                          const subjectMeta = PERMISSION_SUBJECTS.find((s) => s.value === grant.subject);
                          const roleText = grant.subject === "teamRole"
                            ? `${subjectMeta?.label}: ${grant.value} / ${grant.teamRole}`
                            : grant.value
                              ? `${subjectMeta?.label}: ${grant.value}`
                              : `${subjectMeta?.label}`;
                          return (
                            <div key={grant.id} style={{ ...S.card, padding: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{roleText}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <button onClick={() => openEditPermissionDialog(grant)} style={S.addBtn} title="Edit rule"><Pencil size={11} /></button>
                                  <button onClick={() => setPermissionGrants((prev) => prev.filter((g) => g.id !== grant.id))} style={S.delBtn} title="Remove rule"><Trash2 size={11} /></button>
                                </div>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                {grant.actions.map((action) => (
                                  <span key={action} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--accent-soft-border)", background: "var(--accent-soft-bg)", color: "var(--accent-soft)" }}>
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <label style={S.label}>Generated Permissions</label>
                      <div style={{ ...S.permissionPreviewShell, marginTop: 0 }}>
                        <pre style={S.permissionPreviewPre}>
                          {grantsToPermissions(permissionGrants).length
                            ? grantsToPermissions(permissionGrants).join("\n")
                            : "// Add at least one valid rule"}
                        </pre>
                      </div>

                      <div style={{ fontSize: 11, color: "var(--muted-2)", lineHeight: 1.5, marginTop: 10, marginBottom: 10 }}>
                        Clean builder inspired by Appwrite Console: choose action, choose target, then fill IDs where needed.
                      </div>
                      <button onClick={doSaveColPermissions} disabled={busy} style={{ ...S.btnAccent, width: "100%" }}>
                        <Check size={14} /> Save Permissions
                      </button>
                    </div>

                  </>
                )}

                {tab === "indexes" && (
                  <>
                    <div style={{ ...S.secH, marginTop: 12, justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Key size={12} /> Indexes</span>
                      <button onClick={() => { setMf({ idxType: "key" }); setModal({ kind: "createIndex" }); }} style={S.addBtn}><Plus size={12} /></button>
                    </div>
                    {indexes.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#334155" }}>No indexes</div>
                    ) : indexes.map(idx => (
                      <div key={idx.key} style={S.listRow}>
                        <div style={{ ...S.listBtn, cursor: "default" }}>
                          <Key size={13} />
                          <span style={{ flex: 1 }}>{idx.key}</span>
                          <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace" }}>{idx.type}</span>
                        </div>
                        <button onClick={() => setModal({ kind: "confirm", title: "Delete", message: `Delete index "${idx.key}"?`, onConfirm: () => doDeleteIndex(idx.key) })} style={S.delBtn}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </section>

            ) : selDb ? (
              /* ── Database detail ── */
              <section>
                <div style={S.secH}><DatabaseIcon size={12} /> Database</div>
                <div style={S.card}>
                  <label style={S.label}>Name</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...S.input, flex: 1, marginBottom: 0 }} />
                    <button onClick={doSaveDbName} disabled={busy} style={{ ...S.btnAccent, padding: "6px 12px" }}><Check size={14} /></button>
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 6, fontFamily: "monospace" }}>{selDb.$id}</div>
                </div>
              </section>
            ) : (
              <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.7, textAlign: "center", padding: "40px 0" }}>
                {connected ? "Select something to see its properties" : "Connect to get started"}
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ─── Global spinner keyframe (injected once via style tag) ─── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--panel-border); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--muted); }
        /* Selection */
        ::selection { background: var(--accent-soft-bg); }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STYLE CONSTANTS
   ═══════════════════════════════════════════════════ */
const S = {
  root: {
    width: "100vw", height: "100vh", display: "flex", overflow: "hidden", position: "relative" as const,
    boxSizing: "border-box",
    paddingLeft: PANEL_MARGIN,
    paddingRight: PANEL_MARGIN,
    background: "var(--bg)", color: "var(--text)",
    backgroundImage: "radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)",
    backgroundSize: `${GRID}px ${GRID}px`,
    fontFamily: "var(--font-ibm-plex-sans), 'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,

  /* ── Panels ── */
  leftPanel: {
    height: `calc(100vh - ${PANEL_MARGIN * 2}px)`, overflow: "hidden", flexShrink: 0,
    marginTop: PANEL_MARGIN,
    marginBottom: PANEL_MARGIN,
    marginLeft: PANEL_MARGIN,
    marginRight: 0,
    border: "1px solid var(--panel-border)",
    borderRadius: "30px",
    background: "var(--panel-float)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
  } as React.CSSProperties,
  leftInner: {
    width: LEFT_PANEL_WIDTH, height: "100%", display: "flex", flexDirection: "column" as const,
  } as React.CSSProperties,
  logo: {
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 8,
    color: "var(--accent-soft)",
  } as React.CSSProperties,

  rightPanel: {
    height: `calc(100vh - ${PANEL_MARGIN * 2}px)`, overflow: "hidden", flexShrink: 0,
    marginTop: PANEL_MARGIN,
    marginBottom: PANEL_MARGIN,
    marginLeft: 0,
    marginRight: PANEL_MARGIN,
    border: "1px solid var(--panel-border)",
    borderRadius: "30px",
    background: "var(--panel-float)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
  } as React.CSSProperties,
  rightInner: {
    width: RIGHT_PANEL_WIDTH, height: "100%", display: "flex", flexDirection: "column" as const,
  } as React.CSSProperties,
  rightHeader: {
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 8,
  } as React.CSSProperties,

  /* ── Breadcrumb ── */
  breadcrumb: {
    position: "absolute" as const, top: 16, left: 0, right: 0,
    zIndex: 20, display: "flex", alignItems: "center", gap: 12,
    width: "fit-content", margin: "0 auto",
    padding: "8px 16px", background: "var(--glass)", backdropFilter: "blur(12px)",
    border: "1px solid var(--line)", borderRadius: 999, fontSize: 12,
  } as React.CSSProperties,
  headerToolbelt: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 6px",
    borderRadius: 999,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    position: "relative" as const,
  } as React.CSSProperties,
  headerToolBtn: {
    width: 24,
    height: 24,
    border: "none",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "var(--muted)",
    cursor: "grab",
  } as React.CSSProperties,
  headerToolDivider: {
    width: 1,
    height: 16,
    background: "var(--line)",
    margin: "0 2px",
  } as React.CSSProperties,
  headerThemeBtn: {
    width: 34,
    height: 34,
    boxSizing: "border-box",
    border: "1px solid var(--line)",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface)",
    color: "var(--text-dim)",
    cursor: "pointer",
  } as React.CSSProperties,
  /* ── Zoom ── */
  zoomBar: {
    position: "absolute" as const, bottom: 16, right: 16, zIndex: 30,
    display: "flex", alignItems: "center", gap: 2,
    padding: "4px 6px", background: "var(--glass-strong)", backdropFilter: "blur(12px)",
    border: "1px solid var(--line)", borderRadius: 999,
  } as React.CSSProperties,
  zoomBtn: {
    width: 32, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer",
    borderRadius: 999, fontSize: 13,
  } as React.CSSProperties,

  /* ── Form elements ── */
  input: {
    width: "100%", padding: "8px 10px", fontSize: 13,
    background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 999,
    color: "var(--text)", outline: "none", marginBottom: 6,
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  select: {
    width: "100%", padding: "8px 10px", fontSize: 13,
    background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 999,
    color: "var(--text)", outline: "none", marginBottom: 6, cursor: "pointer",
  } as React.CSSProperties,
  label: {
    fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 4,
    display: "block", textTransform: "uppercase" as const, letterSpacing: 0.5,
  } as React.CSSProperties,

  /* ── Buttons ── */
  btnAccent: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "8px 16px", fontSize: 13, fontWeight: 600,
    background: "#6366f1", color: "#fff", border: "none", borderRadius: 999,
    cursor: "pointer", transition: "background 0.15s",
  } as React.CSSProperties,
  btnGhost: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "7px 14px", fontSize: 12, fontWeight: 500,
    background: "transparent", color: "var(--muted)", border: "1px solid var(--panel-border)",
    borderRadius: 999, cursor: "pointer", flex: 1,
  } as React.CSSProperties,
  btnDanger: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "7px 14px", fontSize: 12, fontWeight: 600,
    background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 999, cursor: "pointer", flex: 1,
  } as React.CSSProperties,
  addBtn: {
    width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--accent-soft-bg)", color: "var(--accent-soft)", border: "1px solid var(--accent-soft-border)",
    borderRadius: 999, cursor: "pointer",
  } as React.CSSProperties,
  delBtn: {
    width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", color: "var(--muted-2)", border: "none", borderRadius: 999,
    cursor: "pointer", flexShrink: 0, transition: "color 0.15s",
  } as React.CSSProperties,

  /* ── Section / list ── */
  secH: {
    fontSize: 11, fontWeight: 700, color: "var(--muted-2)", textTransform: "uppercase" as const,
    letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
  } as React.CSSProperties,
  card: {
    background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 12,
  } as React.CSSProperties,
  listRow: {
    display: "flex", alignItems: "center", gap: 0, marginBottom: 2,
  } as React.CSSProperties,
  listBtn: {
    display: "flex", alignItems: "center", gap: 8, width: "100%",
    padding: "7px 10px", fontSize: 13, color: "var(--text-dim)",
    background: "transparent", border: "none", borderRadius: 999,
    cursor: "pointer", textAlign: "left" as const, transition: "background 0.1s",
  } as React.CSSProperties,
  dragItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px", fontSize: 13, fontWeight: 500,
    background: "var(--accent-soft-bg)", border: "1px dashed var(--accent-soft-border)",
    borderRadius: 999, color: "var(--accent-soft)", cursor: "grab",
  } as React.CSSProperties,

  /* ── Tabs ── */
  tabBar: {
    display: "flex", gap: 0, marginTop: 14, borderRadius: 999, overflow: "hidden",
    border: "1px solid var(--line)",
  } as React.CSSProperties,
  tabBtn: {
    flex: 1, padding: "7px 0", fontSize: 11, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    background: "transparent", border: "none", cursor: "pointer",
  } as React.CSSProperties,

  /* ── Modal ── */
  overlay: {
    position: "fixed" as const, inset: 0, zIndex: 100,
    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  } as React.CSSProperties,
  modal: {
    position: "relative" as const,
    background: "var(--panel-elev)", border: "1px solid var(--panel-border)",
    borderRadius: 16, padding: "28px 24px 20px", width: 400,
    maxHeight: "80vh", overflowY: "auto" as const,
    boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.05)",
  } as React.CSSProperties,
  modalWide: {
    width: 860,
    maxWidth: "92vw",
  } as React.CSSProperties,
  modalH: {
    fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16, marginTop: 0,
  } as React.CSSProperties,
  modalClose: {
    position: "absolute" as const, top: 12, right: 12,
    background: "none", border: "none", color: "var(--muted-2)", cursor: "pointer",
    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 999,
  } as React.CSSProperties,
  codeShell: {
    border: "1px solid var(--panel-border)",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
    background: "#111827",
  } as React.CSSProperties,
  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    fontSize: 12,
    color: "#93a1b8",
    borderBottom: "1px solid #2a3244",
    background: "#1a2130",
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  } as React.CSSProperties,
  codePre: {
    margin: 0,
    padding: "14px 16px",
    minHeight: 320,
    maxHeight: "62vh",
    overflow: "auto",
    whiteSpace: "pre",
    fontSize: 12,
    lineHeight: 1.55,
    color: "#d7deea",
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    background: "#0e1522",
  } as React.CSSProperties,
  codeCopyBtn: {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    background: "#1f2937",
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
  modalActionCol: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  } as React.CSSProperties,
  modalBtnPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%",
    padding: "9px 16px", fontSize: 13, fontWeight: 600,
    background: "#6366f1", color: "#fff", border: "none", borderRadius: 999,
    cursor: "pointer", transition: "background 0.15s",
  } as React.CSSProperties,
  modalBtnSecondary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%",
    padding: "8px 14px", fontSize: 12, fontWeight: 500,
    background: "transparent", color: "var(--muted)", border: "1px solid var(--panel-border)",
    borderRadius: 999, cursor: "pointer",
  } as React.CSSProperties,
  modalBtnDanger: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%",
    padding: "8px 14px", fontSize: 12, fontWeight: 600,
    background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 999, cursor: "pointer",
  } as React.CSSProperties,
  permissionPreviewShell: {
    border: "1px solid var(--line)",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
    background: "var(--surface)",
  } as React.CSSProperties,
  permissionPreviewPre: {
    margin: 0,
    padding: "12px 14px",
    minHeight: 80,
    maxHeight: 180,
    overflow: "auto",
    whiteSpace: "pre",
    fontSize: 12,
    lineHeight: 1.5,
    color: "var(--text-dim)",
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
    background: "linear-gradient(180deg, var(--surface) 0%, var(--accent-soft-bg) 100%)",
  } as React.CSSProperties,
  switchRow: {
    width: "100%",
    border: "1px solid var(--panel-border)",
    borderRadius: 999,
    padding: "8px 10px",
    marginBottom: 8,
    background: "var(--surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  } as React.CSSProperties,
  switchLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-dim)",
    letterSpacing: 0.2,
  } as React.CSSProperties,
  switchTrack: {
    width: 34,
    height: 20,
    borderRadius: 999,
    padding: 2,
    display: "inline-flex",
    alignItems: "center",
    transition: "background 0.2s ease",
  } as React.CSSProperties,
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
  } as React.CSSProperties,
};
