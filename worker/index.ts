/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (url.pathname === "/api/weekly-state") {
      return handleWeeklyState(request, env);
    }

    if (url.pathname === "/api/login") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/logout") {
      return handleLogout(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

type WeeklyState = {
  plans?: unknown[];
  deletedPlanIds?: string[];
  staff?: unknown[];
  access?: Record<string, unknown>;
  signatories?: Record<string, unknown>;
  updatedAt?: string;
};

const weeklyStateKey = "mao-weekly-shared-state";
const weeklyStateBackupKey = "mao-weekly-shared-state-backup-2026-09-25";
const recordStoreMigrationKey = "mao-weekly-record-store-migrated-v1";
const sessionDays = 7;
const officialStaffAccounts = [
  ["Rodel L. Pompa", "1001"],
  ["John Aldrich R. Vinzon", "1002"],
  ["Mila D. Lim", "1003"],
  ["Richelle M. Degala", "1004"],
  ["Eng. Hidy C. Flores", "1005"],
  ["Kristine Joy M. Torres", "1006"],
  ["Mellette B. Musico", "1007"],
  ["Rose Ann O. Marasigan", "1008"],
  ["Lorie May S. Tabilisma", "1009"],
  ["Jess Mark R. Macalalad", "1010"],
  ["Aleckz Andrea Rose M. Marayan", "1011"],
  ["Kezzer G. Fabregas", "1012"],
  ["Dra. Ithiel M. Maalihan", "1013"],
  ["Robert A. Merabete, Jr.", "1014"],
  ["Richman M. Bugarin", "1015"],
  ["Princess Joy C. Villarba", "1016"],
  ["Joshua Vargas", "1017"],
  ["Diana Rose Pedragoza", "1018"],
  ["Jaime M. Cupiado", "1019"],
  ["Aquilito S. Constantino", "1020"],
  ["Junnel F. Hernandez", "1021"],
  ["Elias G. Burgos", "1022"],
  ["Cheridan M. Faildo", "1023"],
  ["Melanio O. Mapacpac", "1024"],
];

const defaultAccess = {
  rosterVersion: "2026-official-staff-01",
  staffPassword: "",
  adminPassword: "",
  viewerPassword: "",
  staffCanPlan: true,
  staffCanAccomplish: true,
  staffCanBossTask: false,
};

const defaultSignatories = {
  preparedBy: "Staff / Encoder",
  preparedByTitle: "Agricultural Technologist/AEW",
  reviewedBy: "RODEL L. POMPA",
  reviewedByTitle: "Senior Agriculturist",
  approvedBy: "DANNY S. VILLACRUSIS",
  approvedByTitle: "Municipal Agriculturist",
};

async function handleWeeklyState(request: Request, env: Env): Promise<Response> {
  if (!env.DB) {
    return jsonResponse({ error: "Shared database is not available yet." }, 503, request);
  }

  await ensureWeeklyTables(env.DB);
  await ensureRecordStoreBackfilled(env.DB);

  if (request.method === "GET") {
    const session = await getSession(request, env.DB);
    const storedState = await loadStoredState(env.DB);
    if (!session) {
      const publicState = await stateForClient(env.DB, storedState, false, null);
      return jsonResponse({
        plans: [],
        deletedPlanIds: [],
        staff: publicState.staff,
        access: publicState.access,
        signatories: defaultSignatories,
        updatedAt: publicState.updatedAt,
      }, 200, request);
    }
    return jsonResponse(await stateForClient(env.DB, storedState, session.role === "admin", session), 200, request);
  }

  if (request.method === "POST") {
    const session = await getSession(request, env.DB);
    if (!session) return jsonResponse({ error: "Please log in again before saving." }, 401, request);
    if (session.role === "viewer") return jsonResponse({ error: "Viewer accounts cannot change records." }, 403, request);

    const body = await request.json<WeeklyState>();
    await saveRecordChanges(env.DB, body, session);

    if (session.role === "admin") {
      const requestedAccess = body.access && typeof body.access === "object" ? body.access : {};
      await replaceAuthAccounts(env.DB, requestedAccess);
      await saveMetadataState(env.DB, body);
    }
    const storedState = await loadStoredState(env.DB);
    return jsonResponse(await stateForClient(env.DB, storedState, session.role === "admin", session), 200, request);
  }

  return jsonResponse({ error: "Method not allowed." }, 405, request);
}

type SessionInfo = { role: string; staffName: string };
type PlanRecord = Record<string, unknown> & { id: string; staffName?: string; updatedAt?: string; createdAt?: string };

function validPlans(value: unknown): PlanRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PlanRecord => (
    Boolean(item && typeof item === "object" && String((item as { id?: unknown }).id || "").trim())
  ));
}

