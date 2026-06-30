const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

router.get('/', auth, bookingController.getUserBookings);
router.post('/create', auth, bookingController.createBooking);
router.post('/cancel/:id', auth, bookingController.cancelBooking);

router.post('/coupon/validate', bookingController.validateCoupon);
router.get('/coupons/list', bookingController.getCoupons);

module.exports = router;
