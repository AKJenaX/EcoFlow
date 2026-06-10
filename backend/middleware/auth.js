import jwt from 'jsonwebtoken';
import { executeQuery } from '../db.js';

function isDevBypassEnabled() {
  return String(process.env.ALLOW_DEV_AUTH_BYPASS || '').toLowerCase() === 'true';
}

function getJwtSecret() {
  return process.env.JWT_SECRET || 'swms-dev-secret';
}

export function requireAuth(req, res, next) {
  if (isDevBypassEnabled()) {
    req.user = {
      userId: Number(process.env.DEV_BYPASS_USER_ID || 1),
      roles: ['super_admin']
    };
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.access_token || null;

  if (!token) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing bearer token' });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch (_error) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function requirePermission(...permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
}
