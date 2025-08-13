// server/models/Message.js
import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: String,
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      size: Number,
      mimeType: String
    }]
  },
  status: {
    delivered: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    read: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  editedAt: Date,
  deletedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default model('Message', messageSchema);
