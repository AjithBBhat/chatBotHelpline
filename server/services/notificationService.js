// server/services/notificationService.js
/**
 * Send a real-time notification to a specific user via Socket.IO
 * @param {Object} io - socket.io server instance
 * @param {string} userId - recipient user ID
 * @param {string} type - notification type
 * @param {object} payload - notification data
 */
const sendRealtimeNotification = (io, userId, type, payload) => {
  io.to(userId.toString()).emit('notification', { type, ...payload });
};

/**
 * Notify multiple users (e.g., new message in a group chat)
 */
const broadcastNotification = (io, userIds, type, payload) => {
  userIds.forEach((id) => {
    io.to(id.toString()).emit('notification', { type, ...payload });
  });
};

/**
 * Example where you might send an email (stub only)
 */
const sendEmailNotification = async (email, subject, body) => {
  // Integrate with Nodemailer, SendGrid, etc.
  console.log(`Email to ${email}: ${subject} - ${body}`);
};

export default {
  sendRealtimeNotification,
  broadcastNotification,
  sendEmailNotification
};
