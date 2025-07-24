const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.startsWith('Bearer ') ? 
            authHeader.slice(7) : authHeader;

        if (!token) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
}; 