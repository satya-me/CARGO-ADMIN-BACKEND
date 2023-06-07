const express = require('express');
const router = express.Router();
// const authAdmin = require('../middleware/authAdmin');
const adminController = require('../controller/adminController')

// define url route
router.post('/admin/auth/signup', adminController.registerAdmin);
router.post('/admin/auth/login', adminController.loginAdmin);

module.exports = router;