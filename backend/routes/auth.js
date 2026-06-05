import express from 'express';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { signAccessToken } from '../middleware/auth.js';
import { httpError } from '../utils/httpError.js';

const router = express.Router();

// POST /auth/login
// Authenticates using Username + Password_Hash (bcrypt compare).
// Preserves ALLOW_DEV_AUTH_BYPASS for development convenience.
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw httpError(400, 'VALIDATION_ERROR', 'username and password are required');
    }

    // Dev auth bypass: any username with the magic password skips DB lookup.
    if (
      process.env.ALLOW_DEV_AUTH_BYPASS === 'true' &&
      password === (process.env.DEV_BYPASS_PASSWORD || 'devpass')
    ) {
      const token = signAccessToken({ userId: 0, username });
      return res.json({ accessToken: token, tokenType: 'Bearer' });
    }

    const [rows] = await executeQuery(
      `SELECT User_ID AS userId, Username AS username, Password_Hash AS passwordHash
       FROM UserTable WHERE Username = ?`,
      [username]
    );

    if (!rows.length) {
      throw httpError(401, 'AUTH_FAILED', 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, rows[0].passwordHash);
    if (!valid) {
      throw httpError(401, 'AUTH_FAILED', 'Invalid credentials');
    }

    const token = signAccessToken({
      userId: rows[0].userId,
      username: rows[0].username,
    });
    res.json({ accessToken: token, tokenType: 'Bearer' });
  })
);

// POST /auth/register
// Accepts { username, password }, hashes password, inserts into UserTable.
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw httpError(400, 'VALIDATION_ERROR', 'username and password are required');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const [result] = await executeQuery(
        'INSERT INTO UserTable (Username, Password_Hash) VALUES (?, ?)',
        [username, passwordHash]
      );
      res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw httpError(409, 'CONFLICT', 'Username already taken');
      }
      throw err;
    }
  })
);

// POST /auth/refresh
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) {
      throw httpError(400, 'VALIDATION_ERROR', 'userId is required');
    }
    const accessToken = signAccessToken({ userId });
    res.json({ accessToken, tokenType: 'Bearer' });
  })
);

export default router;
