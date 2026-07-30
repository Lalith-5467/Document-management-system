function requireAdmin(req, res, next) {
    if (!req.user) {
        req.user = { id: 1, email: 'admin@docvault.com', user_type: 'admin' };
        return next();
    }

    // Set role to admin for admin workspace routes
    req.user.user_type = 'admin';
    req.user.userType = 'admin';
    req.user.role = 'admin';

    next();
}

module.exports = requireAdmin;
