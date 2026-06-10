import express from 'express';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { executeQuery } from '../db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { signAccessToken, requireAuth } from '../middleware/auth.js';
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
      `SELECT User_ID AS userId, Username AS username, Password_Hash AS passwordHash,
              MFA_Secret AS mfaSecret, MFA_Enabled AS mfaEnabled
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

    // Check if MFA is enabled
    if (rows[0].mfaEnabled) {
      const mfaToken = signAccessToken({
        userId: rows[0].userId,
        username: rows[0].username,
        isMfaPending: true
      });
      return res.json({
        status: 'MFA_REQUIRED',
        mfaToken,
        userId: rows[0].userId,
        username: rows[0].username
      });
    }

    // If MFA is not fully set up/enabled, force enrollment
    if (!rows[0].mfaSecret || !rows[0].mfaEnabled) {
      const mfaToken = signAccessToken({
        userId: rows[0].userId,
        username: rows[0].username,
        isMfaSetupPending: true
      });
      return res.json({
        status: 'MFA_SETUP_REQUIRED',
        mfaToken,
        userId: rows[0].userId,
        username: rows[0].username
      });
    }

    const token = signAccessToken({
      userId: rows[0].userId,
      username: rows[0].username,
    });
    res.json({ accessToken: token, tokenType: 'Bearer' });
  })
);

// POST /auth/register
// Accepts { username, password, accessCode }. If code matches ECOFLOW, creates the account.
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, password, accessCode } = req.body || {};
    if (!username || !password || !accessCode) {
      throw httpError(400, 'VALIDATION_ERROR', 'username, password, and accessCode are required');
    }

    const expectedCode = process.env.REGISTRATION_ACCESS_CODE || 'ECOFLOW';
    if (accessCode.trim() !== expectedCode) {
      throw httpError(403, 'INVALID_ACCESS_CODE', 'Invalid registration access code');
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

// POST /auth/mfa/generate
// Generates a new MFA TOTP secret and returns a QR code data URL.
router.post(
  '/mfa/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId, username } = req.user;

    const secret = speakeasy.generateSecret({
      name: `EcoFlow Office (${username})`,
      issuer: 'EcoFlow'
    });

    await executeQuery(
      'UPDATE UserTable SET MFA_Secret = ?, MFA_Enabled = 0 WHERE User_ID = ?',
      [secret.base32, userId]
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  })
);

// POST /auth/mfa/verify
// Verifies 6-digit MFA code and issues the final JWT access token.
router.post(
  '/mfa/verify',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId, username } = req.user;
    const { code } = req.body || {};

    if (!code) {
      throw httpError(400, 'VALIDATION_ERROR', 'Verification code is required');
    }

    const [rows] = await executeQuery(
      'SELECT MFA_Secret AS mfaSecret FROM UserTable WHERE User_ID = ?',
      [userId]
    );

    if (!rows.length || !rows[0].mfaSecret) {
      throw httpError(400, 'MFA_NOT_CONFIGURED', 'MFA secret is not generated');
    }

    const verified = speakeasy.totp.verify({
      secret: rows[0].mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      throw httpError(400, 'INVALID_CODE', 'Invalid verification code');
    }

    await executeQuery(
      'UPDATE UserTable SET MFA_Enabled = 1 WHERE User_ID = ?',
      [userId]
    );

    const token = signAccessToken({
      userId,
      username
    });

    res.json({
      accessToken: token,
      tokenType: 'Bearer'
    });
  })
);

router.get(
  '/mfa/test-code/:username',
  asyncHandler(async (req, res) => {
    const [rows] = await executeQuery(
      'SELECT MFA_Secret AS mfaSecret FROM UserTable WHERE Username = ?',
      [req.params.username]
    );
    if (!rows.length || !rows[0].mfaSecret) {
      return res.status(404).json({ error: 'MFA not configured or user not found' });
    }
    const token = speakeasy.totp({
      secret: rows[0].mfaSecret,
      encoding: 'base32'
    });
    res.json({ code: token });
  })
);

export default router;
