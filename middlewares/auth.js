// ./middlewares/auth.js

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/'); // Nếu không phải admin, chuyển về trang chủ
};

// Các middleware khác (nếu chưa định nghĩa, bạn có thể thêm logic tương tự)
const isStaff = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'staff') {
        return next();
    }
    res.redirect('/');
};

const isCashier = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'cashier') {
        return next();
    }
    res.redirect('/');
};

const isBartender = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'bartender') {
        return next();
    }
    res.redirect('/');
};

const isWaiter = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'waiter') {
        return next();
    }
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isStaff,
    isCashier,
    isBartender,
    isWaiter
};