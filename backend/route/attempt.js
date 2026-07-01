const express = require('express');
const router = express.Router();
const jwtaccess = require('../middleware/jwtverification');
const attemptController = require('../controller/attemptController');

router.post('/start', jwtaccess, attemptController.startAttempt);
router.get('/status', jwtaccess, attemptController.getAttemptStatus);
router.post('/violate', jwtaccess, attemptController.recordViolation);

module.exports = router;
