// server/routes/messages.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createMessage, getMessages, markAsRead } from '../services/messageService.js';
import { body, query, param } from 'express-validator';
import { validationResult } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/messages/:conversationId
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post(
  '/:conversationId',
  authenticate,
  [
    param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
    body('text').optional().isString().withMessage('Text must be a string'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text, type, attachments } = req.body;
      const { conversationId } = req.params;

      const message = await createMessage({
        conversationId,
        senderId: req.user._id,
        content: {
          text: text || '',
          type: type || 'text',
          attachments: attachments || []
        }
      });

      return res.status(201).json({ success: true, message });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages from a conversation (paginated)
 * @access  Private
 */
router.get(
  '/:conversationId',
  authenticate,
  [
    param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { conversationId } = req.params;
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;

      const messages = await getMessages(conversationId, page, limit);
      return res.json({ success: true, messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * @route   PATCH /api/messages/:conversationId/read
 * @desc    Mark all messages in a conversation as read
 * @access  Private
 */
router.patch(
  '/:conversationId/read',
  authenticate,
  [param('conversationId').isMongoId().withMessage('Invalid conversation ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { conversationId } = req.params;
      await markAsRead(conversationId, req.user._id);

      return res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
