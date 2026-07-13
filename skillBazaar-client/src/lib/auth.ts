import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import crypto from "crypto";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("volunteerconnect");

// Match the scrypt hasher used in the seed script
const scryptHasher = {
  hash: async (password: string) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 16, p: 1 });
    return `${salt}:${hash.toString("hex")}`;
  },
  verify: async (data: { password: string; hash: string }) => {
    const [salt, hashHex] = data.hash.split(":");
    const hash = crypto.scryptSync(data.password, salt, 64, { N: 16384, r: 16, p: 1 });
    return hash.toString("hex") === hashHex;
  },
};

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: false,
  }),
  emailAndPassword: {
    enabled: true,
    password: scryptHasher,
  },
  rateLimit: {
    window: 60,
    max: 10,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  advanced: {
    cookiePrefix: "volunteerconnect",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
