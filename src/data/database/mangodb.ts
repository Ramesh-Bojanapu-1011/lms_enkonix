import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (typeof MONGODB_URI === "string") {
      cached.promise = mongoose
        .connect(MONGODB_URI, {})
        .then((mongoose) => mongoose);
      // console.log('MongoDB Connected');
    } else {
      throw new Error("MONGODB_URI is not a string");
    }
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
