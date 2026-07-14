import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "volunteerconnect";

function hashPassword(password: string): string {
  const normalized = password.normalize("NFKC");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(normalized, salt, 64, { N: 16384, r: 16, p: 1 });
  return `${salt}:${hash.toString("hex")}`;
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  console.log("[Seed] Connected to MongoDB");

  // Clear collections
  await db.collection("user").deleteMany({});
  await db.collection("account").deleteMany({});
  await db.collection("session").deleteMany({});
  await db.collection("verification").deleteMany({});
  await db.collection("opportunities").deleteMany({});
  await db.collection("applications").deleteMany({});
  await db.collection("categories").deleteMany({});
  await db.collection("organizations").deleteMany({});
  console.log("[Seed] Cleared collections");

  // Create users
  const users = [
    { name: "Admin User", email: "admin@volunteerconnect.org", password: "admin123", role: "admin" },
    { name: "Green Earth Foundation", email: "greenearth@example.com", password: "password123", role: "user" },
    { name: "Hope Education", email: "hopeedu@example.com", password: "password123", role: "user" },
    { name: "Community Care", email: "communitycare@example.com", password: "password123", role: "user" },
    { name: "Alex Johnson", email: "alex@example.com", password: "password123", role: "user" },
  ];

  const userIds: ObjectId[] = [];
  for (const u of users) {
    const id = new ObjectId();
    userIds.push(id);
    await db.collection("user").insertOne({
      _id: id, name: u.name, email: u.email, emailVerified: true, image: null, role: u.role, createdAt: new Date(), updatedAt: new Date(),
    });
    await db.collection("account").insertOne({
      _id: new ObjectId(), userId: id, accountId: u.email, providerId: "credential", password: hashPassword(u.password),
    });
    console.log(`[Seed] Created user: ${u.email} (${u.role})`);
  }

  // Create organizations
  const orgs = [
    { userId: userIds[1].toString(), name: "Green Earth Foundation", description: "Environmental conservation and sustainability", website: "https://greenearth.org", logo: "https://picsum.photos/seed/greenearth/100", verified: true, createdAt: new Date() },
    { userId: userIds[2].toString(), name: "Hope Education", description: "Education and mentoring for underprivileged youth", website: "https://hopeedu.org", logo: "https://picsum.photos/seed/hopeedu/100", verified: true, createdAt: new Date() },
    { userId: userIds[3].toString(), name: "Community Care", description: "Community development and social services", website: "https://communitycare.org", logo: "https://picsum.photos/seed/communitycare/100", verified: true, createdAt: new Date() },
  ];
  await db.collection("organizations").insertMany(orgs);
  console.log("[Seed] Created organizations");

  // Create categories
  const categories = [
    { name: "Environment", slug: "environment", description: "Environmental conservation and sustainability", icon: "leaf", isActive: true },
    { name: "Education", slug: "education", description: "Teaching, mentoring, and educational support", icon: "book", isActive: true },
    { name: "Healthcare", slug: "healthcare", description: "Health awareness and medical support", icon: "heart", isActive: true },
    { name: "Community", slug: "community", description: "Community development and social services", icon: "users", isActive: true },
    { name: "Animals", slug: "animals", description: "Animal welfare and wildlife conservation", icon: "paw", isActive: true },
    { name: "Technology", slug: "technology", description: "Tech for good and digital literacy", icon: "code", isActive: true },
  ];
  await db.collection("categories").insertMany(categories);
  console.log("[Seed] Created categories");

  // Create opportunities
  const futureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const opportunities = [
    {
      organizerId: userIds[1].toString(), organizerName: "Green Earth Foundation",
      title: "Beach Cleanup Drive", slug: "beach-cleanup-drive",
      shortDescription: "Help us clean up the local beach and protect marine life",
      fullDescription: "Join our monthly beach cleanup initiative. We provide gloves, bags, and refreshments. Make a tangible impact on marine conservation.",
      category: "environment", tags: ["environment", "beach", "cleanup"],
      skills: ["Teamwork", "Physical fitness"], responsibilities: ["Collect trash from beach area", "Sort recyclables", "Document findings"],
      benefits: ["Community service hours", "Networking", "Refreshments provided"],
      location: { country: "USA", city: "Miami", area: "South Beach", address: "South Beach Park", isRemote: false },
      images: ["https://picsum.photos/seed/beachcleanup/800/500"],
      commitmentType: "one-time", duration: "4 hours", startDate: futureDate(14), endDate: null, deadline: futureDate(10),
      spotsAvailable: 30, spotsTaken: 12, status: "published", createdAt: new Date(), updatedAt: new Date(),
    },
    {
      organizerId: userIds[2].toString(), organizerName: "Hope Education",
      title: "After-School Tutoring Program", slug: "after-school-tutoring",
      shortDescription: "Tutor students in math and science after school hours",
      fullDescription: "Help underprivileged students succeed in STEM subjects. We provide curriculum materials and training. Flexible scheduling available.",
      category: "education", tags: ["education", "tutoring", "stem"],
      skills: ["Math", "Science", "Patience", "Communication"],
      responsibilities: ["Tutor students in assigned subjects", "Prepare lesson materials", "Track student progress"],
      benefits: ["Teaching experience", "Community impact", "Certificate of appreciation"],
      location: { country: "USA", city: "New York", area: "Brooklyn", address: "Community Center, 123 Main St", isRemote: false },
      images: ["https://picsum.photos/seed/tutoring/800/500"],
      commitmentType: "ongoing", duration: "3 months", startDate: futureDate(7), endDate: futureDate(97), deadline: futureDate(5),
      spotsAvailable: 15, spotsTaken: 8, status: "published", createdAt: new Date(), updatedAt: new Date(),
    },
    {
      organizerId: userIds[3].toString(), organizerName: "Community Care",
      title: "Food Bank Volunteer", slug: "food-bank-volunteer",
      shortDescription: "Sort and distribute food at the local food bank",
      fullDescription: "Help us fight hunger by volunteering at our food bank. Tasks include sorting donations, packing food boxes, and distributing to families in need.",
      category: "community", tags: ["community", "food", "hunger"],
      skills: ["Organization", "Physical fitness"],
      responsibilities: ["Sort food donations", "Pack food boxes", "Distribute to families"],
      benefits: ["Make a direct impact", "Flexible hours", "Meet like-minded people"],
      location: { country: "USA", city: "Chicago", area: "Downtown", address: "456 Oak Avenue", isRemote: false },
      images: ["https://picsum.photos/seed/foodbank/800/500"],
      commitmentType: "flexible", duration: "Flexible", startDate: futureDate(3), endDate: null, deadline: futureDate(1),
      spotsAvailable: 20, spotsTaken: 15, status: "published", createdAt: new Date(), updatedAt: new Date(),
    },
    {
      organizerId: userIds[1].toString(), organizerName: "Green Earth Foundation",
      title: "Tree Planting Initiative", slug: "tree-planting-initiative",
      shortDescription: "Plant trees in urban areas to improve air quality",
      fullDescription: "Join our tree planting campaign. We aim to plant 1000 trees this year. All tools and saplings provided.",
      category: "environment", tags: ["environment", "trees", "urban"],
      skills: ["Physical fitness", "Teamwork"],
      responsibilities: ["Dig planting holes", "Plant saplings", "Water and maintain young trees"],
      benefits: ["Outdoor activity", "Environmental impact", "T-shirt and certificate"],
      location: { country: "USA", city: "Portland", area: "Pearl District", address: "Waterfront Park", isRemote: false },
      images: ["https://picsum.photos/seed/treeplanting/800/500"],
      commitmentType: "one-time", duration: "5 hours", startDate: futureDate(21), endDate: null, deadline: futureDate(18),
      spotsAvailable: 40, spotsTaken: 22, status: "published", createdAt: new Date(), updatedAt: new Date(),
    },
    {
      organizerId: userIds[2].toString(), organizerName: "Hope Education",
      title: "Digital Literacy Workshop", slug: "digital-literacy-workshop",
      shortDescription: "Teach basic computer skills to seniors",
      fullDescription: "Help seniors learn to use smartphones, email, and the internet. Patience and clear communication skills needed.",
      category: "technology", tags: ["technology", "digital", "seniors"],
      skills: ["Computer literacy", "Patience", "Communication"],
      responsibilities: ["Teach basic computer skills", "Help with smartphone setup", "Answer questions"],
      benefits: ["Teaching experience", "Intergenerational connections", "Refreshments"],
      location: { country: "USA", city: "San Francisco", area: "Mission", address: "Senior Center, 789 Mission St", isRemote: false },
      images: ["https://picsum.photos/seed/digiliteracy/800/500"],
      commitmentType: "one-time", duration: "3 hours", startDate: futureDate(10), endDate: null, deadline: futureDate(7),
      spotsAvailable: 10, spotsTaken: 4, status: "published", createdAt: new Date(), updatedAt: new Date(),
    },
    {
      organizerId: userIds[3].toString(), organizerName: "Community Care",
      title: "Animal Shelter Helper", slug: "animal-shelter-helper",
      shortDescription: "Help care for animals at the local shelter",
      fullDescription: "Walk dogs, clean kennels, and socialize cats at our partner animal shelter. Great for animal lovers!",
      category: "animals", tags: ["animals", "shelter", "pets"],
      skills: ["Animal handling", "Physical fitness"],
      responsibilities: ["Walk dogs", "Clean kennels", "Socialize cats", "Help with adoptions"],
      benefits: ["Work with animals", "Flexible schedule", "Adoption discounts"],
      location: { country: "USA", city: "Austin", area: "East Side", address: "Animal Care Center, 321 Pine St", isRemote: false },
      images: ["https://picsum.photos/seed/animalshelter/800/500"],
      commitmentType: "ongoing", duration: "6 months", startDate: futureDate(5), endDate: futureDate(185), deadline: futureDate(3),
      spotsAvailable: 8, spotsTaken: 3, status: "published", createdAt: new Date(), updatedAt: new Date(),
    },
  ];

  const oppIds: ObjectId[] = [];
  for (const opp of opportunities) {
    const id = new ObjectId();
    oppIds.push(id);
    await db.collection("opportunities").insertOne({ _id: id, ...opp });
  }
  console.log("[Seed] Created opportunities");

  // Create applications
  const applications = [
    { opportunityId: oppIds[0].toString(), opportunityTitle: "Beach Cleanup Drive", volunteerId: userIds[4].toString(), volunteerName: "Alex Johnson", volunteerEmail: "alex@example.com", organizerId: userIds[1].toString(), message: "I love the ocean and want to help keep beaches clean!", skills: ["Teamwork"], availability: "Weekends", status: "approved", reviewedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { opportunityId: oppIds[1].toString(), opportunityTitle: "After-School Tutoring Program", volunteerId: userIds[4].toString(), volunteerName: "Alex Johnson", volunteerEmail: "alex@example.com", organizerId: userIds[2].toString(), message: "I have a background in math and want to help students succeed.", skills: ["Math", "Science"], availability: "Tuesday and Thursday afternoons", status: "pending", reviewedAt: null, createdAt: new Date(), updatedAt: new Date() },
    { opportunityId: oppIds[2].toString(), opportunityTitle: "Food Bank Volunteer", volunteerId: userIds[4].toString(), volunteerName: "Alex Johnson", volunteerEmail: "alex@example.com", organizerId: userIds[3].toString(), message: "I want to help fight hunger in my community.", skills: ["Organization"], availability: "Flexible", status: "completed", reviewedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
  ];
  await db.collection("applications").insertMany(applications);
  console.log("[Seed] Created applications");

  console.log("\n═══════════════════════════════════════════");
  console.log("  Seed Complete!");
  console.log("═══════════════════════════════════════════");
  console.log("\n  Demo Accounts:");
  console.log("  ─────────────────────────────────────");
  console.log("  Admin:   admin@volunteerconnect.org / admin123");
  console.log("  Org:     greenearth@example.com    / password123");
  console.log("  Org:     hopeedu@example.com       / password123");
  console.log("  Org:     communitycare@example.com / password123");
  console.log("  User:    alex@example.com           / password123");
  console.log("");

  await client.close();
}

seed().catch(console.error);
