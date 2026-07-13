import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ObjectId } from "mongodb";
import { env } from "./config/env";
import { connectDB, getDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth, optionalAuth } from "./middleware/auth";
import { sendSuccess } from "./utils/apiResponse";
import { NotFoundError, ValidationError, ForbiddenError } from "./utils/errors";
import { strictRateLimiter } from "./middleware/rateLimiter";
import { csrfProtection } from "./middleware/csrf";
import {
  opportunitiesCollection,
  applicationsCollection,
  categoriesCollection,
  contactMessagesCollection,
} from "./database/collections";

const app = express();
const CLIENT_URL = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(csrfProtection);
app.use(express.json());

function paramId(req: express.Request): string {
  return req.params.id as string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── Landing Page Data ────────────────────────────────────────────────────────
app.get("/api/landing/stats", async (_req, res, next) => {
  try {
    const [totalOpportunities, totalApplications, totalOrganizations] = await Promise.all([
      opportunitiesCollection().countDocuments({ status: "published" }),
      applicationsCollection().countDocuments(),
      opportunitiesCollection().distinct("organizerId").then((ids) => ids.length),
    ]);
    sendSuccess(res, { totalOpportunities, totalApplications, totalOrganizations, totalVolunteers: totalApplications });
  } catch (err) { next(err); }
});

app.get("/api/landing/featured", async (_req, res, next) => {
  try {
    const featured = await opportunitiesCollection()
      .find({ status: "published" })
      .sort({ spotsTaken: -1 })
      .limit(4)
      .toArray();
    sendSuccess(res, featured);
  } catch (err) { next(err); }
});

app.get("/api/landing/urgent", async (_req, res, next) => {
  try {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const urgent = await opportunitiesCollection()
      .find({
        status: "published",
        deadline: { $gte: now.toISOString().split("T")[0], $lte: weekFromNow.toISOString().split("T")[0] },
      })
      .sort({ deadline: 1 })
      .limit(4)
      .toArray();
    sendSuccess(res, urgent);
  } catch (err) { next(err); }
});

app.get("/api/landing/organizations", async (_req, res, next) => {
  try {
    const orgs = await opportunitiesCollection().aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$organizerId", name: { $first: "$organizerName" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]).toArray();
    sendSuccess(res, orgs);
  } catch (err) { next(err); }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.get("/api/auth/me", requireAuth, (req, res) => {
  sendSuccess(res, req.user);
});

// ─── Categories ───────────────────────────────────────────────────────────────
app.get("/api/categories", async (_req, res, next) => {
  try {
    const categories = await categoriesCollection().find({ isActive: true }).sort({ name: 1 }).toArray();
    sendSuccess(res, categories);
  } catch (err) { next(err); }
});

// ─── Opportunities ────────────────────────────────────────────────────────────

// List opportunities with search, filter, sort, pagination
app.get("/api/opportunities", optionalAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const filter: any = { status: "published" };

    // Search
    const search = req.query.search as string;
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    const category = req.query.category as string;
    if (category) {
      filter.category = category;
    }

    // Commitment type filter
    const commitmentType = req.query.commitmentType as string;
    if (commitmentType) {
      filter.commitmentType = commitmentType;
    }

    // Location filter
    const city = req.query.city as string;
    if (city) {
      filter["location.city"] = city;
    }

    // Remote filter
    const isRemote = req.query.isRemote as string;
    if (isRemote === "true") {
      filter["location.isRemote"] = true;
    }

    // Sort
    let sort: any = { createdAt: -1 };
    const sortBy = req.query.sortBy as string;
    if (sortBy === "deadline") sort = { deadline: 1 };
    else if (sortBy === "spots") sort = { spotsAvailable: -1 };
    else if (sortBy === "oldest") sort = { createdAt: 1 };

    const [items, total] = await Promise.all([
      opportunitiesCollection().find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      opportunitiesCollection().countDocuments(filter),
    ]);

    sendSuccess(res, items, undefined, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
});

// Get opportunity detail
app.get("/api/opportunities/:id", async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid opportunity ID");
    const opp = await opportunitiesCollection().findOne({ _id: new ObjectId(id) });
    if (!opp) throw new NotFoundError("Opportunity");
    sendSuccess(res, opp);
  } catch (err) { next(err); }
});

// Get current user's opportunities
app.get("/api/opportunities/my", requireAuth, async (req, res, next) => {
  try {
    const opps = await opportunitiesCollection()
      .find({ organizerId: req.user!.id })
      .sort({ createdAt: -1 })
      .toArray();
    sendSuccess(res, opps);
  } catch (err) { next(err); }
});

// Create opportunity
app.post("/api/opportunities", requireAuth, async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.title) throw new ValidationError("Title is required");
    if (!b.category) throw new ValidationError("Category is required");

    const slug = slugify(b.title) + "-" + Date.now().toString(36);
    const opp = {
      organizerId: req.user!.id,
      organizerName: req.user!.name,
      title: b.title,
      slug,
      shortDescription: b.shortDescription || "",
      fullDescription: b.fullDescription || "",
      category: b.category,
      tags: b.tags || [],
      skills: b.skills || [],
      responsibilities: b.responsibilities || [],
      benefits: b.benefits || [],
      location: {
        country: b.location?.country || "",
        city: b.location?.city || "",
        area: b.location?.area || "",
        address: b.location?.address || "",
        isRemote: b.location?.isRemote || false,
      },
      images: b.images || [],
      commitmentType: b.commitmentType || "one-time",
      duration: b.duration || "",
      startDate: b.startDate || "",
      endDate: b.endDate || null,
      deadline: b.deadline || "",
      spotsAvailable: parseInt(b.spotsAvailable) || 1,
      spotsTaken: 0,
      status: b.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await opportunitiesCollection().insertOne(opp);
    sendSuccess(res, { ...opp, _id: result.insertedId }, "Opportunity created", undefined, 201);
  } catch (err) { next(err); }
});

