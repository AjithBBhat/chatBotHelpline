import { Server } from 'socket.io';
import { authenticateSocket } from '../middleware/auth.js';
import { publisher, subscriber } from './redis.js';
import { createMessage } from '../services/messageService.js';
import User from '../models/User.js'; // import User model needed for status update

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(authenticateSocket);

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user to their rooms
    socket.on('join_rooms', async (conversationIds) => {
      for (const id of conversationIds) {
        socket.join(id);
      }
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const message = await createMessage({
          ...data,
          senderId: socket.userId
        });

        // Publish to Redis for horizontal scaling
        await publisher.publish('chat_messages', JSON.stringify({
          type: 'new_message',
          data: message,
          serverId: process.env.SERVER_ID || 'server-1'
        }));

        // Emit to room participants
        io.to(data.conversationId).emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.conversationId).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Update user status to offline
      await User.findByIdAndUpdate(socket.userId, {
        'profile.status': 'offline'
      });
    });
  });

  // Redis subscriber for multi-server communication
  subscriber.subscribe('chat_messages');
  subscriber.on('message', (channel, message) => {
    const data = JSON.parse(message);

    // Don't broadcast messages from this server
    if (data.serverId !== (process.env.SERVER_ID || 'server-1')) {
      io.to(data.data.conversationId).emit('new_message', data.data);
    }
  });

  return io;
};

export default initializeSocket;
