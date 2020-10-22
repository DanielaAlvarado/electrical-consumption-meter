const express = require('express');
const groupController = require('../controllers/groupController');

const router = new express.Router();

router.get('/groups/month', groupController.month);
router.get('/groups/week', groupController.week);

module.exports = router;
