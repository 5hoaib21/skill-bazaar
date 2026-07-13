import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { env } from "./config/env";
import { connectDB, getDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth, requireAdmin, optionalAuth } from "./middleware/auth";
import { sendSuccess, sendError } from "./utils/apiResponse";
import { NotFoundError, ValidationError, ForbiddenError } from "./utils/errors";
import { stripe as stripeClient } from "./config/stripe";
import { rateLimiter, strictRateLimiter } from "./middleware/rateLimiter";

function getStripe(): typeof stripeClient {
  if (!stripeClient) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return stripeClient;
}

function paramId(req: express.Request): string {
  return req.params.id as string;
}

function paramSessionId(req: express.Request): string {
  return req.params.sessionId as string;
}

function paramBookingId(req: express.Request): string {
  return req.params.id as string;
}
import {
  experiencesCollection,
  sessionsCollection,
  bookingsCollection,
  reviewsCollection,
  hostProfilesCollection,
  stripeEventsCollection,
  reportsCollection,
  contactMessagesCollection,
  categoriesCollection,
} from "./database/collections";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(cookieParser());

// Stripe webhook before express.json() for raw body
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      sendError(res, "Missing stripe signature", 400);
      return;
    }
    const stripe = getStripe();
    const event = getStripe().webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);

    const existing = await stripeEventsCollection().findOne({ stripeEventId: event.id });
    if (existing?.processed) {
      sendSuccess(res, null, "Event already processed");
      return;
    }
    await stripeEventsCollection().insertOne({
      stripeEventId: event.id,
      eventType: event.type,
      processed: false,
      processedAt: null,
      error: null,
      createdAt: new Date(),
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const booking = await bookingsCollection().findOneAndUpdate(
          { "stripe.checkoutSessionId": session.id },
          {
            $set: {
              bookingStatus: "confirmed",
              paymentStatus: "paid",
              "stripe.paymentIntentId": session.payment_intent,
              "stripe.chargeId": session.charge || null,
            },
          }
        );
        if (booking) {
          await sessionsCollection().updateOne(
            { _id: booking.sessionId },
            { $inc: { confirmedSeats: booking.participantCount, reservedSeats: -booking.participantCount } }
          );
        }
        break;
      }
      case "checkout.session.expired": {
        const expired = event.data.object as any;
        const expBooking = await bookingsCollection().findOneAndUpdate(
          { "stripe.checkoutSessionId": expired.id },
          { $set: { bookingStatus: "cancelled", paymentStatus: "failed" } }
        );
        if (expBooking) {
          await sessionsCollection().updateOne(
            { _id: expBooking.sessionId },
            { $inc: { reservedSeats: -expBooking.participantCount } }
          );
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as any;
        await bookingsCollection().updateOne(
          { "stripe.chargeId": charge.id },
          { $set: { paymentStatus: "refunded" }, $push: { "stripe.refundIds": charge.refunds?.data?.[0]?.id } }
        );
        break;
      }
      case "account.updated": {
        const account = event.data.object as any;
        await hostProfilesCollection().updateOne(
          { stripeAccountId: account.id },
          {
            $set: {
              stripeChargesEnabled: account.charges_enabled,
              stripePayoutsEnabled: account.payouts_enabled,
              stripeOnboardingComplete: account.charges_enabled && account.payouts_enabled,
            },
          }
        );
        break;
      }
    }

    await stripeEventsCollection().updateOne(
      { stripeEventId: event.id },
      { $set: { processed: true, processedAt: new Date() } }
    );

    res.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook Error]", err.message);
    sendError(res, `Webhook error: ${err.message}`, 400);
  }
});

app.use(express.json());

