const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

router.get('/', authenticateToken, checkPermission('inventory', 'read'), inventoryController.getInventory);
router.post('/adjust', authenticateToken, checkPermission('inventory', 'write'), inventoryController.adjustStock);

module.exports = router;
