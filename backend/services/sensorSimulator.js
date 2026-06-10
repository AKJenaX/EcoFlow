/**
 * Sensor Simulator — simulates IoT bin fill-level updates.
 * Queries all bins, applies random ±2–8% fill delta, updates the DB,
 * and broadcasts BIN_UPDATE (and ALERT_UPDATE if threshold crossed) via WebSocket.
 *
 * Controlled by:
 *   SIMULATE_SENSORS=true  — master on/off switch
 *   SENSOR_INTERVAL_MS=30000 — polling interval (ms)
 */

import { executeQuery } from '../db.js';
import { broadcast } from './wsServer.js';

const FILL_ALERT_THRESHOLD = 85;
const DEFAULT_INTERVAL_MS = 30_000;

let timer = null;

function randomDelta() {
  // ±2 to ±8 percent, with realistic upward bias (bins fill more than they empty)
  const sign = Math.random() < 0.75 ? 1 : -1; // 75% chance to increase
  return sign * (2 + Math.random() * 6);
}

const locationCoordinates = {
  'Koramangala': { lat: 12.9352, lng: 77.6245 },
  'Market Road': { lat: 12.9716, lng: 77.5946 },
  'Indiranagar': { lat: 13.0011, lng: 77.6394 },
  'Whitefield': { lat: 12.9698, lng: 77.7499 },
  'Central Depot': { lat: 12.9789, lng: 77.5905 },
  'West Substation 2': { lat: 12.9469, lng: 77.6138 },
  'Maintenance Dept': { lat: 13.0285, lng: 77.6706 },
  'Inspection Unit 1': { lat: 13.0051, lng: 77.5507 },
  'Inspection Unit 2': { lat: 12.9141, lng: 77.6102 },
  'South Zone': { lat: 12.9226, lng: 77.5861 },
  'Central Logistics': { lat: 12.9592, lng: 77.6433 }
};

function getCoordinatesForLocation(location, binId) {
  if (location && locationCoordinates[location]) {
    return locationCoordinates[location];
  }
  const latOffset = ((binId * 17) % 100) / 1000 - 0.05;
  const lngOffset = ((binId * 31) % 100) / 1000 - 0.05;
  return {
    lat: 12.9716 + latOffset,
    lng: 77.5946 + lngOffset
  };
}

async function tick() {
  try {
    // Fetch all bins with their current fill level from latest telemetry
    const [bins] = await executeQuery(
      `SELECT b.Bin_ID AS id, b.Assigned_Location AS area,
              COALESCE(t.fill_pct, 30) AS fill_pct,
              COALESCE(t.gps_lat, 12.9716) AS gps_lat,
              COALESCE(t.gps_lng, 77.5946) AS gps_lng,
              COALESCE(t.battery_pct, 80) AS battery_pct
       FROM Bin b
       LEFT JOIN telemetry_events t
         ON t.id = (
           SELECT MAX(id) FROM telemetry_events WHERE bin_id = b.Bin_ID
         )`
    );

    for (const bin of bins) {
      const currentFill = Number(bin.fill_pct);
      const newFill = Math.min(100, Math.max(0, currentFill + randomDelta()));
      const roundedFill = Math.round(newFill * 10) / 10;

      const coords = getCoordinatesForLocation(bin.area, bin.id);

      // Insert new telemetry event with correct coordinates
      const [result] = await executeQuery(
        `INSERT INTO telemetry_events
           (bin_id, fill_pct, smoke_detected, tilt_detected, battery_pct, gps_lat, gps_lng, source_device)
         VALUES (?, ?, false, false, ?, ?, ?, 'simulator')`,
        [bin.id, roundedFill, bin.battery_pct, coords.lat, coords.lng]
      );

      const binPayload = {
        Bin_ID: bin.id,
        fill_pct: roundedFill,
        area: bin.area,
        gps_lat: coords.lat,
        gps_lng: coords.lng,
        telemetry_id: result.insertId,
        simulated: true
      };

      // Always broadcast the bin update
      broadcast('BIN_UPDATE', binPayload);

      // If crossing the alert threshold, fire an ALERT_UPDATE too
      if (roundedFill >= FILL_ALERT_THRESHOLD && currentFill < FILL_ALERT_THRESHOLD) {
        console.log(`[Simulator] ⚠️  Bin ${bin.id} crossed ${FILL_ALERT_THRESHOLD}% (${roundedFill.toFixed(1)}%)`);

        // Insert alert record
        try {
          await executeQuery(
            `INSERT INTO alerts (alert_type, severity, status, details_json)
             VALUES ('fill_threshold', 'warning', 'open', ?)`,
            [JSON.stringify({ bin_id: bin.id, fill_pct: roundedFill })]
          );
        } catch {
          // alerts table may have different schema — log but don't crash
        }

        broadcast('ALERT_UPDATE', {
          Bin_ID: bin.id,
          fill_pct: roundedFill,
          area: bin.area,
          Status: 'Critical',
          location: bin.area,
          fillPercentage: Math.round(roundedFill),
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`[Simulator] ✅ Updated ${bins.length} bins at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error('[Simulator] ❌ Tick error:', err.message);
  }
}

/**
 * Start the sensor simulator.
 * Respects SIMULATE_SENSORS env var — will not start if falsy.
 */
export function start() {
  if (process.env.SIMULATE_SENSORS !== 'true') {
    console.log('[Simulator] SIMULATE_SENSORS is not true — sensor simulation disabled.');
    return;
  }

  const intervalMs = Number(process.env.SENSOR_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  console.log(`[Simulator] 🚀 Starting sensor simulation every ${intervalMs / 1000}s`);

  // Run once immediately, then on interval
  tick();
  timer = setInterval(tick, intervalMs);
}

/**
 * Stop the sensor simulator (used in tests or graceful shutdown).
 */
export function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[Simulator] 🛑 Sensor simulation stopped.');
  }
}
