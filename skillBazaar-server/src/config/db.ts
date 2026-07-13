import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  db = client.db("volunteerconnect");
  console.log("[DB] Connected to MongoDB");
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
}

export async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[DB] Disconnected from MongoDB");
  }
}
