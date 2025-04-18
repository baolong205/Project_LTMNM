const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// ======= MENU ROUTES =======
router.get('/menu', isAuthenticated, isAdmin, adminController.getDashboard);
router.post('/menu/add', isAuthenticated, isAdmin, adminController.addMenuItem);
router.get('/menu/edit/:id', isAuthenticated, isAdmin, adminController.getEditForm);
router.post('/menu/update/:id', isAuthenticated, isAdmin, adminController.updateMenuItem);
router.post('/menu/delete/:id', isAuthenticated, isAdmin, adminController.deleteMenuItem);



// ======= USER ROUTES (dùng username) =======
router.get('/users', isAuthenticated, isAdmin, adminController.getUsers);
router.post('/users/add', isAuthenticated, isAdmin, adminController.addUser);
router.get('/menu/delete/:id', isAuthenticated, isAdmin, adminController.deleteMenuItem);
router.get('/users/edit/:username', isAuthenticated, isAdmin, adminController.getEditUserByUsername);
router.post('/users/update/:username', isAuthenticated, isAdmin, adminController.updateUserByUsername);
router.post('/users/delete/:username', isAuthenticated, isAdmin, adminController.deleteUserByUsername);

module.exports = router;
