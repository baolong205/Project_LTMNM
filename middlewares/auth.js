// ./middlewares/auth.js

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session?.user?.role === 'Admin') {
        return next();
    }
    res.redirect('/');
};

const isCashier = (req, res, next) => {
    if (req.session?.user?.role === 'Thu ngân') {
        console.log('🧪 Kiểm tra quyền Cashier:', req.session?.user);
        return next();
    }
    res.redirect('/');
};

const isBartender = (req, res, next) => {
    if (req.session?.user?.role === 'Pha chế') {
        return next();
    }
    res.redirect('/');
};

const isWaiter = (req, res, next) => {
    if (req.session?.user?.role === 'Phục vụ') {
        return next();
    }
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isCashier,
    isBartender,
    isWaiter
};
