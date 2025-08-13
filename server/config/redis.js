// server/config/redis.js
import { createClient } from 'redis';
import { redisUrl } from './config.js';

// Create Redis clients
export const publisher = createClient({ url: redisUrl });
export const subscriber = createClient({ url: redisUrl });

// Error handling
publisher.on('error', (err) => {
  console.error('Redis Publisher Error:', err);
});

subscriber.on('error', (err) => {
  console.error('Redis Subscriber Error:', err);
});

// Connect clients
export const connectRedis = async () => {
  try {
    await publisher.connect();
    await subscriber.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

export default { publisher, subscriber, connectRedis };
