const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const connectDB = require('./config/db');

// Import routes
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const paymentRoutes = require('./routes/payment');
const dashboardRoutes = require('./routes/dashboard');

// ✅ Middleware phân quyền
const {
    isAuthenticated,
    isAdmin,
    isStaff,
    isCashier,
    isBartender,
    isWaiter
} = require('./middlewares/auth');

const app = express();

// ✅ Kết nối MongoDB
connectDB();

// ✅ Cấu hình session trước flash
app.use(session({
    secret: 'LTMNM',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ✅ Cấu hình connect-flash sau session
app.use(flash());

// ✅ Truyền flash message và session vào res.locals
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// ✅ Middleware xử lý form và JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Cấu hình view engine là EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ✅ Cấu hình thư mục tĩnh (public)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Các tuyến đường chính
app.use('/', homeRoutes);
app.use('/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);

// ✅ Trang 404
app.use((req, res) => {
    res.status(404).send("❌ Trang không tồn tại!");
});

// ✅ Khởi chạy server (tự động tăng cổng nếu bị trùng)
const PORT = process.env.PORT || 3000;
function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`✅ Server đang chạy tại: http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️ Cổng ${port} đang bị chiếm. Thử lại với cổng ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('❌ Lỗi khi khởi động server:', err);
        }
    });
}
startServer(PORT);
