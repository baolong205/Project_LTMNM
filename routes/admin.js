const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.get('/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin/dashboard'); 
});

module.exports = router;
