import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  db = client.db("skillbazaar");
  console.log("[DB] Connected to MongoDB");
  return db;
}

export async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log("[DB] Disconnected from MongoDB");
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}
