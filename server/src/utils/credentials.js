import { compare, hash } from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export const normalizeEmail = (email) => email.trim().toLowerCase();
export const hashPassword = (password) => hash(password, BCRYPT_ROUNDS);
export const verifyPassword = (password, passwordHash) => compare(password, passwordHash);
export const performDummyPasswordHash = (password) => hash(password, BCRYPT_ROUNDS);
