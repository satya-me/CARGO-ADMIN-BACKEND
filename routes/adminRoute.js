const express = require('express');
const router = express.Router();
const Verify = require('../middleware/Verify');
const adminController = require('../controller/adminController')

// ************* POST ROUTES ************* //
router.post('/admin/auth/signup', [Verify.duplicateAdminCheck], adminController.registerAdmin);
router.post('/admin/auth/login', adminController.loginAdmin);

module.exports = router;