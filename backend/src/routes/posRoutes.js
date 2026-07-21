const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

router.post('/invoice', authenticateToken, checkPermission('billing', 'create'), posController.createInvoice);
router.post('/hold', authenticateToken, checkPermission('billing', 'create'), posController.holdBill);
router.get('/held', authenticateToken, checkPermission('billing', 'read'), posController.getHeldBills);
router.post('/resume/:id', authenticateToken, checkPermission('billing', 'create'), posController.resumeBill);
router.post('/refund/:invoiceId', authenticateToken, checkPermission('billing', 'delete'), posController.refundInvoice);

module.exports = router;
