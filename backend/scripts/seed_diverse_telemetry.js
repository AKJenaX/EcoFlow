import { connectDB, executeQuery } from '../db.js';

const diverseFills = {
  4: 95,
  5: 78,
  6: 45,
  7: 82,
  8: 60,
  9: 55,
  10: 92,
  11: 74,
  12: 51,
  13: 88,
  14: 67
};

async function seedDiverse() {
  await connectDB();
  console.log('Seeding diverse fill levels to latest telemetry events...');
  
  for (const [binId, fill] of Object.entries(diverseFills)) {
    // Find the latest telemetry event ID for this bin
    const [rows] = await executeQuery(
      'SELECT id FROM telemetry_events WHERE bin_id = ? ORDER BY id DESC LIMIT 1',
      [binId]
    );
    
    if (rows.length > 0) {
      const latestId = rows[0].id;
      // Update its fill_pct
      await executeQuery(
        'UPDATE telemetry_events SET fill_pct = ? WHERE id = ?',
        [fill, latestId]
      );
      console.log(`Updated Bin ${binId} latest event (${latestId}) to fill_pct = ${fill}%`);
    } else {
      // Insert a new event if none exists
      const [res] = await executeQuery(
        `INSERT INTO telemetry_events 
           (bin_id, fill_pct, smoke_detected, tilt_detected, battery_pct, gps_lat, gps_lng, source_device)
         VALUES (?, ?, false, false, 80, 12.9716, 77.5946, 'simulator')`,
        [binId, fill]
      );
      console.log(`Inserted new telemetry event (${res.insertId}) for Bin ${binId} with fill_pct = ${fill}%`);
    }
  }
  
  console.log('Diverse fill levels seeded successfully!');
  process.exit(0);
}

seedDiverse().catch(console.error);
