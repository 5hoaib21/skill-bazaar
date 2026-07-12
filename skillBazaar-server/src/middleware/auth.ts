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

const COOKIE_NAME = "skillbazaar.session_token";

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

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getSessionToken(req);
    if (!token) {
      throw new UnauthorizedError();
    }

    const db = getDB();
    const authSession = await db.collection("session").findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!authSession) {
      throw new UnauthorizedError("Invalid or expired session");
    }

    const user = await db.collection("user").findOne(
      { id: authSession.userId },
      { projection: { id: 1, email: 1, name: 1, emailVerified: 1, image: 1, role: 1 } }
    );

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    req.user = {
      id: user.id,
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
    const token = getSessionToken(req);
    if (!token) {
      next();
      return;
    }

    const db = getDB();
    const authSession = await db.collection("session").findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (authSession) {
      const user = await db.collection("user").findOne(
        { id: authSession.userId },
        { projection: { id: 1, email: 1, name: 1, emailVerified: 1, image: 1, role: 1 } }
      );

      if (user) {
        req.user = {
          id: user.id,
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
