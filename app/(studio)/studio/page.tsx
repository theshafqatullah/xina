"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { Query } from "appwrite";
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
  ChevronDown,
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
  Copy,
  Download,
  Shield,
  Clock,
  Power,
  HardDrive,
  Info,
} from "lucide-react";

/* ─── Types ─── */
type AppwriteConfig = { endpoint: string; projectId: string; apiKey: string };
type SavedConnection = { id: string; name: string; config: AppwriteConfig; createdAt: string; updatedAt: string };
type DatabaseT = { $id: string; name: string; enabled?: boolean; $createdAt?: string; $updatedAt?: string };
type Collection = { $id: string; name: string; permissions?: string[]; $permissions?: string[]; enabled?: boolean; documentSecurity?: boolean; $createdAt?: string; $updatedAt?: string };
type Attribute = {
  key: string;
  type: string;
  required?: boolean;
  array?: boolean;
  size?: number;
  format?: string;
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
  | { kind: "dbTypesPreview" }
  | { kind: "leftPanelDetails" }
  | { kind: "confirm"; title: string; message: string; onConfirm: () => void };

type LanguageOpt = {
  id: string;
  label: string;
  ext: string;
};

type LoadOpts = { silent?: boolean };

const ATTR_PAGE_SIZE = 25;

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

function camelCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase()) || input;
}

function safeFieldName(input: string) {
  return input.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^\d/, "_$&");
}

function upperSnakeCase(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
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
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
    integer: {
      typescript: "number", javascript: "number", python: "int", dart: "int",
      go: "int", php: "int", ruby: "Integer", kotlin: "Int",
      swift: "Int", java: "int", csharp: "int",
    },
    float: {
      typescript: "number", javascript: "number", python: "float", dart: "double",
      go: "float64", php: "float", ruby: "Float", kotlin: "Double",
      swift: "Double", java: "double", csharp: "double",
    },
    boolean: {
      typescript: "boolean", javascript: "boolean", python: "bool", dart: "bool",
      go: "bool", php: "bool", ruby: "Boolean", kotlin: "Boolean",
      swift: "Bool", java: "boolean", csharp: "bool",
    },
    datetime: {
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
    email: {
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
    url: {
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
    ip: {
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
    enum: {
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
    relationship: {
      typescript: "string", javascript: "string", python: "str", dart: "String",
      go: "string", php: "string", ruby: "String", kotlin: "String",
      swift: "String", java: "String", csharp: "string",
    },
  };
  const fallback = map.string[langId] ?? "string";
  return map[attrType]?.[langId] ?? fallback;
}

/* ─── Helpers for CLI-matching type generation ─── */
interface FieldInfo {
  key: string;            // original attribute key (snake_case)
  camel: string;          // camelCase field name
  type: string;           // mapped base type for the language
  required: boolean;
  isArray: boolean;
  isEnum: boolean;
  enumName: string;       // PascalCase name for enum
  elements: string[];     // enum values
}

function buildFieldInfos(attrs: Attribute[], langId: string): FieldInfo[] {
  return attrs.map((a) => {
    const isEnum = a.type === "enum" && Array.isArray(a.elements) && a.elements.length > 0;
    return {
      key: a.key,
      camel: camelCase(a.key),
      type: mapType(a.type, langId),
      required: !!a.required,
      isArray: !!a.array,
      isEnum,
      enumName: isEnum ? pascalCase(a.key) : "",
      elements: isEnum ? a.elements! : [],
    };
  });
}

/* ─── Per-language code generators matching Appwrite CLI output ─── */

function genTypeScript(className: string, fields: FieldInfo[]): string {
  const parts: string[] = [`import { type Models } from 'appwrite';`];
  // Enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const members = f.elements.map((e) => `  ${upperSnakeCase(e)} = "${e}",`).join("\n");
    parts.push(`\nexport enum ${f.enumName} {\n${members}\n}`);
  }
  // Type
  const body = fields.map((f) => {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `${t}[]`;
    if (!f.required) t += " | null";
    return `  ${f.camel}: ${t};`;
  }).join("\n");
  parts.push(`\nexport type ${className} = Models.Document & {\n${body || "  // no attributes"}\n}`);
  return parts.join("\n");
}

function genJavaScript(className: string, fields: FieldInfo[]): string {
  const parts: string[] = [
    `/**\n * @typedef {import('appwrite').Models.Document} Document\n */`,
  ];
  const props = fields.map((f) => {
    let t: string;
    if (f.isEnum) {
      t = f.elements.map((e) => `"${e}"`).join("|");
    } else {
      t = f.type;
    }
    if (f.isArray) t = `${t}[]`;
    if (!f.required) t += "|null|undefined";
    return ` * @property {${t}} ${f.camel}`;
  }).join("\n");
  parts.push(`\n/**\n * @typedef {Object} ${className}\n${props || " * no attributes"}\n */`);
  return parts.join("\n");
}

function genJava(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [`package io.appwrite.models;`, ``, `import java.util.*;`, `public class ${className} {`];
  // Inner enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const vals = f.elements.map((e) => `        ${e}`).join(",\n");
    lines.push(``, `    public enum ${f.enumName} {\n${vals};\n    }`);
  }
  lines.push(``);
  // Private fields
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `List<${t === "int" ? "Integer" : t === "double" ? "Double" : t === "boolean" ? "Boolean" : t}>`;
    lines.push(`    private ${t} ${f.camel};`);
  }
  // Empty constructor
  lines.push(``, `    public ${className}() {`, `    }`);
  // Full constructor
  if (fields.length > 0) {
    const params = fields.map((f) => {
      let t = f.isEnum ? f.enumName : f.type;
      if (f.isArray) t = `List<${t === "int" ? "Integer" : t === "double" ? "Double" : t === "boolean" ? "Boolean" : t}>`;
      return `        ${t} ${f.camel}`;
    }).join(",\n");
    const assigns = fields.map((f) => `        this.${f.camel} = ${f.camel};`).join("\n");
    lines.push(``, `    public ${className}(\n${params}\n    ) {\n${assigns}\n    }`);
  }
  // Getters / setters
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `List<${t === "int" ? "Integer" : t === "double" ? "Double" : t === "boolean" ? "Boolean" : t}>`;
    const cap = f.camel.charAt(0).toUpperCase() + f.camel.slice(1);
    const getter = f.type === "boolean" && !f.isArray ? `get${cap}` : `get${cap}`;
    lines.push(``);
    lines.push(`    public ${t} ${getter}() {`);
    lines.push(`        return ${f.camel};`);
    lines.push(`    }`);
    lines.push(``);
    lines.push(`    public void set${cap}(${t} ${f.camel}) {`);
    lines.push(`        this.${f.camel} = ${f.camel};`);
    lines.push(`    }`);
  }
  // equals
  if (fields.length > 0) {
    const conds = fields.map((f) => `              Objects.equals(${f.camel}, that.${f.camel})`).join(" &&\n");
    lines.push(``);
    lines.push(`    @Override`);
    lines.push(`    public boolean equals(Object obj) {`);
    lines.push(`        if (this == obj) return true;`);
    lines.push(`        if (obj == null || getClass() != obj.getClass()) return false;`);
    lines.push(`        ${className} that = (${className}) obj;`);
    lines.push(`        return ${conds};`);
    lines.push(`    }`);
    // hashCode
    const hashArgs = fields.map((f) => f.camel).join(", ");
    lines.push(``);
    lines.push(`    @Override`);
    lines.push(`    public int hashCode() {`);
    lines.push(`        return Objects.hash(${hashArgs});`);
    lines.push(`    }`);
    // toString
    const toStrBody = fields.map((f) => `                "${f.camel}=" + ${f.camel}`).join(" +\n");
    lines.push(``);
    lines.push(`    @Override`);
    lines.push(`    public String toString() {`);
    lines.push(`        return "${className}{" +`);
    lines.push(`${toStrBody} +`);
    lines.push(`                '}';`);
    lines.push(`    }`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

function genPHP(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [`<?php`, `namespace Appwrite\\Models;`];
  // Top-level enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const cases = f.elements.map((e) => `  case ${upperSnakeCase(e)} = '${e}';`).join("\n");
    lines.push(``, `enum ${f.enumName}: string {\n${cases}\n}`);
  }
  // Class
  lines.push(``, `class ${className} {`);
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : (f.type === "int" || f.type === "float" ? f.type : (f.type === "bool" ? "bool" : "string"));
    if (f.isArray) t = "array";
    if (!f.required) t += "|null";
    lines.push(`  private ${t} $${f.camel};`);
  }
  // Constructor
  if (fields.length > 0) {
    const params = fields.map((f) => {
      let t = f.isEnum ? f.enumName : (f.type === "int" || f.type === "float" ? f.type : (f.type === "bool" ? "bool" : "string"));
      if (f.isArray) t = "array";
      if (!f.required) return `    ?${t} $${f.camel} = null`;
      return `    ${t} $${f.camel}`;
    }).join(",\n");
    const assigns = fields.map((f) => `    $this->${f.camel} = $${f.camel};`).join("\n");
    lines.push(``, `  public function __construct(\n${params}\n  ) {\n${assigns}\n  }`);
  }
  // Getters / setters
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : (f.type === "int" || f.type === "float" ? f.type : (f.type === "bool" ? "bool" : "string"));
    if (f.isArray) t = "array";
    const retType = !f.required ? `${t}|null` : t;
    const cap = f.camel.charAt(0).toUpperCase() + f.camel.slice(1);
    lines.push(`  public function get${cap}(): ${retType} {`);
    lines.push(`    return $this->${f.camel};`);
    lines.push(`  }`);
    lines.push(``);
    lines.push(`  public function set${cap}(${retType} $${f.camel}): void {`);
    lines.push(`    $this->${f.camel} = $${f.camel};`);
    lines.push(`  }`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

function genDart(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [];
  // Enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const vals = f.elements.map((e) => `  ${e},`).join("\n");
    lines.push(`enum ${f.enumName} {\n${vals}\n}\n`);
  }
  // Class
  lines.push(`class ${className} {`);
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `List<${t}>`;
    if (!f.required) t += "?";
    lines.push(`  ${t} ${f.camel};`);
  }
  // Named constructor
  const ctorParams = fields.map((f) => {
    return f.required ? `    required this.${f.camel},` : `    this.${f.camel},`;
  }).join("\n");
  lines.push(``, `  ${className}({\n${ctorParams}\n  });`);
  // fromMap
  const fromMapArgs = fields.map((f) => {
    if (f.isEnum) {
      return f.required
        ? `      ${f.camel}: ${f.enumName}.values.where((e) => e.name == map['${f.key}']).first,`
        : `      ${f.camel}: map['${f.key}'] != null ? ${f.enumName}.values.where((e) => e.name == map['${f.key}']).firstOrNull : null,`;
    }
    if (f.isArray) {
      return `      ${f.camel}: List<${f.type}>.from(map['${f.key}'] ?? []),`;
    }
    if (f.type === "String") {
      return f.required
        ? `      ${f.camel}: map['${f.key}'].toString(),`
        : `      ${f.camel}: map['${f.key}']?.toString(),`;
    }
    return `      ${f.camel}: map['${f.key}'],`;
  }).join("\n");
  lines.push(``, `  factory ${className}.fromMap(Map<String, dynamic> map) {`);
  lines.push(`    return ${className}(\n${fromMapArgs}\n    );`);
  lines.push(`  }`);
  // toMap
  const toMapEntries = fields.map((f) => {
    if (f.isEnum) return `      "${f.key}": ${f.camel}?.name,`;
    return `      "${f.key}": ${f.camel},`;
  }).join("\n");
  lines.push(``, `  Map<String, dynamic> toMap() {`);
  lines.push(`    return {\n${toMapEntries}\n    };`);
  lines.push(`  }`);
  lines.push(`}`);
  return lines.join("\n");
}

function genKotlin(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [`package io.appwrite.models`];
  // Enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const vals = f.elements.map((e) => `    ${e}`).join(",\n");
    lines.push(``, `enum class ${f.enumName} {\n${vals}\n}`);
  }
  // Data class
  const props = fields.map((f) => {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `List<${t}>`;
    if (!f.required) t += "?";
    return `    val ${f.camel}: ${t}`;
  }).join(",\n");
  lines.push(``, `data class ${className}(\n${props || "    // no attributes"}\n)`);
  return lines.join("\n");
}

