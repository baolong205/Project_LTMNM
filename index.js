const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const connectDB = require('./config/db');

const app = express();

// ✅ Kết nối MongoDB
connectDB();

// ✅ Import routes
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const paymentRoutes = require('./routes/payment');
const dashboardRoutes = require('./routes/dashboard');
const bartenderRoutes = require('./routes/bartender'); // 
// ✅ Middleware phân quyền (nếu cần)
const {
    isAuthenticated,
    isAdmin,
    isStaff,
    isCashier,
    isBartender,
    isWaiter
} = require('./middlewares/auth');

// ✅ Cấu hình session
app.use(session({
    secret: 'LTMNM',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Dùng true nếu HTTPS
}));

// ✅ Cấu hình flash
app.use(flash());

// ✅ Biến toàn cục (dùng trong view)
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// ✅ Middleware xử lý form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// ✅ View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ✅ Public folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Các tuyến đường chính
app.use('/', homeRoutes);
app.use('/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/bartender', bartenderRoutes);

// ✅ Trang 404
app.use((req, res) => {
    res.status(404).send("❌ Trang không tồn tại!");
});

// ✅ Khởi chạy server (tự tăng cổng nếu bị trùng)
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
