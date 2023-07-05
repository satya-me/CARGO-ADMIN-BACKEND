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
router.post('/admin/auth/setpassword/:email/:token/:user_type', ImageUpload.single("profile_img"), adminController.setAdminPassword);
router.post('/admin/auth/forgot/password', adminController.forgotPassword);
router.post('/admin/auth/forgot/password/:email/:token/:user_type', adminController.resetAdminPassword);


// ************* GET ROUTES ************* //
router.get('/all/admin', adminController.getAllAdmins);
router.get('/admin/auth/setpassword/:email/:token/:user_type', adminController.setAdminPasswordView);
router.get('/admin/auth/forgot/password/:email/:token/:user_type', adminController.resetAdminPasswordView);


module.exports = router;