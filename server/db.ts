import { MongoClient, Db } from "mongodb";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://admin:secret@localhost:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "mydb";

let client: MongoClient | null = null;
let db: Db | null = null;

/** Returns a singleton MongoDB Db instance. */
export async function getDb(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[server] Connected to MongoDB — database: "${DB_NAME}"`);
  return db;
}

/** Gracefully closes the MongoDB connection. */
export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[server] MongoDB connection closed.");
  }
}