function recordTime(record: PlanRecord): number {
  const value = Date.parse(String(record.updatedAt || record.createdAt || ""));
  return Number.isFinite(value) ? value : 0;
}

async function loadStoredState(db: D1Database): Promise<WeeklyState> {
  const row = await db
    .prepare("SELECT value FROM app_state WHERE key = ?")
    .bind(weeklyStateKey)
    .first<{ value: string }>();
  if (!row?.value) return {};
  try {
    return JSON.parse(row.value) as WeeklyState;
  } catch {
    return {};
  }
}

async function ensureRecordStoreBackfilled(db: D1Database): Promise<void> {
  const migrated = await db
    .prepare("SELECT 1 AS ready FROM app_state WHERE key = ?")
    .bind(recordStoreMigrationKey)
    .first<{ ready: number }>();
  if (migrated) return;

  const sourceRow = await db
    .prepare("SELECT value, updated_at FROM app_state WHERE key = ?")
    .bind(weeklyStateKey)
    .first<{ value: string; updated_at: string }>();
  let sourceState: WeeklyState = {};
  if (sourceRow?.value) {
    try {
      sourceState = JSON.parse(sourceRow.value) as WeeklyState;
    } catch {
      sourceState = {};
    }
    await db.prepare("INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING")
      .bind(weeklyStateBackupKey, sourceRow.value, sourceRow.updated_at)
      .run();
  }

  const migrationTime = String(sourceState.updatedAt || sourceRow?.updated_at || new Date().toISOString()).split("-").slice(0, 3).join("-");
  const normalizedMigrationTime = Number.isFinite(Date.parse(migrationTime)) ? migrationTime : new Date().toISOString();
  const statements = validPlans(sourceState.plans).map((plan) => {
    const createdAt = String(plan.createdAt || normalizedMigrationTime);
    const updatedAt = String(plan.updatedAt || normalizedMigrationTime);
    const migratedPlan = { ...plan, createdAt, updatedAt, migratedFromLegacy: true };
    return db.prepare(
      "INSERT INTO weekly_records (id, staff_name, payload, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, NULL) ON CONFLICT(id) DO NOTHING"
    ).bind(plan.id, String(plan.staffName || ""), JSON.stringify(migratedPlan), createdAt, updatedAt);
  });
  const deletedAt = normalizedMigrationTime;
  for (const id of Array.isArray(sourceState.deletedPlanIds) ? sourceState.deletedPlanIds : []) {
    if (!id) continue;
    statements.push(db.prepare(
      "INSERT INTO weekly_records (id, staff_name, payload, created_at, updated_at, deleted_at) VALUES (?, '', ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET deleted_at = excluded.deleted_at"
    ).bind(String(id), JSON.stringify({ id: String(id) }), deletedAt, deletedAt, deletedAt));
  }
  for (let index = 0; index < statements.length; index += 50) {
    await db.batch(statements.slice(index, index + 50));
  }

  const metadataState: WeeklyState = {
    staff: Array.isArray(sourceState.staff) ? sourceState.staff : [],
    access: sourceState.access && typeof sourceState.access === "object" ? sanitizeAccess(sourceState.access) : {},
    signatories: sourceState.signatories && typeof sourceState.signatories === "object" ? sourceState.signatories : {},
    updatedAt: new Date().toISOString(),
  };
  await db.batch([
    db.prepare("UPDATE app_state SET value = ?, updated_at = ? WHERE key = ?")
      .bind(JSON.stringify(metadataState), metadataState.updatedAt, weeklyStateKey),
    db.prepare("INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING")
      .bind(recordStoreMigrationKey, JSON.stringify({ migratedAt: metadataState.updatedAt, records: statements.length }), metadataState.updatedAt),
  ]);
}

