import { connectDB, executeQuery } from '../db.js';

async function updateGps() {
  await connectDB();
  console.log('Updating telemetry events coordinates...');
  const [result] = await executeQuery(`
    UPDATE telemetry_events t
    JOIN Bin b ON t.bin_id = b.Bin_ID
    SET t.gps_lat = CASE b.Assigned_Location
                      WHEN 'Koramangala' THEN 12.9352
                      WHEN 'Market Road' THEN 12.9716
                      WHEN 'Indiranagar' THEN 13.0011
                      WHEN 'Whitefield' THEN 12.9698
                      WHEN 'Central Depot' THEN 12.9789
                      WHEN 'West Substation 2' THEN 12.9469
                      WHEN 'Maintenance Dept' THEN 13.0285
                      WHEN 'Inspection Unit 1' THEN 13.0051
                      WHEN 'Inspection Unit 2' THEN 12.9141
                      WHEN 'South Zone' THEN 12.9226
                      WHEN 'Central Logistics' THEN 12.9592
                      ELSE 12.9716 + (MOD(b.Bin_ID * 17, 100) / 1000 - 0.05)
                    END,
        t.gps_lng = CASE b.Assigned_Location
                      WHEN 'Koramangala' THEN 77.6245
                      WHEN 'Market Road' THEN 77.5946
                      WHEN 'Indiranagar' THEN 77.6394
                      WHEN 'Whitefield' THEN 77.7499
                      WHEN 'Central Depot' THEN 77.5905
                      WHEN 'West Substation 2' THEN 77.6138
                      WHEN 'Maintenance Dept' THEN 77.6706
                      WHEN 'Inspection Unit 1' THEN 77.5507
                      WHEN 'Inspection Unit 2' THEN 77.6102
                      WHEN 'South Zone' THEN 77.5861
                      WHEN 'Central Logistics' THEN 77.6433
                      ELSE 77.5946 + (MOD(b.Bin_ID * 31, 100) / 1000 - 0.05)
                    END
  `);
  console.log('Telemetry events updated:', result.affectedRows || result.message);
  process.exit(0);
}

updateGps().catch(console.error);
