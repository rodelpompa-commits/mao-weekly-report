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

    if (url.pathname === "/api/weekly-state") {
      return handleWeeklyState(request, env);
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

async function handleWeeklyState(request: Request, env: Env): Promise<Response> {
  if (!env.DB) {
    return jsonResponse({ error: "Shared database is not available yet." }, 503);
  }

  await ensureWeeklyStateTable(env.DB);

  if (request.method === "GET") {
    const row = await env.DB
      .prepare("SELECT value FROM app_state WHERE key = ?")
      .bind(weeklyStateKey)
      .first<{ value: string }>();

    return jsonResponse(row ? JSON.parse(row.value) : null);
  }

  if (request.method === "POST") {
    const body = await request.json<WeeklyState>();
    const nextState = {
      plans: Array.isArray(body.plans) ? body.plans : [],
      staff: Array.isArray(body.staff) ? body.staff : [],
      access: body.access && typeof body.access === "object" ? body.access : {},
      signatories: body.signatories && typeof body.signatories === "object" ? body.signatories : {},
      updatedAt: new Date().toISOString(),
    };

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

async function ensureWeeklyStateTable(db: D1Database): Promise<void> {
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)"
    )
    .run();
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
