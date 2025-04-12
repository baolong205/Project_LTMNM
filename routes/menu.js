const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbFilePath = path.join(__dirname, "../db.json");

// Lấy danh sách menu từ db.json
router.get("/", async (req, res) => {
    try {
        // Truy vấn tất cả các món trong MenuItem
        const menuItems = await MenuItem.find();

        // Render trang menu với danh sách món
        res.render("menu/menu", { menuItems });
    } catch (err) {
        console.error("Lỗi khi truy vấn menu từ MongoDB:", err);
        res.status(500).send("Lỗi máy chủ khi truy vấn dữ liệu menu");
    }
});

module.exports = router;
