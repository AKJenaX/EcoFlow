import { connectDB, executeQuery } from '../db.js';

async function seedData() {
  await connectDB();

  // Seed Authority
  await executeQuery(
    `INSERT IGNORE INTO Authority (Authority_ID, Name, Designation, Control_Room, Works_Under) VALUES
    (1, 'Anup Kumar', 'Chief Commissioner', 'Central Command Room', NULL),
    (2, 'Srinivas Murthy', 'Zonal Manager', 'Koramangala Office', 1),
    (3, 'Rajesh Gowda', 'Supervisor', 'Indiranagar Hub', 2)`
  );
  console.log('Seeded Authority');

  // Seed Vehicle
  await executeQuery(
    `INSERT IGNORE INTO Vehicle (Vehicle_ID, Vehicle_Number, Vehicle_Type, Manufacturer, Assigned_Location, Authority_ID) VALUES
    (1, 'KA-01-AB-2045', 'Compactor', 'Tata Motors', 'Koramangala', 3),
    (2, 'KA-01-CD-3156', 'Dumper Placer', 'Ashok Leyland', 'Indiranagar', 3),
    (3, 'KA-01-EF-4267', 'Mini Truck', 'Mahindra', 'Whitefield', 2)`
  );
  console.log('Seeded Vehicle');

  // Seed Driver
  await executeQuery(
    `INSERT IGNORE INTO Driver (Driver_ID, Name, Address, Control_Number, Duty_Per_Order_ID, Vehicle_ID, Authority_ID) VALUES
    (1, 'Rajesh Kumar', 'Koramangala, Bengaluru', 'CN-001', 1, 1, 3),
    (2, 'Priya Singh', 'Indiranagar, Bengaluru', 'CN-002', 2, 2, 3),
    (3, 'Arun Patel', 'Whitefield, Bengaluru', 'CN-003', 3, 3, 2)`
  );
  console.log('Seeded Driver');

  // Seed Bin
  await executeQuery(
    `INSERT IGNORE INTO Bin (Bin_ID, Capacity, GSM_Number, Installation_Date, Assigned_Location, Vehicle_ID, Authority_ID) VALUES
    (101, 1000, '+919876543210', '2023-01-15', 'Koramangala', 1, 3),
    (104, 1500, '+919876543211', '2023-03-20', 'Market Road', 2, 3),
    (107, 1200, '+919876543212', '2023-02-10', 'Indiranagar', 2, 3),
    (110, 800, '+919876543213', '2023-04-05', 'Whitefield', 3, 2)`
  );
  console.log('Seeded Bin');
  
  console.log('Data seeding completed.');
}

seedData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