// Update opportunity
app.patch("/api/opportunities/:id", requireAuth, async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid opportunity ID");

    const opp = await opportunitiesCollection().findOne({ _id: new ObjectId(id) });
    if (!opp) throw new NotFoundError("Opportunity");
    if (opp.organizerId !== req.user!.id && req.user!.role !== "admin") throw new ForbiddenError();

    const { organizerId, slug, createdAt, ...updateFields } = req.body;
    updateFields.updatedAt = new Date();

    await opportunitiesCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    sendSuccess(res, null, "Opportunity updated");
  } catch (err) { next(err); }
});

// Delete opportunity
app.delete("/api/opportunities/:id", requireAuth, async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid opportunity ID");

    const opp = await opportunitiesCollection().findOne({ _id: new ObjectId(id) });
    if (!opp) throw new NotFoundError("Opportunity");
    if (opp.organizerId !== req.user!.id && req.user!.role !== "admin") throw new ForbiddenError();

    await opportunitiesCollection().deleteOne({ _id: new ObjectId(id) });
    sendSuccess(res, null, "Opportunity deleted");
  } catch (err) { next(err); }
});

// ─── Applications ─────────────────────────────────────────────────────────────

// Submit application
app.post("/api/applications", requireAuth, async (req, res, next) => {
  try {
    const b = req.body;
    if (!b.opportunityId) throw new ValidationError("opportunityId is required");

    if (!ObjectId.isValid(b.opportunityId)) throw new ValidationError("Invalid opportunity ID");

    const opp = await opportunitiesCollection().findOne({ _id: new ObjectId(b.opportunityId) });
    if (!opp) throw new NotFoundError("Opportunity");
    if (opp.status !== "published") throw new ValidationError("Opportunity is not accepting applications");

    // Check deadline
    if (opp.deadline && new Date(opp.deadline) < new Date()) {
      throw new ValidationError("Application deadline has passed");
    }

    // Check own opportunity
    if (opp.organizerId === req.user!.id) {
      throw new ValidationError("Cannot apply to your own opportunity");
    }

    // Check duplicate
    const existing = await applicationsCollection().findOne({
      opportunityId: new ObjectId(b.opportunityId),
      volunteerId: req.user!.id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) throw new ValidationError("You have already applied to this opportunity");

    // Check spots
    if (opp.spotsTaken >= opp.spotsAvailable) {
      throw new ValidationError("No spots available");
    }

    const application = {
      opportunityId: new ObjectId(b.opportunityId),
      opportunityTitle: opp.title,
      volunteerId: req.user!.id,
      volunteerName: req.user!.name,
      volunteerEmail: req.user!.email,
      organizerId: opp.organizerId,
      message: b.message || "",
      skills: b.skills || [],
      availability: b.availability || "",
      status: "pending" as const,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await applicationsCollection().insertOne(application);

    // Increment spots taken
    await opportunitiesCollection().updateOne(
      { _id: new ObjectId(b.opportunityId) },
      { $inc: { spotsTaken: 1 } }
    );

    sendSuccess(res, { ...application, _id: result.insertedId }, "Application submitted", undefined, 201);
  } catch (err) { next(err); }
});

// My applications (volunteer)
app.get("/api/applications/my", requireAuth, async (req, res, next) => {
  try {
    const apps = await applicationsCollection()
      .find({ volunteerId: req.user!.id })
      .sort({ createdAt: -1 })
      .toArray();
    sendSuccess(res, apps);
  } catch (err) { next(err); }
});

// Received applications (organizer)
app.get("/api/applications/received", requireAuth, async (req, res, next) => {
  try {
    const filter: any = { organizerId: req.user!.id };

    const status = req.query.status as string;
    if (status && ["pending", "approved", "rejected", "completed"].includes(status)) {
      filter.status = status;
    }

    const apps = await applicationsCollection()
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    sendSuccess(res, apps);
  } catch (err) { next(err); }
});

// Approve application
app.patch("/api/applications/:id/approve", requireAuth, async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid application ID");

    const app2 = await applicationsCollection().findOne({ _id: new ObjectId(id) });
    if (!app2) throw new NotFoundError("Application");
    if (app2.organizerId !== req.user!.id) throw new ForbiddenError();
    if (app2.status !== "pending") throw new ValidationError("Only pending applications can be approved");

    await applicationsCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved", reviewedAt: new Date(), updatedAt: new Date() } }
    );

    sendSuccess(res, null, "Application approved");
  } catch (err) { next(err); }
});

