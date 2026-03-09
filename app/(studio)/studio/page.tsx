"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
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
type Collection = { $id: string; name: string };
type Attribute = { key: string; type: string; required?: boolean; size?: number; relatedCollectionId?: string; elements?: string[]; min?: number; max?: number; xdefault?: any };
type DocumentT = { $id: string; [key: string]: any };
type IndexDef = { key: string; type: string; attributes: string[]; orders?: string[] };
type CanvasNode = { id: string; x: number; y: number; label: string; dbId: string };
type Rel = { from: string; to: string };
type ThemeMode = "light" | "dark";

type ModalState =
  | null
  | { kind: "createDb" }
  | { kind: "createCol"; pos?: { x: number; y: number } }
  | { kind: "createAttr"; colId: string; attrType: AttrType }
  | { kind: "createDoc" }
  | { kind: "editDoc"; docId: string; json: string }
  | { kind: "createIndex" }
  | { kind: "typesPreview"; colId: string }
  | { kind: "confirm"; title: string; message: string; onConfirm: () => void };

type LanguageOpt = {
  id: string;
  label: string;
  ext: string;
};

type LoadOpts = { silent?: boolean };

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

/* ─── Layout constants ─── */
const NODE_W = 260;
const NODE_HEADER = 44;
const ATTR_ROW = 32;
const GRID = 20;
const PANEL_MARGIN = 10;
const LEFT_PANEL_WIDTH = 280;
const RIGHT_PANEL_WIDTH = 320;
const nodeH = (n: number) => NODE_HEADER + Math.max(1, n) * ATTR_ROW + 8;

