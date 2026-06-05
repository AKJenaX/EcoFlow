import express from 'express';
import { executeQuery } from '../db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { httpError } from '../utils/httpError.js';

const router = express.Router();

/**
 * POST /api/pickup-requests
 * Create a new pickup request.
 * Body: { binId, scheduledDate, notes }
 */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { binId, scheduledDate, notes } = req.body || {};
    const requestedBy = req.user?.username || req.user?.userId || 'unknown';

    if (!binId || !scheduledDate) {
      throw httpError(400, 'VALIDATION_ERROR', 'binId and scheduledDate are required');
    }

    const [result] = await executeQuery(
      `INSERT INTO PickupRequests (Bin_ID, Requested_By, Scheduled_Date, Notes)
       VALUES (?, ?, ?, ?)`,
      [binId, requestedBy, scheduledDate, notes || null]
    );

    res.status(201).json({ message: 'Pickup request created', requestId: result.insertId });
  })
);

/**
 * GET /api/pickup-requests?status=pending|confirmed|completed
 * List all pickup requests, optionally filtered by status.
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const validStatuses = ['pending', 'confirmed', 'completed'];

    let query = `
      SELECT pr.*, b.Assigned_Location AS bin_location
      FROM PickupRequests pr
      LEFT JOIN Bin b ON b.Bin_ID = pr.Bin_ID
    `;
    const params = [];

    if (status && validStatuses.includes(status)) {
      query += ' WHERE pr.Status = ?';
      params.push(status);
    }

    query += ' ORDER BY pr.Scheduled_Date ASC, pr.Created_At DESC';

    const [rows] = await executeQuery(query, params);
    res.json(rows);
  })
);

/**
 * PUT /api/pickup-requests/:id
 * Update a pickup request (status and/or notes).
 * Body: { status?, notes? }
 */
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body || {};
    const validStatuses = ['pending', 'confirmed', 'completed'];

    if (status && !validStatuses.includes(status)) {
      throw httpError(400, 'VALIDATION_ERROR', `status must be one of: ${validStatuses.join(', ')}`);
    }

    const [[existing]] = await executeQuery(
      'SELECT Request_ID FROM PickupRequests WHERE Request_ID = ?',
      [id]
    );
    if (!existing) throw httpError(404, 'NOT_FOUND', 'Pickup request not found');

    const fields = [];
    const values = [];
    if (status) { fields.push('Status = ?'); values.push(status); }
    if (notes !== undefined) { fields.push('Notes = ?'); values.push(notes); }

    if (fields.length === 0) {
      throw httpError(400, 'VALIDATION_ERROR', 'Provide at least one field to update: status, notes');
    }

    values.push(id);
    await executeQuery(
      `UPDATE PickupRequests SET ${fields.join(', ')} WHERE Request_ID = ?`,
      values
    );

    res.json({ message: 'Pickup request updated' });
  })
);

/**
 * DELETE /api/pickup-requests/:id
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await executeQuery('DELETE FROM PickupRequests WHERE Request_ID = ?', [id]);
    res.json({ message: 'Pickup request deleted' });
  })
);

export default router;