// Reject application
app.patch("/api/applications/:id/reject", requireAuth, async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid application ID");

    const app2 = await applicationsCollection().findOne({ _id: new ObjectId(id) });
    if (!app2) throw new NotFoundError("Application");
    if (app2.organizerId !== req.user!.id) throw new ForbiddenError();
    if (app2.status !== "pending") throw new ValidationError("Only pending applications can be rejected");

    await applicationsCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "rejected", reviewedAt: new Date(), updatedAt: new Date() } }
    );

    // Free up spot
    await opportunitiesCollection().updateOne(
      { _id: app2.opportunityId },
      { $inc: { spotsTaken: -1 } }
    );

    sendSuccess(res, null, "Application rejected");
  } catch (err) { next(err); }
});

// Withdraw application
app.patch("/api/applications/:id/withdraw", requireAuth, async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid application ID");

    const app2 = await applicationsCollection().findOne({ _id: new ObjectId(id) });
    if (!app2) throw new NotFoundError("Application");
    if (app2.volunteerId !== req.user!.id) throw new ForbiddenError();
    if (!["pending", "approved"].includes(app2.status)) {
      throw new ValidationError("Cannot withdraw from this application");
    }

    await applicationsCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "withdrawn", updatedAt: new Date() } }
    );

    // Free up spot
    await opportunitiesCollection().updateOne(
      { _id: app2.opportunityId },
      { $inc: { spotsTaken: -1 } }
    );

    sendSuccess(res, null, "Application withdrawn");
  } catch (err) { next(err); }
});

// Complete application
app.patch("/api/applications/:id/complete", requireAuth, async (req, res, next) => {
  try {
    const id = paramId(req);
    if (!ObjectId.isValid(id)) throw new ValidationError("Invalid application ID");

    const app2 = await applicationsCollection().findOne({ _id: new ObjectId(id) });
    if (!app2) throw new NotFoundError("Application");
    if (app2.organizerId !== req.user!.id) throw new ForbiddenError();
    if (app2.status !== "approved") throw new ValidationError("Only approved applications can be completed");

    await applicationsCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "completed", updatedAt: new Date() } }
    );

    sendSuccess(res, null, "Application marked as completed");
  } catch (err) { next(err); }
});

