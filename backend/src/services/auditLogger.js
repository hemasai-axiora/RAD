const db = require('../config/db');

/**
 * Logs an action in the audit_logs table
 * @param {string|null} storeId - Tenant Store UUID
 * @param {string|null} userId - User UUID who performed the action
 * @param {string} action - Description of the action (e.g. 'CREATED_PRODUCT')
 * @param {string} module - Target module (e.g. 'inventory', 'billing')
 * @param {object|null} details - Structured parameters related to action
 * @param {string|null} ipAddress - Client IP address
 */
async function logAction(storeId, userId, action, module, details = null, ipAddress = null) {
  try {
    const queryStr = `
      INSERT INTO audit_logs (store_id, user_id, action, module, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(queryStr, [
      storeId,
      userId,
      action,
      module,
      details ? JSON.stringify(details) : null,
      ipAddress,
    ]);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

module.exports = {
  logAction,
};
