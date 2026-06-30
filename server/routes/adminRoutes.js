const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

// Protect all routes in this router with Auth and Admin role check
router.use(auth, adminOnly);

router.get('/stats', adminController.getStats);

// Flight endpoints
router.post('/flight', adminController.addFlight);
router.put('/flight/:id', adminController.updateFlight);
router.delete('/flight/:id', adminController.deleteFlight);

// Train endpoints
router.post('/train', adminController.addTrain);
router.put('/train/:id', adminController.updateTrain);
router.delete('/train/:id', adminController.deleteTrain);

// Bus endpoints
router.post('/bus', adminController.addBus);
router.put('/bus/:id', adminController.updateBus);
router.delete('/bus/:id', adminController.deleteBus);

// Coupon endpoints
router.post('/coupon', adminController.addCoupon);
router.put('/coupon/:id', adminController.updateCoupon);
router.delete('/coupon/:id', adminController.deleteCoupon);

module.exports = router;
