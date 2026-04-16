import { MongoClient, Db } from "mongodb";

export class MongoDBClient {
  private static instance: MongoDBClient;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor(private readonly uri: string) {
    this.client = new MongoClient(this.uri);
  }

  static getInstance(uri?: string): MongoDBClient {
    if (!MongoDBClient.instance) {
      if (!uri) {
        throw new Error("URI is required to initialize MongoDBClient");
      }
      MongoDBClient.instance = new MongoDBClient(uri);
    }
    return MongoDBClient.instance;
  }

  async connect(dbName: string): Promise<void> {
    if (this.db) return;

    await this.client.connect();
    this.db = this.client.db(dbName);
    console.log(`Connected to MongoDB — database: "${dbName}"`);
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.db = null;
    console.log("MongoDB connection closed.");
  }
}