// ─── Contact ──────────────────────────────────────────────────────────────────
app.post("/api/contact", strictRateLimiter(5, 60 * 1000), async (req, res, next) => {
  try {
    const { name, email, subject, message, website } = req.body;
    if (website) { sendSuccess(res, null, "Message sent", undefined, 201); return; }
    if (!name || !email || !subject || !message) throw new ValidationError("All fields required");
    const msg = { name, email, subject, message, createdAt: new Date() };
    const result = await contactMessagesCollection().insertOne(msg);
    sendSuccess(res, { ...msg, _id: result.insertedId }, "Message sent", undefined, 201);
  } catch (err) { next(err); }
});

// ─── Dashboard Summary ────────────────────────────────────────────────────────
app.get("/api/dashboard/summary", requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const userId = req.user!.id;

    const [
      totalOpportunities,
      totalApplications,
      pendingApplications,
      approvedApplications,
      completedActivities,
    ] = await Promise.all([
      opportunitiesCollection().countDocuments({ organizerId: userId }),
      applicationsCollection().countDocuments({ organizerId: userId }),
      applicationsCollection().countDocuments({ organizerId: userId, status: "pending" }),
      applicationsCollection().countDocuments({ organizerId: userId, status: "approved" }),
      applicationsCollection().countDocuments({ organizerId: userId, status: "completed" }),
    ]);

    // Monthly application data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAgg = await applicationsCollection().aggregate([
      { $match: { organizerId: userId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    const monthlyData = monthlyAgg.map((m: any) => ({
      month: m._id,
      applications: m.count,
    }));

    // Status distribution
    const statusAgg = await applicationsCollection().aggregate([
      { $match: { organizerId: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray();

    const statusDistribution = statusAgg.map((s: any) => ({
      status: s._id,
      count: s.count,
    }));

    // Category distribution
    const categoryAgg = await opportunitiesCollection().aggregate([
      { $match: { organizerId: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]).toArray();

    const categoryDistribution = categoryAgg.map((c: any) => ({
      category: c._id,
      count: c.count,
    }));

    sendSuccess(res, {
      totalOpportunities,
      totalApplications,
      pendingApplications,
      approvedApplications,
      completedActivities,
      monthlyData,
      statusDistribution,
      categoryDistribution,
    });
  } catch (err) { next(err); }
});

// ─── Default Categories ───────────────────────────────────────────────────────
const defaultCategories = [
  { name: "Environment", slug: "environment", description: "Environmental conservation and sustainability", icon: "leaf", isActive: true },
  { name: "Education", slug: "education", description: "Teaching, mentoring, and educational support", icon: "book", isActive: true },
  { name: "Healthcare", slug: "healthcare", description: "Health awareness and medical support", icon: "heart", isActive: true },
  { name: "Community", slug: "community", description: "Community development and social services", icon: "users", isActive: true },
  { name: "Animals", slug: "animals", description: "Animal welfare and wildlife conservation", icon: "paw", isActive: true },
  { name: "Disaster Relief", slug: "disaster-relief", description: "Emergency response and disaster recovery", icon: "alert", isActive: true },
  { name: "Arts & Culture", slug: "arts-culture", description: "Arts, culture, and heritage preservation", icon: "palette", isActive: true },
  { name: "Technology", slug: "technology", description: "Tech for good and digital literacy", icon: "code", isActive: true },
];

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    const db = await connectDB();

    // Seed default categories
    const catCount = await categoriesCollection().countDocuments();
    if (catCount === 0) {
      await categoriesCollection().insertMany(defaultCategories);
      console.log("[Seed] Default categories created");
    }

    // Create search index
    try {
      await opportunitiesCollection().createIndex(
        { title: "text", shortDescription: "text", fullDescription: "text", tags: "text" }
      );
    } catch { /* index may already exist */ }

    app.listen(env.PORT, () => {
      console.log(`[Server] VolunteerConnect API running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  }
}

start();
