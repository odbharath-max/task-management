const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    const token = parts[1];

    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not configured");

        return res.status(500).json({
            message: "JWT secret is not configured"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        console.error("JWT VERIFY ERROR:", error);

        return res.status(403).json({
            message: "Invalid or expired token",
            error: error.message
        });
    }
}

module.exports = authenticateToken;