const express = require('express');
const router = express.Router();
const Verify = require('../middleware/Verify');
const adminController = require('../controller/adminController')
const Authentication = require('../middleware/authAdmin');
const { ImageUpload } = require('../config/mediaConfig');

// ************* POST ROUTES ************* //
router.post('/admin/auth/signup', ImageUpload.single("profile_img"), [Verify.duplicateAdminCheck], adminController.registerAdmin);
router.post('/admin/auth/login', adminController.loginAdmin);
router.post('/admin/update/:id', [Authentication.verifyToken], adminController.updateAdmin);
router.post('/admin/delete/:id', [Authentication.verifyToken], adminController.deleteAdmin);


// ************* GET ROUTES ************* //
router.get('/all/admin', adminController.getAllAdmins);


module.exports = router;