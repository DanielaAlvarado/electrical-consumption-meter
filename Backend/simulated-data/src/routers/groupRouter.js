const express = require('express');
const groupController = require('../controllers/groupController');

const router = new express.Router();

router.get('/groups/devicesMonthly', groupController.devicesMonthly);
router.get('/groups/devicesWeekly', groupController.devicesWeekly);
router.get('/groups/roomsMonthly', groupController.roomsMonthly);
router.get('/groups/roomsWeekly', groupController.roomsWeekly);

module.exports = router;
