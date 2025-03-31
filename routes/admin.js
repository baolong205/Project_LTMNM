const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/auth');

router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard');
});

module.exports = router;
