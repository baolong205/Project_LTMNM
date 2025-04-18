const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', {
    user: req.session.user || null,
    menuItems: [],
    editItem: null
  });
});

module.exports = router;
