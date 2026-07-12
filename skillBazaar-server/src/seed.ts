import { MongoClient, ObjectId } from "mongodb";
import { randomBytes, scryptSync } from "node:crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in .env");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
const db = client.db("skillbazaar");

function uuid() {
  return crypto.randomUUID();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 });
  return `${salt}:${key.toString("hex")}`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function seed() {
  await client.connect();
  console.log("[Seed] Connected to MongoDB");

  // ── Clear existing app data (keep auth collections) ─────────────────
  const collections = ["host_profiles", "experiences", "sessions", "bookings", "reviews", "stripeEvents", "reports", "contactMessages"];
  for (const name of collections) {
    await db.collection(name).deleteMany({});
  }
  console.log("[Seed] Cleared app collections");

  // ── Users ───────────────────────────────────────────────────────────
  const usersData = [
    { email: "admin@skillbazaar.com", name: "Shoaib Admin", password: "admin123", role: "admin" },
    { email: "maria@example.com", name: "Maria Khan", password: "password123", role: "user" },
    { email: "david@example.com", name: "David Chen", password: "password123", role: "user" },
    { email: "sarah@example.com", name: "Sarah Patel", password: "password123", role: "user" },
    { email: "alex@example.com", name: "Alex Rivera", password: "password123", role: "user" },
  ] as const;

  // Clean old users with same emails
  // better-auth stores userId as ObjectId in account/session, so compare by ObjectId
  for (const u of usersData) {
    const existing = await db.collection("user").findOne({ email: u.email });
    if (existing) {
      await db.collection("account").deleteMany({ userId: existing._id });
      await db.collection("session").deleteMany({ userId: existing._id });
      await db.collection("user").deleteOne({ _id: existing._id });
    }
  }

  interface UserDoc { _id: ObjectId; name: string; email: string; emailVerified: boolean; image: string | null; role: string; createdAt: Date; updatedAt: Date };
  const userDocs: UserDoc[] = [];
  for (const u of usersData) {
    const _id = new ObjectId();
    const doc: UserDoc = {
      _id,
      name: u.name,
      email: u.email,
      emailVerified: true,
      image: null,
      role: u.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("user").insertOne(doc);
    userDocs.push(doc);

    // Account for password auth — userId must be ObjectId to match better-auth's adapter
    await db.collection("account").insertOne({
      _id: new ObjectId(),
      accountId: u.email,
      providerId: "credential",
      userId: _id,
      password: hashPassword(u.password),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a valid session
    await db.collection("session").insertOne({
      _id: new ObjectId(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      token: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: _id,
    });

    console.log(`[Seed] Created user: ${u.email} (${u.role})`);
  }

  // Named refs
  const adminUser = userDocs[0];
  const maria = userDocs[1];
  const david = userDocs[2];
  const sarah = userDocs[3];
  const alex = userDocs[4];

  // ── Host Profiles ──────────────────────────────────────────────────
  const hostProfiles = [
    { userId: maria._id.toString(), displayName: "Maria Khan", bio: "Professional chef with 12 years of experience in Italian cuisine. Love teaching others the art of cooking.", skills: ["Italian Cooking", "Pasta Making", "Baking", "Pastry"], languages: ["English", "Urdu"], city: "Dhaka", phone: "+8801700000001", profileImageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400", verificationStatus: "verified" },
    { userId: david._id.toString(), displayName: "David Chen", bio: "Artist and sculptor specializing in ceramic pottery. Teaching workshops for 8 years.", skills: ["Pottery", "Ceramics", "Sculpture", "Watercolor"], languages: ["English", "Mandarin"], city: "Dhaka", phone: "+8801700000002", profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", verificationStatus: "verified" },
    { userId: sarah._id.toString(), displayName: "Sarah Patel", bio: "Award-winning photographer. Love helping beginners discover the joy of photography.", skills: ["Photography", "Photo Editing", "Composition", "Street Photography"], languages: ["English", "Hindi"], city: "Dhaka", phone: "+8801700000003", profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", verificationStatus: "verified" },
  ];

  // Clean old host profiles for these users
  for (const hp of hostProfiles) {
    await db.collection("host_profiles").deleteMany({ userId: hp.userId });
  }

  const hostDocIds: ObjectId[] = [];
  for (const hp of hostProfiles) {
    const res = await db.collection("host_profiles").insertOne({
      ...hp,
      stripeAccountId: null,
      stripeOnboardingComplete: false,
      stripeChargesEnabled: false,
      stripePayoutsEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    hostDocIds.push(res.insertedId);
  }
  console.log("[Seed] Created 3 host profiles");

  // ── Experiences ────────────────────────────────────────────────────
  const hostUserIds = [maria._id.toString(), david._id.toString(), sarah._id.toString()];
  const hostObjectIds = [maria._id, david._id, sarah._id];

  const experienceData = [
    {
      hostIdx: 0,
      title: "Authentic Italian Pasta Making",
      shortDescription: "Learn to make fresh pasta from scratch with a professional chef",
      fullDescription: "Join Maria in her home kitchen for an intimate 3-hour hands-on pasta-making workshop. You will learn to prepare fresh egg pasta dough from scratch, shape multiple pasta varieties (fettuccine, ravioli, farfalle), and create two classic Italian sauces. End the session by enjoying the meal you prepared with a glass of wine. All ingredients and equipment provided. Suitable for beginners and intermediate cooks alike.",
      category: "cooking",
      tags: ["pasta", "italian", "cooking", "hands-on", "dinner"],
      language: "English",
      durationMinutes: 180,
      pricePerParticipant: 2500,
      defaultCapacity: 8,
      minimumAge: 14,
      includedItems: ["All ingredients", "Apron", "Recipe cards", "Glass of wine", "Meal you prepare"],
      participantRequirements: ["No cooking experience needed", "Comfortable standing for 3 hours", "Notify of any food allergies"],
      safetyNotes: ["Sharp knives used", "Hot surfaces", "Allergen information available"],
      city: "Dhaka",
      area: "Gulshan",
      address: "House 42, Road 8, Gulshan 1",
      latitude: 23.7965,
      longitude: 90.4084,
      coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      images: [
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
        "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600",
      ],
    },
    {
      hostIdx: 0,
      title: "Morning Yoga in the Park",
      shortDescription: "Start your day with rejuvenating yoga surrounded by nature",
      fullDescription: "Experience the serenity of outdoor yoga in Dhaka's beautiful Gulshan Lake Park. This 90-minute session blends Hatha and Vinyasa flows suitable for all levels. Maria is also a certified yoga instructor who will guide you through breathing exercises, sun salutations, and relaxation techniques. Bring your own mat. Beginners warmly welcomed.",
      category: "fitness",
      tags: ["yoga", "fitness", "outdoor", "morning", "wellness"],
      language: "English",
      durationMinutes: 90,
      pricePerParticipant: 800,
      defaultCapacity: 15,
      minimumAge: 12,
      includedItems: ["Guided yoga session", "Cool-down tea"],
      participantRequirements: ["Bring your own yoga mat", "Comfortable athletic wear", "Arrive 10 minutes early"],
      safetyNotes: ["Stay hydrated", "Inform instructor of injuries", "Sun protection recommended"],
      city: "Dhaka",
      area: "Gulshan",
      address: "Gulshan Lake Park, North Entrance",
      latitude: 23.7925,
      longitude: 90.4130,
      coverImage: "https://images.unsplash.com/photo-1544367567-223f2d99c5f1?w=800",
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600",
      ],
    },
    {
      hostIdx: 1,
      title: "Hand-Building Pottery Workshop",
      shortDescription: "Create beautiful ceramic pieces using traditional hand-building techniques",
      fullDescription: "Discover the meditative art of pottery in this 3-hour hands-on workshop at David's studio. You will learn three core hand-building techniques: pinch pots, coil building, and slab construction. Create your own mug, bowl, or small sculpture. David will guide you step by step, sharing techniques passed down through generations. All clay, tools, and firing included. Your finished pieces will be glazed and ready for pickup in 2 weeks.",
      category: "arts-crafts",
      tags: ["pottery", "ceramics", "clay", "hand-building", "sculpture"],
      language: "English",
      durationMinutes: 180,
      pricePerParticipant: 3000,
      defaultCapacity: 6,
      minimumAge: 16,
      includedItems: ["2kg clay", "All tools", "Glazing", "Firing", "Finished pieces"],
      participantRequirements: ["No experience needed", "Short nails recommended", "Wear clothes you don't mind getting dirty"],
      safetyNotes: ["Clay dust precautions", "Apron provided", "Studio ventilation"],
      city: "Dhaka",
      area: "Banani",
      address: "Studio 7, Road 11, Banani DOHS",
      latitude: 23.7954,
      longitude: 90.4070,
      coverImage: "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=800",
      images: [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600",
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600",
      ],
    },
    {
      hostIdx: 1,
      title: "Watercolor Landscapes for Beginners",
      shortDescription: "Paint stunning landscapes with watercolors no prior experience needed",
      fullDescription: "Unlock your creative potential in this relaxed 2.5-hour watercolor workshop. David will teach you essential techniques: wet-on-wet, wet-on-dry, color mixing, and creating depth. By the end of the session you will complete a small landscape painting to take home. All materials provided. This workshop is designed for absolute beginners and those looking to refresh their skills.",
      category: "arts-crafts",
      tags: ["watercolor", "painting", "art", "landscape", "beginner"],
      language: "English",
      durationMinutes: 150,
      pricePerParticipant: 2000,
      defaultCapacity: 10,
      minimumAge: 12,
      includedItems: ["Watercolor set", "Brushes", "Paper", "Reference images", "Your finished painting"],
      participantRequirements: ["No experience necessary", "All materials provided"],
      safetyNotes: ["Non-toxic paints used", "Aprons provided"],
      city: "Dhaka",
      area: "Banani",
      address: "Studio 7, Road 11, Banani DOHS",
      latitude: 23.7954,
      longitude: 90.4070,
      coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
      images: [
        "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?w=600",
      ],
    },
    {
      hostIdx: 2,
      title: "Urban Photography Walk",
      shortDescription: "Explore Dhaka's streets through your lens with a pro photographer",
      fullDescription: "Join Sarah for a 3-hour guided photography walk through Old Dhaka's most photogenic neighborhoods. Learn composition, lighting, street photography techniques, and how to capture the soul of a city. Sarah will provide tips for both smartphone and DSLR photographers. The walk covers Shahid Minar, Star Mosque, Sadarghat, and hidden alleys. End at a rooftop café with sunset views where Sarah reviews your best shots and offers feedback.",
      category: "photography",
      tags: ["photography", "street", "urban", "walk", "composition"],
      language: "English",
      durationMinutes: 180,
      pricePerParticipant: 2200,
      defaultCapacity: 8,
      minimumAge: 14,
      includedItems: ["Guided walk", "Photography tips", "Feedback session", "Bottled water"],
      participantRequirements: ["Any camera or smartphone", "Comfortable walking shoes", "Fully charged devices"],
      safetyNotes: ["Stay with the group", "Watch traffic in narrow streets", "Bring umbrella"],
      city: "Dhaka",
      area: "Old Dhaka",
      address: "Meeting point: Central Shahid Minar",
      latitude: 23.7271,
      longitude: 90.3969,
      coverImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
      images: [
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
      ],
    },
    {
      hostIdx: 2,
      title: "Portrait Photography Masterclass",
      shortDescription: "Master natural-light portrait photography in a small group setting",
      fullDescription: "A focused 2.5-hour masterclass on portrait photography using natural light. Sarah covers finding good light, posing subjects, directing expressions, composition rules, and minimal editing. The class includes a live photoshoot session where you photograph a model with Sarah's guidance. Suitable for intermediate photographers who know their camera basics and want to improve people photography.",
      category: "photography",
      tags: ["portrait", "photography", "lighting", "model", "composition"],
      language: "English",
      durationMinutes: 150,
      pricePerParticipant: 2800,
      defaultCapacity: 6,
      minimumAge: 16,
      includedItems: ["Model fee", "Studio space", "Tea and snacks"],
      participantRequirements: ["DSLR or mirrorless camera", "Basic camera knowledge", "Bring your own SD card"],
      safetyNotes: ["Respect model boundaries", "No flash photography"],
      city: "Dhaka",
      area: "Uttara",
      address: "Creative Hub, Sector 4, Uttara",
      latitude: 23.8759,
      longitude: 90.3795,
      coverImage: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
      images: [
        "https://images.unsplash.com/photo-1636622433525-127afdf3662d?w=600",
      ],
    },
  ];

  const experienceObjectIds: ObjectId[] = [];
  for (const exp of experienceData) {
    const hostOid = hostObjectIds[exp.hostIdx];
    const hostUserId = hostUserIds[exp.hostIdx];
    const slug = slugify(exp.title) + "-" + Date.now().toString(36);

    const images = exp.images.map((url: string, i: number) => ({
      url,
      alt: `${exp.title} image ${i + 1}`,
      isCover: false,
    }));
    images.unshift({ url: exp.coverImage, alt: exp.title, isCover: true });

    const res = await db.collection("experiences").insertOne({
      hostId: hostOid,
      title: exp.title,
      slug,
      shortDescription: exp.shortDescription,
      fullDescription: exp.fullDescription,
      category: exp.category,
      tags: exp.tags,
      language: exp.language,
      durationMinutes: exp.durationMinutes,
      pricePerParticipant: exp.pricePerParticipant,
      currency: "BDT",
      defaultCapacity: exp.defaultCapacity,
      minimumAge: exp.minimumAge,
      includedItems: exp.includedItems,
      participantRequirements: exp.participantRequirements,
      safetyNotes: exp.safetyNotes,
      cancellationPolicyId: "standard",
      images,
      location: {
        country: "Bangladesh",
        city: exp.city,
        area: exp.area,
        address: exp.address,
        latitude: exp.latitude,
        longitude: exp.longitude,
        publicLocationLabel: `${exp.area}, ${exp.city}`,
      },
      status: "published",
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
      ratingSummary: { average: 0, count: 0 },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
    experienceObjectIds.push(res.insertedId);
    console.log(`[Seed] Created experience: ${exp.title}`);
  }

  // ── Sessions ───────────────────────────────────────────────────────
  const today = new Date();
  const sessionDocs: { _id: ObjectId; experienceId: ObjectId; hostId: ObjectId; startAt: Date; endAt: Date; capacity: number; reservedSeats: number; confirmedSeats: number; bookingCutoffAt: Date; status: string; cancelledAt: null; cancellationReason: null; createdAt: Date; updatedAt: Date }[] = [];

  for (let ei = 0; ei < experienceData.length; ei++) {
    const exp = experienceData[ei];
    const expId = experienceObjectIds[ei];
    const hostOid = hostObjectIds[exp.hostIdx];
    const cap = exp.defaultCapacity;

    // Generate 3 future sessions at weekly intervals starting from next week
    for (let wi = 0; wi < 3; wi++) {
      const startDay = 1 + wi; // next week, then +1 week, then +2 weeks
      const startAt = new Date(today);
      startAt.setDate(startAt.getDate() + startDay * 7);
      startAt.setHours(10, 0, 0, 0);

      const endAt = new Date(startAt);
      endAt.setMinutes(endAt.getMinutes() + exp.durationMinutes);

      const cutoff = new Date(startAt);
      cutoff.setHours(cutoff.getHours() - 4); // 4 hours before

      const session = {
        _id: new ObjectId(),
        experienceId: expId,
        hostId: hostOid,
        startAt,
        endAt,
        capacity: cap,
        reservedSeats: 0,
        confirmedSeats: 0,
        bookingCutoffAt: cutoff,
        status: "scheduled" as const,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sessionDocs.push(session);
    }

    // Add one past completed session for review testing (for first 3 experiences only)
    if (ei < 3) {
      const pastStart = new Date(today);
      pastStart.setDate(pastStart.getDate() - 14);
      pastStart.setHours(10, 0, 0, 0);
      const pastEnd = new Date(pastStart);
      pastEnd.setMinutes(pastEnd.getMinutes() + exp.durationMinutes);
      const pastCutoff = new Date(pastStart);
      pastCutoff.setHours(pastCutoff.getHours() - 4);

      const pastSession = {
        _id: new ObjectId(),
        experienceId: expId,
        hostId: hostOid,
        startAt: pastStart,
        endAt: pastEnd,
        capacity: cap,
        reservedSeats: 0,
        confirmedSeats: 2,
        bookingCutoffAt: pastCutoff,
        status: "completed" as const,
        cancelledAt: null,
        cancellationReason: null,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      sessionDocs.push(pastSession);
    }
  }

  await db.collection("sessions").insertMany(sessionDocs);
  console.log(`[Seed] Created ${sessionDocs.length} sessions`);

  // ── Bookings ───────────────────────────────────────────────────────
  // Alex books the past sessions (completed) and one future session
  const pastSessions = sessionDocs.filter(s => s.status === "completed");
  const futureSessions = sessionDocs.filter(s => s.status === "scheduled");

  const bookingDocs: any[] = [];
  let bookingNum = 1;

  for (const ps of pastSessions) {
    const bookingRef = "DEMO-" + String(bookingNum++).padStart(4, "0");
    bookingDocs.push({
      _id: new ObjectId(),
      bookingReference: bookingRef,
      userId: alex._id,
      hostId: ps.hostId,
      experienceId: ps.experienceId,
      sessionId: ps._id,
      participantCount: 2,
      currency: "BDT",
      subtotalAmount: 5000,
      platformFeeAmount: 500,
      taxAmount: 0,
      totalAmount: 5500,
      hostEarningAmount: 4500,
      bookingStatus: "completed",
      paymentStatus: "paid",
      seatHoldExpiresAt: null,
      stripe: {
        checkoutSessionId: "cs_demo_" + bookingRef,
        paymentIntentId: "pi_demo_" + bookingRef,
        chargeId: "ch_demo_" + bookingRef,
        refundIds: [],
        connectedAccountId: null,
      },
      cancellation: { cancelledBy: null, reason: null, cancelledAt: null },
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  // Also book one future session
  const futureSession = futureSessions[0];
  if (futureSession) {
    const bookingRef = "DEMO-" + String(bookingNum++).padStart(4, "0");
    bookingDocs.push({
      _id: new ObjectId(),
      bookingReference: bookingRef,
      userId: alex._id,
      hostId: futureSession.hostId,
      experienceId: futureSession.experienceId,
      sessionId: futureSession._id,
      participantCount: 1,
      currency: "BDT",
      subtotalAmount: 2500,
      platformFeeAmount: 250,
      taxAmount: 0,
      totalAmount: 2750,
      hostEarningAmount: 2250,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      seatHoldExpiresAt: null,
      stripe: {
        checkoutSessionId: "cs_demo_" + bookingRef,
        paymentIntentId: "pi_demo_" + bookingRef,
        chargeId: "ch_demo_" + bookingRef,
        refundIds: [],
        connectedAccountId: null,
      },
      cancellation: { cancelledBy: null, reason: null, cancelledAt: null },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });

    // Update session seats
    await db.collection("sessions").updateOne(
      { _id: futureSession._id },
      { $inc: { confirmedSeats: 1 } }
    );
  }

  await db.collection("bookings").insertMany(bookingDocs);
  console.log(`[Seed] Created ${bookingDocs.length} bookings`);

  // ── Reviews ────────────────────────────────────────────────────────
  // Review each past booking
  for (let bi = 0; bi < pastSessions.length; bi++) {
    const booking = bookingDocs[bi];
    const exp = experienceData[bi];
    const ratings = {
      "Authentic Italian Pasta Making": 5,
      "Morning Yoga in the Park": 4,
      "Hand-Building Pottery Workshop": 5,
    };
    const comments = {
      "Authentic Italian Pasta Making": "Incredible experience! Maria is a fantastic teacher and the pasta was delicious. Learned so much in just 3 hours.",
      "Morning Yoga in the Park": "Lovely morning yoga session. The park setting is beautiful. Maria is patient and gives great adjustments.",
      "Hand-Building Pottery Workshop": "David's studio is amazing. He made pottery feel accessible and fun. My mug turned out beautiful!",
    };

    const existingReview = await db.collection("reviews").findOne({ bookingId: booking._id });
    if (!existingReview) {
      await db.collection("reviews").insertOne({
        _id: new ObjectId(),
        bookingId: booking._id,
        experienceId: pastSessions[bi].experienceId,
        hostId: pastSessions[bi].hostId,
        reviewerId: alex._id,
        rating: (ratings as any)[exp.title] || 4,
        comment: (comments as any)[exp.title] || "Great experience!",
        status: "published",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      });
      console.log(`[Seed] Created review for: ${exp.title}`);
    }
  }

  // Update experience rating summaries
  for (let ei = 0; ei < 3; ei++) {
    const expId = experienceObjectIds[ei];
    const revs = await db.collection("reviews").find({ experienceId: expId, status: "published" }).toArray();
    if (revs.length > 0) {
      const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
      await db.collection("experiences").updateOne(
        { _id: expId },
        { $set: { "ratingSummary.average": Math.round(avg * 10) / 10, "ratingSummary.count": revs.length } }
      );
    }
  }

  console.log("[Seed] Updated experience ratings");

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════");
  console.log("  Seed Complete!");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("  Demo Accounts:");
  console.log("  ─────────────────────────────────────");
  console.log(`  Admin:   admin@skillbazaar.com / admin123`);
  console.log(`  Host:    maria@example.com   / password123  (Cooking, Fitness)`);
  console.log(`  Host:    david@example.com   / password123  (Arts & Crafts)`);
  console.log(`  Host:    sarah@example.com   / password123  (Photography)`);
  console.log(`  User:    alex@example.com    / password123  (Has bookings & reviews)`);
  console.log("");
  console.log(`  Created ${experienceData.length} experiences, ${sessionDocs.length} sessions,`);
  console.log(`  ${bookingDocs.length} bookings, and ${pastSessions.length} reviews`);
  console.log("");

  await client.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Error:", err);
  process.exit(1);
});
