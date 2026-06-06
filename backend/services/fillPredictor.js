/**
 * Fill-level predictor using least-squares linear regression.
 * Queries the last 7 days of telemetry_events for a given bin,
 * fits a regression line, and predicts when the bin will reach 100%.
 *
 * Returns:
 *   { binId, predictedFullAt, hoursUntilFull, confidence }
 *
 * No external ML dependencies — pure JS math.
 */

import { executeQuery } from '../db.js';

/**
 * Least-squares linear regression.
 * x = array of numbers (time in hours from first reading)
 * y = array of numbers (fill percentages)
 * Returns { slope, intercept, rSquared }
 */
function linearRegression(x, y) {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: y[0] ?? 0, rSquared: 0 };

  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;

  let ssXX = 0;
  let ssXY = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    ssXX += (x[i] - meanX) ** 2;
    ssXY += (x[i] - meanX) * (y[i] - meanY);
    ssTot += (y[i] - meanY) ** 2;
  }

  if (ssXX === 0) return { slope: 0, intercept: meanY, rSquared: 0 };

  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;

  // R² = 1 - SS_res / SS_tot
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssRes += (y[i] - (slope * x[i] + intercept)) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, rSquared };
}

function confidenceLabel(rSquared) {
  if (rSquared > 0.8) return 'high';
  if (rSquared > 0.5) return 'medium';
  return 'low';
}

/**
 * Predict when bin `binId` will reach 100% fill.
 * @param {number|string} binId
 * @returns {Promise<{binId, predictedFullAt, hoursUntilFull, confidence}|{error}|null>}
 */
export async function predictFillLevel(binId) {
  // Query the last 7 days of telemetry for this bin
  const [rows] = await executeQuery(
    `SELECT fill_pct, created_at
     FROM telemetry_events
     WHERE bin_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND fill_pct IS NOT NULL
     ORDER BY created_at ASC
     LIMIT 500`,
    [binId]
  );

  if (!rows || rows.length < 3) {
    return { error: 'insufficient data' };
  }

  // Convert timestamps to hours since first reading
  const t0 = new Date(rows[0].created_at).getTime();
  const x = rows.map(r => (new Date(r.created_at).getTime() - t0) / 3_600_000);
  const y = rows.map(r => Number(r.fill_pct));

  const { slope, intercept, rSquared } = linearRegression(x, y);

  // If slope is <= 0 the bin isn't filling — return a far-future estimate
  if (slope <= 0) {
    return {
      binId: Number(binId),
      predictedFullAt: null,
      hoursUntilFull: null,
      confidence: confidenceLabel(rSquared),
      note: 'Fill rate is flat or decreasing'
    };
  }

  // hours from t0 when y = 100
  const lastX = x[x.length - 1];
  const currentFill = intercept + slope * lastX;
  const hoursUntilFull = Math.max(0, (100 - currentFill) / slope);

  const predictedFullAt = new Date(
    t0 + (lastX + hoursUntilFull) * 3_600_000
  ).toISOString();

  return {
    binId: Number(binId),
    currentFill: Math.round(currentFill * 10) / 10,
    predictedFullAt,
    hoursUntilFull: Math.round(hoursUntilFull * 10) / 10,
    confidence: confidenceLabel(rSquared),
    rSquared: Math.round(rSquared * 1000) / 1000,
    dataPoints: rows.length
  };
}
