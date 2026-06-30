const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { auth } = require('../middleware/auth');

router.get('/faqs', supportController.getFAQs);
router.post('/ai', supportController.aiAssistant);

router.get('/tickets', auth, supportController.getTickets);
router.post('/ticket', auth, supportController.createTicket);
router.post('/ticket/reply/:id', auth, supportController.replyTicket);

module.exports = router;
