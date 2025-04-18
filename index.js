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
const bartenderRoutes = require('./routes/bartender');
const inventoryRoutes = require('./routes/inventory'); 


// Cấu hình session và flash
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

app.use('/', require('./routes/admin')); 

// ✅ Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Sử dụng các route
app.use('/', homeRoutes);
app.use('/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/bartender', bartenderRoutes);
app.use('/inventory', inventoryRoutes);



// Trang 404
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
// Route tạm để login thử với quyền admin
app.get('/login-admin', (req, res) => {
    req.session.user = {
      username: 'admin',
      role: 'admin'
    };
    res.redirect('/dashboard');
  });

  app.get('/login-admin', (req, res) => {
    req.session.user = {
      name: "Cao Cường",
      role: "admin" // ✅ Quan trọng: đây chính là thông tin để hiển thị vai trò
    };
    res.redirect('/');
  });