app.get("/api/health", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── Auth ────────────────────────────────────────────────────────────────────
app.get("/api/auth/me", requireAuth, (req, res, next) => {
  try {
    sendSuccess(res, req.user);
  } catch (err) { next(err); }
});

// ─── Experiences ─────────────────────────────────────────────────────────────
app.get("/api/experiences", optionalAuth, async (req, res, next) => {
  try {
    const {
      search, category, city, area, date, minPrice, maxPrice,
      minRating, page = "1", limit = "12", sort = "newest", status, hostSelf,
    } = req.query as Record<string, string>;

    const filter: any = {};
    if (hostSelf === "true" && req.user) {
      filter.hostId = new ObjectId(req.user.id);
      if (status) filter.status = status;
    } else {
      filter.status = "published";
      filter.archived = { $ne: true };
    }
    if (category) filter.category = category;
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (area) filter["location.area"] = { $regex: area, $options: "i" };
    if (minPrice || maxPrice) {
      filter.pricePerParticipant = {};
      if (minPrice) filter.pricePerParticipant.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerParticipant.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }
    if (minRating) {
      filter["ratingSummary.average"] = { $gte: parseFloat(minRating) };
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { pricePerParticipant: 1 };
    else if (sort === "price_desc") sortObj = { pricePerParticipant: -1 };
    else if (sort === "rating") sortObj = { "ratingSummary.average": -1 };
    else if (sort === "reviews") sortObj = { "ratingSummary.count": -1 };

    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pg - 1) * lim;

    const [items, total] = await Promise.all([
      experiencesCollection().find(filter).sort(sortObj).skip(skip).limit(lim).toArray(),
      experiencesCollection().countDocuments(filter),
    ]);

    if (date) {
      const dateStr = new Date(date).toISOString().split("T")[0];
      const expIds = items.map((e) => e._id);
      const availSessions = await sessionsCollection().find({
        experienceId: { $in: expIds },
        startAt: { $gte: new Date(dateStr), $lt: new Date(dateStr + "T23:59:59.999Z") },
        status: "scheduled",
      }).project({ experienceId: 1 }).toArray();
      const availIds = new Set(availSessions.map((s) => s.experienceId?.toString()));
      const filtered = items.filter((e) => availIds.has(e._id!.toString()));
      sendSuccess(res, filtered, undefined, { page: pg, limit: lim, total: filtered.length, totalPages: Math.ceil(filtered.length / lim) });
      return;
    }

    const now = new Date();
    const futureSessions = await sessionsCollection().find({
      experienceId: { $in: items.map((e) => e._id) },
      startAt: { $gt: now },
      status: "scheduled",
    }).project({ experienceId: 1, startAt: 1, capacity: 1, confirmedSeats: 1, reservedSeats: 1 }).toArray();

    const enriched = items.map((exp) => {
      const item = exp as any;
      const expSessions = futureSessions.filter((s) => s.experienceId?.toString() === item._id.toString());
      const sorted = expSessions.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
      item.nextAvailableDate = sorted[0]?.startAt || null;
      item.availableSessionsCount = sorted.length;
      return item;
    });

    sendSuccess(res, enriched, undefined, { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

app.get("/api/experiences/:id", optionalAuth, async (req, res, next) => {
  try {
    const exp = await experiencesCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!exp) throw new NotFoundError("Experience");
    sendSuccess(res, exp);
  } catch (err) { next(err); }
});

app.post("/api/experiences", requireAuth, async (req, res, next) => {
  try {
    const body = req.body;
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const exp = {
      hostId: new ObjectId(req.user!.id),
      title: body.title,
      slug,
      shortDescription: body.shortDescription || "",
      fullDescription: body.fullDescription || "",
      category: body.category || "",
      tags: body.tags || [],
      language: body.language || "English",
      durationMinutes: parseInt(body.durationMinutes) || 60,
      pricePerParticipant: parseInt(body.pricePerParticipant) || 0,
      currency: body.currency || "BDT",
      defaultCapacity: parseInt(body.defaultCapacity) || 10,
      minimumAge: body.minimumAge ? parseInt(body.minimumAge) : null,
      includedItems: body.includedItems || [],
      participantRequirements: body.participantRequirements || [],
      safetyNotes: body.safetyNotes || [],
      cancellationPolicyId: body.cancellationPolicyId || "standard",
      images: body.images || [],
      location: {
        country: body.location?.country || "",
        city: body.location?.city || "",
        area: body.location?.area || "",
        address: body.location?.address || "",
        latitude: body.location?.latitude || null,
        longitude: body.location?.longitude || null,
        publicLocationLabel: body.location?.publicLocationLabel || body.location?.city || "",
      },
      status: "draft",
      moderation: { reviewedBy: null, reviewedAt: null, rejectionReason: null },
      ratingSummary: { average: 0, count: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await experiencesCollection().insertOne(exp);
    sendSuccess(res, { ...exp, _id: result.insertedId }, "Experience created", undefined, 201);
  } catch (err) { next(err); }
});

app.patch("/api/experiences/:id", requireAuth, async (req, res, next) => {
  try {
    const exp = await experiencesCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!exp) throw new NotFoundError("Experience");
    if (exp.hostId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();

    const { hostId, slug, ratingSummary, ...updateFields } = req.body;
    const result = await experiencesCollection().findOneAndUpdate(
      { _id: exp._id },
      { $set: { ...updateFields, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

app.delete("/api/experiences/:id", requireAuth, async (req, res, next) => {
  try {
    const exp = await experiencesCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!exp) throw new NotFoundError("Experience");
    if (exp.hostId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();

    const hasBookings = await bookingsCollection().findOne({ experienceId: exp._id });
    if (hasBookings) {
      await experiencesCollection().updateOne({ _id: exp._id }, { $set: { status: "archived", updatedAt: new Date() } });
      sendSuccess(res, null, "Experience archived");
    } else {
      await experiencesCollection().deleteOne({ _id: exp._id });
      sendSuccess(res, null, "Experience deleted");
    }
  } catch (err) { next(err); }
});

app.patch("/api/experiences/:id/status", requireAuth, async (req, res, next) => {
  try {
    const exp = await experiencesCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!exp) throw new NotFoundError("Experience");
    if (exp.hostId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();

    const { status } = req.body;
    const validStatuses = ["draft", "pending_review", "published", "paused", "rejected", "archived"];
    if (!validStatuses.includes(status)) throw new ValidationError("Invalid status");

    const update: any = { status, updatedAt: new Date() };
    if (status === "pending_review") {
      update.moderation = { reviewedBy: null, reviewedAt: null, rejectionReason: null };
    }

    await experiencesCollection().updateOne({ _id: exp._id }, { $set: update });
    sendSuccess(res, null, `Experience status updated to ${status}`);
  } catch (err) { next(err); }
});

// ─── Sessions ────────────────────────────────────────────────────────────────
app.get("/api/experiences/:id/sessions", async (req, res, next) => {
  try {
    const sessions = await sessionsCollection().find({
      experienceId: new ObjectId(paramId(req)),
    }).sort({ startAt: 1 }).toArray();
    sendSuccess(res, sessions);
  } catch (err) { next(err); }
});

app.post("/api/experiences/:id/sessions", requireAuth, async (req, res, next) => {
  try {
    const expId = new ObjectId(paramId(req));
    const exp = await experiencesCollection().findOne({ _id: expId });
    if (!exp) throw new NotFoundError("Experience");
    if (exp.hostId.toString() !== req.user!.id) throw new ForbiddenError();

    const body = req.body;
    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);
    if (startAt <= new Date()) throw new ValidationError("Session must be in the future");
    if (endAt <= startAt) throw new ValidationError("End time must be after start time");

    const session = {
      experienceId: expId,
      hostId: new ObjectId(req.user!.id),
      startAt,
      endAt,
      capacity: parseInt(body.capacity) || exp.defaultCapacity,
      reservedSeats: 0,
      confirmedSeats: 0,
      bookingCutoffAt: new Date(startAt.getTime() - 24 * 60 * 60 * 1000),
      status: "scheduled" as const,
      cancelledAt: null,
      cancellationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await sessionsCollection().insertOne(session);
    sendSuccess(res, { ...session, _id: result.insertedId }, "Session created", undefined, 201);
  } catch (err) { next(err); }
});

app.patch("/api/sessions/:id", requireAuth, async (req, res, next) => {
  try {
    const session = await sessionsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!session) throw new NotFoundError("Session");
    if (session.hostId.toString() !== req.user!.id) throw new ForbiddenError();
    if (session.status === "completed") throw new ValidationError("Cannot edit completed session");
    if (session.status === "cancelled") throw new ValidationError("Cannot edit cancelled session");

    const { experienceId, hostId, reservedSeats, confirmedSeats, ...updateFields } = req.body;
    if (updateFields.capacity && parseInt(updateFields.capacity) < session.confirmedSeats)
      throw new ValidationError("Capacity cannot be lower than confirmed bookings");

    await sessionsCollection().updateOne(
      { _id: session._id },
      { $set: { ...updateFields, updatedAt: new Date() } }
    );
    sendSuccess(res, null, "Session updated");
  } catch (err) { next(err); }
});

app.delete("/api/sessions/:id", requireAuth, async (req, res, next) => {
  try {
    const session = await sessionsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!session) throw new NotFoundError("Session");
    if (session.hostId.toString() !== req.user!.id) throw new ForbiddenError();

    const bookings = await bookingsCollection().findOne({ sessionId: session._id, bookingStatus: { $ne: "cancelled" } });
    if (bookings) throw new ValidationError("Cannot delete session with existing bookings");

    await sessionsCollection().deleteOne({ _id: session._id });
    sendSuccess(res, null, "Session deleted");
  } catch (err) { next(err); }
});

app.patch("/api/sessions/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const session = await sessionsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!session) throw new NotFoundError("Session");
    if (session.hostId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();

    const { reason } = req.body;
    await sessionsCollection().updateOne(
      { _id: session._id },
      { $set: { status: "cancelled", cancelledAt: new Date(), cancellationReason: reason || null, updatedAt: new Date() } }
    );

    const affectedBookings = await bookingsCollection().find({
      sessionId: session._id,
      bookingStatus: { $in: ["confirmed", "pending_payment"] },
    }).toArray();

    for (const b of affectedBookings) {
      await bookingsCollection().updateOne(
        { _id: b._id },
        { $set: { bookingStatus: "cancelled", paymentStatus: "refunded", "cancellation.cancelledBy": "host", "cancellation.reason": reason || "Session cancelled by host", "cancellation.cancelledAt": new Date() } }
      );
      if (b.stripe?.paymentIntentId) {
        try {
          await getStripe().refunds.create({ payment_intent: b.stripe.paymentIntentId });
        } catch (e) { console.error("[Refund Error]", e); }
      }
    }

    sendSuccess(res, { cancelledBookings: affectedBookings.length }, "Session cancelled, bookings refunded");
  } catch (err) { next(err); }
});

// ─── Host Profile ────────────────────────────────────────────────────────────
app.post("/api/hosts/profile", requireAuth, async (req, res, next) => {
  try {
    const existing = await hostProfilesCollection().findOne({ userId: req.user!.id });
    if (existing) throw new ValidationError("Host profile already exists");

    const body = req.body;
    const profile = {
      userId: req.user!.id,
      displayName: body.displayName || req.user!.name,
      bio: body.bio || null,
      skills: body.skills || [],
      languages: body.languages || [],
      city: body.city || null,
      phone: body.phone || null,
      profileImageUrl: body.profileImageUrl || null,
      verificationStatus: "unverified" as const,
      stripeAccountId: null,
      stripeOnboardingComplete: false,
      stripeChargesEnabled: false,
      stripePayoutsEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await hostProfilesCollection().insertOne(profile);
    sendSuccess(res, { ...profile, _id: result.insertedId }, "Host profile created", undefined, 201);
  } catch (err) { next(err); }
});

app.get("/api/hosts/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await hostProfilesCollection().findOne({ userId: req.user!.id });
    if (!profile) throw new NotFoundError("Host profile");
    sendSuccess(res, profile);
  } catch (err) { next(err); }
});

app.patch("/api/hosts/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await hostProfilesCollection().findOneAndUpdate(
      { userId: req.user!.id },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!profile) throw new NotFoundError("Host profile");
    sendSuccess(res, profile);
  } catch (err) { next(err); }
});

app.get("/api/hosts/:id", async (req, res, next) => {
  try {
    const profile = await hostProfilesCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!profile) {
      const user = ObjectId.isValid(req.params.id)
        ? await getDB().collection("user").findOne({ _id: new ObjectId(req.params.id) })
        : null;
      if (!user) throw new NotFoundError("Host");
      sendSuccess(res, { userId: user._id.toString(), displayName: user.name, profileImageUrl: user.image || null, bio: null, skills: [], languages: [], city: null });
      return;
    }
    sendSuccess(res, profile);
  } catch (err) { next(err); }
});

// ─── Stripe Connect ──────────────────────────────────────────────────────────
app.post("/api/stripe/connect/account", requireAuth, async (req, res, next) => {
  try {
    let profile = await hostProfilesCollection().findOne({ userId: req.user!.id });
    if (!profile) throw new NotFoundError("Host profile");
    if (!profile.stripeAccountId) {
      const account = await getStripe().accounts.create({ type: "express", country: "BD", capabilities: { transfers: { requested: true }, card_payments: { requested: true } } });
      await hostProfilesCollection().updateOne({ userId: req.user!.id }, { $set: { stripeAccountId: account.id, updatedAt: new Date() } });
      profile.stripeAccountId = account.id;
    }
    sendSuccess(res, { accountId: profile.stripeAccountId });
  } catch (err) { next(err); }
});

app.post("/api/stripe/connect/onboarding-link", requireAuth, async (req, res, next) => {
  try {
    const profile = await hostProfilesCollection().findOne({ userId: req.user!.id });
    if (!profile?.stripeAccountId) throw new ValidationError("Stripe account not created yet");
    const link = await getStripe().accountLinks.create({
      account: profile.stripeAccountId,
      refresh_url: `${req.headers.origin}/dashboard/host/payouts`,
      return_url: `${req.headers.origin}/dashboard/host/payouts?onboarding=complete`,
      type: "account_onboarding",
    });
    sendSuccess(res, { url: link.url });
  } catch (err) { next(err); }
});

app.get("/api/stripe/connect/status", requireAuth, async (req, res, next) => {
  try {
    const profile = await hostProfilesCollection().findOne({ userId: req.user!.id });
    if (!profile?.stripeAccountId) {
      sendSuccess(res, { connected: false, onboardingComplete: false, chargesEnabled: false, payoutsEnabled: false });
      return;
    }
    sendSuccess(res, {
      connected: true,
      accountId: profile.stripeAccountId,
      onboardingComplete: profile.stripeOnboardingComplete,
      chargesEnabled: profile.stripeChargesEnabled,
      payoutsEnabled: profile.stripePayoutsEnabled,
    });
  } catch (err) { next(err); }
});

// ─── Bookings ────────────────────────────────────────────────────────────────
app.post("/api/bookings", requireAuth, async (req, res, next) => {
  try {
    const { sessionId, participantCount } = req.body;
    if (!sessionId || !participantCount) throw new ValidationError("sessionId and participantCount required");

    const session = await sessionsCollection().findOne({ _id: new ObjectId(sessionId) });
    if (!session) throw new NotFoundError("Session");
    if (session.status !== "scheduled") throw new ValidationError("Session is not available");
    if (session.startAt <= new Date()) throw new ValidationError("Session has already started");

    const available = session.capacity - session.confirmedSeats - session.reservedSeats;
    if (participantCount > available) throw new ValidationError("Not enough available seats");

    const exp = await experiencesCollection().findOne({ _id: session.experienceId });
    if (!exp || exp.status !== "published") throw new ValidationError("Experience is not available");

    const profile = await hostProfilesCollection().findOne({ userId: session.hostId.toString() });
    if (!profile?.stripeOnboardingComplete) throw new ValidationError("Host payment setup incomplete");

    const ref = "SB-" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();
    const subtotal = exp.pricePerParticipant * participantCount;
    const platformFee = Math.round(subtotal * 0.1);
    const total = subtotal + platformFee;

    const booking = {
      bookingReference: ref,
      userId: new ObjectId(req.user!.id),
      hostId: session.hostId,
      experienceId: session.experienceId,
      sessionId: session._id,
      participantCount,
      currency: exp.currency,
      subtotalAmount: subtotal,
      platformFeeAmount: platformFee,
      taxAmount: 0,
      totalAmount: total,
      hostEarningAmount: subtotal - platformFee,
      bookingStatus: "pending_payment" as const,
      paymentStatus: "unpaid" as const,
      seatHoldExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      stripe: { checkoutSessionId: null, paymentIntentId: null, chargeId: null, refundIds: [], connectedAccountId: profile.stripeAccountId },
      cancellation: { cancelledBy: null, reason: null, cancelledAt: null },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection().insertOne(booking);

    await sessionsCollection().updateOne(
      { _id: session._id, $expr: { $lte: [{ $add: ["$confirmedSeats", "$reservedSeats", participantCount] }, "$capacity"] } },
      { $inc: { reservedSeats: participantCount } }
    );

    // Only use Connect for real Stripe accounts (not demo mock IDs)
    const isRealStripeAccount = profile.stripeAccountId && profile.stripeAccountId.startsWith("acct_") && !profile.stripeAccountId.startsWith("acct_demo_");

    const checkoutSession = await getStripe().checkout.sessions.create({
      line_items: [{ price_data: { currency: exp.currency.toLowerCase(), product_data: { name: exp.title }, unit_amount: exp.pricePerParticipant * 100 }, quantity: participantCount }],
      mode: "payment",
      success_url: `${req.headers.origin}/checkout/success?booking=${ref}`,
      cancel_url: `${req.headers.origin}/checkout/cancelled?booking=${ref}`,
      metadata: { bookingId: result.insertedId.toString(), bookingReference: ref },
      ...(isRealStripeAccount ? {
        application_fee_amount: platformFee * 100,
        transfer_data: { destination: profile.stripeAccountId },
      } : {}),
    });

    await bookingsCollection().updateOne(
      { _id: result.insertedId },
      { $set: { "stripe.checkoutSessionId": checkoutSession.id } }
    );

    sendSuccess(res, { bookingReference: ref, checkoutUrl: checkoutSession.url, checkoutSessionId: checkoutSession.id }, "Booking created");
  } catch (err) { next(err); }
});

app.get("/api/bookings/me", requireAuth, async (req, res, next) => {
  try {
    const bookings = await bookingsCollection().find({ userId: new ObjectId(req.user!.id) })
      .sort({ createdAt: -1 }).toArray();
    sendSuccess(res, bookings);
  } catch (err) { next(err); }
});

app.get("/api/bookings/:id", requireAuth, async (req, res, next) => {
  try {
    const booking = await bookingsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.userId.toString() !== req.user!.id && booking.hostId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();
    sendSuccess(res, booking);
  } catch (err) { next(err); }
});

app.patch("/api/bookings/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const booking = await bookingsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.userId.toString() !== req.user!.id) throw new ForbiddenError();
    if (booking.bookingStatus !== "confirmed" && booking.bookingStatus !== "pending_payment")
      throw new ValidationError("Booking cannot be cancelled");

    const session = await sessionsCollection().findOne({ _id: booking.sessionId });
    if (!session) throw new NotFoundError("Session");

    const hoursUntilSession = session.startAt ? (session.startAt.getTime() - Date.now()) / (1000 * 60 * 60) : 0;
    let refundAmount = 0;
    if (hoursUntilSession >= 48) refundAmount = booking.totalAmount;
    else if (hoursUntilSession >= 24) refundAmount = Math.round(booking.totalAmount * 0.5);

    await bookingsCollection().updateOne(
      { _id: booking._id },
      { $set: { bookingStatus: "cancelled", paymentStatus: refundAmount > 0 ? "refunded" : "partially_refunded", "cancellation.cancelledBy": "user", "cancellation.reason": req.body.reason || null, "cancellation.cancelledAt": new Date(), updatedAt: new Date() } }
    );

    await sessionsCollection().updateOne(
      { _id: booking.sessionId },
      { $inc: { confirmedSeats: -booking.participantCount, reservedSeats: -booking.participantCount } }
    );

    if (refundAmount > 0 && booking.stripe?.paymentIntentId) {
      try {
        await getStripe().refunds.create({ payment_intent: booking.stripe.paymentIntentId, amount: refundAmount * 100 });
      } catch (e) { console.error("[Refund Error]", e); }
    }

    sendSuccess(res, { refunded: refundAmount }, `Booking cancelled${refundAmount > 0 ? `, refund: ${refundAmount}` : ""}`);
  } catch (err) { next(err); }
});

app.patch("/api/bookings/:id/complete", requireAuth, async (req, res, next) => {
  try {
    const booking = await bookingsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.hostId.toString() !== req.user!.id) throw new ForbiddenError();
    if (booking.bookingStatus !== "confirmed") throw new ValidationError("Booking must be confirmed to complete");

    await bookingsCollection().updateOne(
      { _id: booking._id },
      { $set: { bookingStatus: "completed", updatedAt: new Date() } }
    );

    const session = await sessionsCollection().findOne({ _id: booking.sessionId });
    if (session) {
      const allCompleted = (await bookingsCollection().countDocuments({
        sessionId: booking.sessionId,
        bookingStatus: { $ne: "completed" },
      })) === 0;
      if (allCompleted) {
        await sessionsCollection().updateOne(
          { _id: booking.sessionId },
          { $set: { status: "completed", updatedAt: new Date() } }
        );
      }
    }

    sendSuccess(res, null, "Booking completed");
  } catch (err) { next(err); }
});

app.get("/api/host/bookings", requireAuth, async (req, res, next) => {
  try {
    const bookings = await bookingsCollection().find({ hostId: new ObjectId(req.user!.id) })
      .sort({ createdAt: -1 }).toArray();
    sendSuccess(res, bookings);
  } catch (err) { next(err); }
});

app.get("/api/host/sessions/:sessionId/bookings", requireAuth, async (req, res, next) => {
  try {
    const session = await sessionsCollection().findOne({ _id: new ObjectId(paramSessionId(req)) });
    if (!session) throw new NotFoundError("Session");
    if (session.hostId.toString() !== req.user!.id) throw new ForbiddenError();

    const bookings = await bookingsCollection().find({ sessionId: session._id }).toArray();
    sendSuccess(res, bookings);
  } catch (err) { next(err); }
});

// ─── Payments ────────────────────────────────────────────────────────────────
app.post("/api/payments/create-checkout-session", requireAuth, async (req, res, next) => {
  try {
    const { bookingReference } = req.body;
    const booking = await bookingsCollection().findOne({ bookingReference });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.userId.toString() !== req.user!.id) throw new ForbiddenError();

    const exp = await experiencesCollection().findOne({ _id: booking.experienceId });
    if (!exp) throw new NotFoundError("Experience");

    const hostProfile = await hostProfilesCollection().findOne({ userId: booking.hostId.toString() });
    const platformFee = Math.round(booking.subtotalAmount * 0.1);

    // Only use Connect for real Stripe accounts (not demo mock IDs)
    const isRealStripeAccount = hostProfile?.stripeAccountId && hostProfile.stripeAccountId.startsWith("acct_") && !hostProfile.stripeAccountId.startsWith("acct_demo_");

    const session = await getStripe().checkout.sessions.create({
      line_items: [{ price_data: { currency: booking.currency.toLowerCase(), product_data: { name: exp.title }, unit_amount: exp.pricePerParticipant * 100 }, quantity: booking.participantCount }],
      mode: "payment",
      success_url: `${req.headers.origin}/checkout/success?booking=${bookingReference}`,
      cancel_url: `${req.headers.origin}/checkout/cancelled?booking=${bookingReference}`,
      metadata: { bookingId: booking._id!.toString(), bookingReference },
      ...(isRealStripeAccount ? {
        application_fee_amount: platformFee * 100,
        transfer_data: { destination: hostProfile.stripeAccountId },
      } : {}),
    });

    await bookingsCollection().updateOne(
      { _id: booking._id },
      { $set: { "stripe.checkoutSessionId": session.id } }
    );

    sendSuccess(res, { url: session.url, sessionId: session.id });
  } catch (err) { next(err); }
});

app.post("/api/payments/refunds", requireAuth, async (req, res, next) => {
  try {
    const { bookingReference, amount } = req.body;
    const booking = await bookingsCollection().findOne({ bookingReference });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.hostId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();

    if (!booking.stripe?.paymentIntentId) throw new ValidationError("No payment to refund");

    const refund = await getStripe().refunds.create({
      payment_intent: booking.stripe.paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    await bookingsCollection().updateOne(
      { _id: booking._id },
      { $set: { paymentStatus: amount ? "partially_refunded" : "refunded", updatedAt: new Date() }, $push: { "stripe.refundIds": refund.id } }
    );

    sendSuccess(res, { refundId: refund.id, amount: refund.amount / 100 }, "Refund processed");
  } catch (err) { next(err); }
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
app.get("/api/experiences/:id/reviews", async (req, res, next) => {
  try {
    const reviews = await reviewsCollection().find({
      experienceId: new ObjectId(paramId(req)),
      status: "published",
    }).sort({ createdAt: -1 }).toArray();
    sendSuccess(res, reviews);
  } catch (err) { next(err); }
});

app.post("/api/reviews", requireAuth, async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) throw new ValidationError("bookingId and rating required");

    const booking = await bookingsCollection().findOne({ _id: new ObjectId(bookingId) });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.userId.toString() !== req.user!.id) throw new ForbiddenError();
    if (booking.bookingStatus !== "completed") throw new ValidationError("Can only review completed bookings");
    if (booking.hostId.toString() === req.user!.id) throw new ValidationError("Cannot review your own experience");

    const existing = await reviewsCollection().findOne({ bookingId: booking._id });
    if (existing) throw new ValidationError("Already reviewed this booking");

    const review = {
      bookingId: booking._id,
      experienceId: booking.experienceId,
      hostId: booking.hostId,
      reviewerId: new ObjectId(req.user!.id),
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      comment: comment || "",
      status: "published" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection().insertOne(review);

    const stats = await reviewsCollection().aggregate([
      { $match: { experienceId: booking.experienceId, status: "published" } },
      { $group: { _id: "$experienceId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();

    if (stats.length > 0) {
      await experiencesCollection().updateOne(
        { _id: booking.experienceId },
        { $set: { "ratingSummary.average": Math.round(stats[0].avg * 10) / 10, "ratingSummary.count": stats[0].count } }
      );
    }

    sendSuccess(res, { ...review, _id: result.insertedId }, "Review created", undefined, 201);
  } catch (err) { next(err); }
});

app.patch("/api/reviews/:id", requireAuth, async (req, res, next) => {
  try {
    const review = await reviewsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!review) throw new NotFoundError("Review");
    if (review.reviewerId.toString() !== req.user!.id) throw new ForbiddenError();

    const { rating, comment } = req.body;
    await reviewsCollection().updateOne(
      { _id: review._id },
      { $set: { rating: rating || review.rating, comment: comment !== undefined ? comment : review.comment, updatedAt: new Date() } }
    );
    sendSuccess(res, null, "Review updated");
  } catch (err) { next(err); }
});

app.delete("/api/reviews/:id", requireAuth, async (req, res, next) => {
  try {
    const review = await reviewsCollection().findOne({ _id: new ObjectId(paramId(req)) });
    if (!review) throw new NotFoundError("Review");
    if (review.reviewerId.toString() !== req.user!.id && req.user!.role !== "admin")
      throw new ForbiddenError();
    await reviewsCollection().deleteOne({ _id: review._id });
    sendSuccess(res, null, "Review deleted");
  } catch (err) { next(err); }
});

// ─── Admin ───────────────────────────────────────────────────────────────────
app.get("/api/admin/experiences", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (status) filter.status = status;
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const [items, total] = await Promise.all([
      experiencesCollection().find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).toArray(),
      experiencesCollection().countDocuments(filter),
    ]);
    sendSuccess(res, items, undefined, { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

app.patch("/api/admin/experiences/:id/moderate", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["published", "rejected"].includes(status)) throw new ValidationError("Status must be published or rejected");
    const exp = await experiencesCollection().findOneAndUpdate(
      { _id: new ObjectId(paramId(req)) },
      { $set: { status, moderation: { reviewedBy: new ObjectId(req.user!.id), reviewedAt: new Date(), rejectionReason: rejectionReason || null }, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!exp) throw new NotFoundError("Experience");
    sendSuccess(res, null, `Experience ${status}`);
  } catch (err) { next(err); }
});

app.get("/api/admin/hosts", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { verificationStatus, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const [items, total] = await Promise.all([
      hostProfilesCollection().find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).toArray(),
      hostProfilesCollection().countDocuments(filter),
    ]);
    sendSuccess(res, items, undefined, { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

app.patch("/api/admin/hosts/:id/verify", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    if (!["verified", "rejected", "pending"].includes(verificationStatus))
      throw new ValidationError("Invalid verification status");
    const profile = await hostProfilesCollection().findOneAndUpdate(
      { _id: new ObjectId(paramId(req)) },
      { $set: { verificationStatus, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!profile) throw new NotFoundError("Host profile");
    sendSuccess(res, null, `Host ${verificationStatus}`);
  } catch (err) { next(err); }
});

app.get("/api/admin/reports", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (status) filter.status = status;
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const [items, total] = await Promise.all([
      reportsCollection().find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).toArray(),
      reportsCollection().countDocuments(filter),
    ]);
    sendSuccess(res, items, undefined, { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

app.patch("/api/admin/reports/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["open", "reviewing", "resolved", "dismissed"].includes(status))
      throw new ValidationError("Invalid status");
    const report = await reportsCollection().findOneAndUpdate(
      { _id: new ObjectId(paramId(req)) },
      { $set: { status, reviewedBy: new ObjectId(req.user!.id), updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!report) throw new NotFoundError("Report");
    sendSuccess(res, null, `Report ${status}`);
  } catch (err) { next(err); }
});

app.patch("/api/admin/users/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status: userStatus } = req.body;
    if (!["active", "suspended"].includes(userStatus)) throw new ValidationError("Invalid status");
    await getDB().collection("user").updateOne(
      { _id: new ObjectId(req.params.id as string) },
      { $set: { updatedAt: new Date(), ...(userStatus === "suspended" ? { banned: true, banReason: req.body.reason || null } : { banned: false, banReason: null }) } }
    );
    sendSuccess(res, null, `User ${userStatus}`);
  } catch (err) { next(err); }
});

app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (status === "suspended") filter.banned = true;
    else if (status === "active") filter.banned = { $ne: true };
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const [items, total] = await Promise.all([
      getDB().collection("user").find(filter).project({ name: 1, email: 1, role: 1, banned: 1, createdAt: 1 }).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).toArray(),
      getDB().collection("user").countDocuments(filter),
    ]);
    sendSuccess(res, items, undefined, { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

app.get("/api/admin/bookings", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (status) filter.bookingStatus = status;
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const [items, total] = await Promise.all([
      bookingsCollection().find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).toArray(),
      bookingsCollection().countDocuments(filter),
    ]);
    sendSuccess(res, items, undefined, { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

// ─── Reports (User) ──────────────────────────────────────────────────────────
app.post("/api/reports", requireAuth, async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!targetType || !targetId || !reason) throw new ValidationError("targetType, targetId, and reason required");
    const report = {
      reporterId: new ObjectId(req.user!.id),
      targetType,
      targetId: new ObjectId(targetId),
      reason,
      details: details || "",
      status: "open" as const,
      reviewedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await reportsCollection().insertOne(report);
    sendSuccess(res, { ...report, _id: result.insertedId }, "Report submitted", undefined, 201);
  } catch (err) { next(err); }
});

// ─── Contact ─────────────────────────────────────────────────────────────────
app.post("/api/contact", strictRateLimiter(5, 60 * 1000), async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) throw new ValidationError("All fields required");
    const msg = { name, email, subject, message, createdAt: new Date() };
    const result = await contactMessagesCollection().insertOne(msg);
    sendSuccess(res, { ...msg, _id: result.insertedId }, "Message sent", undefined, 201);
  } catch (err) { next(err); }
});

// ─── Categories ──────────────────────────────────────────────────────────────
app.get("/api/categories", async (req, res, next) => {
  try {
    const categories = await categoriesCollection().find({ isActive: true }).sort({ name: 1 }).toArray();
    sendSuccess(res, categories);
  } catch (err) { next(err); }
});

app.post("/api/categories", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl } = req.body;
    if (!name || !slug) throw new ValidationError("Name and slug required");
    const cat = {
      name, slug, description: description || "", imageUrl: imageUrl || null,
      isActive: true, createdAt: new Date(), updatedAt: new Date(),
    };
    const result = await categoriesCollection().insertOne(cat);
    sendSuccess(res, { ...cat, _id: result.insertedId }, "Category created", undefined, 201);
  } catch (err) { next(err); }
});

// ─── Host Dashboard Stats ────────────────────────────────────────────────────
app.get("/api/host/dashboard", requireAuth, async (req, res, next) => {
  try {
    const hostId = new ObjectId(req.user!.id);
    const [totalExperiences, upcomingSessions, pendingBookings, completedBookings, totalBookings] = await Promise.all([
      experiencesCollection().countDocuments({ hostId }),
      sessionsCollection().countDocuments({ hostId, startAt: { $gt: new Date() }, status: { $ne: "cancelled" } }),
      bookingsCollection().countDocuments({ hostId, bookingStatus: "confirmed" }),
      bookingsCollection().countDocuments({ hostId, bookingStatus: "completed" }),
      bookingsCollection().find({ hostId, bookingStatus: { $in: ["confirmed", "completed"] } }).toArray(),
    ]);

    const grossAmount = totalBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformFees = totalBookings.reduce((sum, b) => sum + b.platformFeeAmount, 0);
    const earnings = totalBookings.reduce((sum, b) => sum + b.hostEarningAmount, 0);

    sendSuccess(res, {
      totalPublishedExperiences: totalExperiences,
      upcomingSessions,
      pendingBookings,
      completedBookings,
      grossBookingAmount: grossAmount,
      platformFees,
      estimatedEarnings: earnings,
    });
  } catch (err) { next(err); }
});

// ─── Host Payouts ────────────────────────────────────────────────────────────
app.get("/api/host/payouts", requireAuth, async (req, res, next) => {
  try {
    const profile = await hostProfilesCollection().findOne({ userId: req.user!.id });
    if (!profile?.stripeAccountId) {
      sendSuccess(res, { payouts: [], connected: false });
      return;
    }

    const payouts = await getStripe().payouts.list({
      limit: 20,
    }, {
      stripeAccount: profile.stripeAccountId,
    });

    sendSuccess(res, {
      connected: true,
      accountId: profile.stripeAccountId,
      payouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount / 100,
        currency: p.currency.toUpperCase(),
        status: p.status,
        arrivalDate: new Date(p.arrival_date * 1000),
        created: new Date(p.created * 1000),
      })),
    });
  } catch (err) { next(err); }
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Seat Hold Expiration Cleanup ─────────────────────────────────────────────
async function cleanupExpiredSeatHolds() {
  try {
    const now = new Date();
    const expiredBookings = await bookingsCollection().find({
      bookingStatus: "pending_payment",
      seatHoldExpiresAt: { $lt: now },
    }).toArray();

    for (const booking of expiredBookings) {
      await bookingsCollection().updateOne(
        { _id: booking._id },
        { $set: { bookingStatus: "cancelled", paymentStatus: "failed", updatedAt: now } }
      );
      await sessionsCollection().updateOne(
        { _id: booking.sessionId },
        { $inc: { reservedSeats: -booking.participantCount } }
      );
    }

    if (expiredBookings.length > 0) {
      console.log(`[Cleanup] Released ${expiredBookings.length} expired seat holds`);
    }
  } catch (err) {
    console.error("[Cleanup] Error cleaning up expired seat holds:", err);
  }
}

async function start() {
  try {
    await connectDB();

    // Seed default categories if empty
    const catCount = await categoriesCollection().countDocuments();
    if (catCount === 0) {
      const defaults = [
        { name: "Cooking", slug: "cooking", description: "Learn to cook delicious meals", imageUrl: null },
        { name: "Arts & Crafts", slug: "arts-crafts", description: "Explore your creative side", imageUrl: null },
        { name: "Music", slug: "music", description: "Learn instruments and vocals", imageUrl: null },
        { name: "Outdoors", slug: "outdoors", description: "Adventure and outdoor activities", imageUrl: null },
        { name: "Technology", slug: "technology", description: "Tech workshops and coding", imageUrl: null },
        { name: "Photography", slug: "photography", description: "Capture moments like a pro", imageUrl: null },
        { name: "Fitness", slug: "fitness", description: "Stay fit and healthy", imageUrl: null },
        { name: "Local Tours", slug: "local-tours", description: "Explore your city", imageUrl: null },
      ];
      await categoriesCollection().insertMany(defaults.map((c) => ({ ...c, isActive: true, createdAt: new Date(), updatedAt: new Date() })));
      console.log("[Seed] Default categories created");
    }

    // Clean up expired seat holds on startup
    await cleanupExpiredSeatHolds();

    // Run cleanup every 5 minutes
    setInterval(cleanupExpiredSeatHolds, 5 * 60 * 1000);

    // Create text search index for experiences
    try {
      await experiencesCollection().createIndex(
        { title: "text", shortDescription: "text", fullDescription: "text", tags: "text" },
        { name: "experience_text_search" }
      );
    } catch (err) {
      // Index may already exist, ignore duplicate key error
      if ((err as any).code !== 11000) {
        console.error("[Index] Error creating text search index:", err);
      }
    }

    app.listen(env.PORT, () => {
      console.log(`[Server] SkillBazaar API running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  }
}

start();
