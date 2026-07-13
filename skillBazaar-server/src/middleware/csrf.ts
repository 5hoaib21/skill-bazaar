import { Request, Response, NextFunction } from "express";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE = "volunteerconnect.csrf_token";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_LENGTH = 32;
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString("hex");
}

function tokensMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Double-submit cookie CSRF protection.
 * - Sets a CSRF cookie on GET requests.
 * - Validates X-CSRF-Token header matches cookie on state-changing methods.
 * - Skips validation when cookie is absent (cross-origin requests with SameSite cookies).
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Safe methods: set cookie for frontend to read
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (!req.cookies[CSRF_COOKIE]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return next();
  }

  // State-changing methods: validate if cookie is present
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  // If no cookie sent (cross-origin), skip CSRF — X-Session-ID provides auth
  if (!cookieToken) {
    return next();
  }

  // If cookie present, header must match
  if (!headerToken || !tokensMatch(cookieToken, headerToken)) {
    res.status(403).json({
      success: false,
      error: "Invalid CSRF token",
    });
    return;
  }

  next();
}
