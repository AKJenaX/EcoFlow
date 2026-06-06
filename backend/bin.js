import express from 'express';
import { db } from './db.js';
import { asyncHandler } from './middleware/asyncHandler.js';
import { requireAuth, requirePermission } from './middleware/auth.js';
import { auditAction } from './middleware/audit.js';
import { predictFillLevel } from './services/fillPredictor.js';
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM Bin');
  res.json(rows);
}));

router.post('/add', requireAuth, requirePermission('bin.write'), auditAction('create', 'Bin', (_req, body) => body.id), asyncHandler(async (req, res) => {
  const { Capacity, GSM_Number, Installation_Date, Assigned_Location, Vehicle_ID, Authority_ID } = req.body;
  const [result] = await db.execute(
    'INSERT INTO Bin (Capacity, GSM_Number, Installation_Date, Assigned_Location, Vehicle_ID, Authority_ID) VALUES (?, ?, ?, ?, ?, ?)',
    [Capacity, GSM_Number, Installation_Date, Assigned_Location, Vehicle_ID, Authority_ID]
  );
  res.json({ message: 'Bin added', id: result.insertId });
}));

router.put('/update/:id', requireAuth, requirePermission('bin.write'), auditAction('update', 'Bin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Capacity, GSM_Number, Installation_Date, Assigned_Location, Vehicle_ID, Authority_ID } = req.body;
  await db.execute(
    'UPDATE Bin SET Capacity=?, GSM_Number=?, Installation_Date=?, Assigned_Location=?, Vehicle_ID=?, Authority_ID=? WHERE Bin_ID=?',
    [Capacity, GSM_Number, Installation_Date, Assigned_Location, Vehicle_ID, Authority_ID, id]
  );
  res.json({ message: 'Bin updated' });
}));

router.delete('/delete/:id', requireAuth, requirePermission('bin.delete'), auditAction('delete', 'Bin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM Bin WHERE Bin_ID=?', [id]);
  res.json({ message: 'Bin deleted' });
}));

/**
 * GET /bin/:id/prediction
 * Returns fill-level prediction using linear regression on telemetry history.
 */
router.get('/:id/prediction', requireAuth, asyncHandler(async (req, res) => {
  const result = await predictFillLevel(req.params.id);
  res.json(result);
}));

export default router;
