const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // Kết nối MongoDB

// Import routes
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const paymentRoutes = require('./routes/payment');
const app = express();

// Kết nối MongoDB
connectDB();

// Cấu hình session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // secure: false cho môi trường không HTTPS
}));

// Middleware xử lý dữ liệu từ form & JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình thư mục views & EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware truyền session vào res.locals
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Cấu hình thư mục public (CSS, JS, ảnh)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', homeRoutes);  // ✅ Trang chính
app.use('/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).send("Trang không tồn tại!");
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server chạy tại: http://localhost:${PORT}`);
});
