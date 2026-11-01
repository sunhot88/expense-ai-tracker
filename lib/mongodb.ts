import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// 在開發模式 hot reload 時重用連線，避免重複建立
const globalCache = globalThis as unknown as {
  _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};
const cache = (globalCache._mongoose ??= { conn: null, promise: null });

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("缺少環境變數 MONGODB_URI");
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(MONGODB_URI, { bufferCommands: false });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}
