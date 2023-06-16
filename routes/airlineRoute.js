const express = require('express');
const airlineController = require('../controller/airlinesController');
const Verify = require('../middleware/Verify');
const { ImageUpload } = require('../config/mediaConfig');
const Authentication = require('../middleware/authAdmin');


const router = express.Router();

// ************* POST ROUTES ************* //
router.post('/add/airline', ImageUpload.single("aireline_logo"), [Verify.duplicateAirlineCheck], airlineController.addAirline);
router.post('/update/airline/:id', [Authentication.verifyToken], airlineController.updateAirline);
router.post('/delete/airline/:id', [Authentication.verifyToken], airlineController.deleteAirline);


// ************* GET ROUTES ************* //
router.get('/all/airline', airlineController.allAirline);


module.exports = router;