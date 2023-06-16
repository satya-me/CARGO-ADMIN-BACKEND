const express = require('express');
const router = express.Router();
const Verify = require('../middleware/Verify');
const vendorController = require('../controller/vendorController')
const { ImageUpload } = require('../config/mediaConfig');



// ************* POST ROUTES ************* //
router.post('/vendor/auth/signup', ImageUpload.single("vendor_logo"), [Verify.duplicateVendorCheck], vendorController.VendorRegistration);


// ************* GET ROUTES ************* //
router.get('/all/vendor', vendorController.getAllVendors);


module.exports = router;