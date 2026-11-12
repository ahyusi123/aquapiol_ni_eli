import crypto from "node:crypto";

const SECRET = process.env.API_TOKEN_SECRET || (process.env.NODE_ENV === "production" ? "" : "aquapiol-local-development-secret-change-me");
const ISSUER = "aquapiol-hr";
if (!SECRET) throw new Error("API_TOKEN_SECRET is required in production.");

const b64url = (value) => Buffer.from(value).toString("base64url");
const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export function createAccessToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss: ISSUER, sub: String(user.id), email: user.email,
    name: user.name, scope: ["hr:employees:read", "hr:attendance:read", "hr:leaves:read", "hr:schedules:read"],
    iat: now, exp: now + 60 * 60
  }));
  const input = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", SECRET).update(input).digest("base64url");
  return `${input}.${signature}`;
}

export function requireApiAuth(requiredScope) {
  return (req, res, next) => {
    const match = /^Bearer\s+(.+)$/i.exec(req.get("authorization") || "");
    if (!match) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Bearer token is required." } });
    const parts = match[1].split(".");
    if (parts.length !== 3) return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid access token." } });
    const input = `${parts[0]}.${parts[1]}`;
    const expected = crypto.createHmac("sha256", SECRET).update(input).digest("base64url");
    if (!safeEqual(parts[2], expected)) return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid access token." } });
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      const now = Math.floor(Date.now() / 1000);
      if (payload.iss !== ISSUER || !payload.sub || !Number.isFinite(payload.exp) || payload.exp <= now)
        return res.status(401).json({ success: false, error: { code: "TOKEN_EXPIRED", message: "Access token is invalid or expired." } });
      if (requiredScope && !Array.isArray(payload.scope) || (requiredScope && !payload.scope.includes(requiredScope)))
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient API permission." } });
      req.apiUser = payload;
      next();
    } catch {
      return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid access token." } });
    }
  };
}
