const express = require('express');
const router = express.Router();
const jwtaccess = require('../middleware/jwtverification');
const resultController = require('../controller/resultController');

router.get('/Generateresult', jwtaccess, resultController.generateResult);
router.get('/downloadResponse/:userId', jwtaccess, resultController.downloadResponse);

module.exports = router;
