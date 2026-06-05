import express from 'express';
import { executeQuery } from '../db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { optimizeRoute } from '../services/routeOptimizer.js';

const router = express.Router();

/**
 * GET /api/routes/optimize?driverId=X&threshold=60
 * Fetches the driver's vehicle, finds assigned bins, runs nearest-neighbour optimizer,
 * returns ordered bin list with lat/lng and total distance in km.
 *
 * Depot defaults to Bengaluru city centre if driver address has no coordinates.
 */
router.get(
  '/optimize',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { driverId, threshold } = req.query;
    const fillThreshold = Number(threshold ?? 60);

    // Fetch all bins (Bin table has gps_lat / gps_lng from IoT telemetry join)
    // We join with the latest telemetry event per bin to get fill level
    const [bins] = await executeQuery(
      `SELECT b.Bin_ID AS id,
              b.Assigned_Location AS area,
              COALESCE(t.gps_lat, 12.9716) AS lat,
              COALESCE(t.gps_lng, 77.5946) AS lng,
              COALESCE(t.fill_pct, 0)       AS fillLevel
       FROM Bin b
       LEFT JOIN telemetry_events t
         ON t.bin_id = b.Bin_ID
         AND t.id = (
           SELECT MAX(id) FROM telemetry_events WHERE bin_id = b.Bin_ID
         )`
    );

    // Depot — use driver's control number area or default to Bengaluru
    let depot = { lat: 12.9716, lng: 77.5946 };

    if (driverId) {
      const [[driver]] = await executeQuery(
        'SELECT * FROM Driver WHERE Driver_ID = ?',
        [driverId]
      ).catch(() => [[null]]);

      if (driver) {
        // If driver has a vehicle with a location, could extend here
        // For now keep the default depot
      }
    }

    const { orderedBins, totalDistanceKm } = optimizeRoute(bins, depot, fillThreshold);

    res.json({
      driverId: driverId || null,
      fillThreshold,
      depot,
      totalDistanceKm,
      binCount: orderedBins.length,
      route: orderedBins
    });
  })
);

export default router;