function genSwift(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [`import Foundation`];
  // Enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const cases = f.elements.map((e) => `  case ${e} = "${e}"`).join("\n");
    lines.push(``, `public enum ${f.enumName}: String, Codable, CaseIterable {\n${cases}\n}`);
  }
  // Class
  lines.push(``, `public class ${className}: Codable {`);
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `[${t}]`;
    if (!f.required) t += "?";
    lines.push(`    public let ${f.camel}: ${t}`);
  }
  // CodingKeys
  const codingKeys = fields.map((f) => `        case ${f.camel} = "${f.key}"`).join("\n");
  lines.push(``, `    enum CodingKeys: String, CodingKey {\n${codingKeys}\n    }`);
  // init
  const initParams = fields.map((f) => {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `[${t}]`;
    if (!f.required) t += "?";
    return `        ${f.camel}: ${t}`;
  }).join(",\n");
  const initAssigns = fields.map((f) => `        self.${f.camel} = ${f.camel}`).join("\n");
  lines.push(``, `    init(\n${initParams}\n    ) {\n${initAssigns}\n    }`);
  // Decodable init
  const decodeBody = fields.map((f) => {
    const method = f.required ? "decode" : "decodeIfPresent";
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `[${t}]`;
    return `        self.${f.camel} = try container.${method}(${t}.self, forKey: .${f.camel})`;
  }).join("\n");
  lines.push(``, `    public required init(from decoder: Decoder) throws {`);
  lines.push(`        let container = try decoder.container(keyedBy: CodingKeys.self)`);
  lines.push(``, `${decodeBody}`);
  lines.push(`    }`);
  // Encodable
  const encodeBody = fields.map((f) => {
    const method = f.required ? "encode" : "encodeIfPresent";
    return `        try container.${method}(${f.camel}, forKey: .${f.camel})`;
  }).join("\n");
  lines.push(``, `    public func encode(to encoder: Encoder) throws {`);
  lines.push(`        var container = encoder.container(keyedBy: CodingKeys.self)`);
  lines.push(``, `${encodeBody}`);
  lines.push(`    }`);
  // toMap
  const mapEntries = fields.map((f) => `            "${f.key}": ${f.camel} as Any`).join(",\n");
  lines.push(``, `    public func toMap() -> [String: Any] {`);
  lines.push(`        return [\n${mapEntries}\n        ]`);
  lines.push(`    }`);
  // from(map:)
  const fromEntries = fields.map((f) => {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `[${t}]`;
    const cast = f.required ? `as! ${t}` : `as? ${t}`;
    return `            ${f.camel}: map["${f.key}"] ${cast}`;
  }).join(",\n");
  lines.push(``, `    public static func from(map: [String: Any]) -> ${className} {`);
  lines.push(`        return ${className}(\n${fromEntries}\n        )`);
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join("\n");
}

function genPython(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [`from dataclasses import dataclass`];
  // Enums
  const hasEnums = fields.some((f) => f.isEnum);
  if (hasEnums) lines.push(`from enum import Enum`);
  for (const f of fields) {
    if (!f.isEnum) continue;
    const vals = f.elements.map((e) => `    ${upperSnakeCase(e)} = "${e}"`).join("\n");
    lines.push(``, `class ${f.enumName}(Enum):\n${vals}`);
  }
  lines.push(``, `@dataclass`, `class ${className}:`);
  if (fields.length === 0) {
    lines.push(`    pass`);
  } else {
    // Required fields first, then optional
    const req = fields.filter((f) => f.required);
    const opt = fields.filter((f) => !f.required);
    for (const f of [...req, ...opt]) {
      let t = f.isEnum ? f.enumName : f.type;
      if (f.isArray) t = `list[${t}]`;
      if (!f.required) t += " | None";
      lines.push(`    ${f.camel}: ${t}${f.required ? "" : " = None"}`);
    }
  }
  return lines.join("\n");
}

function genGo(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [];
  // Enums as type + const
  for (const f of fields) {
    if (!f.isEnum) continue;
    lines.push(`type ${f.enumName} string`, ``);
    lines.push(`const (`);
    for (const e of f.elements) {
      lines.push(`\t${f.enumName}${pascalCase(e)} ${f.enumName} = "${e}"`);
    }
    lines.push(`)`, ``);
  }
  // Struct
  lines.push(`type ${className} struct {`);
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `[]${t}`;
    if (!f.required) t = `*${t}`;
    lines.push(`\t${pascalCase(f.camel)} ${t} \`json:"${f.key}"\``);
  }
  lines.push(`}`);
  return lines.join("\n");
}

function genRuby(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [];
  // Module with enums as constants
  for (const f of fields) {
    if (!f.isEnum) continue;
    for (const e of f.elements) {
      lines.push(`${upperSnakeCase(f.camel)}_${upperSnakeCase(e)} = '${e}'.freeze`);
    }
    lines.push(``);
  }
  lines.push(`class ${className}`);
  if (fields.length > 0) {
    lines.push(`  attr_accessor ${fields.map((f) => `:${f.camel}`).join(", ")}`);
    // initialize
    const params = fields.map((f) => `${f.camel}:${f.required ? "" : " nil"}`).join(", ");
    const assigns = fields.map((f) => `    @${f.camel} = ${f.camel}`).join("\n");
    lines.push(``, `  def initialize(${params})`);
    lines.push(assigns);
    lines.push(`  end`);
  }
  lines.push(`end`);
  return lines.join("\n");
}

