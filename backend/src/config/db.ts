import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    console.log("Using Mongo URI:", env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${(err as Error).message}`);
    process.exit(1);
  }
}