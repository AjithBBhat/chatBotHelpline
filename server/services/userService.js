// server/services/userService.js
import { findById, findByIdAndUpdate, find } from '../models/User.js';

/**
 * Get a user by ID (excluding password)
 */
const getUserById = async (userId) => {
  return await findById(userId).select('-password');
};

/**
 * Update user status (online, offline, away)
 */
const updateUserStatus = async (userId, status) => {
  return await findByIdAndUpdate(
    userId,
    { 'profile.status': status },
    { new: true }
  ).select('-password');
};

/**
 * Search for users by username or email
 */
const searchUsers = async (keyword) => {
  return await find({
    $or: [
      { username: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ]
  }).select('-password');
};

/**
 * Update user profile details
 */
const updateProfile = async (userId, profileData) => {
  return await findByIdAndUpdate(
    userId,
    { profile: profileData },
    { new: true }
  ).select('-password');
};

export default {
  getUserById,
  updateUserStatus,
  searchUsers,
  updateProfile
};
