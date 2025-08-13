// server/models/User.js
import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    displayName: String,
    avatar: String,
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline'
    }
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await genSalt(12);
  this.password = await hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await compare(candidatePassword, this.password);
};

export default model('User', userSchema);
