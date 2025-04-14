const express = require('express');
const router = express.Router();
const {   
    getPendingOrders,   
    startPreparing,   
    completeOrder,   
    getBartenderPage,   
    markItemAsComplete,
    getCompletedOrders   
} = require('../controllers/bartenderController');

// Route hiển thị các món đang chờ chế biến
router.get('/', getBartenderPage);  

// Route hiển thị các món đã hoàn thành
router.get('/completed-orders', getCompletedOrders);

module.exports = router;
