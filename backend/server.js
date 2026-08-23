const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Task routes
app.use("/api/tasks", taskRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Task Management API is running!"
    });
});

// MongoDB
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();

        const db = client.db("taskManagement");

        app.locals.db = db;

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

connectDB();