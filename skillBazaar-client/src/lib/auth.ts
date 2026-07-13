import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("volunteerconnect");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: false,
  }),
  emailAndPassword: {
    enabled: true,
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
