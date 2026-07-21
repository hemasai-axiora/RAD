const db = require('./db');

async function update() {
  console.log('Updating role permissions in database...');
  try {
    const storeAdminPermissions = JSON.stringify({
      inventory: ['read', 'write'],
      billing: ['read', 'write', 'create', 'delete'],
      users: ['read', 'write'],
      reports: ['read'],
      customers: ['read', 'write']
    });

    const managerPermissions = JSON.stringify({
      inventory: ['read', 'write'],
      billing: ['read', 'write', 'create'],
      reports: ['read'],
      customers: ['read', 'write']
    });

    await db.query('UPDATE roles SET permissions = $1 WHERE id = 2', [storeAdminPermissions]);
    console.log('✓ Store Admin (id: 2) updated successfully.');

    await db.query('UPDATE roles SET permissions = $1 WHERE id = 3', [managerPermissions]);
    console.log('✓ Manager (id: 3) updated successfully.');

    console.log('Roles update completed successfully.');
  } catch (error) {
    console.error('Failed to update roles:', error);
  } finally {
    process.exit(0);
  }
}

update();
