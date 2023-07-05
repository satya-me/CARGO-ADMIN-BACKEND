const express = require('express');
const airlineController = require('../controller/airlinesController');
const Verify = require('../middleware/Verify');
const { ImageUpload } = require('../config/mediaConfig');
const Authentication = require('../middleware/authAdmin');


const router = express.Router();

// ************* POST ROUTES ************* //
router.post('/add/airline', ImageUpload.single("aireline_logo"), [Verify.duplicateAirlineCheck], airlineController.addAirline);
router.post('/login/airline', airlineController.loginAirline);
router.post('/update/airline/:id', ImageUpload.single("aireline_logo"), [Authentication.verifyToken], airlineController.updateAirline);
router.post('/delete/airline/:id', [Authentication.verifyToken], airlineController.deleteAirline);
router.post('/airline/setpassword/:email/:token/:user_type', ImageUpload.single("aireline_logo"), airlineController.setAirlinePassword);
router.post('/airline/forgot/password', airlineController.forgotAirlinePassword);
router.post('/airline/forgot/password/:email/:token/:user_type', airlineController.resetAirlinePassword);

// ************* GET ROUTES ************* //
router.get('/all/airline', airlineController.allAirline);
router.get('/airline/setpassword/:email/:token/:user_type', airlineController.setAirlinePasswordView);
router.get('/airline/forgot/password/:email/:token/:user_type', airlineController.resetAirlinePasswordView);

module.exports = router;