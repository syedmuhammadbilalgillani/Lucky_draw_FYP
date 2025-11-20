// helpers/authHelpers.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../lib/logger.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '1d';

export async function hashPassword(plainPassword) {
  logger.debug('Hashing password');
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword, hash) {
  logger.debug('Verifying password');
  return bcrypt.compare(plainPassword, hash);
}

export function generateAuthToken(user) {
  logger.debug('Generating token for userId:', user.id);

  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function getSafeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export function validateRegisterPayload({ fullName, email, password }) {
  const errors = [];
  if (!fullName) errors.push('fullName is required');
  if (!email) errors.push('email is required');
  if (!password || password.length < 6) errors.push('password must be at least 6 characters');
  return errors;
}

export function validateLoginPayload({ email, password }) {
  const errors = [];
  if (!email) errors.push('email is required');
  if (!password) errors.push('password is required');
  return errors;
}
