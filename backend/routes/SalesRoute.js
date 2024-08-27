const sales = require('../controller/SalesController');
const express = require('express');
const router = express.Router();

const middleware = require('../middleware/UserMiddleware');
router.use(middleware.verifyToken);
router.use(middleware.verifyAccountStatus);

// Define static routes first to avoid conflicts with dynamic routes
router.get('/ironbarscrape', sales.getIronBarScrape);

router.get('/', sales.getAllSales);
router.get('/customer/:id', sales.getSalesByCustomer);
router.get('/supplier/:id', sales.getSalesBySupplier);

// Dynamic routes should come after static routes
router.get('/:id', sales.getSalesById);

router.post('/register', sales.createSales);

router.delete('/delete/:id', sales.deleteSales);

router.put('/update/:id', sales.updateSales);

module.exports = router;
