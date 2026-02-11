import { ResponseCode } from "#shared/types";
import { PublicRoute } from "#server/types";
import { verifyToken } from "#server/utils/auth";

/**
 * Authentication Middleware
 *
 * This middleware protects all /api/* routes by requiring a valid JWT token.
 * Public paths are configured below with their allowed HTTP methods.
 */

const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/api/auth/login", methods: ["POST"] },
  { path: "/api/auth/refresh", methods: ["POST"] },
  { path: "/api/auth/logout", methods: ["POST"] },

  { path: "^/api/movies$", methods: ["GET"] },
  { path: "^/api/movies/[a-f0-9-]+$", methods: ["GET"] },

  { path: "^/api/series$", methods: ["GET"] },
  { path: "^/api/series/[a-f0-9-]+$", methods: ["GET"] },
  { path: "^/api/series/[a-f0-9-]+/seasons$", methods: ["GET"] },

  { path: "^/api/seasons/[a-f0-9-]+$", methods: ["GET"] },
  { path: "^/api/seasons/[a-f0-9-]+/episodes$", methods: ["GET"] },

  { path: "^/api/episodes/[a-f0-9-]+$", methods: ["GET"] },

  { path: "^/api/genres$", methods: ["GET"] },
  { path: "^/api/genres/[a-f0-9-]+$", methods: ["GET"] },

  { path: "^/api/_nuxt_icon/.*", methods: ["GET"] },
];

function matchesPublicRoute(path: string, routePath: string): boolean {
  if (routePath.startsWith("^")) {
    const regex = new RegExp(routePath.replace("^", ""));
    return regex.test(path);
  }
  return path === routePath;
}

function findPublicRoute(path: string, method: string): PublicRoute | undefined {
  return PUBLIC_ROUTES.find(
    (route) => matchesPublicRoute(path, route.path) && route.methods.includes(method),
  );
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event).pathname;

  if (!url.startsWith("/api/")) {
    return;
  }

  const publicRoute = findPublicRoute(url, event.method);
  if (publicRoute) {
    return;
  }

  const authHeader = getHeader(event, "authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return createResponse(
      {
        code: ResponseCode.Unauthorized,
        message: "Authorization token is required",
      },
      null,
    );
  }

  const config = useRuntimeConfig();
  const token = authHeader.substring(7);
  const payload = verifyToken(token, config.jwt.access);

  if (!payload) {
    return createResponse(
      {
        code: ResponseCode.Unauthorized,
        message: "Invalid or expired token",
      },
      null,
    );
  }

  // Attach authenticated user to event context
  event.context.user = payload;
});
