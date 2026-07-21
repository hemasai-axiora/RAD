const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

router.get('/summary', authenticateToken, checkPermission('reports', 'read'), reportController.getDashboardSummary);
router.get('/sales', authenticateToken, checkPermission('reports', 'read'), reportController.getSalesReport);
router.get('/gst', authenticateToken, checkPermission('reports', 'read'), reportController.getGstReport);
router.get('/audit', authenticateToken, checkPermission('reports', 'read'), reportController.getAuditLogs);
router.get('/daily-sales', authenticateToken, checkPermission('reports', 'read'), reportController.getDailySalesReport);
router.get('/item-sales', authenticateToken, checkPermission('reports', 'read'), reportController.getItemSalesReport);
router.get('/customer-sales', authenticateToken, checkPermission('reports', 'read'), reportController.getCustomerSalesReport);
router.get('/inventory', authenticateToken, checkPermission('reports', 'read'), reportController.getInventoryReport);

module.exports = router;
