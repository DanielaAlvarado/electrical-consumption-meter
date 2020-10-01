const express = require('express');
const groupController = require('../controllers/groupController');

const router = new express.Router();

router.get('/groups/month', groupController.month);

module.exports = router;
