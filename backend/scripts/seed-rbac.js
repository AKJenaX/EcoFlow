import { connectDB, executeQuery } from '../db.js';
import bcrypt from 'bcryptjs';

const roles = ['super_admin', 'zonal_manager', 'supervisor', 'driver'];
const permissions = [
  'authority.write',
  'authority.delete',
  'vehicle.write',
  'vehicle.delete',
  'driver.write',
  'driver.delete',
  'user.write',
  'user.delete',
  'bin.write',
  'bin.delete',
  'iot.ingest',
  'sla.manage',
  'sla.read',
  'incident.write',
  'incident.read',
  'incident.assign',
  'analytics.read',
  'analytics.write',
  'optimization.read',
  'forecast.read',
  'anomaly.read',
  'copilot.read',
  'complaint.read',
  'complaint.write'
];

async function seed() {
  await connectDB();

  for (const role of roles) {
    await executeQuery(
      'INSERT IGNORE INTO roles (role_name, description) VALUES (?, ?)',
      [role, `${role} role`]
    );
  }

  for (const permission of permissions) {
    await executeQuery(
      'INSERT IGNORE INTO permissions (permission_name, description) VALUES (?, ?)',
      [permission, `${permission} permission`]
    );
  }

  const [[adminRole]] = await executeQuery('SELECT id FROM roles WHERE role_name = ?', ['super_admin']);
  const [allPerms] = await executeQuery('SELECT id FROM permissions');
  for (const perm of allPerms) {
    await executeQuery(
      'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [adminRole.id, perm.id]
    );
  }

  // Seed default admin user
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Check if admin user already exists
  const [existingUser] = await executeQuery('SELECT User_ID FROM UserTable WHERE Username = ?', [adminUsername]);
  let userId;
  if (!existingUser.length) {
    const [insertResult] = await executeQuery(
      'INSERT INTO UserTable (Username, Password_Hash) VALUES (?, ?)',
      [adminUsername, passwordHash]
    );
    userId = insertResult.insertId;
    console.log(`Seeded admin user (ID: ${userId})`);
  } else {
    userId = existingUser[0].User_ID;
    console.log(`Admin user already exists (ID: ${userId})`);
  }

  // Link admin user to super_admin role
  await executeQuery(
    'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [userId, adminRole.id]
  );
  console.log(`Linked admin user to super_admin role`);

  console.log('RBAC seed complete.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