function filled(v: unknown): v is string { return typeof v === "string" && v.trim().length > 0; }
function cfgReady(c: AppwriteConfig) { return filled(c.endpoint) && filled(c.projectId) && filled(c.apiKey); }

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
  const [tab, setTab] = useState<"schema" | "docs" | "indexes">("schema");

  const [nodes, setNodes] = useState<Record<string, CanvasNode>>({});
  const [rels, setRels] = useState<Rel[]>([]);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const toolbeltRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const [editName, setEditName] = useState("");
  const [editReq, setEditReq] = useState(false);
  const [editSize, setEditSize] = useState<number | undefined>();
  const [editDef, setEditDef] = useState("");

  const [modal, setModal] = useState<ModalState>(null);
  const [mf, setMf] = useState<Record<string, string>>({});
  const closeModal = () => { setModal(null); setMf({}); };

  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const activeDbIdRef = useRef<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [hoverTool, setHoverTool] = useState<{ label: string; x: number } | null>(null);

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

      const list: Collection[] = d?.collections ?? [];
      setCollections(list);
      setSelCol((prev) => {
        if (!prev) {
          return null;
        }
        return list.some((c) => c.$id === prev.$id) ? prev : null;
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
      const detected = list
        .filter(a => a.type === "relationship" && a.relatedCollectionId)
        .map(a => ({ from: colId, to: a.relatedCollectionId! }));
      setRels(prev => {
        const existing = prev.filter(r => r.from !== colId);
        return [...existing, ...detected];
      });
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
    const detectedRels: Rel[] = [];
    await Promise.all(cols.map(async (col) => {
      try {
        const d = await api("listAttributes", { databaseId: dbId, collectionId: col.$id });
        const list: Attribute[] = d?.attributes ?? [];
        result[col.$id] = list;
        list.filter(a => a.type === "relationship" && a.relatedCollectionId)
          .forEach(a => detectedRels.push({ from: col.$id, to: a.relatedCollectionId! }));
      } catch { result[col.$id] = []; }
    }));
    setAllAttrs(result);
    setRels(detectedRels);
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
      if (tab === "docs") await loadDocuments(activeDbId, selectedColId, { silent: true });
      if (tab === "indexes") await loadIndexes(activeDbId, selectedColId, { silent: true });
    }
  }, [
    loadDatabases,
    loadCollections,
    loadAllAttributes,
    loadAttributes,
    loadDocuments,
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
      if (tab === "docs") loadDocuments(selDb.$id, selCol.$id, { silent: true });
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
  const edgeAnchor = (from: CanvasNode, to: CanvasNode, fromH: number, toH: number) => {
    const fx = from.x + NODE_W / 2, fy = from.y + fromH / 2;
    const tx = to.x + NODE_W / 2, ty = to.y + toH / 2;
    const dx = tx - fx, dy = ty - fy;
    let ax: number, ay: number, bx: number, by: number;
    if (Math.abs(dx) * fromH > Math.abs(dy) * NODE_W) {
      ax = dx > 0 ? from.x + NODE_W : from.x; ay = fy;
      bx = dx > 0 ? to.x : to.x + NODE_W; by = ty;
    } else {
      ax = fx; ay = dy > 0 ? from.y + fromH : from.y;
      bx = tx; by = dy > 0 ? to.y : to.y + toH;
    }
    return { ax, ay, bx, by };
  };

  const nodeArr = Object.values(nodes);
  const selNodeId = selCol?.$id ?? null;

  const allRels = useMemo(() => {
    const seen = new Set<string>();
    return rels.filter(r => { const k = `${r.from}→${r.to}`; if (seen.has(k)) return false; seen.add(k); return true; });
  }, [rels]);

  const onToolEnter = (e: React.PointerEvent<HTMLButtonElement>, label: string) => {
    const toolbelt = toolbeltRef.current;
    if (!toolbelt) return;
    const iconRect = e.currentTarget.getBoundingClientRect();
    const beltRect = toolbelt.getBoundingClientRect();
    const x = iconRect.left - beltRect.left + iconRect.width / 2;
    setHoverTool({ label, x });
  };

  const onToolLeave = () => setHoverTool(null);

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

      <button
        type="button"
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        style={S.themeToggle}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </button>

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
              style={{ ...S.modal, ...(modal.kind === "typesPreview" ? S.modalWide : {}) }}
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
                  <button onClick={doCreateDatabase} disabled={busy} style={S.btnAccent}>
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
                  <button onClick={() => doCreateCollection(modal.pos)} disabled={busy} style={S.btnAccent}>
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
                  <button onClick={() => doCreateAttributeFromForm(modal.colId)} disabled={busy} style={S.btnAccent}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create Attribute
                  </button>
                </>
              )}

              {modal.kind === "createDoc" && (
                <>
                  <p style={S.modalH}>Create Document</p>
                  <label style={S.label}>JSON Data</label>
                  <textarea style={{ ...S.input, height: 140, fontFamily: "monospace", resize: "vertical" }} value={mf.docJson ?? "{}"} onChange={e => setMf(p => ({ ...p, docJson: e.target.value }))} />
                  <button onClick={doCreateDocument} disabled={busy} style={S.btnAccent}>
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
                  <button onClick={doUpdateDocument} disabled={busy} style={S.btnAccent}>
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
                  <button onClick={doCreateIndex} disabled={busy} style={S.btnAccent}>
                    {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create
                  </button>
                </>
              )}

              {modal.kind === "confirm" && (
                <>
                  <p style={S.modalH}>{modal.title}</p>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>{modal.message}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={closeModal} style={S.btnGhost}>Cancel</button>
                    <button onClick={() => { closeModal(); modal.onConfirm(); }} style={S.btnDanger}>
                      <Trash2 size={14} /> Delete
                    </button>
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

            {connected && (
              <section>
                <div style={S.secH}><GripVertical size={12} /> Canvas Tools</div>
                <div style={{ fontSize: 12, color: "var(--muted-2)", lineHeight: 1.6 }}>
                  Drag icon-only tools from the top header onto the canvas.
                </div>
              </section>
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
            <div ref={toolbeltRef} style={S.headerToolbelt}>
              <button
                title="New database"
                draggable
                onDragStart={e => startPaletteDrag(e, { type: "new-database" })}
                onPointerEnter={(e) => onToolEnter(e, "Database")}
                onPointerLeave={onToolLeave}
                style={S.headerToolBtn}
              >
                <DatabaseIcon size={14} />
              </button>
              <button
                title="New collection"
                draggable
                onDragStart={e => startPaletteDrag(e, { type: "new-collection" })}
                onPointerEnter={(e) => onToolEnter(e, "Collection")}
                onPointerLeave={onToolLeave}
                style={S.headerToolBtn}
                disabled={!selDb}
              >
                <Table2 size={14} />
              </button>
              <div style={S.headerToolDivider} />
              {ATTR_TYPES.map((at) => (
                <button
                  key={at}
                  title={`Attribute: ${at}`}
                  draggable
                  onDragStart={e => startPaletteDrag(e, { type: "attr-type", attrType: at })}
                  onPointerEnter={(e) => onToolEnter(e, at.charAt(0).toUpperCase() + at.slice(1))}
                  onPointerLeave={onToolLeave}
                  style={{ ...S.headerToolBtn, color: typeColor(at) }}
                >
                  <TypeIcon type={at} size={13} />
                </button>
              ))}
              <AnimatePresence>
                {hoverTool && (
                  <motion.div
                    key={hoverTool.label}
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ ...S.headerToolTipWrap, left: hoverTool.x }}
                  >
                    <span style={S.headerToolTipStem} />
                    <span style={S.headerToolLabel}>{hoverTool.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
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
            <svg style={{ position: "absolute", left: 0, top: 0, width: 10000, height: 10000, pointerEvents: "none", zIndex: 1 }}>
              {allRels.map((rel, i) => {
                const from = nodes[rel.from], to = nodes[rel.to];
                if (!from || !to) return null;
                const fA = allAttrs[rel.from] ?? [], tA = allAttrs[rel.to] ?? [];
                const { ax, ay, bx, by } = edgeAnchor(from, to, nodeH(fA.length), nodeH(tA.length));
                const dx = bx - ax, dy = by - ay;
                const horiz = Math.abs(dx) > Math.abs(dy);
                const cpx = horiz ? dx * 0.5 : 0;
                const cpy = horiz ? 0 : dy * 0.5;
                return (
                  <motion.path
                    key={i}
                    d={`M ${ax} ${ay} C ${ax + cpx} ${ay + cpy}, ${bx - cpx} ${by - cpy}, ${bx} ${by}`}
                    fill="none"
                    stroke="var(--accent-soft)"
                    strokeWidth={1}
                    opacity={0.85}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.18), ease: "easeOut" }}
                  />
                );
              })}
            </svg>

            {/* Empty state */}
            {nodeArr.length === 0 && !busy && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, pointerEvents: "none" }}>
                <div style={{ textAlign: "center", maxWidth: 380 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Layers size={48} style={{ color: "var(--panel-border)" }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dim)", marginBottom: 8 }}>
                    {connected ? "Your canvas is empty" : "Connect to Appwrite"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.7 }}>
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
                    borderRadius: 12,
                    boxShadow: "none",
                    cursor: "grab", touchAction: "none", zIndex: isSel ? 10 : 5,
                    userSelect: "none", transition: "border-color 0.15s, box-shadow 0.2s",
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <div style={{
                    padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                    background: isDrop ? "rgba(16,185,129,0.08)" : isSel ? "rgba(99,102,241,0.08)" : "var(--accent-soft-bg)",
                    borderBottom: "1px solid var(--panel-border)",
                  }}>
                    <Table2 size={14} style={{ color: isDrop ? "#10b981" : isSel ? "var(--accent-soft)" : "var(--muted-2)", flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
                    <span style={{ fontSize: 10, color: "var(--muted-2)", fontFamily: "monospace", background: "var(--surface)", padding: "1px 6px", borderRadius: 4 }}>{attrs.length}</span>
                  </div>
                  {/* Rows */}
                  <div style={{ padding: "4px 0" }}>
                    {attrs.length === 0 ? (
                      <div style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>
                        {isDrop ? "Drop to add" : "No attributes"}
                      </div>
                    ) : attrs.map((a, idx) => (
                      <div
                        key={a.key}
                        onClick={e => { e.stopPropagation(); setSelCol(collections.find(c => c.$id === node.id) ?? null); setSelAttr(a); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", fontSize: 12,
                          color: selAttr?.key === a.key && selCol?.$id === node.id ? "var(--text)" : "var(--muted)",
                          background: selAttr?.key === a.key && selCol?.$id === node.id
                            ? "rgba(99,102,241,0.1)"
                            : idx % 2 === 0 ? "transparent" : "var(--accent-soft-bg)",
                          cursor: "pointer", transition: "background 0.1s",
                          borderLeft: `2px solid ${typeColor(a.type)}`,
                        }}
                      >
                        <TypeIcon type={a.type} size={12} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.key}</span>
                        <span style={{ fontSize: 9, color: typeColor(a.type), fontFamily: "monospace", textTransform: "uppercase", opacity: 0.7 }}>{a.type.substring(0, 4)}</span>
                        {a.required && <span style={{ fontSize: 8, color: "#eab308", fontWeight: 700 }}>REQ</span>}
                      </div>
                    ))}
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
                  {(["schema", "docs", "indexes"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      ...S.tabBtn,
                      background: tab === t ? "rgba(99,102,241,0.1)" : "transparent",
                      color: tab === t ? "#a5b4fc" : "#475569",
                      borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent",
                    }}>
                      {t === "schema" ? <Columns3 size={12} /> : t === "docs" ? <FileText size={12} /> : <Key size={12} />}
                      {t === "docs" ? "Docs" : t === "indexes" ? "Idx" : "Schema"}
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
                      {rels.filter(r => r.from === selCol.$id || r.to === selCol.$id).map((r, i) => {
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

                {tab === "docs" && (
                  <>
                    <div style={{ ...S.secH, marginTop: 12, justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FileText size={12} /> Documents</span>
                      <button onClick={() => { setMf({ docJson: "{}" }); setModal({ kind: "createDoc" }); }} style={S.addBtn}><Plus size={12} /></button>
                    </div>
                    {documents.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#334155" }}>No documents</div>
                    ) : documents.map(doc => (
                      <div key={doc.$id} style={S.listRow}>
                        <button onClick={() => setSelDoc(doc)} style={{ ...S.listBtn, flex: 1 }}>
                          <FileText size={13} />
                          <span style={{ fontSize: 12, fontFamily: "monospace", color: "#6b7280" }}>{doc.$id.substring(0, 16)}...</span>
                        </button>
                        <button onClick={() => setModal({ kind: "confirm", title: "Delete", message: `Delete "${doc.$id}"?`, onConfirm: () => doDeleteDocument(doc.$id) })} style={S.delBtn}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
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
    background: "var(--bg)", color: "var(--text)",
    backgroundImage: "radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)",
    backgroundSize: `${GRID}px ${GRID}px`,
    fontFamily: "var(--font-ibm-plex-sans), 'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,

  /* ── Panels ── */
  leftPanel: {
    height: `calc(100vh - ${PANEL_MARGIN * 2}px)`, overflow: "hidden", flexShrink: 0,
    margin: PANEL_MARGIN,
    border: "1px solid var(--panel-border)",
    borderRadius: 12,
    background: "var(--panel-float)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
  } as React.CSSProperties,
  leftInner: {
    width: LEFT_PANEL_WIDTH, height: "100%", display: "flex", flexDirection: "column" as const,
  } as React.CSSProperties,
  logo: {
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 8,
    borderBottom: "1px solid var(--line)", color: "var(--accent-soft)",
  } as React.CSSProperties,

  rightPanel: {
    height: `calc(100vh - ${PANEL_MARGIN * 2}px)`, overflow: "hidden", flexShrink: 0,
    margin: PANEL_MARGIN,
    border: "1px solid var(--panel-border)",
    borderRadius: 12,
    background: "var(--panel-float)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
  } as React.CSSProperties,
  rightInner: {
    width: RIGHT_PANEL_WIDTH, height: "100%", display: "flex", flexDirection: "column" as const,
  } as React.CSSProperties,
  rightHeader: {
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 8,
    borderBottom: "1px solid var(--line)",
  } as React.CSSProperties,

  themeToggle: {
    position: "fixed" as const,
    top: 16,
    right: 16,
    zIndex: 60,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    background: "var(--glass)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--panel-border)",
    borderRadius: 10,
    cursor: "pointer",
  } as React.CSSProperties,

  /* ── Breadcrumb ── */
  breadcrumb: {
    position: "absolute" as const, top: 16, left: 0, right: 0,
    zIndex: 20, display: "flex", alignItems: "center", gap: 12,
    width: "fit-content", margin: "0 auto",
    padding: "8px 16px", background: "var(--glass)", backdropFilter: "blur(12px)",
    border: "1px solid var(--line)", borderRadius: 10, fontSize: 12,
  } as React.CSSProperties,
  headerToolbelt: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 6px",
    borderRadius: 8,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    position: "relative" as const,
  } as React.CSSProperties,
  headerToolBtn: {
    width: 24,
    height: 24,
    border: "none",
    borderRadius: 6,
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
  headerToolLabel: {
    padding: "6px 12px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.2,
    color: "var(--text)",
    background: "var(--glass)",
    border: "1px solid var(--line)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  headerToolTipWrap: {
    position: "absolute" as const,
    top: "calc(100% + 10px)",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
    pointerEvents: "none",
    zIndex: 25,
  } as React.CSSProperties,
  headerToolTipStem: {
    width: 1,
    height: 12,
    background: "var(--line)",
  } as React.CSSProperties,

  /* ── Zoom ── */
  zoomBar: {
    position: "absolute" as const, bottom: 16, right: 16, zIndex: 30,
    display: "flex", alignItems: "center", gap: 2,
    padding: "4px 6px", background: "var(--glass-strong)", backdropFilter: "blur(12px)",
    border: "1px solid var(--line)", borderRadius: 10,
  } as React.CSSProperties,
  zoomBtn: {
    width: 32, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer",
    borderRadius: 6, fontSize: 13,
  } as React.CSSProperties,

  /* ── Form elements ── */
  input: {
    width: "100%", padding: "8px 10px", fontSize: 13,
    background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 8,
    color: "var(--text)", outline: "none", marginBottom: 6,
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  select: {
    width: "100%", padding: "8px 10px", fontSize: 13,
    background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 8,
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
    background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
    cursor: "pointer", transition: "background 0.15s",
  } as React.CSSProperties,
  btnGhost: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "7px 14px", fontSize: 12, fontWeight: 500,
    background: "transparent", color: "var(--muted)", border: "1px solid var(--panel-border)",
    borderRadius: 8, cursor: "pointer", flex: 1,
  } as React.CSSProperties,
  btnDanger: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "7px 14px", fontSize: 12, fontWeight: 600,
    background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 8, cursor: "pointer", flex: 1,
  } as React.CSSProperties,
  addBtn: {
    width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--accent-soft-bg)", color: "var(--accent-soft)", border: "1px solid var(--accent-soft-border)",
    borderRadius: 6, cursor: "pointer",
  } as React.CSSProperties,
  delBtn: {
    width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", color: "var(--muted-2)", border: "none", borderRadius: 6,
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
    background: "transparent", border: "none", borderRadius: 6,
    cursor: "pointer", textAlign: "left" as const, transition: "background 0.1s",
  } as React.CSSProperties,
  dragItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 12px", fontSize: 13, fontWeight: 500,
    background: "var(--accent-soft-bg)", border: "1px dashed var(--accent-soft-border)",
    borderRadius: 8, color: "var(--accent-soft)", cursor: "grab",
  } as React.CSSProperties,

  /* ── Tabs ── */
  tabBar: {
    display: "flex", gap: 0, marginTop: 14, borderRadius: 8, overflow: "hidden",
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
    borderRadius: 6,
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
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#1f2937",
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
  switchRow: {
    width: "100%",
    border: "1px solid var(--panel-border)",
    borderRadius: 10,
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
