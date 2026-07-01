const express = require('express');
const router = express.Router();
const jwtaccess = require('../middleware/jwtverification');
const timingController = require('../controller/timingController');

router.get('/timing', timingController.getTiming);
router.post('/settiming', jwtaccess, timingController.setTiming);

module.exports = router;
