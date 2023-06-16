const express = require('express');
const router = express.Router();
const Verify = require('../middleware/Verify');
const vendorController = require('../controller/vendorController')
const { ImageUpload } = require('../config/mediaConfig');
const Authentication = require('../middleware/authAdmin');



// ************* POST ROUTES ************* //
router.post('/vendor/auth/signup', ImageUpload.single("vendor_logo"), [Verify.duplicateVendorCheck], vendorController.VendorRegistration);
router.post('/vendor/update/:id', ImageUpload.single("vendor_logo"), [Authentication.verifyToken], vendorController.updateVendor);
router.post('/vendor/delete/:id', [Authentication.verifyToken], vendorController.deleteVendor);


// ************* GET ROUTES ************* //
router.get('/all/vendor', vendorController.getAllVendors);


module.exports = router;