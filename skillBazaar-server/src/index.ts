import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/auth";
import { sendSuccess } from "./utils/apiResponse";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(cookieParser());

// Stripe webhook must use raw body before express.json() for signature verification
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), (req, res, next) => {
  try {
    // Get raw body from req.body (Buffer)
    sendSuccess(res, null, "Stripe webhook - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Auth Routes (handled by better-auth on frontend) ──────────────────────
app.get("/api/auth/me", requireAuth, (req, res, next) => {
  try {
    sendSuccess(res, req.user);
  } catch (err) {
    next(err);
  }
});

// ─── Experience Routes ───────────────────────────────────────────────────────
app.get("/api/experiences", (req, res, next) => {
  try {
    // TODO: implement list experiences with search, filters, pagination
    sendSuccess(res, null, "List experiences - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/experiences/:id", (req, res, next) => {
  try {
    // TODO: implement get experience by id
    sendSuccess(res, null, "Get experience - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.post("/api/experiences", (req, res, next) => {
  try {
    // TODO: implement create experience (host only)
    sendSuccess(res, null, "Create experience - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/experiences/:id", (req, res, next) => {
  try {
    // TODO: implement update experience (owner only)
    sendSuccess(res, null, "Update experience - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/experiences/:id", (req, res, next) => {
  try {
    // TODO: implement archive experience (owner or admin)
    sendSuccess(res, null, "Archive experience - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/experiences/:id/status", (req, res, next) => {
  try {
    // TODO: implement update experience status (owner or admin)
    sendSuccess(res, null, "Update experience status - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Session Routes ──────────────────────────────────────────────────────────
app.get("/api/experiences/:id/sessions", (req, res, next) => {
  try {
    // TODO: implement list sessions for an experience
    sendSuccess(res, null, "List sessions - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.post("/api/experiences/:id/sessions", (req, res, next) => {
  try {
    // TODO: implement create session (host only)
    sendSuccess(res, null, "Create session - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/sessions/:id", (req, res, next) => {
  try {
    // TODO: implement update session (host only)
    sendSuccess(res, null, "Update session - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/sessions/:id", (req, res, next) => {
  try {
    // TODO: implement delete session (host only)
    sendSuccess(res, null, "Delete session - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/sessions/:id/cancel", (req, res, next) => {
  try {
    // TODO: implement cancel session (host only, triggers refunds)
    sendSuccess(res, null, "Cancel session - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Booking Routes ──────────────────────────────────────────────────────────
app.post("/api/bookings", (req, res, next) => {
  try {
    // TODO: implement create booking (user, with Stripe checkout session)
    sendSuccess(res, null, "Create booking - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/bookings/me", (req, res, next) => {
  try {
    // TODO: implement list user's bookings
    sendSuccess(res, null, "List my bookings - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/bookings/:id", (req, res, next) => {
  try {
    // TODO: implement get booking by id
    sendSuccess(res, null, "Get booking - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/bookings/:id/cancel", (req, res, next) => {
  try {
    // TODO: implement cancel booking (user or host)
    sendSuccess(res, null, "Cancel booking - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/bookings/:id/complete", (req, res, next) => {
  try {
    // TODO: implement mark booking as completed (host)
    sendSuccess(res, null, "Complete booking - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/host/bookings", (req, res, next) => {
  try {
    // TODO: implement list host's bookings
    sendSuccess(res, null, "List host bookings - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/host/sessions/:sessionId/bookings", (req, res, next) => {
  try {
    // TODO: implement list bookings for a specific session (host)
    sendSuccess(res, null, "List session bookings - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Payment Routes ──────────────────────────────────────────────────────────
app.post("/api/payments/create-checkout-session", (req, res, next) => {
  try {
    // TODO: implement Stripe Checkout session creation
    sendSuccess(res, null, "Create checkout session - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.post("/api/payments/refunds", (req, res, next) => {
  try {
    // TODO: implement refund processing
    sendSuccess(res, null, "Process refund - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Host Routes ─────────────────────────────────────────────────────────────
app.post("/api/hosts/profile", (req, res, next) => {
  try {
    // TODO: implement create host profile
    sendSuccess(res, null, "Create host profile - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/hosts/me", (req, res, next) => {
  try {
    // TODO: implement get current host profile
    sendSuccess(res, null, "Get my host profile - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/hosts/me", (req, res, next) => {
  try {
    // TODO: implement update host profile
    sendSuccess(res, null, "Update host profile - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/hosts/:id", (req, res, next) => {
  try {
    // TODO: implement get public host profile
    sendSuccess(res, null, "Get host profile - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.post("/api/stripe/connect/account", (req, res, next) => {
  try {
    // TODO: implement create or retrieve Stripe Connect account
    sendSuccess(res, null, "Stripe Connect account - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.post("/api/stripe/connect/onboarding-link", (req, res, next) => {
  try {
    // TODO: implement generate Stripe Connect onboarding link
    sendSuccess(res, null, "Stripe Connect onboarding link - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/stripe/connect/status", (req, res, next) => {
  try {
    // TODO: implement get Stripe Connect status
    sendSuccess(res, null, "Stripe Connect status - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Review Routes ───────────────────────────────────────────────────────────
app.get("/api/experiences/:id/reviews", (req, res, next) => {
  try {
    // TODO: implement list reviews for an experience
    sendSuccess(res, null, "List reviews - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.post("/api/reviews", (req, res, next) => {
  try {
    // TODO: implement create review (user with completed booking)
    sendSuccess(res, null, "Create review - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/reviews/:id", (req, res, next) => {
  try {
    // TODO: implement update review
    sendSuccess(res, null, "Update review - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/reviews/:id", (req, res, next) => {
  try {
    // TODO: implement delete review
    sendSuccess(res, null, "Delete review - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Admin Routes ────────────────────────────────────────────────────────────
app.get("/api/admin/experiences", (req, res, next) => {
  try {
    // TODO: implement list all experiences for moderation (admin only)
    sendSuccess(res, null, "Admin list experiences - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/admin/experiences/:id/moderate", (req, res, next) => {
  try {
    // TODO: implement approve/reject experience (admin only)
    sendSuccess(res, null, "Moderate experience - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/admin/hosts", (req, res, next) => {
  try {
    // TODO: implement list hosts for verification (admin only)
    sendSuccess(res, null, "Admin list hosts - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/admin/hosts/:id/verify", (req, res, next) => {
  try {
    // TODO: implement verify/reject host (admin only)
    sendSuccess(res, null, "Verify host - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.get("/api/admin/reports", (req, res, next) => {
  try {
    // TODO: implement list reports (admin only)
    sendSuccess(res, null, "Admin list reports - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/admin/reports/:id", (req, res, next) => {
  try {
    // TODO: implement review report (admin only)
    sendSuccess(res, null, "Review report - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/admin/users/:id/status", (req, res, next) => {
  try {
    // TODO: implement suspend/activate user (admin only)
    sendSuccess(res, null, "Update user status - not yet implemented", undefined, 501);
  } catch (err) {
    next(err);
  }
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`[Server] SkillBazaar API running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  }
}

start();
