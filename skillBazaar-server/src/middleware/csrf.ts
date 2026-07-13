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
 * - Sets a CSRF cookie on every request if missing.
 * - Validates X-CSRF-Token header matches cookie on state-changing methods.
 * - Skips safe methods (GET/HEAD/OPTIONS) and the Stripe webhook.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip safe HTTP methods — they must be idempotent and never cause state changes
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Still set the cookie so the frontend can read it
    if (!req.cookies[CSRF_COOKIE]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // Frontend needs to read this to send as header
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return next();
  }

  // State-changing methods require validation
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || !tokensMatch(cookieToken, headerToken)) {
    res.status(403).json({
      success: false,
      error: "Invalid or missing CSRF token",
    });
    return;
  }

  next();
}
