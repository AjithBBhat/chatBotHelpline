import express from 'express';
import mongoose from 'mongoose';
import { body, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   POST /api/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('participantIds')
      .isArray({ min: 1 })
      .withMessage('Participants list is required'),
    body('type')
      .isIn(['direct', 'group', 'helpline'])
      .withMessage('Invalid conversation type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { participantIds, type, metadata } = req.body;

      // Combine creator with given participants
      const allIds = [req.user._id.toString(), ...participantIds];

      // Verify all users exist
      const foundUsers = await User.find({ _id: { $in: allIds } });
      if (foundUsers.length !== allIds.length) {
        return res.status(400).json({ message: 'One or more participants not found' });
      }

      // Build embedded participant objects
      const participantsArray = [
        {
          userId: new mongoose.Types.ObjectId(req.user._id),
          role: 'admin', // creator is admin by default
          joinedAt: new Date()
        },
        ...participantIds.map(id => ({
          userId: new mongoose.Types.ObjectId(id),
          role: 'member',
          joinedAt: new Date()
        }))
      ];

      // Optional: Prevent duplicate conversations with same participants & type
      const existingConversation = await Conversation.findOne({
        type,
        'participants.userId': { $all: allIds.map(id => new mongoose.Types.ObjectId(id)) },
        $expr: { $eq: [{ $size: '$participants' }, allIds.length] }
      });

      if (existingConversation) {
        return res.status(200).json({ success: true, conversation: existingConversation });
      }

      // Create new conversation
      const conversation = await Conversation.create({
        type,
        participants: participantsArray,
        metadata: metadata || { isActive: true },
        lastMessage: null
      });

      res.status(201).json({ success: true, conversation });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for the logged-in user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user._id
    })
      .populate('participants.userId', 'username email profile')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/conversations/:id
 * @desc    Get a specific conversation by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid conversation ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const conversation = await Conversation.findById(req.params.id)
        .populate('participants.userId', 'username email profile');

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // Verify that requesting user is a participant
      const isParticipant = conversation.participants.some(p =>
        p.userId._id.equals(req.user._id)
      );
      if (!isParticipant) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json({ success: true, conversation });
    } catch (error) {
      console.error('Get single conversation error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
