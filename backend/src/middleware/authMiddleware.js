const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: ' Token not provided' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authentication scheme' });
    }

    try {
        const decode = jwt.verify(token, jwtSecret);

        req.user = {
            id: decode.id,
            email: decode.email,
            role: decode.role
        };

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token'});
    }
}

module.exports = authMiddleware;