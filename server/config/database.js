import mongoose from 'mongoose';
import { mongoUri } from './config.js';

const { connect, connection } = mongoose;

const connectDB = async () => {
  try {
    const conn = await connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Handle connection events
connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export default connectDB;
