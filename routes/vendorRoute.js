const express = require('express');
const router = express.Router();
const Verify = require('../middleware/Verify');
const vendorController = require('../controller/vendorController')
const { ImageUpload } = require('../config/mediaConfig');
const Authentication = require('../middleware/authAdmin');



// ************* POST ROUTES ************* //
router.post('/vendor/auth/signup', ImageUpload.single("vendor_logo"), [Verify.duplicateVendorCheck], vendorController.VendorRegistration);
router.post('/login/vendor', vendorController.loginVendor);
router.post('/vendor/update/:id', ImageUpload.single("vendor_logo"), [Authentication.verifyToken], vendorController.updateVendor);
router.post('/vendor/delete/:id', [Authentication.verifyToken], vendorController.deleteVendor);
router.post('/vendor/setpassword/:email/:token/:user_type', ImageUpload.single("vendor_logo"), vendorController.setVendorPassword);


// ************* GET ROUTES ************* //
router.get('/all/vendor', vendorController.getAllVendors);
router.get('/vendor/setpassword/:email/:token/:user_type', vendorController.setVendorPasswordView);


module.exports = router;