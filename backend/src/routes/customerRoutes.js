const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

router.get('/', authenticateToken, checkPermission('customers', 'read'), customerController.getCustomers);
router.post('/', authenticateToken, checkPermission('customers', 'write'), customerController.createCustomer);
router.get('/:id/history', authenticateToken, checkPermission('customers', 'read'), customerController.getCustomerHistory);

module.exports = router;
