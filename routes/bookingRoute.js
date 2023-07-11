const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController')
const Authentication = require('../middleware/authAdmin');


// ************* POST ROUTES ************* //
router.post('/take/booking', [Authentication.verifyToken], bookingController.createBooking);
router.post('/update/booking/:id', [Authentication.verifyToken], bookingController.updateBooking);
router.post('/delete/booking/:id', [Authentication.verifyToken], bookingController.deleteBooking);
router.post('/delete/file', bookingController.fileDelete);



// ************* GET ROUTES ************* //
router.get('/all/booking', bookingController.getAllBookingData);


module.exports = router;