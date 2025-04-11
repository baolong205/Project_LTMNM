const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Import routes
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const orderRouter = require('./routes/order');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const paymentRoutes = require('./routes/payment');

// ✅ Import middleware
const {
    isAuthenticated,
    isAdmin,
    isStaff,
    isCashier,
    isBartender,
    isWaiter
} = require('./middlewares/auth');

const app = express();

// Kết nối MongoDB
connectDB();

// Cấu hình session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
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

// Cấu hình thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', homeRoutes);
app.use('/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/order', orderRouter);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).send("Trang không tồn tại!");
});

// Tự động thử cổng khác nếu bị chiếm
const PORT = process.env.PORT || 3000;
function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`✅ Server chạy tại: http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️ Cổng ${port} đang bị chiếm. Đang thử cổng ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('❌ Lỗi khi khởi động server:', err);
        }
    });
}
startServer(PORT);
