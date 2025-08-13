import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { jwtSecret, jwtExpire } from '../config/config.js';

export const generateToken = (userId) => {
  return sign({ userId }, jwtSecret, { expiresIn: jwtExpire });
};

export const verifyToken = (token) => {
  return verify(token, jwtSecret);
};

export default { generateToken, verifyToken };
