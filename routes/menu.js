const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const dbFilePath = path.join(__dirname, "../db.json");

// Lấy danh sách sản phẩm theo loại
router.get("/category/:type", async (req, res) => {
    const { type } = req.params;

    try {
        const data = await fs.readFile(dbFilePath, "utf8");
        const db = JSON.parse(data);
        const filteredItems = db.menuItems.filter(item => item.type === type);

        res.json(filteredItems);
    } catch (err) {
        console.error("❌ Lỗi khi đọc dữ liệu:", err);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
});

module.exports = router;