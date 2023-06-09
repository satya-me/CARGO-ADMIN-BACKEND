const express = require('express');
const router = express.Router();
const airlineController = require('../controller/airlinesController')
const Verify = require('../middleware/Verify')

// define url route
router.post('/add/airline', [Verify.duplicateAirlineCheck], airlineController.addAirline);
router.get('/all/airline', airlineController.allAirline);
router.post('/update/airline/:id', airlineController.updateAirline);
router.post('/delete/airline/:id', airlineController.deleteAirline);

module.exports = router;