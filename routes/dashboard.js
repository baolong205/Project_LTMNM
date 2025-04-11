const express = require('express');
const router = express.Router();

// Hiển thị trang dashboard
router.get('/', (req, res) => {
    res.render('admin/dashboard'); 
  });
  

module.exports = router;
