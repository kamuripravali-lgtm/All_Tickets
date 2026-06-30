const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/cities', searchController.getCities);
router.get('/flights', searchController.searchFlights);
router.get('/trains', searchController.searchTrains);
router.get('/buses', searchController.searchBuses);

module.exports = router;
