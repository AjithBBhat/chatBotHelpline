// server/app.js
import { json, urlencoded } from 'express';
import express from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import compression from 'compression';

// Import configurations
import { NODE_ENV, port } from './config/config.js';
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import initializeSocket from './config/socket.js';

// Import middleware
import { cors, helmet, limiter } from './middleware/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import fileRoutes from './routes/files.js';
import conversationRoutes from './routes/conversations.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Create Express app
const app = express();
app.use(express.json());  // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies 
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Connect to databases
connectDB();
connectRedis();

// Security middleware
app.use(helmet);
app.use(cors);
app.use(limiter);

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(compression());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

// Static files
// Get __filename equivalent
const __filename = fileURLToPath(import.meta.url);

// Get __dirname equivalent
const __dirname = dirname(__filename);

// Use __dirname with join for static files path
app.use('/uploads', express.static(join(__dirname, '../uploads')));


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/conversations', conversationRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'server OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    ...(NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('/*splat', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📱 Socket.IO server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

export default app;
