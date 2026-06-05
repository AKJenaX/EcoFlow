/**
 * Greedy nearest-neighbour route optimizer using the Haversine formula.
 * No external dependencies — pure JS math.
 */

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine distance between two lat/lng points in kilometres.
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Greedy nearest-neighbour algorithm.
 *
 * @param {Array<{id, lat, lng, fillLevel}>} bins
 * @param {{lat, lng}} depot  — starting point (driver location or yard)
 * @param {number} fillThreshold — only include bins at or above this fill % (default 60)
 * @returns {{ orderedBins: Array, totalDistanceKm: number }}
 */
export function optimizeRoute(bins, depot, fillThreshold = 60) {
  // Filter to bins that need collection
  const eligible = bins.filter(
    (b) => Number(b.fillLevel ?? b.fill_pct ?? 0) >= fillThreshold
  );

  if (eligible.length === 0) {
    return { orderedBins: [], totalDistanceKm: 0 };
  }

  const remaining = [...eligible];
  const route = [];
  let current = depot;
  let totalKm = 0;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineKm(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const next = remaining.splice(nearestIdx, 1)[0];
    totalKm += nearestDist;
    current = { lat: next.lat, lng: next.lng };
    route.push(next);
  }

  return {
    orderedBins: route,
    totalDistanceKm: Math.round(totalKm * 100) / 100
  };
}
