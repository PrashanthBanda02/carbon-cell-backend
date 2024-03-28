const jwt = require('jsonwebtoken')

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]

    // Check for token 
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        // this will return payload on successful verification
        const decoded = jwt.verify(token, 'jwt-key');  

        // Add decoded token data to request object
        req.user = decoded;
        // console.log('Token verified successfully!')

        // Proceed to next middleware or route handler
        next();
    } catch (error) {
        console.error('Token verification error');
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = verifyToken 

