const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbFilePath = path.join(__dirname, "../db.json");

// Lấy danh sách menu từ db.json
router.get("/", (req, res) => {
    fs.readFile(dbFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Lỗi đọc file db.json:", err);
            return res.status(500).send("Lỗi máy chủ");
        }

        const dbData = JSON.parse(data);
        const menuItems = dbData.menuItems || []; // Lấy danh sách menu

        res.render("menu/menu", { menuItems });
    });
});

module.exports = router;