async function saveRecordChanges(db: D1Database, incoming: WeeklyState, session: SessionInfo): Promise<void> {
  const actorName = session.role === "staff" ? session.staffName : session.role;
  for (const plan of validPlans(incoming.plans)) {
    if (session.role !== "admin" && plan.staffName !== session.staffName) continue;
    const existing = await db.prepare("SELECT staff_name, payload, created_at, updated_at, deleted_at FROM weekly_records WHERE id = ?")
      .bind(plan.id)
      .first<{ staff_name: string; payload: string; created_at: string; updated_at: string; deleted_at: string | null }>();
    if (existing && session.role !== "admin" && existing.staff_name !== session.staffName) continue;
    if (existing?.deleted_at) continue;
    const incomingTime = recordTime(plan);
    if (existing && (!incomingTime || incomingTime <= Date.parse(existing.updated_at))) continue;
    const now = new Date().toISOString();
    const createdAt = String(plan.createdAt || existing?.created_at || now);
    const updatedAt = String(plan.updatedAt || now);
    const normalizedPlan = { ...plan, createdAt, updatedAt };
    const result = await db.prepare(
      "INSERT INTO weekly_records (id, staff_name, payload, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, NULL) ON CONFLICT(id) DO UPDATE SET staff_name = excluded.staff_name, payload = excluded.payload, updated_at = excluded.updated_at, deleted_at = NULL WHERE excluded.updated_at > weekly_records.updated_at AND weekly_records.deleted_at IS NULL"
    ).bind(plan.id, String(plan.staffName || ""), JSON.stringify(normalizedPlan), createdAt, updatedAt).run();
    if ((result.meta?.changes || 0) > 0) {
      await db.prepare(
        "INSERT INTO weekly_record_history (version_id, record_id, staff_name, operation, payload, actor_role, actor_name, saved_at, sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), plan.id, String(plan.staffName || ""), existing ? "update" : "create", JSON.stringify(normalizedPlan), session.role, actorName, now, Date.now()).run();
    }
  }

  for (const id of Array.isArray(incoming.deletedPlanIds) ? incoming.deletedPlanIds.map(String).filter(Boolean) : []) {
    const existing = await db.prepare("SELECT staff_name, payload, deleted_at FROM weekly_records WHERE id = ?")
      .bind(id)
      .first<{ staff_name: string; payload: string; deleted_at: string | null }>();
    if (!existing || existing.deleted_at) continue;
    if (session.role !== "admin" && existing.staff_name !== session.staffName) continue;
    const now = new Date().toISOString();
    const result = await db.prepare("UPDATE weekly_records SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
      .bind(now, now, id).run();
    if ((result.meta?.changes || 0) > 0) {
      await db.prepare(
        "INSERT INTO weekly_record_history (version_id, record_id, staff_name, operation, payload, actor_role, actor_name, saved_at, sequence) VALUES (?, ?, ?, 'delete', ?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), id, existing.staff_name, existing.payload, session.role, actorName, now, Date.now()).run();
    }
  }
}

async function saveMetadataState(db: D1Database, incoming: WeeklyState): Promise<void> {
  const current = await loadStoredState(db);
  const updatedAt = new Date().toISOString();
  const nextState: WeeklyState = {
    staff: Array.isArray(incoming.staff) ? incoming.staff : current.staff || [],
    access: incoming.access && typeof incoming.access === "object" ? sanitizeAccess(incoming.access) : sanitizeAccess(current.access || {}),
    signatories: incoming.signatories && typeof incoming.signatories === "object" ? incoming.signatories : current.signatories || {},
    updatedAt,
  };
  await db.prepare("INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .bind(weeklyStateKey, JSON.stringify(nextState), updatedAt).run();
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonResponse({ error: "Shared database is not available yet." }, 503, request);
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405, request);

  await ensureWeeklyTables(env.DB);
  const body = await request.json<{ role?: string; staffName?: string; password?: string }>();
  const role = String(body.role || "").trim();
  const staffName = String(body.staffName || "").trim();
  const password = String(body.password || "");
  const name = role === "staff" ? staffName : role;

  let account = await env.DB
    .prepare("SELECT role, name FROM auth_accounts WHERE role = ? AND name = ? AND password = ?")
    .bind(role, name, password)
    .first<{ role: string; name: string }>();

  if (!account) return jsonResponse({ error: "Incorrect password. Please try again." }, 401, request);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
  await env.DB
    .prepare("INSERT INTO auth_sessions (token, role, staff_name, expires_at) VALUES (?, ?, ?, ?)")
    .bind(token, account.role, account.role === "staff" ? account.name : "", expiresAt)
    .run();

  return jsonResponse({
    token,
    role: account.role,
    staffName: account.role === "staff" ? account.name : "",
  }, 200, request);
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonResponse({ ok: true }, 200, request);
  await ensureWeeklyTables(env.DB);
  const token = bearerToken(request);
  if (token) {
    await env.DB.prepare("DELETE FROM auth_sessions WHERE token = ?").bind(token).run();
  }
  return jsonResponse({ ok: true }, 200, request);
}

async function ensureWeeklyTables(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS auth_accounts (role TEXT NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, PRIMARY KEY (role, name))"),
    db.prepare("CREATE TABLE IF NOT EXISTS auth_sessions (token TEXT PRIMARY KEY, role TEXT NOT NULL, staff_name TEXT NOT NULL, expires_at TEXT NOT NULL)"),
  ]);

  const row = await db.prepare("SELECT COUNT(*) AS count FROM auth_accounts").first<{ count: number }>();
  if ((row?.count || 0) > 0) return;

  await db.batch([
    db.prepare("INSERT INTO auth_accounts (role, name, password) VALUES (?, ?, ?)").bind("admin", "admin", "mao2026"),
    db.prepare("INSERT INTO auth_accounts (role, name, password) VALUES (?, ?, ?)").bind("viewer", "viewer", "viewer123"),
    ...officialStaffAccounts.map(([name, password]) => (
      db.prepare("INSERT INTO auth_accounts (role, name, password) VALUES (?, ?, ?)").bind("staff", name, password)
    )),
  ]);
}

async function stateForClient(
  db: D1Database,
  storedState: WeeklyState | null,
  includePasswords: boolean,
  session: SessionInfo | null,
): Promise<WeeklyState> {
  const accounts = await db
    .prepare("SELECT name, password FROM auth_accounts WHERE role = 'staff' ORDER BY rowid")
    .all<{ name: string; password: string }>();
  const admin = await db.prepare("SELECT password FROM auth_accounts WHERE role = 'admin' AND name = 'admin'").first<{ password: string }>();
  const viewer = await db.prepare("SELECT password FROM auth_accounts WHERE role = 'viewer' AND name = 'viewer'").first<{ password: string }>();
  const staffAccounts = (accounts.results || []).map((account) => (
    includePasswords ? account : { name: account.name, password: "" }
  ));
  const storedAccess = storedState?.access && typeof storedState.access === "object" ? storedState.access : {};
  const access = {
    ...defaultAccess,
    ...sanitizeAccess(storedAccess),
    staffAccounts,
    adminPassword: includePasswords ? admin?.password || "" : "",
    viewerPassword: includePasswords ? viewer?.password || "" : "",
  };
  let plans: PlanRecord[] = [];
  let deletedPlanIds: string[] = [];
  if (session) {
    const records = session.role === "staff"
      ? await db.prepare("SELECT id, payload, deleted_at FROM weekly_records WHERE staff_name = ? ORDER BY updated_at")
        .bind(session.staffName)
        .all<{ id: string; payload: string; deleted_at: string | null }>()
      : await db.prepare("SELECT id, payload, deleted_at FROM weekly_records ORDER BY updated_at")
        .all<{ id: string; payload: string; deleted_at: string | null }>();
    for (const record of records.results || []) {
      if (record.deleted_at) {
        deletedPlanIds.push(record.id);
        continue;
      }
      try {
        const plan = JSON.parse(record.payload) as PlanRecord;
        if (plan?.id) plans.push(plan);
      } catch {
        // A damaged record is omitted without preventing other staff records from loading.
      }
    }
    if (session.role === "staff") {
      const allDeleted = await db.prepare("SELECT id FROM weekly_records WHERE deleted_at IS NOT NULL")
        .all<{ id: string }>();
      deletedPlanIds = [...new Set([...deletedPlanIds, ...(allDeleted.results || []).map((row) => row.id)])];
    }
  }

  return {
    plans,
    deletedPlanIds,
    staff: Array.isArray(storedState?.staff) && storedState.staff.length
      ? storedState.staff
      : staffAccounts.map((account) => account.name),
    access,
    signatories: { ...defaultSignatories, ...(storedState?.signatories || {}) },
    updatedAt: storedState?.updatedAt,
  };
}

async function replaceAuthAccounts(db: D1Database, access: Record<string, unknown>): Promise<void> {
  const staffAccounts = Array.isArray(access.staffAccounts) ? access.staffAccounts : [];
  const staffInserts = staffAccounts
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const account = item as { name?: unknown; password?: unknown };
      const name = String(account.name || "").trim();
      const password = String(account.password || "").trim();
      return name ? [name, password || "1001"] : null;
    })
    .filter((item): item is string[] => Boolean(item));

  const adminPassword = String(access.adminPassword || "mao2026").trim() || "mao2026";
  const viewerPassword = String(access.viewerPassword || "viewer123").trim() || "viewer123";

  await db.prepare("DELETE FROM auth_accounts").run();
  await db.batch([
    db.prepare("INSERT INTO auth_accounts (role, name, password) VALUES (?, ?, ?)").bind("admin", "admin", adminPassword),
    db.prepare("INSERT INTO auth_accounts (role, name, password) VALUES (?, ?, ?)").bind("viewer", "viewer", viewerPassword),
    ...staffInserts.map(([name, password]) => (
      db.prepare("INSERT INTO auth_accounts (role, name, password) VALUES (?, ?, ?)").bind("staff", name, password)
    )),
  ]);
}

