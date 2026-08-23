const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

console.log("AUTH ROUTES LOADED");

const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// REGISTER
// =========================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Get database
        const db = req.app.locals.db;

        if (!db) {
            return res.status(500).json({
                message: "Database not connected"
            });
        }

        const users = db.collection("users");

        // Check existing user
        const existingUser = await users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await users.insertOne({
            name: name,
            email: email,
            password: hashedPassword,
            createdAt: new Date()
        });

        console.log("User registered:", email);

        return res.status(201).json({
            message: "Registration successful",
            userId: result.insertedId
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Get database
        const db = req.app.locals.db;

        if (!db) {
            return res.status(500).json({
                message: "Database not connected"
            });
        }

        const users = db.collection("users");

        // Find user
        const user = await users.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// CHECK REGISTERED ROUTES
// =========================
console.log(
    "AUTH ROUTES:",
    router.stack
        .filter(layer => layer.route)
        .map(layer => ({
            path: layer.route.path,
            methods: layer.route.methods
        }))
);


// Export router
module.exports = router;