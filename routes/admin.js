const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Cấu hình multer để upload ảnh món ăn
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// ======= MENU ROUTES =======
router.get('/dashboard', isAuthenticated, isAdmin, adminController.getDashboard);
router.post('/add', isAuthenticated, isAdmin, upload.single('image'), adminController.addMenuItem);
router.get('/edit/:id', isAuthenticated, isAdmin, adminController.getEditForm);
router.post('/edit/:id', isAuthenticated, isAdmin, upload.single('image'), adminController.updateMenuItem);
router.get('/delete/:id', isAuthenticated, isAdmin, adminController.deleteMenuItem);


// ======= USER ROUTES (dùng username) =======
router.get('/users', isAuthenticated, isAdmin, adminController.getUsers);
router.post('/users/add', isAuthenticated, isAdmin, adminController.addUser);
router.get('/users/edit/:username', isAuthenticated, isAdmin, adminController.getEditUserByUsername);
router.post('/users/update/:username', isAuthenticated, isAdmin, adminController.updateUserByUsername);
router.post('/users/delete/:username', isAuthenticated, isAdmin, adminController.deleteUserByUsername);

module.exports = router;
