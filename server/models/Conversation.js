// server/models/Conversation.js
import { Schema, model } from 'mongoose';

const conversationSchema = new Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'helpline'],
    required: true
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'agent'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: Date
  }],
  metadata: {
    name: String,
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  lastMessage: {
    content: String,
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }
}, {
  timestamps: true
});

export default model('Conversation', conversationSchema);
