// server/services/messageService.js
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

/**
 * Create and store a new message
 */
export const createMessage = async ({ conversationId, senderId, content }) => {
  // Verify conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Create message document
  const message = await Message.create({
    conversationId,
    senderId,
    content: {
      text: content.text,
      type: content.type || 'text',
      attachments: content.attachments || []
    }
  });

  // Update lastMessage in conversation
  conversation.lastMessage = {
    content: content.text,
    senderId,
    timestamp: message.createdAt
  };
  await conversation.save();

  return message.populate('senderId', 'username profile');
};

/**
 * Mark messages as read
 */
export const markAsRead = async (conversationId, userId) => {
  await Message.updateMany(
    {
      conversationId,
      'status.read.userId': { $ne: userId }
    },
    {
      $addToSet: {
        'status.read': { userId, timestamp: new Date() }
      }
    }
  );
};

/**
 * Fetch messages in a conversation with pagination
 */
export const getMessages = async (conversationId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'username profile');

  return messages.reverse(); // so oldest message comes first
};

export default {
  createMessage,
  getMessages,
  markAsRead
};
