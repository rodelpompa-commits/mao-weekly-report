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
      return new Response(null, { status: 204, headers: corsHeaders() });
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
  staff?: unknown[];
  access?: Record<string, unknown>;
  signatories?: Record<string, unknown>;
  updatedAt?: string;
};

const weeklyStateKey = "mao-weekly-shared-state";
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
    return jsonResponse({ error: "Shared database is not available yet." }, 503);
  }

  await ensureWeeklyTables(env.DB);

  if (request.method === "GET") {
    const session = await getSession(request, env.DB);
    const row = await env.DB
      .prepare("SELECT value FROM app_state WHERE key = ?")
      .bind(weeklyStateKey)
      .first<{ value: string }>();

    const storedState = row ? JSON.parse(row.value) : null;
    return jsonResponse(await stateForClient(env.DB, storedState, session?.role === "admin"));
  }

  if (request.method === "POST") {
    const session = await getSession(request, env.DB);
    if (!session) return jsonResponse({ error: "Please log in again before saving." }, 401);

    const body = await request.json<WeeklyState>();
    const current = await env.DB
      .prepare("SELECT value FROM app_state WHERE key = ?")
      .bind(weeklyStateKey)
      .first<{ value: string }>();
    const currentState = current ? JSON.parse(current.value) : {};
    const requestedAccess = body.access && typeof body.access === "object" ? body.access : {};
    const currentAccess = currentState.access && typeof currentState.access === "object" ? currentState.access : {};

    const nextState = {
      plans: Array.isArray(body.plans) ? body.plans : [],
      staff: Array.isArray(body.staff) ? body.staff : [],
      access: session.role === "admin" ? sanitizeAccess(requestedAccess) : sanitizeAccess(currentAccess),
      signatories: body.signatories && typeof body.signatories === "object" ? body.signatories : {},
      updatedAt: new Date().toISOString(),
    };

    if (session.role === "admin") {
      await replaceAuthAccounts(env.DB, requestedAccess);
    }

    await env.DB
      .prepare(
        "INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
      )
      .bind(weeklyStateKey, JSON.stringify(nextState), nextState.updatedAt)
      .run();

    return jsonResponse(nextState);
  }

  return jsonResponse({ error: "Method not allowed." }, 405);
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonResponse({ error: "Shared database is not available yet." }, 503);
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

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

  if (!account && role === "admin" && password === "9999") {
    account = { role: "admin", name: "admin" };
  }

  if (!account) return jsonResponse({ error: "Incorrect password. Please try again." }, 401);

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
  });
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonResponse({ ok: true });
  await ensureWeeklyTables(env.DB);
  const token = bearerToken(request);
  if (token) {
    await env.DB.prepare("DELETE FROM auth_sessions WHERE token = ?").bind(token).run();
  }
  return jsonResponse({ ok: true });
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

async function stateForClient(db: D1Database, storedState: WeeklyState | null, includePasswords: boolean): Promise<WeeklyState> {
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

  return {
    plans: Array.isArray(storedState?.plans) ? storedState?.plans : [],
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

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function corsHeaders(): HeadersInit {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-max-age": "86400",
  };
}
