import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let mongodInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillchallenge_ladder';
  
  try {
    // Attempt standard connection first with 3 second serverSelectionTimeoutMS
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection to ${uri} failed (${err.message}).`);
    console.log(`[Database] Initializing MongoMemoryServer for standalone development...`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] MongoMemoryServer connected successfully at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] Failed to initialize MongoMemoryServer:`, memErr);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