function sanitizeAccess(access: Record<string, unknown>): Record<string, unknown> {
  return {
    rosterVersion: access.rosterVersion || defaultAccess.rosterVersion,
    staffCanPlan: access.staffCanPlan !== false,
    staffCanAccomplish: access.staffCanAccomplish !== false,
    staffCanBossTask: access.staffCanBossTask === true,
  };
}

async function getSession(request: Request, db: D1Database): Promise<{ role: string; staffName: string } | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const session = await db
    .prepare("SELECT role, staff_name, expires_at FROM auth_sessions WHERE token = ?")
    .bind(token)
    .first<{ role: string; staff_name: string; expires_at: string }>();

  if (!session || new Date(session.expires_at).getTime() < Date.now()) return null;
  return { role: session.role, staffName: session.staff_name };
}

function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function corsHeaders(request?: Request): HeadersInit {
  const origin = request?.headers.get("origin") || "";
  const allowedOrigins = new Set([
    "https://rodelpompa-commits.github.io",
    "https://weekly-accomplishment-monitor.daphneisolde.chatgpt.site",
  ]);
  const allowOrigin = allowedOrigins.has(origin) ? origin : "https://weekly-accomplishment-monitor.daphneisolde.chatgpt.site";
  return {
    "access-control-allow-origin": allowOrigin,
    "vary": "Origin",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-max-age": "86400",
  };
}
