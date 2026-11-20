import { MongoClient } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

export const DATABASE_NAME = "rick-and-morty";

// Reuse the client across hot reloads in development.
export const mongoClient = globalThis._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalThis._mongoClient = mongoClient;
}

export const db = mongoClient.db(DATABASE_NAME);

const mongodbClient = mongoClient.connect();

export default mongodbClient;
