const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const filetypes = /csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only CSV files are allowed'));
  },
});

// Categories Routes
router.get('/categories', authenticateToken, checkPermission('inventory', 'read'), productController.getCategories);
router.post('/categories', authenticateToken, checkPermission('inventory', 'write'), productController.createCategory);

// Brands Routes
router.get('/brands', authenticateToken, checkPermission('inventory', 'read'), productController.getBrands);
router.post('/brands', authenticateToken, checkPermission('inventory', 'write'), productController.createBrand);

// Products Routes
router.get('/', authenticateToken, checkPermission('inventory', 'read'), productController.getProducts);
router.post('/', authenticateToken, checkPermission('inventory', 'write'), productController.createProduct);
router.put('/:id', authenticateToken, checkPermission('inventory', 'write'), productController.updateProduct);
router.delete('/:id', authenticateToken, checkPermission('inventory', 'write'), productController.deleteProduct);

// Bulk Import Products
router.post('/bulk-import', authenticateToken, checkPermission('inventory', 'write'), upload.single('file'), productController.bulkImport);

module.exports = router;
