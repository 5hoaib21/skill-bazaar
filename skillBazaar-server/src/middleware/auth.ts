import { Request, Response, NextFunction } from "express";
import { getDB } from "../config/db";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { ObjectId } from "mongodb";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const COOKIE_NAME = "volunteerconnect.session_token";

function getSessionToken(req: Request): string | null {
  if (req.cookies?.[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

async function findSession(db: any, token: string) {
  // Try by token first (normal flow)
  let authSession = await db.collection("session").findOne({
    token,
    expiresAt: { $gt: new Date() },
  });
  if (authSession) return authSession;

  // Fallback: try by session ID (cross-origin flow where cookie can't be sent)
  if (ObjectId.isValid(token)) {
    authSession = await db.collection("session").findOne({
      _id: new ObjectId(token),
      expiresAt: { $gt: new Date() },
    });
  }
  return authSession;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try cookie/Bearer token first, then X-Session-ID header
    let token = getSessionToken(req);
    if (!token) {
      const sessionId = req.headers["x-session-id"] as string | undefined;
      if (sessionId && ObjectId.isValid(sessionId)) {
        token = sessionId;
      }
    }
    if (!token) {
      throw new UnauthorizedError();
    }

    const db = getDB();
    const authSession = await findSession(db, token);

    if (!authSession) {
      throw new UnauthorizedError("Invalid or expired session");
    }

    const userId =
      authSession.userId instanceof ObjectId
        ? authSession.userId
        : typeof authSession.userId === "string" && ObjectId.isValid(authSession.userId)
          ? new ObjectId(authSession.userId)
          : authSession.userId;

    const user = await db.collection("user").findOne(
      { _id: userId },
      { projection: { _id: 1, email: 1, name: 1, emailVerified: 1, image: 1, role: 1 } }
    );

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image || null,
      role: (user as any).role || "user",
    };

    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = getSessionToken(req);
    if (!token) {
      const sessionId = req.headers["x-session-id"] as string | undefined;
      if (sessionId && ObjectId.isValid(sessionId)) {
        token = sessionId;
      }
    }
    if (!token) {
      next();
      return;
    }

    const db = getDB();
    const authSession = await findSession(db, token);

    if (authSession) {
      const userId =
        authSession.userId instanceof ObjectId
          ? authSession.userId
          : typeof authSession.userId === "string" && ObjectId.isValid(authSession.userId)
            ? new ObjectId(authSession.userId)
            : authSession.userId;

      const user = await db.collection("user").findOne(
        { _id: userId },
        { projection: { _id: 1, email: 1, name: 1, emailVerified: 1, image: 1, role: 1 } }
      );

      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          image: user.image || null,
          role: (user as any).role || "user",
        };
      }
    }

    next();
  } catch {
    next();
  }
}