function genCSharp(className: string, fields: FieldInfo[]): string {
  const lines: string[] = [];
  // Enums
  for (const f of fields) {
    if (!f.isEnum) continue;
    const vals = f.elements.map((e) => `    ${pascalCase(e)}`).join(",\n");
    lines.push(`public enum ${f.enumName}\n{\n${vals}\n}\n`);
  }
  lines.push(`public class ${className}`);
  lines.push(`{`);
  for (const f of fields) {
    let t = f.isEnum ? f.enumName : f.type;
    if (f.isArray) t = `List<${t}>`;
    const nullable = !f.required ? "?" : "";
    lines.push(`    public ${t}${nullable} ${pascalCase(f.camel)} { get; set; }`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

function generateTypeCode(collection: Collection, attrs: Attribute[], langId: string) {
  const className = pascalCase(collection.name || collection.$id);
  const fields = buildFieldInfos(attrs, langId);

  switch (langId) {
    case "typescript": return genTypeScript(className, fields);
    case "javascript": return genJavaScript(className, fields);
    case "java":       return genJava(className, fields);
    case "php":        return genPHP(className, fields);
    case "dart":       return genDart(className, fields);
    case "kotlin":     return genKotlin(className, fields);
    case "swift":      return genSwift(className, fields);
    case "python":     return genPython(className, fields);
    case "go":         return genGo(className, fields);
    case "ruby":       return genRuby(className, fields);
    case "csharp":     return genCSharp(className, fields);
    default:           return "// Unsupported language";
  }
}

function generateDbTypeCode(db: DatabaseT, colList: Collection[], allAttrsMap: Record<string, Attribute[]>, langId: string): string {
  if (colList.length === 0) return `// No collections in database "${db.name}"`;

  // For multi-collection files, generate each collection's code then deduplicate imports
  const parts: string[] = [];
  for (const col of colList) {
    const attrs = allAttrsMap[col.$id] ?? [];
    parts.push(generateTypeCode(col, attrs, langId));
  }

  let combined = parts.join("\n\n");

  // Deduplicate repeated imports/headers for combined output
  if (langId === "typescript") {
    const importLine = `import { type Models } from 'appwrite';`;
    const count = (combined.match(new RegExp(importLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
    if (count > 1) {
      combined = importLine + "\n" + combined.replaceAll(importLine + "\n", "").replaceAll(importLine, "");
    }
  } else if (langId === "javascript") {
    const docImport = `/**\n * @typedef {import('appwrite').Models.Document} Document\n */`;
    const count = (combined.match(/\@typedef \{import\('appwrite'\)\.Models\.Document\}/g) ?? []).length;
    if (count > 1) {
      combined = docImport + "\n" + combined.replaceAll(docImport + "\n", "").replaceAll(docImport, "");
    }
  } else if (langId === "php") {
    const nsLine = `namespace Appwrite\\Models;`;
    const phpTag = `<?php`;
    combined = combined.replaceAll(phpTag + "\n", "").replaceAll(phpTag, "");
    combined = combined.replaceAll(nsLine + "\n", "").replaceAll(nsLine, "");
    combined = `<?php\n${nsLine}\n\n` + combined.trim();
  } else if (langId === "java") {
    const pkgLine = `package io.appwrite.models;`;
    const impLine = `import java.util.*;`;
    combined = combined.replaceAll(pkgLine + "\n", "").replaceAll(pkgLine, "");
    combined = combined.replaceAll(impLine + "\n", "").replaceAll(impLine, "");
    combined = `${pkgLine}\n\n${impLine}\n\n` + combined.trim();
  } else if (langId === "kotlin") {
    const pkgLine = `package io.appwrite.models`;
    combined = combined.replaceAll(pkgLine + "\n", "").replaceAll(pkgLine, "");
    combined = `${pkgLine}\n\n` + combined.trim();
  } else if (langId === "swift") {
    const impLine = `import Foundation`;
    combined = combined.replaceAll(impLine + "\n", "").replaceAll(impLine, "");
    combined = `${impLine}\n\n` + combined.trim();
  } else if (langId === "python") {
    const dcImport = `from dataclasses import dataclass`;
    const enumImport = `from enum import Enum`;
    combined = combined.replaceAll(dcImport + "\n", "").replaceAll(dcImport, "");
    combined = combined.replaceAll(enumImport + "\n", "").replaceAll(enumImport, "");
    const hasEnum = combined.includes("class ") && combined.includes("(Enum):");
    combined = `${dcImport}\n${hasEnum ? enumImport + "\n" : ""}\n` + combined.trim();
  }

  return combined;
}

function generateDbTypeFiles(db: DatabaseT, colList: Collection[], allAttrsMap: Record<string, Attribute[]>, langId: string): { name: string; content: string }[] {
  const lang = TYPE_LANGS.find(l => l.id === langId) ?? TYPE_LANGS[0];
  return colList.map(col => {
    const attrs = allAttrsMap[col.$id] ?? [];
    const code = generateTypeCode(col, attrs, langId);
    return { name: `${pascalCase(col.name || col.$id)}.${lang.ext}`, content: code };
  });
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
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const KEYBOARD_PAN_STEP = 48;
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
    enabled: raw?.enabled,
    documentSecurity: raw?.documentSecurity ?? raw?.document_security,
    $createdAt: raw?.$createdAt,
    $updatedAt: raw?.$updatedAt,
  };
}

const envCfg: AppwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  apiKey: process.env.NEXT_PUBLIC_APPWRITE_API_KEY ?? "",
};

const CONNECTIONS_KEY = "xinaConnections";
const ACTIVE_CONNECTION_KEY = "xinaActiveConnectionId";
const NODE_LAYOUTS_KEY = "xinaNodeLayouts";
const NODE_GAP = 24;

type NodeLayoutMap = Record<string, Record<string, Record<string, { x: number; y: number }>>>;

function normalizePoint(p: { x: number; y: number }) {
  return {
    x: Math.round(p.x / GRID) * GRID,
    y: Math.round(p.y / GRID) * GRID,
  };
}

function readNodeLayouts(): NodeLayoutMap {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(NODE_LAYOUTS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeNodeLayouts(layouts: NodeLayoutMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NODE_LAYOUTS_KEY, JSON.stringify(layouts));
}

function nodesOverlap(a: { x: number; y: number; h: number }, b: { x: number; y: number; h: number }) {
  return (
    a.x < b.x + NODE_W + NODE_GAP &&
    a.x + NODE_W + NODE_GAP > b.x &&
    a.y < b.y + b.h + NODE_GAP &&
    a.y + a.h + NODE_GAP > b.y
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function StudioPage() {
  const [cfg, setCfg] = useState<AppwriteConfig>({ endpoint: "", projectId: "", apiKey: "" });
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [connectionName, setConnectionName] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  const [databases, setDatabases] = useState<DatabaseT[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeTotal, setAttributeTotal] = useState(0);
  const [attributeCursorAfter, setAttributeCursorAfter] = useState<string | null>(null);
  const [attributeLoadedCount, setAttributeLoadedCount] = useState(0);
  const [attributeHasMore, setAttributeHasMore] = useState(false);
  const [attributeLoadingMore, setAttributeLoadingMore] = useState(false);
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
  const [spacePressed, setSpacePressed] = useState(false);
  const dragClientRef = useRef<{ x: number; y: number } | null>(null);
  const panClientRef = useRef<{ x: number; y: number } | null>(null);

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
  const nodesRef = useRef<Record<string, CanvasNode>>({});
  const allAttrsRef = useRef<Record<string, Attribute[]>>({});

  const layoutScopeConnectionId = useCallback(() => activeConnectionId || "default", [activeConnectionId]);

  const getStoredDbLayout = useCallback((connectionId: string, dbId: string) => {
    const layouts = readNodeLayouts();
    return layouts?.[connectionId]?.[dbId] ?? {};
  }, []);

  const saveDbLayout = useCallback((connectionId: string, dbId: string, dbLayout: Record<string, { x: number; y: number }>) => {
    const layouts = readNodeLayouts();
    writeNodeLayouts({
      ...layouts,
      [connectionId]: {
        ...(layouts[connectionId] ?? {}),
        [dbId]: dbLayout,
      },
    });
  }, []);

  const persistNodesForDb = useCallback((connectionId: string, dbId: string, nextNodes: Record<string, CanvasNode>) => {
    const dbLayout: Record<string, { x: number; y: number }> = {};
    for (const node of Object.values(nextNodes)) {
      if (node.dbId !== dbId) continue;
      dbLayout[node.id] = normalizePoint({ x: node.x, y: node.y });
    }
    saveDbLayout(connectionId, dbId, dbLayout);
  }, [saveDbLayout]);

  const resolveFreeNodePosition = useCallback((
    desired: { x: number; y: number },
    nodeId: string,
    working: Record<string, CanvasNode>
  ) => {
    const start = normalizePoint(desired);
    const attrs = allAttrsRef.current[nodeId] ?? [];
    const targetH = nodeH(attrs.length);

    const collides = (x: number, y: number) => {
      for (const n of Object.values(working)) {
        if (n.id === nodeId) continue;
        const h = nodeH((allAttrsRef.current[n.id] ?? []).length);
        if (nodesOverlap({ x, y, h: targetH }, { x: n.x, y: n.y, h })) return true;
      }
      return false;
    };

    if (!collides(start.x, start.y)) return start;

    const stride = GRID * 2;
    const cols = 18;
    for (let i = 1; i <= 900; i++) {
      const x = start.x + (i % cols) * stride;
      const y = start.y + Math.floor(i / cols) * stride;
      if (!collides(x, y)) return { x, y };
    }

    return start;
  }, []);

  const clearWorkspaceState = useCallback(() => {
    setDatabases([]);
    setCollections([]);
    setAttributes([]);
    setAttributeTotal(0);
    setAttributeCursorAfter(null);
    setAttributeLoadedCount(0);
    setAttributeHasMore(false);
    setAttributeLoadingMore(false);
    setDocuments([]);
    setIndexes([]);
    setAllAttrs({});
    setSelDb(null);
    setSelCol(null);
    setSelAttr(null);
    setSelDoc(null);
    setNodes({});
    activeDbIdRef.current = null;
  }, []);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    allAttrsRef.current = allAttrs;
  }, [allAttrs]);

  /* ─── Persist config ─── */
  const saveCfg = (c: AppwriteConfig) => {
    setCfg(c);
    try { localStorage.setItem("xinaAppwriteConfig", JSON.stringify(c)); } catch {}
  };

  const persistConnections = useCallback((next: SavedConnection[], nextActiveId: string | null) => {
    setConnections(next);
    setActiveConnectionId(nextActiveId);
    try {
      localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(next));
      if (nextActiveId) localStorage.setItem(ACTIVE_CONNECTION_KEY, nextActiveId);
      else localStorage.removeItem(ACTIVE_CONNECTION_KEY);
    } catch {}
  }, []);

  const selectConnection = useCallback((id: string) => {
    const picked = connections.find((c) => c.id === id);
    if (!picked) return;
    saveCfg(picked.config);
    setConnectionName(picked.name);
    persistConnections(connections, picked.id);
    if (connected) {
      setConnected(false);
      clearWorkspaceState();
      toast.info("Disconnected. Connect to the selected profile.");
    }
  }, [clearWorkspaceState, connected, connections, persistConnections]);

  const addConnection = useCallback(() => {
    const name = connectionName.trim();
    if (!name) { toast.error("Connection name is required"); return; }
    if (!cfgReady(cfg)) { toast.error("Fill all connection fields"); return; }
    if (connections.length >= 1) {
      toast.error("Only one saved connection is allowed. Update or remove the existing connection.");
      return;
    }
    const now = new Date().toISOString();
    const entry: SavedConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      config: { ...cfg },
      createdAt: now,
      updatedAt: now,
    };
    const next = [...connections, entry];
    persistConnections(next, entry.id);
    toast.success("Connection profile added");
  }, [cfg, connectionName, connections, persistConnections]);

  const updateConnection = useCallback(() => {
    if (!activeConnectionId) { toast.error("Select a connection first"); return; }
    const name = connectionName.trim();
    if (!name) { toast.error("Connection name is required"); return; }
    if (!cfgReady(cfg)) { toast.error("Fill all connection fields"); return; }
    const next = connections.map((c) => (
      c.id === activeConnectionId
        ? { ...c, name, config: { ...cfg }, updatedAt: new Date().toISOString() }
        : c
    ));
    persistConnections(next, activeConnectionId);
    toast.success("Connection profile updated");
  }, [activeConnectionId, cfg, connectionName, connections, persistConnections]);

  const removeConnection = useCallback(() => {
    if (!activeConnectionId) { toast.error("Select a connection first"); return; }

    try {
      const layouts = readNodeLayouts();
      if (layouts[activeConnectionId]) {
        const { [activeConnectionId]: _removed, ...rest } = layouts;
        writeNodeLayouts(rest);
      }
    } catch {}

    const next = connections.filter((c) => c.id !== activeConnectionId);
    const nextActiveId = next[0]?.id ?? null;
    persistConnections(next, nextActiveId);
    if (nextActiveId) {
      const picked = next.find((c) => c.id === nextActiveId);
      if (picked) {
        saveCfg(picked.config);
        setConnectionName(picked.name);
      }
    } else {
      saveCfg({ endpoint: "", projectId: "", apiKey: "" });
      setConnectionName("");
    }
    setConnected(false);
    clearWorkspaceState();
    toast.success("Connection profile removed");
  }, [activeConnectionId, clearWorkspaceState, connections, persistConnections]);

  const disconnectCurrent = useCallback(() => {
    if (!connected) return;
    setConnected(false);
    clearWorkspaceState();
    toast.info("Disconnected");
  }, [clearWorkspaceState, connected]);

  useEffect(() => {
    try {
      const rawConnections = localStorage.getItem(CONNECTIONS_KEY);
      const rawActive = localStorage.getItem(ACTIVE_CONNECTION_KEY);
      const parsedConnections: SavedConnection[] = rawConnections ? JSON.parse(rawConnections) : [];

      if (Array.isArray(parsedConnections) && parsedConnections.length > 0) {
        const chosen = parsedConnections.find((c) => c.id === rawActive) ?? parsedConnections[0];
        const single = [chosen];
        persistConnections(single, chosen.id);
        setActiveConnectionId(chosen.id);
        setConnectionName(chosen.name);
        setCfg(chosen.config);
        if (cfgReady(chosen.config)) setConnected(true);
        return;
      }

      const rawSingle = localStorage.getItem("xinaAppwriteConfig");
      const savedSingle = rawSingle ? JSON.parse(rawSingle) : null;
      const merged = { ...envCfg, ...(savedSingle ?? {}) };
      setCfg(merged);
      if (cfgReady(merged)) {
        const now = new Date().toISOString();
        const seed: SavedConnection = {
          id: `conn_${Date.now()}_seed`,
          name: "Default",
          config: merged,
          createdAt: now,
          updatedAt: now,
        };
        persistConnections([seed], seed.id);
        setConnectionName(seed.name);
        setConnected(true);
      }
    } catch {}
  }, [persistConnections]);

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

      const connectionId = layoutScopeConnectionId();
      const storedLayout = getStoredDbLayout(connectionId, dbId);

      setNodes((prev) => {
        const next: Record<string, CanvasNode> = {};
        list.forEach((c, index) => {
          const existing = prev[c.$id];
          const stored = storedLayout[c.$id];

          const hasExact = existing?.dbId === dbId || !!stored;
          const base = existing?.dbId === dbId
            ? normalizePoint({ x: existing.x, y: existing.y })
            : stored
              ? normalizePoint({ x: stored.x, y: stored.y })
              : { x: 80 + (index % 4) * 300, y: 80 + Math.floor(index / 4) * 220 };

          const placed = hasExact ? base : resolveFreeNodePosition(base, c.$id, next);
          next[c.$id] = {
            id: c.$id,
            label: c.name,
            dbId,
            x: placed.x,
            y: placed.y,
          };
        });

        persistNodesForDb(connectionId, dbId, next);
        return next;
      });
      return list;
    } catch (e: any) { toast.error(e.message); }
    finally { if (!silent) setBusy(false); }
  }, [api, getStoredDbLayout, layoutScopeConnectionId, persistNodesForDb, resolveFreeNodePosition]);

  const loadAttributes = useCallback(async (
    dbId: string,
    colId: string,
    opts?: LoadOpts & { append?: boolean; cursorAfter?: string | null }
  ) => {
    const silent = !!opts?.silent;
    const append = !!opts?.append;
    const cursorAfter = opts?.cursorAfter ?? null;

    if (append) setAttributeLoadingMore(true);
    if (!silent && !append) setBusy(true);

    try {
      let list: Attribute[] = [];
      let total: number | undefined;

      try {
        const queries = [Query.limit(ATTR_PAGE_SIZE)];
        if (cursorAfter) queries.push(Query.cursorAfter(cursorAfter));

        const d = await api("listAttributes", {
          databaseId: dbId,
          collectionId: colId,
          queries,
        });

        list = d?.attributes ?? [];
        total = typeof d?.total === "number" ? d.total : undefined;
      } catch (err: any) {
        const msg = String(err?.message ?? "").toLowerCase();
        const isQuerySyntaxError = msg.includes("invalid") && (msg.includes("query") || msg.includes("syntax") || msg.includes("param"));
        if (!isQuerySyntaxError) throw err;

        const allData = await api("listAttributes", { databaseId: dbId, collectionId: colId });
        const allList: Attribute[] = allData?.attributes ?? [];

        if (append) {
          const start = attributeLoadedCount;
          list = allList.slice(start, start + ATTR_PAGE_SIZE);
        } else {
          list = allList.slice(0, ATTR_PAGE_SIZE);
        }
        total = allList.length;
      }

      if (append) {
        setAttributes((prev) => {
          const seen = new Set(prev.map((attr) => attr.key));
          const nextPage = list.filter((attr) => !seen.has(attr.key));
          return [...prev, ...nextPage];
        });
      } else {
        setAttributes(list);
      }

      const loadedCount = append ? attributeLoadedCount + list.length : list.length;
      const nextCursor = list.length ? list[list.length - 1]?.key ?? null : cursorAfter;
      setAttributeCursorAfter(nextCursor);
      setAttributeLoadedCount(loadedCount);
      const resolvedTotal = typeof total === "number" ? total : loadedCount + (list.length === ATTR_PAGE_SIZE ? 1 : 0);
      setAttributeTotal(resolvedTotal);
      setAttributeHasMore(typeof total === "number" ? loadedCount < total : list.length === ATTR_PAGE_SIZE);
      return list;
    } catch (e: any) { toast.error(e.message); }
    finally {
      if (!silent && !append) setBusy(false);
      if (append) setAttributeLoadingMore(false);
    }
  }, [api, attributeLoadedCount]);

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
        let cursorAfter: string | null = null;
        const all: Attribute[] = [];

        while (true) {
          const queries = [Query.limit(ATTR_PAGE_SIZE)];
          if (cursorAfter) queries.push(Query.cursorAfter(cursorAfter));

          const d = await api("listAttributes", {
            databaseId: dbId,
            collectionId: col.$id,
            queries,
          });
          const list: Attribute[] = d?.attributes ?? [];
          all.push(...list);

          const total = typeof d?.total === "number" ? d.total : undefined;
          cursorAfter = list.length ? list[list.length - 1]?.key ?? null : cursorAfter;
          if (!list.length) break;
          if (typeof total === "number") {
            if (all.length >= total) break;
          } else if (list.length < ATTR_PAGE_SIZE) {
            break;
          }
        }

        result[col.$id] = all;
      } catch { result[col.$id] = []; }
    }));
    setAllAttrs(result);
  }, [api]);

  const loadMoreAttributes = useCallback(async () => {
    if (!selDb || !selCol || !attributeHasMore || attributeLoadingMore) return;
    await loadAttributes(selDb.$id, selCol.$id, { silent: true, append: true, cursorAfter: attributeCursorAfter });
  }, [attributeCursorAfter, attributeHasMore, attributeLoadingMore, loadAttributes, selCol, selDb]);

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
    }
  }, [loadAttributes, selDb?.$id, selCol?.$id]);

  useEffect(() => {
    if (selDb && selCol && tab === "indexes") {
      loadIndexes(selDb.$id, selCol.$id, { silent: true });
    }
  }, [loadIndexes, selDb?.$id, selCol?.$id, tab]);
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

      if (pos) {
        const connectionId = layoutScopeConnectionId();
        const layouts = readNodeLayouts();
        const dbLayout = layouts?.[connectionId]?.[selDb.$id] ?? {};
        const placed = resolveFreeNodePosition(pos, id, nodesRef.current);
        writeNodeLayouts({
          ...layouts,
          [connectionId]: {
            ...(layouts[connectionId] ?? {}),
            [selDb.$id]: {
              ...dbLayout,
              [id]: normalizePoint(placed),
            },
          },
        });
      }

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

  const doToggleDbEnabled = async () => {
    if (!selDb) return;
    const next = !selDb.enabled;
    try {
      await api("updateDatabase", { databaseId: selDb.$id, name: selDb.name, enabled: next });
      setSelDb(p => p ? { ...p, enabled: next } : p);
      setDatabases(prev => prev.map(db => db.$id === selDb.$id ? { ...db, enabled: next } : db));
      toast.success(next ? "Database enabled" : "Database disabled");
    } catch (e: any) { toast.error(e.message); }
  };

  const doExportDbSchema = async () => {
    if (!selDb) return;
    try {
      const colsData = await api("listCollections", { databaseId: selDb.$id });
      const colList = colsData?.collections ?? [];
      const schema: any = { database: { id: selDb.$id, name: selDb.name, enabled: selDb.enabled }, collections: [] };
      for (const col of colList) {
        const attrsData = await api("listAttributes", { databaseId: selDb.$id, collectionId: col.$id });
        const idxData = await api("listIndexes", { databaseId: selDb.$id, collectionId: col.$id });
        schema.collections.push({
          id: col.$id, name: col.name,
          attributes: attrsData?.attributes ?? [],
          indexes: idxData?.indexes ?? [],
        });
      }
      const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${selDb.name}-schema.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Schema exported");
    } catch (e: any) { toast.error(e.message); }
  };

  const [backupPolicies, setBackupPolicies] = useState<Record<string, { schedule: string; retention: number; lastBackup?: string }>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("xina_backup_policies") || "{}"); } catch { return {}; }
  });
  const saveBackupPolicy = (dbId: string, schedule: string, retention: number) => {
    setBackupPolicies(prev => {
      const next = { ...prev, [dbId]: { ...prev[dbId], schedule, retention } };
      localStorage.setItem("xina_backup_policies", JSON.stringify(next));
      return next;
    });
    toast.success("Backup policy saved");
  };
  const doRunBackup = async () => {
    if (!selDb) return;
    await doExportDbSchema();
    setBackupPolicies(prev => {
      const next = { ...prev, [selDb.$id]: { ...prev[selDb.$id], schedule: prev[selDb.$id]?.schedule || "manual", retention: prev[selDb.$id]?.retention || 5, lastBackup: new Date().toISOString() } };
      localStorage.setItem("xina_backup_policies", JSON.stringify(next));
      return next;
    });
  };
  const copyId = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch { toast.error("Failed to copy"); }
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

  const doToggleColEnabled = async () => {
    if (!selDb || !selCol) return;
    const next = !selCol.enabled;
    try {
      await api("updateCollection", { databaseId: selDb.$id, collectionId: selCol.$id, enabled: next });
      setSelCol(p => p ? { ...p, enabled: next } : p);
      setCollections(prev => prev.map(c => c.$id === selCol.$id ? { ...c, enabled: next } : c));
      toast.success(next ? "Collection enabled" : "Collection disabled");
    } catch (e: any) { toast.error(e.message); }
  };

  const doToggleDocSecurity = async () => {
    if (!selDb || !selCol) return;
    const next = !selCol.documentSecurity;
    try {
      await api("updateCollection", { databaseId: selDb.$id, collectionId: selCol.$id, documentSecurity: next });
      setSelCol(p => p ? { ...p, documentSecurity: next } : p);
      setCollections(prev => prev.map(c => c.$id === selCol.$id ? { ...c, documentSecurity: next } : c));
      toast.success(next ? "Document security enabled" : "Document security disabled");
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

  const zoomToPoint = useCallback((clientX: number, clientY: number, targetZoom: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom)));
      return;
    }
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom));
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const worldX = (localX - pan.x) / zoom;
    const worldY = (localY - pan.y) / zoom;

    setPan({
      x: localX - worldX * nextZoom,
      y: localY - worldY * nextZoom,
    });
    setZoom(nextZoom);
  }, [pan.x, pan.y, zoom]);

  const zoomByFactorAt = useCallback((factor: number, point?: { x: number; y: number }) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const anchor = point ?? (rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    zoomToPoint(anchor.x, anchor.y, zoom * factor);
  }, [zoom, zoomToPoint]);

  const resetViewport = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const anchor = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    zoomToPoint(anchor.x, anchor.y, 1);
  }, [zoomToPoint]);

  const homeViewport = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitViewportToContent = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasNodes = Object.values(nodes);
    if (!canvasNodes.length) {
      homeViewport();
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of canvasNodes) {
      const attrs = allAttrs[node.id] ?? [];
      const h = nodeH(attrs.length);
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + NODE_W);
      maxY = Math.max(maxY, node.y + h);
    }

    const padding = 120;
    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);
    const fitW = Math.max(80, rect.width - padding * 2);
    const fitH = Math.max(80, rect.height - padding * 2);
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(fitW / contentWidth, fitH / contentHeight)));

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    setZoom(nextZoom);
    setPan({
      x: rect.width / 2 - cx * nextZoom,
      y: rect.height / 2 - cy * nextZoom,
    });
  }, [allAttrs, homeViewport, nodes]);

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
      setNodes(prev => {
        const node = prev[payload.id];
        if (!node) return prev;
        const placed = resolveFreeNodePosition({ x, y }, payload.id, prev);
        const next = { ...prev, [payload.id]: { ...node, x: placed.x, y: placed.y } };
        if (selDb) persistNodesForDb(layoutScopeConnectionId(), selDb.$id, next);
        return next;
      });
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
    dragClientRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ id, ox: (e.clientX - rect.left - pan.x) / zoom - n.x, oy: (e.clientY - rect.top - pan.y) / zoom - n.y });
    const col = collections.find(c => c.$id === id);
    if (col) { setSelCol(col); setSelAttr(null); }
  };

  useEffect(() => {
    if (!drag) return;
    let rafId: number | null = null;

    const applyMove = () => {
      rafId = null;
      const pointer = dragClientRef.current;
      if (!pointer) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setNodes(prev => ({
        ...prev,
        [drag.id]: {
          ...prev[drag.id],
          x: (pointer.x - rect.left - pan.x) / zoom - drag.ox,
          y: (pointer.y - rect.top - pan.y) / zoom - drag.oy,
        },
      }));
    };

    const move = (e: PointerEvent) => {
      dragClientRef.current = { x: e.clientX, y: e.clientY };
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(applyMove);
    };
    const up = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      dragClientRef.current = null;
      setNodes((prev) => {
        const moving = prev[drag.id];
        if (!moving) return prev;
        const placed = resolveFreeNodePosition({ x: moving.x, y: moving.y }, drag.id, prev);
        const next = { ...prev, [drag.id]: { ...moving, x: placed.x, y: placed.y } };
        if (selDb) persistNodesForDb(layoutScopeConnectionId(), selDb.$id, next);
        return next;
      });
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [drag, layoutScopeConnectionId, pan, persistNodesForDb, resolveFreeNodePosition, selDb, zoom]);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    setSelCol(null); setSelAttr(null);
    if (e.button === 1 || (e.button === 0 && (e.shiftKey || spacePressed))) {
      e.preventDefault();
      panClientRef.current = { x: e.clientX, y: e.clientY };
      setPanning({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
    }
  };

  useEffect(() => {
    if (!panning) return;
    let rafId: number | null = null;

    const applyMove = () => {
      rafId = null;
      const pointer = panClientRef.current;
      if (!pointer) return;
      setPan({
        x: panning.px + (pointer.x - panning.sx),
        y: panning.py + (pointer.y - panning.sy),
      });
    };

    const move = (e: PointerEvent) => {
      panClientRef.current = { x: e.clientX, y: e.clientY };
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(applyMove);
    };
    const up = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      panClientRef.current = null;
      setPanning(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [panning]);

  const onCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.metaKey || e.ctrlKey) {
      const factor = Math.exp(-e.deltaY * 0.002);
      zoomByFactorAt(factor, { x: e.clientX, y: e.clientY });
      return;
    }

    // Default wheel/trackpad motion pans the canvas like design tools.
    setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
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

      if (e.code === "Space") {
        e.preventDefault();
        setSpacePressed(true);
        return;
      }

      const plusPressed = e.key === "+" || e.key === "=";
      const minusPressed = e.key === "-" || e.key === "_";
      const fitPressed = e.key.toLowerCase() === "f" || (e.shiftKey && e.key === "1");

      if ((e.metaKey || e.ctrlKey) && (plusPressed || minusPressed || e.key === "0" || e.key === "1")) {
        e.preventDefault();
      }

      if (plusPressed) {
        e.preventDefault();
        zoomByFactorAt(1.15);
      } else if (minusPressed) {
        e.preventDefault();
        zoomByFactorAt(1 / 1.15);
      } else if (e.key === "1") {
        e.preventDefault();
        resetViewport();
      } else if (e.key === "0") {
        e.preventDefault();
        fitViewportToContent();
      } else if (fitPressed) {
        e.preventDefault();
        fitViewportToContent();
      } else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        homeViewport();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setPan((prev) => ({ x: prev.x, y: prev.y + (e.shiftKey ? KEYBOARD_PAN_STEP * 2 : KEYBOARD_PAN_STEP) }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setPan((prev) => ({ x: prev.x, y: prev.y - (e.shiftKey ? KEYBOARD_PAN_STEP * 2 : KEYBOARD_PAN_STEP) }));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPan((prev) => ({ x: prev.x + (e.shiftKey ? KEYBOARD_PAN_STEP * 2 : KEYBOARD_PAN_STEP), y: prev.y }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPan((prev) => ({ x: prev.x - (e.shiftKey ? KEYBOARD_PAN_STEP * 2 : KEYBOARD_PAN_STEP), y: prev.y }));
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpacePressed(false);
    };

    const onBlur = () => {
      setSpacePressed(false);
      setPanning(null);
      panClientRef.current = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [fitViewportToContent, homeViewport, modal, resetViewport, zoomByFactorAt]);

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
                ...(modal.kind === "typesPreview" || modal.kind === "dbTypesPreview" ? S.modalWide : {}),
                ...(modal.kind === "permissionRule" ? { width: 520 } : {}),
                ...(modal.kind === "leftPanelDetails" ? { width: 520 } : {}),
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

              {modal.kind === "leftPanelDetails" && (
                <>
                  <p style={S.modalH}>Connection</p>
                  <div style={{ fontSize: 12, color: "var(--muted-2)", marginBottom: 10 }}>
                    Status: <span style={{ color: connected ? "#10b981" : "#f59e0b", fontWeight: 600 }}>{connected ? "Connected" : "Disconnected"}</span>
                  </div>

                  {connections.length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted-2)", marginBottom: 6 }}>
                      Saved profile: <strong style={{ color: "var(--text)" }}>{connections[0]?.name}</strong>
                    </div>
                  )}

                  <input value={connectionName} onChange={e => setConnectionName(e.target.value)} placeholder="Connection Name" style={S.input} />
                  <input value={cfg.endpoint} onChange={e => saveCfg({ ...cfg, endpoint: e.target.value })} placeholder="Endpoint URL" style={S.input} />
                  <input value={cfg.projectId} onChange={e => saveCfg({ ...cfg, projectId: e.target.value })} placeholder="Project ID" style={S.input} />
                  <input value={cfg.apiKey} onChange={e => saveCfg({ ...cfg, apiKey: e.target.value })} placeholder="API Key" type="password" style={S.input} />

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 4 }}>
                    <button onClick={addConnection} disabled={connections.length >= 1} style={{ ...S.modalBtnPrimary, margin: 0, opacity: connections.length >= 1 ? 0.6 : 1 }}>
                      <Plus size={14} /> Add
                    </button>
                    <button onClick={updateConnection} disabled={!activeConnectionId} style={{ ...S.modalBtnSecondary, margin: 0, opacity: activeConnectionId ? 1 : 0.6 }}>
                      <Pencil size={14} /> Update
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={removeConnection}
                      disabled={!activeConnectionId}
                      style={{ ...S.modalBtnDanger, margin: 0, opacity: activeConnectionId ? 1 : 0.6 }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                    <button onClick={closeModal} style={{ ...S.modalBtnSecondary, margin: 0 }}>Close</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 8 }}>
                    <button onClick={handleConnect} disabled={busy} style={{ ...S.modalBtnPrimary, margin: 0 }}>
                      {busy ? <Loader2 size={14} className="spin" /> : <Plug size={14} />} Connect
                    </button>
                    <button onClick={disconnectCurrent} disabled={!connected} style={{ ...S.modalBtnSecondary, margin: 0, opacity: connected ? 1 : 0.6 }}>
                      <Power size={14} /> Disconnect
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

              {modal.kind === "dbTypesPreview" && (() => {
                const langId = mf.typesLang ?? "typescript";
                const lang = TYPE_LANGS.find((l) => l.id === langId) ?? TYPE_LANGS[0];
                const mode = mf.dbTypesMode ?? "single";
                const singleCode = selDb ? generateDbTypeCode(selDb, collections, allAttrs, lang.id) : "// No database selected";
                const files = selDb ? generateDbTypeFiles(selDb, collections, allAttrs, lang.id) : [];

                const doDownloadSingle = () => {
                  if (!selDb) return;
                  const blob = new Blob([singleCode], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `${selDb.name}-types.${lang.ext}`; a.click();
                  URL.revokeObjectURL(url);
                  toast.success("File downloaded");
                };

                const doDownloadZip = async () => {
                  if (!selDb || files.length === 0) return;
                  const zip = new JSZip();
                  const folder = zip.folder(selDb.name) ?? zip;
                  for (const f of files) folder.file(f.name, f.content);
                  const blob = await zip.generateAsync({ type: "blob" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `${selDb.name}-types.zip`; a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Zip downloaded");
                };

                return (
                  <>
                    <p style={S.modalH}>Database Types</p>
                    <div style={{ fontSize: 12, color: "var(--muted-2)", marginBottom: 10 }}>
                      {selDb?.name ?? "Database"} — {collections.length} collection{collections.length !== 1 ? "s" : ""}
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                      <label style={{ ...S.label, marginBottom: 0 }}>Language</label>
                      <select
                        style={{ ...S.select, marginBottom: 0, width: 180 }}
                        value={lang.id}
                        onChange={(e) => setMf((prev) => ({ ...prev, typesLang: e.target.value }))}
                      >
                        {TYPE_LANGS.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                      <label style={{ ...S.label, marginBottom: 0, marginLeft: 8 }}>Output</label>
                      <select
                        style={{ ...S.select, marginBottom: 0, width: 160 }}
                        value={mode}
                        onChange={(e) => setMf((prev) => ({ ...prev, dbTypesMode: e.target.value }))}
                      >
                        <option value="single">Single file</option>
                        <option value="multi">File per collection</option>
                      </select>
                    </div>

                    {mode === "single" ? (
                      <div style={S.codeShell}>
                        <div style={S.codeHeader}>
                          <span>{selDb ? `${selDb.name}-types.${lang.ext}` : `types.${lang.ext}`}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>{collections.length} collections</span>
                            <button onClick={() => copyText(singleCode)} style={S.codeCopyBtn}>Copy</button>
                          </div>
                        </div>
                        <pre style={S.codePre}>{singleCode}</pre>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                        {files.length === 0 ? (
                          <div style={{ fontSize: 12, color: "var(--muted-2)", padding: 16, textAlign: "center" }}>No collections in this database</div>
                        ) : files.map((f, i) => (
                          <div key={i} style={S.codeShell}>
                            <div style={S.codeHeader}>
                              <span>{f.name}</span>
                              <button onClick={() => copyText(f.content)} style={S.codeCopyBtn}>Copy</button>
                            </div>
                            <pre style={{ ...S.codePre, maxHeight: 160 }}>{f.content}</pre>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      {mode === "single" ? (
                        <button onClick={doDownloadSingle} style={{ ...S.btnAccent, flex: 1 }}>
                          <Download size={14} /> Download .{lang.ext}
                        </button>
                      ) : (
                        <button onClick={doDownloadZip} style={{ ...S.btnAccent, flex: 1 }}>
                          <Download size={14} /> Download .zip
                        </button>
                      )}
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
            <img src="/xina-logo.svg" alt="Xina" style={{ height: 26, width: "auto" }} />
            <Tooltip>
              <TooltipTrigger
                onClick={() => setModal({ kind: "leftPanelDetails" })}
                aria-label="Open details"
                style={{
                  marginLeft: "auto",
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid var(--panel-border)",
                  background: "var(--surface)",
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent>Other details</TooltipContent>
            </Tooltip>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Connection */}
            <section>
              <div style={{ ...S.secH, justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plug size={12} /> Connection</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: connected ? "#10b981" : "var(--muted)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#10b981" : "var(--muted)", boxShadow: connected ? "0 0 8px #10b981" : "none" }} />
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <button
                onClick={() => setModal({ kind: "leftPanelDetails" })}
                style={{ ...S.btnGhost, width: "100%", justifyContent: "center", marginTop: 8 }}
              >
                <Info size={14} /> Manage Credentials
              </button>
            </section>

           

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
            cursor: panning ? "grabbing" : drag ? "grabbing" : spacePressed ? "grab" : "default",
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
            <button title="Zoom in (+)" onClick={() => zoomByFactorAt(1.2)} style={S.zoomBtn}><ZoomIn size={14} /></button>
            <button title="Actual size (1)" onClick={resetViewport} style={{ ...S.zoomBtn, width: 44, fontSize: 11 }}>{Math.round(zoom * 100)}%</button>
            <button title="Zoom out (-)" onClick={() => zoomByFactorAt(1 / 1.2)} style={S.zoomBtn}><ZoomOut size={14} /></button>
            <div style={{ width: 1, height: 16, background: "var(--panel-border)" }} />
            <button title="Fit content (0 / F)" onClick={fitViewportToContent} style={S.zoomBtn}><Search size={14} /></button>
            <button title="Home (H)" onClick={homeViewport} style={S.zoomBtn}><Home size={14} /></button>
            <button title="Reset pan only" onClick={() => setPan({ x: 0, y: 0 })} style={S.zoomBtn}><Maximize2 size={14} /></button>
          </motion.div>
          <div
            style={{
              position: "absolute",
              right: 22,
              bottom: 66,
              fontSize: 11,
              color: "var(--muted-2)",
              background: "var(--panel-float)",
              border: "1px solid var(--panel-border)",
              borderRadius: 999,
              padding: "6px 10px",
              backdropFilter: "blur(8px)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 12,
            }}
          >
            Space + Drag: Pan • Ctrl/Cmd + Wheel: Zoom • 0/F: Fit • 1: 100%
          </div>
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
          <div style={{ ...S.rightHeader, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Settings size={14} style={{ color: "#6366f1" }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Properties</span>
            </div>
            {selCol && !selAttr && !selDoc && (
              <button
                onClick={() => {
                  setMf((prev) => ({ ...prev, typesLang: prev.typesLang ?? "typescript" }));
                  setModal({ kind: "typesPreview", colId: selCol.$id });
                }}
                style={S.addBtn}
                title="View generated types"
              >
                <FileText size={13} />
              </button>
            )}
            {selDb && !selCol && !selAttr && !selDoc && (
              <button
                onClick={() => {
                  setMf((prev) => ({ ...prev, typesLang: prev.typesLang ?? "typescript", dbTypesMode: prev.dbTypesMode ?? "single" }));
                  setModal({ kind: "dbTypesPreview" });
                }}
                style={S.addBtn}
                title="Generate database types"
              >
                <FileText size={13} />
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {selAttr ? (
              /* ── Attribute detail ── */
              <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Back button */}
                <button onClick={() => setSelAttr(null)} style={{ ...S.btnGhost, width: "fit-content", padding: "4px 10px", fontSize: 12 }}>
                  <ArrowLeft size={12} /> Back to collection
                </button>

                {/* Type header badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: `${typeColor(selAttr.type)}10`, border: `1px solid ${typeColor(selAttr.type)}25` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColor(selAttr.type)}20`, color: typeColor(selAttr.type) }}>
                    <TypeIcon type={selAttr.type} size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{selAttr.key}</div>
                    <div style={{ fontSize: 11, color: typeColor(selAttr.type), fontWeight: 600, textTransform: "capitalize", marginTop: 1 }}>{selAttr.type}</div>
                  </div>
                </div>

                {/* Key + copy */}
                <div style={S.card}>
                  <label style={S.label}>Attribute Key</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selAttr.key}</code>
                    <button onClick={() => copyId(selAttr.key)} style={{ ...S.addBtn, flexShrink: 0 }} title="Copy key"><Copy size={11} /></button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "2px 8px", borderRadius: 999, background: `${typeColor(selAttr.type)}15`, color: typeColor(selAttr.type), border: `1px solid ${typeColor(selAttr.type)}30` }}>
                      {selAttr.type}
                    </span>
                    {selAttr.required && (
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Settings size={13} style={{ color: "#6366f1" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Settings</span>
                  </div>

                  <DialogSwitch
                    label="Required"
                    checked={editReq}
                    onChange={(next) => setEditReq(next)}
                  />

                  {typeof selAttr.size === "number" && (
                    <div style={{ marginTop: 6 }}>
                      <label style={S.label}>Size (max characters)</label>
                      <input type="number" value={editSize ?? selAttr.size} onChange={e => setEditSize(+e.target.value)} style={S.input} />
                    </div>
                  )}

                  {(selAttr.type === "integer" || selAttr.type === "float") && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                      <div>
                        <label style={S.label}>Min</label>
                        <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", padding: "6px 10px", borderRadius: 6, background: "rgba(107,114,128,0.08)", border: "1px solid var(--panel-border)" }}>{selAttr.min ?? "—"}</div>
                      </div>
                      <div>
                        <label style={S.label}>Max</label>
                        <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", padding: "6px 10px", borderRadius: 6, background: "rgba(107,114,128,0.08)", border: "1px solid var(--panel-border)" }}>{selAttr.max ?? "—"}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 6 }}>
                    <label style={S.label}>Default Value</label>
                    <input value={editDef} onChange={e => setEditDef(e.target.value)} placeholder="(optional)" style={S.input} />
                  </div>
                </div>

                {/* Enum elements */}
                {selAttr.type === "enum" && selAttr.elements && selAttr.elements.length > 0 && (
                  <div style={S.card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <ListOrdered size={13} style={{ color: "#14b8a6" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Enum Values</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#6b7280" }}>{selAttr.elements.length} values</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {selAttr.elements.map((el, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(20,184,166,0.08)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.15)", fontFamily: "monospace" }}>{el}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relationship info */}
                {selAttr.type === "relationship" && (
                  <div style={S.card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <GitBranch size={13} style={{ color: "#6366f1" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Relationship</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(() => {
                        const relColId = selAttr.relatedCollectionId || selAttr.related_collection_id || (typeof selAttr.relatedCollection === "string" ? selAttr.relatedCollection : selAttr.relatedCollection?.$id) || selAttr.related_collection || "—";
                        const relCol = collections.find(c => c.$id === relColId);
                        const relType = selAttr.relationType || selAttr.relation_type || "—";
                        const twoWay = selAttr.twoWay ?? selAttr.two_way;
                        const twoWayKey = selAttr.twoWayKey || selAttr.two_way_key;
                        return (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                              <span style={{ color: "#6b7280" }}>Related Collection</span>
                              <span style={{ fontWeight: 600, color: "#a5b4fc" }}>{relCol?.name ?? relColId}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                              <span style={{ color: "#6b7280" }}>Type</span>
                              <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{relType}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                              <span style={{ color: "#6b7280" }}>Two-Way</span>
                              <span style={{ fontWeight: 600, color: twoWay ? "#10b981" : "#6b7280" }}>{twoWay ? "Yes" : "No"}</span>
                            </div>
                            {twoWayKey && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                                <span style={{ color: "#6b7280" }}>Two-Way Key</span>
                                <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{twoWayKey}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Save */}
                <button onClick={doSaveAttr} disabled={busy} style={{ ...S.btnAccent, width: "100%" }}>
                  <Check size={14} /> Save Changes
                </button>

                {/* Danger zone */}
                <div style={{ ...S.card, borderColor: "rgba(239,68,68,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <AlertCircle size={13} style={{ color: "#ef4444" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444" }}>Danger Zone</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>
                    Deleting this attribute is permanent and will remove it from all documents in this collection.
                  </div>
                  <button onClick={() => setModal({ kind: "confirm", title: "Delete Attribute", message: `Delete "${selAttr.key}"? This will remove the attribute from all documents.`, onConfirm: () => doDeleteAttribute(selAttr.key) })} style={{ ...S.btnDanger, width: "100%" }}>
                    <Trash2 size={14} /> Delete Attribute
                  </button>
                </div>
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
              <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Header */}
                <div style={S.secH}><Table2 size={12} /> Collection</div>

                {/* Name + ID */}
                <div style={S.card}>
                  <label style={S.label}>Name</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...S.input, flex: 1, marginBottom: 0 }} />
                    <button onClick={doSaveColName} disabled={busy} style={{ ...S.btnAccent, padding: "6px 12px" }}><Check size={14} /></button>
                  </div>
                  <label style={{ ...S.label, marginTop: 10 }}>Collection ID</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selCol.$id}</code>
                    <button onClick={() => copyId(selCol.$id)} style={{ ...S.addBtn, flexShrink: 0 }} title="Copy ID"><Copy size={11} /></button>
                  </div>
                </div>

                {/* Status & Settings */}
                <div style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Power size={13} style={{ color: selCol.enabled !== false ? "#10b981" : "#ef4444" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Status</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: selCol.enabled !== false ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: selCol.enabled !== false ? "#10b981" : "#ef4444", border: `1px solid ${selCol.enabled !== false ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                      {selCol.enabled !== false ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <DialogSwitch
                    label="Enabled"
                    checked={selCol.enabled !== false}
                    onChange={() => doToggleColEnabled()}
                  />
                  <DialogSwitch
                    label="Document Security"
                    checked={!!selCol.documentSecurity}
                    onChange={() => doToggleDocSecurity()}
                  />
                  <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5, marginTop: 4 }}>
                    When document security is enabled, users can access documents for which they have been granted either document or collection level permissions.
                  </div>
                </div>

                {/* Overview */}
                <div style={S.card}>
                  <label style={S.label}>Overview</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#a5b4fc" }}>{attributeTotal || attributes.length}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Attributes</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#6ee7b7" }}>{indexes.length}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Indexes</div>
                    </div>
                  </div>
                  {selCol.$createdAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "#6b7280" }}>
                      <Clock size={11} />
                      <span>Created {new Date(selCol.$createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  )}
                  {selCol.$updatedAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11, color: "#6b7280" }}>
                      <Clock size={11} />
                      <span>Updated {new Date(selCol.$updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  )}
                </div>

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
                    ) : (
                      <>
                        {attributes.map(a => (
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
                        {attributeHasMore && (
                          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                            <button
                              type="button"
                              onClick={loadMoreAttributes}
                              disabled={attributeLoadingMore}
                              title="Load more attributes"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 999,
                                border: "1px solid var(--panel-border)",
                                background: "var(--panel-bg)",
                                color: "var(--muted-2)",
                                display: "grid",
                                placeItems: "center",
                                cursor: attributeLoadingMore ? "wait" : "pointer",
                              }}
                            >
                              {attributeLoadingMore ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronDown size={12} />}
                            </button>
                          </div>
                        )}
                      </>
                    )}
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

                {/* Danger Zone */}
                <div style={{ ...S.card, borderColor: "rgba(239,68,68,0.2)", marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <AlertCircle size={13} style={{ color: "#ef4444" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444" }}>Danger Zone</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>
                    Deleting this collection will permanently remove all attributes, indexes, and documents within it.
                  </div>
                  <button
                    onClick={() => setModal({ kind: "confirm", title: "Delete Collection", message: `Delete "${selCol.name}"? All attributes, indexes, and documents will be permanently lost.`, onConfirm: () => doDeleteCollection(selCol.$id) })}
                    style={{ ...S.btnDanger, width: "100%" }}
                  >
                    <Trash2 size={14} /> Delete Collection
                  </button>
                </div>
              </section>

            ) : selDb ? (
              /* ── Database detail ── */
              <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Header */}
                <div style={S.secH}><DatabaseIcon size={12} /> Database</div>

                {/* Name + ID */}
                <div style={S.card}>
                  <label style={S.label}>Name</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...S.input, flex: 1, marginBottom: 0 }} />
                    <button onClick={doSaveDbName} disabled={busy} style={{ ...S.btnAccent, padding: "6px 12px" }}><Check size={14} /></button>
                  </div>
                  <label style={{ ...S.label, marginTop: 10 }}>Database ID</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selDb.$id}</code>
                    <button onClick={() => copyId(selDb.$id)} style={{ ...S.addBtn, flexShrink: 0 }} title="Copy ID"><Copy size={11} /></button>
                  </div>
                </div>

                {/* Status */}
                <div style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Power size={13} style={{ color: selDb.enabled !== false ? "#10b981" : "#ef4444" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Status</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: selDb.enabled !== false ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: selDb.enabled !== false ? "#10b981" : "#ef4444", border: `1px solid ${selDb.enabled !== false ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                      {selDb.enabled !== false ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <DialogSwitch
                    label="Enabled"
                    checked={selDb.enabled !== false}
                    onChange={() => doToggleDbEnabled()}
                  />
                </div>

                {/* Stats overview */}
                <div style={S.card}>
                  <label style={S.label}>Overview</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#a5b4fc" }}>{collections.length}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Collections</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#6ee7b7" }}>{Object.values(allAttrs).reduce((sum, arr) => sum + arr.length, 0)}</div>
                      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>Attributes</div>
                    </div>
                  </div>
                  {selDb.$createdAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "#6b7280" }}>
                      <Clock size={11} />
                      <span>Created {new Date(selDb.$createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  )}
                  {selDb.$updatedAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11, color: "#6b7280" }}>
                      <Clock size={11} />
                      <span>Updated {new Date(selDb.$updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  )}
                </div>

                {/* Backup & Export */}
                <div style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Shield size={13} style={{ color: "#6366f1" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Backup & Export</span>
                  </div>

                  <label style={S.label}>Schedule</label>
                  <select
                    value={backupPolicies[selDb.$id]?.schedule || "manual"}
                    onChange={e => saveBackupPolicy(selDb.$id, e.target.value, backupPolicies[selDb.$id]?.retention || 5)}
                    style={S.select}
                  >
                    <option value="manual">Manual only</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>

                  <label style={S.label}>Retention (exports to keep)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={backupPolicies[selDb.$id]?.retention || 5}
                    onChange={e => saveBackupPolicy(selDb.$id, backupPolicies[selDb.$id]?.schedule || "manual", Math.max(1, Math.min(50, +e.target.value)))}
                    style={S.input}
                  />

                  {backupPolicies[selDb.$id]?.lastBackup && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", marginBottom: 6 }}>
                      <Clock size={11} />
                      <span>Last backup: {new Date(backupPolicies[selDb.$id].lastBackup!).toLocaleString()}</span>
                    </div>
                  )}

                  <button onClick={doRunBackup} disabled={busy} style={{ ...S.btnAccent, width: "100%" }}>
                    <Download size={14} /> Export Schema Now
                  </button>
                </div>

                {/* Export full schema */}
                <div style={S.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <HardDrive size={13} style={{ color: "#6366f1" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Quick Actions</span>
                  </div>
                  <button
                    onClick={doExportDbSchema}
                    disabled={busy}
                    style={{ ...S.btnGhost, width: "100%", justifyContent: "center" }}
                  >
                    <Download size={14} /> Export as JSON
                  </button>
                </div>

                {/* Danger zone */}
                <div style={{ ...S.card, borderColor: "rgba(239,68,68,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <AlertCircle size={13} style={{ color: "#ef4444" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444" }}>Danger Zone</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>
                    Deleting a database will permanently remove all collections, attributes, and documents within it.
                  </div>
                  <button
                    onClick={() => setModal({ kind: "confirm", title: "Delete Database", message: `Delete "${selDb.name}"? All collections and documents will be permanently lost.`, onConfirm: () => doDeleteDatabase(selDb.$id) })}
                    style={{ ...S.btnDanger, width: "100%" }}
                  >
                    <Trash2 size={14} /> Delete Database
                  </button>
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
